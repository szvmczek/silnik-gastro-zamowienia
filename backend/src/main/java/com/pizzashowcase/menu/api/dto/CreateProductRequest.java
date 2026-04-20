package com.pizzashowcase.menu.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateProductRequest(
        @NotNull Long categoryId,
        @NotBlank @Size(max = 140) String name,
        @Size(max = 2000) String description,
        @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) BigDecimal basePrice,
        @Size(max = 500) @Pattern(regexp = "^(https?://.+)?$", message = "imageUrl must start with http:// or https://") String imageUrl,
        int displayOrder,
        Boolean available
) {
}
