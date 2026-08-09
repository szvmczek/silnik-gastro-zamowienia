package com.pizzashowcase.order.api.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderConfirmationDto(
        String orderNumber,
        UUID trackingToken,
        BigDecimal total,
        BigDecimal deliveryFee,
        String deliveryZoneName,
        // D-03: null = odliczona kwota.
        BigDecimal cashChangeFrom
) {
}
