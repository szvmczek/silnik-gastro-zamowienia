package com.pizzashowcase.order.api.dto.admin;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderEtaRequest(
        @NotNull Long version,
        @NotNull @Min(0) @Max(480) Integer minutesFromNow
) {
}
