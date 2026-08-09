package com.pizzashowcase.order.api.dto;

import com.pizzashowcase.order.domain.FulfillmentType;
import com.pizzashowcase.order.domain.OrderStatus;
import com.pizzashowcase.order.domain.PaymentMethod;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderTrackingDto(
        String orderNumber,
        OrderStatus status,
        Integer etaMinutes,
        Instant etaSetAt,
        FulfillmentType fulfillmentType,
        PaymentMethod paymentMethod,
        Instant placedAt,
        OrderTrackingAddressDto deliveryAddress,
        List<OrderTrackingItemDto> items,
        BigDecimal subtotal,
        BigDecimal deliveryFee,
        String deliveryZoneName,
        BigDecimal total,
        // D-03: null = odliczona kwota.
        BigDecimal cashChangeFrom
) {
}
