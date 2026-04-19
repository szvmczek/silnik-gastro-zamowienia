package com.pizzashowcase.menu.api.dto;

import java.util.List;

public record MenuDto(
        List<CategoryDto> categories
) {
}
