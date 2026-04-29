package com.pizzashowcase.order.api.dto.admin;

import com.pizzashowcase.order.domain.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateOrderStatusRequest(
        @NotNull Long version,
        @NotNull OrderStatus status,
        @Size(max = 500) String reason
) {
}
