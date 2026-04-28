package com.pizzashowcase.delivery.api.dto;

import com.pizzashowcase.delivery.domain.DeliveryZoneType;

import java.math.BigDecimal;
import java.util.List;

public record DeliveryZoneDto(
        Long id,
        String name,
        DeliveryZoneType type,
        BigDecimal deliveryFee,
        boolean active,
        int displayOrder,
        List<DeliveryZoneAreaDto> areas
) {
}
