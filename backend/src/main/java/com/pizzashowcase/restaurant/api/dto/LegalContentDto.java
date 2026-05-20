package com.pizzashowcase.restaurant.api.dto;

import com.pizzashowcase.restaurant.domain.RestaurantSettings;

/**
 * Privacy policy + terms of service text (M-046).
 *
 * <p>Served by {@code GET /api/public/legal} — deliberately separate from the
 * 60s-polled {@code /api/public/settings} so the legal documents do not ride
 * on every poll — and by {@code GET /api/admin/legal}.
 */
public record LegalContentDto(
        String privacyPolicy,
        String termsOfService
) {
    public static LegalContentDto from(RestaurantSettings s) {
        return new LegalContentDto(s.getPrivacyPolicy(), s.getTermsOfService());
    }
}
