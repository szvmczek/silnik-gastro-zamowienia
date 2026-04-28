package com.pizzashowcase.delivery.api.dto;

import com.pizzashowcase.delivery.domain.DeliveryLookupResult;
import com.pizzashowcase.delivery.domain.DeliveryZoneType;

import java.math.BigDecimal;

public record DeliveryCheckResponse(
        DeliveryZoneType status,
        BigDecimal fee,
        String zoneName
) {
    public static DeliveryCheckResponse from(DeliveryLookupResult r) {
        return new DeliveryCheckResponse(r.type(), r.fee(), r.zoneName());
    }
}
