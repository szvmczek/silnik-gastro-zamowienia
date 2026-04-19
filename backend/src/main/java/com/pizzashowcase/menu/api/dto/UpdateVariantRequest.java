package com.pizzashowcase.menu.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateVariantRequest(
        @NotBlank @Size(max = 60) String name,
        @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) BigDecimal price,
        int displayOrder
) {
}
