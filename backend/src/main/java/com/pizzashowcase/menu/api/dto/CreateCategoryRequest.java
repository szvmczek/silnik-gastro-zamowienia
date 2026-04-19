package com.pizzashowcase.menu.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCategoryRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 2000) String description,
        int displayOrder,
        Boolean active
) {
}
