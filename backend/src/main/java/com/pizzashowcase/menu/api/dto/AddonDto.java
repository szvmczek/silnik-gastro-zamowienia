package com.pizzashowcase.menu.api.dto;

import java.math.BigDecimal;

public record AddonDto(
        Long id,
        String name,
        BigDecimal price,
        int displayOrder
) {
}
