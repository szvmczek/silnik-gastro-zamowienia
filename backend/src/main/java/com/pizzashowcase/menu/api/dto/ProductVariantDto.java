package com.pizzashowcase.menu.api.dto;

import java.math.BigDecimal;

public record ProductVariantDto(
        Long id,
        String name,
        BigDecimal price,
        int displayOrder
) {
}
