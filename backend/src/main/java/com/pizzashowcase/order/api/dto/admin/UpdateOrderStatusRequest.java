package com.pizzashowcase.order.api.dto.admin;

import com.pizzashowcase.order.domain.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull Long version,
        @NotNull OrderStatus status
) {
}
