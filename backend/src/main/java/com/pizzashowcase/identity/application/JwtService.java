package com.pizzashowcase.identity.application;

import com.pizzashowcase.config.JwtProperties;
import com.pizzashowcase.identity.domain.Role;
import com.pizzashowcase.identity.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.DecodingException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final int MIN_KEY_BYTES = 32;

    private final JwtProperties properties;
    private SecretKey signingKey;
    private Duration expiration;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void init() {
        String secret = properties.secret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET is not set. Generate one with: openssl rand -base64 48");
        }
        byte[] keyBytes = decodeSecret(secret);
        if (keyBytes.length < MIN_KEY_BYTES) {
            throw new IllegalStateException(
                    "JWT_SECRET is too short (" + keyBytes.length + " bytes). "
                            + "Need at least " + MIN_KEY_BYTES + " bytes. "
                            + "Run: openssl rand -base64 48");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        int hours = properties.expirationHours() <= 0 ? 12 : properties.expirationHours();
        this.expiration = Duration.ofHours(hours);
    }

    private byte[] decodeSecret(String secret) {
        try {
            byte[] decoded = Decoders.BASE64.decode(secret);
            if (decoded.length >= MIN_KEY_BYTES) {
                return decoded;
            }
        } catch (DecodingException | IllegalArgumentException ignored) {
            // Not valid base64 — fall back to raw UTF-8 bytes below.
        }
        return secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    public IssuedToken issue(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(expiration);
        String token = Jwts.builder()
                .subject(user.getEmail())
                .claim("uid", user.getId())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey)
                .compact();
        return new IssuedToken(token, expiresAt);
    }

    public Optional<JwtPayload> parse(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            Role role = Role.valueOf(claims.get("role", String.class));
            Long uid = claims.get("uid", Number.class).longValue();
            return Optional.of(new JwtPayload(claims.getSubject(), uid, role, claims.getExpiration().toInstant()));
        } catch (ExpiredJwtException ex) {
            log.debug("JWT expired at {} for subject {}", ex.getClaims().getExpiration(), ex.getClaims().getSubject());
            return Optional.empty();
        } catch (JwtException ex) {
            log.warn("JWT rejected: {}", ex.getClass().getSimpleName());
            return Optional.empty();
        } catch (Exception ex) {
            log.warn("JWT parse failed: {}", ex.getClass().getSimpleName());
            return Optional.empty();
        }
    }

    public record IssuedToken(String token, Instant expiresAt) {}

    public record JwtPayload(String email, Long userId, Role role, Instant expiresAt) {}
}
