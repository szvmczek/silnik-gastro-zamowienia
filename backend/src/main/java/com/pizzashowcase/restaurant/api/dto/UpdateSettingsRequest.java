package com.pizzashowcase.restaurant.api.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public record UpdateSettingsRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 200) String tagline,
        @NotBlank @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "primaryColor must be #RRGGBB") String primaryColor,
        @Size(max = 40) String phone,
        @Email @Size(max = 200) String email,
        @Size(max = 200) String addressLine,
        @Size(max = 100) String city,
        @Size(max = 20) String postalCode,
        @Size(max = 500) @Pattern(regexp = "^(https?://.+)?$", message = "logoUrl must start with http:// or https://") String logoUrl,
        @NotBlank @Size(min = 3, max = 3) String currency,
        @Size(max = 200) String seoDescription,
        @Size(max = 500) @Pattern(regexp = "^(https?://.+)?$", message = "googleMapsUrl must start with http:// or https://") String googleMapsUrl,
        @Size(max = 500) @Pattern(regexp = "^(https?://.+)?$", message = "socialFacebook must start with http:// or https://") String socialFacebook,
        @Size(max = 500) @Pattern(regexp = "^(https?://.+)?$", message = "socialInstagram must start with http:// or https://") String socialInstagram,
        @NotNull @Min(5) @Max(120) Integer defaultPreparationMinutes,
        @NotNull @DecimalMin("0.0") @DecimalMax("500.0") BigDecimal minOrderAmount,
        @Size(max = 200) String manualClosedReason,
        Instant manualClosedUntil
) {
}
