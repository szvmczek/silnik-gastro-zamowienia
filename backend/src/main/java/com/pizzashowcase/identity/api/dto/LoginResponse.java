package com.pizzashowcase.identity.api.dto;

import java.time.Instant;

public record LoginResponse(String token, Instant expiresAt, UserSummaryDto user) {
}
