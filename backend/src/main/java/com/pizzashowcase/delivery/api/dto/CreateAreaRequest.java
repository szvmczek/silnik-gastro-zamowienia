package com.pizzashowcase.delivery.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAreaRequest(
        @NotBlank @Size(max = 120) String city,
        @Size(max = 6) String postalCode
) {
}
