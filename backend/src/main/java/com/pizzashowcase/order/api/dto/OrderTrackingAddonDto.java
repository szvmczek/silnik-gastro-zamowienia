package com.pizzashowcase.order.api.dto;

import java.math.BigDecimal;

public record OrderTrackingAddonDto(
        String groupName,
        String name,
        BigDecimal unitPrice
) {
}
