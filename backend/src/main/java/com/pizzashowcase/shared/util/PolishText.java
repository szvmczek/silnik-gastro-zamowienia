package com.pizzashowcase.shared.util;

import java.text.Normalizer;

public final class PolishText {

    private PolishText() {
    }

    public static String stripAccents(String input) {
        if (input == null) return "";
        String mapped = input
                .replace('ł', 'l').replace('Ł', 'L')
                .replace('ń', 'n').replace('Ń', 'N');
        return Normalizer.normalize(mapped, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
    }
}
