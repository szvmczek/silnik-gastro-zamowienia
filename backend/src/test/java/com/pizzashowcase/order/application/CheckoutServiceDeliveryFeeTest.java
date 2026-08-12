package com.pizzashowcase.order.application;

import com.pizzashowcase.delivery.application.DeliveryZoneLookupService;
import com.pizzashowcase.delivery.domain.DeliveryLookupResult;
import com.pizzashowcase.delivery.domain.DeliveryZoneType;
import com.pizzashowcase.menu.domain.Category;
import com.pizzashowcase.menu.domain.Product;
import com.pizzashowcase.menu.infrastructure.ProductAddonGroupRepository;
import com.pizzashowcase.menu.infrastructure.ProductRepository;
import com.pizzashowcase.order.api.dto.AddressRequest;
import com.pizzashowcase.order.api.dto.CreateOrderItemRequest;
import com.pizzashowcase.order.api.dto.CreateOrderRequest;
import com.pizzashowcase.order.api.dto.OrderConfirmationDto;
import com.pizzashowcase.order.domain.FulfillmentType;
import com.pizzashowcase.order.domain.Order;
import com.pizzashowcase.order.domain.PaymentMethod;
import com.pizzashowcase.order.infrastructure.OrderRepository;
import com.pizzashowcase.restaurant.application.RestaurantSettingsService;
import com.pizzashowcase.restaurant.domain.RestaurantSettings;
import com.pizzashowcase.shared.error.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CheckoutServiceDeliveryFeeTest {

    private ProductRepository productRepository;
    private ProductAddonGroupRepository productAddonGroupRepository;
    private OrderRepository orderRepository;
    private OrderNumberGenerator orderNumberGenerator;
    private ApplicationEventPublisher eventPublisher;
    private DeliveryZoneLookupService deliveryLookup;
    private RestaurantSettingsService restaurantSettingsService;
    private CheckoutService service;

    @BeforeEach
    void setUp() {
        productRepository = mock(ProductRepository.class);
        productAddonGroupRepository = mock(ProductAddonGroupRepository.class);
        orderRepository = mock(OrderRepository.class);
        orderNumberGenerator = mock(OrderNumberGenerator.class);
        eventPublisher = mock(ApplicationEventPublisher.class);
        deliveryLookup = mock(DeliveryZoneLookupService.class);
        restaurantSettingsService = mock(RestaurantSettingsService.class);
        RestaurantSettings settings = mock(RestaurantSettings.class);
        when(settings.getDefaultPreparationMinutes()).thenReturn(30);
        when(restaurantSettingsService.getSettings()).thenReturn(settings);
        // Prawdziwy OrderLinePricer na zamockowanych repozytoriach menu —
        // wycena pozycji ma iść tą samą ścieżką co produkcyjnie.
        service = new CheckoutService(
                new OrderLinePricer(productRepository, productAddonGroupRepository),
                orderRepository, orderNumberGenerator, eventPublisher, deliveryLookup,
                restaurantSettingsService);

        Category cat = mock(Category.class);
        when(cat.isActive()).thenReturn(true);
        Product p = mock(Product.class);
        when(p.getId()).thenReturn(1L);
        when(p.getName()).thenReturn("Margherita");
        when(p.isAvailable()).thenReturn(true);
        when(p.getCategory()).thenReturn(cat);
        when(p.getBasePrice()).thenReturn(new BigDecimal("30.00"));
        when(p.getVariants()).thenReturn(java.util.Collections.emptySet());

        when(productRepository.findAllByIdInWithVariants(anyCollection())).thenReturn(List.of(p));
        when(productAddonGroupRepository.findAllByProductIdsWithAddons(anyCollection())).thenReturn(List.of());
        when(orderNumberGenerator.next()).thenReturn("2026-00001");
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private CreateOrderRequest baseRequest(FulfillmentType ft, PaymentMethod pm, AddressRequest addr) {
        return baseRequest(ft, pm, addr, null);
    }

    private CreateOrderRequest baseRequest(FulfillmentType ft, PaymentMethod pm, AddressRequest addr,
                                           BigDecimal cashChangeFrom) {
        return new CreateOrderRequest(
                "Jan Kowalski",
                "+48123456789",
                null,
                ft,
                pm,
                addr,
                null,
                cashChangeFrom,
                List.of(new CreateOrderItemRequest(1L, null, null, 1))
        );
    }

    @Test
    void deliveryWithFreeZoneSetsFeeZeroAndZoneName() {
        when(deliveryLookup.lookup("NDM", "05-100"))
                .thenReturn(new DeliveryLookupResult(DeliveryZoneType.FREE, BigDecimal.ZERO, "Centrum", 1L));
        AddressRequest addr = new AddressRequest("Główna", "1", null, "05-100", "NDM", null);

        OrderConfirmationDto conf = service.placeOrder(baseRequest(FulfillmentType.DELIVERY, PaymentMethod.CASH_ON_DELIVERY, addr));

        assertThat(conf.total()).isEqualByComparingTo("30.00");
    }

    @Test
    void deliveryWithPaidZoneAddsFeeToTotal() {
        when(deliveryLookup.lookup("NDM", "05-160"))
                .thenReturn(new DeliveryLookupResult(DeliveryZoneType.PAID, new BigDecimal("5.00"), "Modlin", 2L));
        AddressRequest addr = new AddressRequest("Forteczna", "1", null, "05-160", "NDM", null);

        OrderConfirmationDto conf = service.placeOrder(baseRequest(FulfillmentType.DELIVERY, PaymentMethod.CASH_ON_DELIVERY, addr));

        assertThat(conf.total()).isEqualByComparingTo("35.00");
    }

    @Test
    void deliveryWithUnavailableZoneThrows422() {
        when(deliveryLookup.lookup(any(), any()))
                .thenReturn(DeliveryLookupResult.unavailableMiss());
        AddressRequest addr = new AddressRequest("Marszałkowska", "1", null, "00-001", "Warszawa", null);

        assertThatThrownBy(() -> service.placeOrder(baseRequest(FulfillmentType.DELIVERY, PaymentMethod.CASH_ON_DELIVERY, addr)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Nie dostarczamy");

        verify(orderRepository, never()).save(any());
    }

    @Test
    void pickupSkipsLookupAndKeepsTotalAsSubtotal() {
        OrderConfirmationDto conf = service.placeOrder(baseRequest(FulfillmentType.PICKUP, PaymentMethod.CASH_ON_PICKUP, null));

        assertThat(conf.total()).isEqualByComparingTo("30.00");
        verify(deliveryLookup, never()).lookup(any(), any());
    }

    // D-03 — reszta z gotówki.

    @Test
    void cashChangeFromNullMeansExactAmount() {
        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);

        OrderConfirmationDto conf = service.placeOrder(
                baseRequest(FulfillmentType.PICKUP, PaymentMethod.CASH_ON_PICKUP, null, null));

        verify(orderRepository).save(captor.capture());
        assertThat(captor.getValue().getCashChangeFrom()).isNull();
        assertThat(conf.cashChangeFrom()).isNull();
    }

    @Test
    void cashChangeFromAboveTotalIsStoredScaledToTwoDecimals() {
        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);

        OrderConfirmationDto conf = service.placeOrder(
                baseRequest(FulfillmentType.PICKUP, PaymentMethod.CASH_ON_PICKUP, null, new BigDecimal("100")));

        verify(orderRepository).save(captor.capture());
        assertThat(captor.getValue().getCashChangeFrom()).isEqualByComparingTo("100.00");
        assertThat(conf.cashChangeFrom()).isEqualByComparingTo("100.00");
    }

    @Test
    void cashChangeFromEqualToTotalIsAccepted() {
        OrderConfirmationDto conf = service.placeOrder(
                baseRequest(FulfillmentType.PICKUP, PaymentMethod.CASH_ON_PICKUP, null, new BigDecimal("30.00")));

        assertThat(conf.cashChangeFrom()).isEqualByComparingTo("30.00");
    }

    @Test
    void cashChangeFromBelowTotalThrows422() {
        assertThatThrownBy(() -> service.placeOrder(
                baseRequest(FulfillmentType.PICKUP, PaymentMethod.CASH_ON_PICKUP, null, new BigDecimal("20.00"))))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("niższa niż wartość zamówienia");

        verify(orderRepository, never()).save(any());
    }

    @Test
    void cashChangeFromIsComparedAgainstTotalIncludingDeliveryFee() {
        when(deliveryLookup.lookup("NDM", "05-160"))
                .thenReturn(new DeliveryLookupResult(DeliveryZoneType.PAID, new BigDecimal("5.00"), "Modlin", 2L));
        AddressRequest addr = new AddressRequest("Forteczna", "1", null, "05-160", "NDM", null);

        // subtotal 30.00 + dostawa 5.00 = 35.00; banknot 32 zł nie wystarcza.
        assertThatThrownBy(() -> service.placeOrder(baseRequest(
                FulfillmentType.DELIVERY, PaymentMethod.CASH_ON_DELIVERY, addr, new BigDecimal("32.00"))))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("niższa niż wartość zamówienia");
    }

    @Test
    void newOrderGetsAutoEtaFromDefaultPreparationMinutes() {
        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);

        service.placeOrder(baseRequest(FulfillmentType.PICKUP, PaymentMethod.CASH_ON_PICKUP, null));

        verify(orderRepository).save(captor.capture());
        Order saved = captor.getValue();
        assertThat(saved.getEtaMinutes()).isEqualTo(30);
        assertThat(saved.getEtaSetAt()).isNotNull();
    }
}
