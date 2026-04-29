package com.pizzashowcase.order.api.dto.admin;

import com.pizzashowcase.order.domain.OrderStatus;

import java.time.Instant;

public record AdminOrderStatusHistoryDto(
        OrderStatus status,
        Instant changedAt,
        String changedBy,
        String reason
) {
}
