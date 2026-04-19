package com.pizzashowcase.menu.api.dto;

import java.math.BigDecimal;

public record AdminVariantDto(
        Long id,
        Long productId,
        String name,
        BigDecimal price,
        int displayOrder
) {
}
