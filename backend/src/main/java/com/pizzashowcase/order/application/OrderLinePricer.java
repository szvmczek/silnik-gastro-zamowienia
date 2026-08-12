package com.pizzashowcase.order.application;

import com.pizzashowcase.menu.domain.Addon;
import com.pizzashowcase.menu.domain.AddonGroup;
import com.pizzashowcase.menu.domain.Product;
import com.pizzashowcase.menu.domain.ProductAddonGroup;
import com.pizzashowcase.menu.domain.ProductVariant;
import com.pizzashowcase.menu.infrastructure.ProductAddonGroupRepository;
import com.pizzashowcase.menu.infrastructure.ProductRepository;
import com.pizzashowcase.order.domain.OrderItem;
import com.pizzashowcase.order.domain.OrderItemAddon;
import com.pizzashowcase.shared.error.ApiException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Jedyne miejsce, w którym powstaje wyceniona pozycja zamówienia.
 *
 * <p>Wyciągnięte z {@code CheckoutService}, żeby edycja zamówienia w panelu
 * liczyła cenę TYM SAMYM silnikiem co checkout (CLAUDE.md §5 — cena zawsze
 * po stronie serwera, nigdy wpisywana ręcznie). Zachowanie dla checkoutu
 * jest przeniesione 1:1.
 */
@Service
public class OrderLinePricer {

    /**
     * CHECKOUT egzekwuje dostępność produktu i aktywność kategorii —
     * klient nie może zamówić czegoś, co właśnie zeszło z menu.
     * ADMIN_EDIT tego nie sprawdza: admin rozmawia z klientem przez
     * telefon i wie, co jest na stanie, więc chwilowo wyłączony produkt
     * nie może zablokować dopisania sosu. Pozostałe walidacje (wariant
     * i dodatek należą do produktu, min/max/required grup, duplikaty)
     * obowiązują w obu trybach.
     */
    public enum PricingMode {
        CHECKOUT,
        ADMIN_EDIT
    }

    public record LineSpec(Long productId,
                           Long variantId,
                           List<Long> addonIds,
                           int quantity,
                           String itemNote) {
    }

    /** {@code items} zachowuje kolejność przekazanych {@code specs}. */
    public record PricedLines(List<OrderItem> items, BigDecimal subtotal) {
    }

    private final ProductRepository productRepository;
    private final ProductAddonGroupRepository productAddonGroupRepository;

    public OrderLinePricer(ProductRepository productRepository,
                           ProductAddonGroupRepository productAddonGroupRepository) {
        this.productRepository = productRepository;
        this.productAddonGroupRepository = productAddonGroupRepository;
    }

    public PricedLines price(List<LineSpec> specs, PricingMode mode) {
        if (specs.isEmpty()) {
            return new PricedLines(List.of(), BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        }

        Set<Long> productIds = specs.stream()
                .map(LineSpec::productId)
                .collect(Collectors.toSet());

        Map<Long, Product> productsById = productRepository.findAllByIdInWithVariants(productIds).stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        Map<Long, List<ProductAddonGroup>> addonGroupsByProductId = productAddonGroupRepository
                .findAllByProductIdsWithAddons(productIds).stream()
                .collect(Collectors.groupingBy(link -> link.getProduct().getId()));

        List<OrderItem> items = new ArrayList<>(specs.size());
        BigDecimal subtotal = BigDecimal.ZERO;
        for (LineSpec line : specs) {
            OrderItem item = buildOrderItem(line, mode, productsById, addonGroupsByProductId);
            items.add(item);
            subtotal = subtotal.add(item.getLineTotal());
        }
        return new PricedLines(items, subtotal.setScale(2, RoundingMode.HALF_UP));
    }

    /**
     * Ostrzeżenia dla podglądu edycji: ADMIN_EDIT nie blokuje pozycji
     * z produktem zdjętym z karty, ale admin ma o tym wiedzieć, zanim
     * obieca coś klientowi przez telefon.
     */
    public List<String> availabilityWarnings(Collection<Long> productIds) {
        if (productIds.isEmpty()) {
            return List.of();
        }
        return productRepository.findAllByIdInWithVariants(productIds).stream()
                .filter(p -> !p.isAvailable() || !p.getCategory().isActive())
                .map(p -> "Produkt „" + p.getName() + "” jest obecnie niedostępny w menu.")
                .toList();
    }

    private OrderItem buildOrderItem(LineSpec line,
                                     PricingMode mode,
                                     Map<Long, Product> productsById,
                                     Map<Long, List<ProductAddonGroup>> addonGroupsByProductId) {
        Product product = productsById.get(line.productId());
        if (product == null) {
            throw ApiException.unprocessable("Produkt o id " + line.productId() + " nie istnieje.");
        }
        if (mode == PricingMode.CHECKOUT
                && (!product.isAvailable() || !product.getCategory().isActive())) {
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
        item.setItemNote(trimToNull(line.itemNote()));
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

    private static String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private record AddonContext(Addon addon, AddonGroup group) {
    }
}
