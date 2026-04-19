package com.pizzashowcase.menu.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProductDto(
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
        List<ProductVariantDto> variants,
        List<AddonGroupDto> addonGroups
) {
}
