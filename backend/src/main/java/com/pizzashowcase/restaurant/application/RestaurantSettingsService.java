package com.pizzashowcase.restaurant.application;

import com.pizzashowcase.restaurant.domain.RestaurantSettings;
import com.pizzashowcase.restaurant.infrastructure.RestaurantSettingsRepository;
import com.pizzashowcase.shared.error.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
            String socialInstagram
    ) {}
}
