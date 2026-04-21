package com.pizzashowcase.order.api.dto.admin;

public record AdminDashboardSummaryDto(
        long newToday,
        long inPreparation,
        long awaitingFulfillment
) {
}
