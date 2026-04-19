package com.pizzashowcase.menu.api.dto;

import java.util.List;

public record CategoryDto(
        Long id,
        String slug,
        String name,
        String description,
        int displayOrder,
        boolean active,
        List<ProductDto> products
) {
}
