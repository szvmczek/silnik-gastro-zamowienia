package com.pizzashowcase.menu.api.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateAvailabilityRequest(
        @NotNull Boolean available
) {
}
