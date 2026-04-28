package com.pizzashowcase.delivery.domain;

import java.math.BigDecimal;

public record DeliveryLookupResult(
        DeliveryZoneType type,
        BigDecimal fee,
        String zoneName,
        Long zoneId
) {
    public static DeliveryLookupResult unavailableMiss() {
        return new DeliveryLookupResult(DeliveryZoneType.UNAVAILABLE, BigDecimal.ZERO, null, null);
    }

    public static DeliveryLookupResult of(DeliveryZone zone) {
        return new DeliveryLookupResult(zone.getType(), zone.getDeliveryFee(), zone.getName(), zone.getId());
    }

    public boolean isAvailable() {
        return type != DeliveryZoneType.UNAVAILABLE;
    }
}
