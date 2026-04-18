package com.pizzashowcase.restaurant.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePageContentRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank String body,
        @Size(max = 500) String imageUrl,
        @Size(max = 60) String ctaLabel,
        @Size(max = 300) String ctaHref
) {
}
