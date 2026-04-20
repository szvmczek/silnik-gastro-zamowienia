package com.pizzashowcase.order.api.dto;

public record OrderTrackingAddressDto(
        String street,
        String buildingNumber,
        String apartmentNumber,
        String postalCode,
        String city,
        String notes
) {
}
