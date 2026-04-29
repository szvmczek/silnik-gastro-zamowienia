package com.pizzashowcase.order.api.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record AdminDashboardStatsDto(
        Today today,
        ActiveCounts activeCounts,
        List<DailyStats> last7Days,
        List<HourlyStats> hourlyToday,
        List<TopProductStats> topProducts30Days
) {
    public record Today(
            long orderCount,
            BigDecimal totalRevenue,
            BigDecimal averageOrderValue,
            long deliveryCount,
            long pickupCount,
            long canceledCount
    ) {
    }

    public record ActiveCounts(
            // 'new' is reserved in Java; map JSON key explicitly.
            @JsonProperty("new") long newCount,
            long inPreparation,
            long readyForPickup,
            long readyForDelivery,
            long outForDelivery
    ) {
    }

    public record DailyStats(LocalDate date, long orderCount, BigDecimal revenue) {
    }

    public record HourlyStats(int hour, long orderCount) {
    }

    public record TopProductStats(String productName, long totalSold) {
    }
}
