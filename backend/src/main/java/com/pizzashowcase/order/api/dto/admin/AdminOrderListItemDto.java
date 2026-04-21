package com.pizzashowcase.order.api.dto.admin;

import com.pizzashowcase.order.domain.FulfillmentType;
import com.pizzashowcase.order.domain.OrderStatus;
import com.pizzashowcase.order.domain.PaymentMethod;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminOrderListItemDto(
        Long id,
        Long version,
        String orderNumber,
        OrderStatus status,
        FulfillmentType fulfillmentType,
        PaymentMethod paymentMethod,
        String customerName,
        String customerPhone,
        BigDecimal total,
        Instant placedAt,
        Integer etaMinutes,
        int itemsCount
) {
}
