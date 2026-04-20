package com.pizzashowcase.menu.api.dto;

public record AdminCategoryDto(
        Long id,
        Long version,
        String slug,
        String name,
        String description,
        int displayOrder,
        boolean active,
        long productsCount
) {
}
