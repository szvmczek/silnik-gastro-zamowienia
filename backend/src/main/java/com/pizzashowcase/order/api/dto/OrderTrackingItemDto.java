package com.pizzashowcase.order.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record OrderTrackingItemDto(
        String productName,
        String variantName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal,
        List<OrderTrackingAddonDto> addons
) {
}
