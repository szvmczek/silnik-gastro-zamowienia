package com.pizzashowcase.delivery.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DeliveryCheckRequest(
        @NotBlank
        @Size(max = 120)
        String city,

        @NotBlank
        @Size(max = 6)
        String postalCode
) {
}
