package com.pizzashowcase.restaurant.api.dto;

import jakarta.validation.constraints.Size;

/**
 * Admin update payload for the RODO documents (M-046). Both fields optional —
 * an empty/blank value clears the document (service trims to null).
 */
public record UpdateLegalRequest(
        @Size(max = 20000) String privacyPolicy,
        @Size(max = 20000) String termsOfService
) {
}
