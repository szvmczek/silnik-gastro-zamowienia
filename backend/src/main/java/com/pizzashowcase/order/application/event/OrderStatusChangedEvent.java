package com.pizzashowcase.order.application.event;

import com.pizzashowcase.order.domain.FulfillmentType;
import com.pizzashowcase.order.domain.OrderStatus;

public record OrderStatusChangedEvent(
        Long orderId,
        String orderNumber,
        OrderStatus newStatus,
        FulfillmentType fulfillmentType
) {
}
