package com.pizzashowcase.restaurant.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateSettingsRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 200) String tagline,
        @NotBlank @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "primaryColor must be #RRGGBB") String primaryColor,
        @Size(max = 40) String phone,
        @Email @Size(max = 200) String email,
        @Size(max = 200) String addressLine,
        @Size(max = 100) String city,
        @Size(max = 20) String postalCode,
        @Size(max = 500) String logoUrl,
        @NotBlank @Size(min = 3, max = 3) String currency
) {
}
