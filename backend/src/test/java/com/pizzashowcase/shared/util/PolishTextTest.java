package com.pizzashowcase.shared.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PolishTextTest {

    @Test
    void nullInputReturnsEmpty() {
        assertThat(PolishText.stripAccents(null)).isEmpty();
    }

    @Test
    void stripsLowercaseDiacritics() {
        assertThat(PolishText.stripAccents("ąęćłńóśźż")).isEqualTo("aeclnoszz");
    }

    @Test
    void stripsUppercaseDiacritics() {
        assertThat(PolishText.stripAccents("ĄĘĆŁŃÓŚŹŻ")).isEqualTo("AECLNOSZZ");
    }

    @Test
    void preservesWhitespaceAndCase() {
        assertThat(PolishText.stripAccents("Nowy Dwór")).isEqualTo("Nowy Dwor");
    }

    @Test
    void leavesPlainAsciiUntouched() {
        assertThat(PolishText.stripAccents("Pizza Margherita")).isEqualTo("Pizza Margherita");
    }
}
