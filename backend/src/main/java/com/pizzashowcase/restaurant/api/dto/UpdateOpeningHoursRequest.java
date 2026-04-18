package com.pizzashowcase.restaurant.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateOpeningHoursRequest(
        @NotNull @Size(min = 7, max = 7) @Valid List<OpeningHoursEntryRequest> days
) {
}
