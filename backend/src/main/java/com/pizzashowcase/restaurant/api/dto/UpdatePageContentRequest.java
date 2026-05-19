package com.pizzashowcase.restaurant.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdatePageContentRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 5000) String body,
        @Size(max = 500) @Pattern(regexp = "^(https?://.+)?$", message = "imageUrl must start with http:// or https://") String imageUrl,
        @Size(max = 60) String ctaLabel,
        @Size(max = 300) @Pattern(regexp = "^((https?://|/|tel:|mailto:).+)?$", message = "ctaHref must start with http://, https://, tel:, mailto: or /") String ctaHref,
        @NotNull Boolean active
) {
}
