package com.pizzashowcase.restaurant.application;

import com.pizzashowcase.restaurant.domain.RestaurantSettings;
import com.pizzashowcase.restaurant.infrastructure.RestaurantSettingsRepository;
import com.pizzashowcase.shared.error.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Service
public class RestaurantSettingsService {

    private final RestaurantSettingsRepository repository;

    public RestaurantSettingsService(RestaurantSettingsRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public RestaurantSettings getSettings() {
        return repository.findById(RestaurantSettings.SINGLETON_ID)
                .orElseThrow(() -> ApiException.notFound("Restaurant settings not initialized"));
    }

    @Transactional
    public RestaurantSettings update(SettingsUpdate update) {
        RestaurantSettings settings = getSettings();
        settings.setName(update.name());
        settings.setTagline(update.tagline());
        settings.setPrimaryColor(update.primaryColor());
        settings.setPhone(update.phone());
        settings.setEmail(update.email());
        settings.setAddressLine(update.addressLine());
        settings.setCity(update.city());
        settings.setPostalCode(update.postalCode());
        settings.setLogoUrl(update.logoUrl());
        settings.setCurrency(update.currency());
        settings.setSeoDescription(update.seoDescription());
        settings.setGoogleMapsUrl(update.googleMapsUrl());
        settings.setSocialFacebook(update.socialFacebook());
        settings.setSocialInstagram(update.socialInstagram());
        settings.setDefaultPreparationMinutes(update.defaultPreparationMinutes());
        settings.setMinOrderAmount(update.minOrderAmount());
        // Manual close — N32: reason null clears the close; until only kept
        // when a reason is present.
        String reason = update.manualClosedReason();
        boolean hasReason = reason != null && !reason.isBlank();
        settings.setManualClosedReason(hasReason ? reason.trim() : null);
        settings.setManualClosedUntil(hasReason ? update.manualClosedUntil() : null);
        return settings;
    }

    public record SettingsUpdate(
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
    ) {}
}
