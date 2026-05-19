package com.pizzashowcase.restaurant.api;

import com.pizzashowcase.restaurant.api.dto.SettingsDto;
import com.pizzashowcase.restaurant.api.dto.UpdateSettingsRequest;
import com.pizzashowcase.restaurant.application.RestaurantSettingsService;
import com.pizzashowcase.restaurant.application.RestaurantSettingsService.SettingsUpdate;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/settings")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSettingsController {

    private final RestaurantSettingsService service;

    public AdminSettingsController(RestaurantSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public SettingsDto get() {
        return SettingsDto.from(service.getSettings());
    }

    @PutMapping
    public SettingsDto update(@Valid @RequestBody UpdateSettingsRequest request) {
        SettingsUpdate update = new SettingsUpdate(
                request.name(),
                request.tagline(),
                request.primaryColor(),
                request.phone(),
                request.email(),
                request.addressLine(),
                request.city(),
                request.postalCode(),
                request.logoUrl(),
                request.currency(),
                request.seoDescription(),
                request.googleMapsUrl(),
                request.socialFacebook(),
                request.socialInstagram(),
                request.defaultPreparationMinutes(),
                request.minOrderAmount(),
                request.manualClosedReason(),
                request.manualClosedUntil()
        );
        return SettingsDto.from(service.update(update));
    }
}
