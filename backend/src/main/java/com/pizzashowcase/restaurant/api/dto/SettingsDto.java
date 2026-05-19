package com.pizzashowcase.restaurant.api.dto;

import com.pizzashowcase.restaurant.domain.RestaurantSettings;

import java.math.BigDecimal;
import java.time.Instant;

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
        String currency,
        String seoDescription,
        String googleMapsUrl,
        String socialFacebook,
        String socialInstagram,
        int defaultPreparationMinutes,
        BigDecimal minOrderAmount,
        String manualClosedReason,
        Instant manualClosedUntil
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
                s.getCurrency(),
                s.getSeoDescription(),
                s.getGoogleMapsUrl(),
                s.getSocialFacebook(),
                s.getSocialInstagram(),
                s.getDefaultPreparationMinutes(),
                s.getMinOrderAmount(),
                s.getManualClosedReason(),
                s.getManualClosedUntil()
        );
    }
}
