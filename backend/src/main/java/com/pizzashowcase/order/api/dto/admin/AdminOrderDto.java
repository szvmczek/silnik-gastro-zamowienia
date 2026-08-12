package com.pizzashowcase.order.api.dto.admin;

import com.pizzashowcase.order.api.dto.OrderTrackingAddressDto;
import com.pizzashowcase.order.api.dto.OrderTrackingItemDto;
import com.pizzashowcase.order.domain.FulfillmentType;
import com.pizzashowcase.order.domain.OrderStatus;
import com.pizzashowcase.order.domain.PaymentMethod;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdminOrderDto(
        Long id,
        Long version,
        String orderNumber,
        // AD-Δ13: Wyjątek od "Zero Backend Touch" w Warstwie 4 (M-033).
        // Pole wystawione żeby OrderDetailPage mógł zlinkować operator do
        // public trackera klienta przez /track/{token}. Wymaga support
        // workflow gdy klient dzwoni z pytaniem "gdzie moje zamówienie".
        String trackingToken,
        OrderStatus status,
        Integer etaMinutes,
        Instant etaSetAt,
        FulfillmentType fulfillmentType,
        PaymentMethod paymentMethod,
        Instant placedAt,
        Instant updatedAt,
        String customerName,
        String customerPhone,
        String customerEmail,
        String customerNotes,
        // D-03: nominał, z którego wydać resztę. null = odliczona kwota.
        // Wyjątek od D-08 „panel nietknięty" — to dana operacyjna, nie styl:
        // kurier / osoba wydająca musi wiedzieć, ile brać na wydanie.
        BigDecimal cashChangeFrom,
        OrderTrackingAddressDto deliveryAddress,
        List<OrderTrackingItemDto> items,
        BigDecimal subtotal,
        BigDecimal deliveryFee,
        String deliveryZoneName,
        BigDecimal total,
        List<AdminOrderStatusHistoryDto> statusHistory,
        // Historia edycji treści zamówienia — tylko w detalu, świadomie NIE
        // w AdminOrderListItemDto: payload listy z AD-022 zostaje bez zmian.
        List<AdminOrderEditDto> edits
) {
}
