package com.pizzashowcase.delivery.api.dto;

import com.pizzashowcase.delivery.domain.DeliveryZoneType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateDeliveryZoneRequest(
        @NotBlank @Size(max = 80) String name,
        @NotNull DeliveryZoneType type,
        @NotNull
        @DecimalMin(value = "0.00", inclusive = true)
        @Digits(integer = 8, fraction = 2)
        BigDecimal deliveryFee,
        Boolean active
) {
}
