package com.pizzashowcase.order.application;

import com.pizzashowcase.menu.domain.Addon;
import com.pizzashowcase.menu.domain.AddonGroup;
import com.pizzashowcase.menu.domain.Product;
import com.pizzashowcase.menu.domain.ProductAddonGroup;
import com.pizzashowcase.menu.domain.ProductVariant;
import com.pizzashowcase.delivery.application.DeliveryZoneLookupService;
import com.pizzashowcase.delivery.domain.DeliveryLookupResult;
import com.pizzashowcase.delivery.domain.DeliveryZoneType;
import com.pizzashowcase.menu.infrastructure.ProductAddonGroupRepository;
import com.pizzashowcase.menu.infrastructure.ProductRepository;
import com.pizzashowcase.order.api.dto.AddressRequest;
import com.pizzashowcase.order.api.dto.CreateOrderItemRequest;
import com.pizzashowcase.order.api.dto.CreateOrderRequest;
import com.pizzashowcase.order.api.dto.OrderConfirmationDto;
import com.pizzashowcase.order.application.event.OrderCreatedEvent;
import com.pizzashowcase.order.domain.Address;
import com.pizzashowcase.order.domain.FulfillmentType;
import com.pizzashowcase.order.domain.Order;
import com.pizzashowcase.order.domain.OrderItem;
import com.pizzashowcase.order.domain.OrderItemAddon;
import com.pizzashowcase.order.domain.OrderStatus;
import com.pizzashowcase.order.domain.OrderStatusHistory;
import com.pizzashowcase.order.domain.PaymentMethod;
import com.pizzashowcase.order.infrastructure.OrderRepository;
import com.pizzashowcase.restaurant.application.RestaurantSettingsService;
import com.pizzashowcase.shared.error.ApiException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CheckoutService {

    private final ProductRepository productRepository;
    private final ProductAddonGroupRepository productAddonGroupRepository;
    private final OrderRepository orderRepository;
    private final OrderNumberGenerator orderNumberGenerator;
    private final ApplicationEventPublisher eventPublisher;
    private final DeliveryZoneLookupService deliveryZoneLookupService;
    private final RestaurantSettingsService restaurantSettingsService;

    public CheckoutService(ProductRepository productRepository,
                           ProductAddonGroupRepository productAddonGroupRepository,
                           OrderRepository orderRepository,
                           OrderNumberGenerator orderNumberGenerator,
                           ApplicationEventPublisher eventPublisher,
                           DeliveryZoneLookupService deliveryZoneLookupService,
                           RestaurantSettingsService restaurantSettingsService) {
        this.productRepository = productRepository;
        this.productAddonGroupRepository = productAddonGroupRepository;
        this.orderRepository = orderRepository;
        this.orderNumberGenerator = orderNumberGenerator;
        this.eventPublisher = eventPublisher;
        this.deliveryZoneLookupService = deliveryZoneLookupService;
        this.restaurantSettingsService = restaurantSettingsService;
    }

    @Transactional(rollbackFor = Exception.class)
    public OrderConfirmationDto placeOrder(CreateOrderRequest request) {
        validateFulfillmentPaymentAddress(request);

        Set<Long> productIds = request.items().stream()
                .map(CreateOrderItemRequest::productId)
                .collect(Collectors.toSet());

        Map<Long, Product> productsById = productRepository.findAllByIdInWithVariants(productIds).stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        Map<Long, List<ProductAddonGroup>> addonGroupsByProductId = productAddonGroupRepository
                .findAllByProductIdsWithAddons(productIds).stream()
                .collect(Collectors.groupingBy(link -> link.getProduct().getId()));

        List<OrderItem> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CreateOrderItemRequest line : request.items()) {
            OrderItem item = buildOrderItem(line, productsById, addonGroupsByProductId);
            items.add(item);
            subtotal = subtotal.add(item.getLineTotal());
        }
        subtotal = subtotal.setScale(2, RoundingMode.HALF_UP);

        BigDecimal deliveryFee = BigDecimal.ZERO;
        String deliveryZoneName = null;
        if (request.fulfillmentType() == FulfillmentType.DELIVERY) {
            AddressRequest a = request.deliveryAddress();
            DeliveryLookupResult zone = deliveryZoneLookupService.lookup(a.city(), a.postalCode());
            if (zone.type() == DeliveryZoneType.UNAVAILABLE) {
                throw ApiException.unprocessable("Nie dostarczamy pod ten adres.");
            }
            deliveryFee = zone.fee().setScale(2, RoundingMode.HALF_UP);
            deliveryZoneName = zone.zoneName();
        }

        String orderNumber = orderNumberGenerator.next();
        UUID trackingToken = UUID.randomUUID();
        BigDecimal total = subtotal.add(deliveryFee).setScale(2, RoundingMode.HALF_UP);

        Order order = new Order(
                orderNumber,
                trackingToken,
                request.customerName().trim(),
                request.customerPhone().trim(),
                normalizeEmail(request.customerEmail()),
                request.fulfillmentType(),
                request.paymentMethod(),
                buildAddress(request),
                normalizeNotes(request.customerNotes()),
                subtotal,
                deliveryFee,
                deliveryZoneName,
                total
        );
        for (OrderItem item : items) {
            order.addItem(item);
        }
        // Auto-ETA on create (M-043, PHASES.md M2 / resolves PHASE5_FINDINGS #25):
        // a new order gets a baseline ETA from RestaurantSettings
        // .defaultPreparationMinutes. Admin overrides per order via
        // PATCH /admin/orders/{id}/eta. defaultPreparationMinutes is a non-null
        // primitive int (DB default 30, admin-validated 5–120) — no null guard.
        order.setEta(restaurantSettingsService.getSettings().getDefaultPreparationMinutes());
        order.addStatusHistory(new OrderStatusHistory(OrderStatus.NEW, Instant.now(), null));

        Order persisted = orderRepository.save(order);
        eventPublisher.publishEvent(new OrderCreatedEvent(
                persisted.getId(),
                persisted.getOrderNumber(),
                persisted.getTotal(),
                persisted.getCreatedAt() != null ? persisted.getCreatedAt() : Instant.now()));
        return new OrderConfirmationDto(
                persisted.getOrderNumber(),
                persisted.getPublicTrackingToken(),
                persisted.getTotal(),
                persisted.getDeliveryFee(),
                persisted.getDeliveryZoneName());
    }

    private void validateFulfillmentPaymentAddress(CreateOrderRequest req) {
        FulfillmentType ft = req.fulfillmentType();
        PaymentMethod pm = req.paymentMethod();

        if (ft == FulfillmentType.DELIVERY && pm != PaymentMethod.CASH_ON_DELIVERY) {
            throw ApiException.unprocessable("Dla dostawy dostępna jest płatność CASH_ON_DELIVERY.");
        }
        if (ft == FulfillmentType.PICKUP && pm != PaymentMethod.CASH_ON_PICKUP) {
            throw ApiException.unprocessable("Dla odbioru osobistego dostępna jest płatność CASH_ON_PICKUP.");
        }

        AddressRequest addr = req.deliveryAddress();
        if (ft == FulfillmentType.DELIVERY) {
            if (addr == null
                    || isBlank(addr.street())
                    || isBlank(addr.buildingNumber())
                    || isBlank(addr.postalCode())
                    || isBlank(addr.city())) {
                throw ApiException.unprocessable("Dla dostawy wymagane są: ulica, numer budynku, kod pocztowy i miasto.");
            }
        } else {
            if (addr != null && !addressIsBlank(addr)) {
                throw ApiException.unprocessable("Dla odbioru osobistego nie podawaj adresu dostawy.");
            }
        }
    }

    private OrderItem buildOrderItem(CreateOrderItemRequest line,
                                     Map<Long, Product> productsById,
                                     Map<Long, List<ProductAddonGroup>> addonGroupsByProductId) {
        Product product = productsById.get(line.productId());
        if (product == null) {
            throw ApiException.unprocessable("Produkt o id " + line.productId() + " nie istnieje.");
        }
        if (!product.isAvailable() || !product.getCategory().isActive()) {
            throw ApiException.unprocessable("Produkt '" + product.getName() + "' nie jest już dostępny.");
        }

        ProductVariant variant = resolveVariant(product, line.variantId());
        BigDecimal unitPrice = variant != null ? variant.getPrice() : product.getBasePrice();
        if (unitPrice == null) {
            throw ApiException.unprocessable("Produkt '" + product.getName() + "' nie ma poprawnej ceny.");
        }

        List<ProductAddonGroup> productGroups = addonGroupsByProductId.getOrDefault(product.getId(), List.of());
        List<OrderItemAddon> resolvedAddons = resolveAddons(product, productGroups, line.addonIds());

        BigDecimal addonsSum = resolvedAddons.stream()
                .map(OrderItemAddon::getUnitPriceSnapshot)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal lineUnitTotal = unitPrice.add(addonsSum);
        BigDecimal lineTotal = lineUnitTotal.multiply(BigDecimal.valueOf(line.quantity()))
                .setScale(2, RoundingMode.HALF_UP);

        OrderItem item = new OrderItem(
                product.getId(),
                variant != null ? variant.getId() : null,
                product.getName(),
                variant != null ? variant.getName() : null,
                unitPrice,
                line.quantity(),
                lineTotal
        );
        for (OrderItemAddon addon : resolvedAddons) {
            item.addAddon(addon);
        }
        return item;
    }

    private ProductVariant resolveVariant(Product product, Long variantId) {
        boolean hasVariants = !product.getVariants().isEmpty();
        if (hasVariants) {
            if (variantId == null) {
                throw ApiException.unprocessable("Produkt '" + product.getName() + "' wymaga wyboru wariantu.");
            }
            return product.getVariants().stream()
                    .filter(v -> v.getId().equals(variantId))
                    .findFirst()
                    .orElseThrow(() -> ApiException.unprocessable(
                            "Wariant " + variantId + " nie należy do produktu '" + product.getName() + "'."));
        }
        if (variantId != null) {
            throw ApiException.unprocessable("Produkt '" + product.getName() + "' nie ma wariantów.");
        }
        return null;
    }

    private List<OrderItemAddon> resolveAddons(Product product,
                                               List<ProductAddonGroup> productGroups,
                                               List<Long> requestedAddonIds) {
        List<Long> requested = requestedAddonIds != null ? requestedAddonIds : List.of();

        Map<Long, AddonContext> allowedAddons = new HashMap<>();
        for (ProductAddonGroup link : productGroups) {
            AddonGroup group = link.getAddonGroup();
            for (Addon addon : group.getAddons()) {
                allowedAddons.put(addon.getId(), new AddonContext(addon, group));
            }
        }

        List<OrderItemAddon> snapshots = new ArrayList<>();
        Map<Long, Integer> selectedPerGroup = new HashMap<>();
        Set<Long> seen = new HashSet<>();
        for (Long addonId : requested) {
            if (!seen.add(addonId)) {
                throw ApiException.unprocessable(
                        "Powtórzony dodatek " + addonId + " w pozycji produktu '" + product.getName() + "'.");
            }
            AddonContext ctx = allowedAddons.get(addonId);
            if (ctx == null) {
                throw ApiException.unprocessable(
                        "Dodatek " + addonId + " nie należy do produktu '" + product.getName() + "'.");
            }
            selectedPerGroup.merge(ctx.group.getId(), 1, Integer::sum);
            snapshots.add(new OrderItemAddon(
                    ctx.addon.getId(),
                    ctx.group.getName(),
                    ctx.addon.getName(),
                    ctx.addon.getPrice()
            ));
        }

        for (ProductAddonGroup link : productGroups) {
            AddonGroup group = link.getAddonGroup();
            int selected = selectedPerGroup.getOrDefault(group.getId(), 0);
            if (group.isRequired() && selected < 1) {
                throw ApiException.unprocessable(
                        "Grupa dodatków '" + group.getName() + "' jest wymagana dla produktu '" + product.getName() + "'.");
            }
            if (selected < group.getMinSelect()) {
                throw ApiException.unprocessable(
                        "Grupa '" + group.getName() + "' wymaga minimum " + group.getMinSelect() + " dodatków.");
            }
            if (selected > group.getMaxSelect()) {
                throw ApiException.unprocessable(
                        "Grupa '" + group.getName() + "' dopuszcza maksimum " + group.getMaxSelect() + " dodatków.");
            }
        }

        return snapshots;
    }

    private Address buildAddress(CreateOrderRequest request) {
        if (request.fulfillmentType() != FulfillmentType.DELIVERY) {
            return Address.empty();
        }
        AddressRequest a = request.deliveryAddress();
        return new Address(
                trimOrNull(a.street()),
                trimOrNull(a.buildingNumber()),
                trimOrNull(a.apartmentNumber()),
                trimOrNull(a.postalCode()),
                trimOrNull(a.city()),
                trimOrNull(a.notes())
        );
    }

    private static boolean addressIsBlank(AddressRequest a) {
        return isBlank(a.street())
                && isBlank(a.buildingNumber())
                && isBlank(a.apartmentNumber())
                && isBlank(a.postalCode())
                && isBlank(a.city())
                && isBlank(a.notes());
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private static String trimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String normalizeEmail(String email) {
        String t = trimOrNull(email);
        return t == null ? null : t.toLowerCase(Locale.ROOT);
    }

    private static String normalizeNotes(String notes) {
        return trimOrNull(notes);
    }

    private record AddonContext(Addon addon, AddonGroup group) {
    }
}
