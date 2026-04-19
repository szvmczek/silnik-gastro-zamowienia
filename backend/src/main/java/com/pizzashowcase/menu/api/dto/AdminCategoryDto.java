package com.pizzashowcase.menu.api.dto;

public record AdminCategoryDto(
        Long id,
        String slug,
        String name,
        String description,
        int displayOrder,
        boolean active,
        long productsCount
) {
}
