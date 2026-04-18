package com.pizzashowcase.restaurant.api.dto;

import com.pizzashowcase.restaurant.domain.RestaurantSettings;

public record SettingsDto(
        Long id,
        String name,
        String tagline,
        String primaryColor,
        String phone,
        String email,
        String addressLine,
        String city,
        String postalCode,
        String logoUrl,
        String currency
) {
    public static SettingsDto from(RestaurantSettings s) {
        return new SettingsDto(
                s.getId(),
                s.getName(),
                s.getTagline(),
                s.getPrimaryColor(),
                s.getPhone(),
                s.getEmail(),
                s.getAddressLine(),
                s.getCity(),
                s.getPostalCode(),
                s.getLogoUrl(),
                s.getCurrency()
        );
    }
}
