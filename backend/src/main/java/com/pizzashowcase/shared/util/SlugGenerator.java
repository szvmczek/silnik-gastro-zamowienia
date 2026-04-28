package com.pizzashowcase.shared.util;

import java.util.Locale;
import java.util.function.Predicate;

public final class SlugGenerator {

    private SlugGenerator() {
    }

    public static String slugify(String input) {
        if (input == null) return "";
        String stripped = PolishText.stripAccents(input);
        String lower = stripped.toLowerCase(Locale.ROOT);
        String hyphenated = lower.replaceAll("[^a-z0-9]+", "-");
        return trimHyphens(hyphenated);
    }

    public static String uniqueSlug(String baseName, Predicate<String> exists) {
        String base = slugify(baseName);
        if (base.isEmpty()) base = "item";
        if (!exists.test(base)) return base;
        int suffix = 2;
        while (true) {
            String candidate = base + "-" + suffix;
            if (!exists.test(candidate)) return candidate;
            suffix++;
            if (suffix > 1000) {
                throw new IllegalStateException("Unable to generate unique slug for: " + baseName);
            }
        }
    }

    private static String trimHyphens(String s) {
        int start = 0;
        int end = s.length();
        while (start < end && s.charAt(start) == '-') start++;
        while (end > start && s.charAt(end - 1) == '-') end--;
        return s.substring(start, end);
    }
}
