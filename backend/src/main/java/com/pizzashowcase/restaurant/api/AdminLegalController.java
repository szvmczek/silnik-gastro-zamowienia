package com.pizzashowcase.restaurant.api;

import com.pizzashowcase.restaurant.api.dto.LegalContentDto;
import com.pizzashowcase.restaurant.api.dto.UpdateLegalRequest;
import com.pizzashowcase.restaurant.application.RestaurantSettingsService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * RODO documents editor endpoint (M-046). Dedicated — kept off the shared
 * {@code SettingsDto} so the legal text does not bloat the 60s-polled
 * {@code /api/public/settings}.
 */
@RestController
@RequestMapping("/api/admin/legal")
@PreAuthorize("hasRole('ADMIN')")
public class AdminLegalController {

    private final RestaurantSettingsService service;

    public AdminLegalController(RestaurantSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public LegalContentDto get() {
        return LegalContentDto.from(service.getSettings());
    }

    @PutMapping
    public LegalContentDto update(@Valid @RequestBody UpdateLegalRequest request) {
        return LegalContentDto.from(
                service.updateLegal(request.privacyPolicy(), request.termsOfService()));
    }
}
