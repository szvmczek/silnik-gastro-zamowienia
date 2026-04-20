package com.pizzashowcase.menu.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAddonGroupRequest(
        @NotBlank @Size(max = 100) String name,
        @Min(0) int minSelect,
        @Min(0) int maxSelect,
        Boolean required
) {
}
