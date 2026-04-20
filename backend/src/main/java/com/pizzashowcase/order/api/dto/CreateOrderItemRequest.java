package com.pizzashowcase.order.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateOrderItemRequest(
        @NotNull Long productId,
        Long variantId,
        List<Long> addonIds,
        @NotNull @Min(1) @Max(99) Integer quantity
) {
}
