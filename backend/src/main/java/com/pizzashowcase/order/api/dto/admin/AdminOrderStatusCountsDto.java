package com.pizzashowcase.order.api.dto.admin;

import com.pizzashowcase.order.domain.OrderStatus;

import java.util.Map;

/**
 * Per-status order counts for the admin orders-list filter chips.
 *
 * <p>{@code byStatus} always carries an entry for every {@link OrderStatus}
 * (0 when none) so the frontend can render every chip without null handling.
 * {@code total} is the sum across statuses for the applied filter range.
 */
public record AdminOrderStatusCountsDto(
        Map<OrderStatus, Long> byStatus,
        long total
) {
}
