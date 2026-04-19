package com.pizzashowcase.menu.api.dto;

import java.math.BigDecimal;

public record AdminProductDto(
        Long id,
        Long categoryId,
        String categorySlug,
        String categoryName,
        String slug,
        String name,
        String description,
        BigDecimal basePrice,
        String imageUrl,
        int displayOrder,
        boolean available,
        int variantsCount,
        int addonGroupsCount
) {
}
