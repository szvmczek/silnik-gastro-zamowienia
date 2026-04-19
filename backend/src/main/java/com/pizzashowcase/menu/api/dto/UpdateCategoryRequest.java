package com.pizzashowcase.menu.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateCategoryRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 2000) String description,
        int displayOrder,
        @NotNull Boolean active
) {
}
