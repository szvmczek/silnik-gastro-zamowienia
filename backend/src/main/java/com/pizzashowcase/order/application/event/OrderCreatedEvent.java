package com.pizzashowcase.order.application.event;

import java.math.BigDecimal;
import java.time.Instant;

public record OrderCreatedEvent(
        Long orderId,
        String orderNumber,
        BigDecimal total,
        Instant placedAt
) {
}
