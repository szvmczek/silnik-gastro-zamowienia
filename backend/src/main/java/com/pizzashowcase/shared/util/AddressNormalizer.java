package com.pizzashowcase.shared.util;

import java.util.Locale;
import java.util.regex.Pattern;

public final class AddressNormalizer {

    private static final Pattern POSTAL_CANONICAL = Pattern.compile("^\\d{2}-\\d{3}$");
    private static final Pattern POSTAL_DIGITS_ONLY = Pattern.compile("^\\d{5}$");

    private AddressNormalizer() {
    }

    public static String normalizeCity(String raw) {
        if (raw == null) {
            throw new IllegalArgumentException("City must not be null");
        }
        String stripped = PolishText.stripAccents(raw)
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ")
                .trim();
        if (stripped.isEmpty()) {
            throw new IllegalArgumentException("City must not be blank");
        }
        return stripped;
    }

    public static String normalizePostalCode(String raw) {
        if (raw == null) {
            return null;
        }
        String compact = raw.replaceAll("\\s+", "");
        if (compact.isEmpty()) {
            return null;
        }
        if (POSTAL_CANONICAL.matcher(compact).matches()) {
            return compact;
        }
        if (POSTAL_DIGITS_ONLY.matcher(compact).matches()) {
            return compact.substring(0, 2) + "-" + compact.substring(2);
        }
        throw new IllegalArgumentException("Invalid postal code: " + raw);
    }

    public static boolean isValidPostalCode(String raw) {
        try {
            String normalized = normalizePostalCode(raw);
            return normalized != null;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }
}
