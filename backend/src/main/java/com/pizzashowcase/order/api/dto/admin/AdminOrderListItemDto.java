package com.pizzashowcase.order.api.dto.admin;

import com.pizzashowcase.order.api.dto.OrderTrackingAddressDto;
import com.pizzashowcase.order.api.dto.OrderTrackingItemDto;
import com.pizzashowcase.order.domain.FulfillmentType;
import com.pizzashowcase.order.domain.OrderStatus;
import com.pizzashowcase.order.domain.PaymentMethod;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdminOrderListItemDto(
        Long id,
        Long version,
        String orderNumber,
        OrderStatus status,
        FulfillmentType fulfillmentType,
        PaymentMethod paymentMethod,
        String customerName,
        String customerPhone,
        String customerNotes,
        OrderTrackingAddressDto deliveryAddress,
        List<OrderTrackingItemDto> items,
        BigDecimal total,
        Instant placedAt,
        Integer etaMinutes,
        Instant etaSetAt,
        int itemsCount
) {
}
