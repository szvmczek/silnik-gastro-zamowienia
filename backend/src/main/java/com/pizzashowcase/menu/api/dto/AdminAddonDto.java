package com.pizzashowcase.menu.api.dto;

import java.math.BigDecimal;

public record AdminAddonDto(
        Long id,
        Long addonGroupId,
        String name,
        BigDecimal price,
        int displayOrder
) {
}
