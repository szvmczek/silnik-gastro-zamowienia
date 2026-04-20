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
        FulfillmentType fulfillmentType,
        PaymentMethod paymentMethod,
        Instant placedAt,
        OrderTrackingAddressDto deliveryAddress,
        List<OrderTrackingItemDto> items,
        BigDecimal subtotal,
        BigDecimal total
) {
}
