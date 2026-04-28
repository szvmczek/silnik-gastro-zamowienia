package com.pizzashowcase.shared.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AddressNormalizerTest {

    @Test
    void cityLowercasesStripsAccentsAndCollapsesWhitespace() {
        assertThat(AddressNormalizer.normalizeCity("Łomianki")).isEqualTo("lomianki");
        assertThat(AddressNormalizer.normalizeCity("Nowy Dwór"))
                .isEqualTo("nowy dwor");
        assertThat(AddressNormalizer.normalizeCity("  NOWY   DWÓR  "))
                .isEqualTo("nowy dwor");
    }

    @Test
    void cityRejectsNullAndBlank() {
        assertThatThrownBy(() -> AddressNormalizer.normalizeCity(null))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> AddressNormalizer.normalizeCity("   "))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void postalAcceptsCanonicalFormat() {
        assertThat(AddressNormalizer.normalizePostalCode("05-100")).isEqualTo("05-100");
    }

    @Test
    void postalReformatsFiveDigits() {
        assertThat(AddressNormalizer.normalizePostalCode("05100")).isEqualTo("05-100");
    }

    @Test
    void postalNullReturnsNull() {
        assertThat(AddressNormalizer.normalizePostalCode(null)).isNull();
        assertThat(AddressNormalizer.normalizePostalCode("   ")).isNull();
    }

    @Test
    void postalRejectsInvalid() {
        assertThatThrownBy(() -> AddressNormalizer.normalizePostalCode("abc"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> AddressNormalizer.normalizePostalCode("123-45"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void postalStripsInternalWhitespace() {
        assertThat(AddressNormalizer.normalizePostalCode(" 05 - 100 ")).isEqualTo("05-100");
    }

    @Test
    void isValidPostalCodeReturnsFalseForInvalid() {
        assertThat(AddressNormalizer.isValidPostalCode("05-100")).isTrue();
        assertThat(AddressNormalizer.isValidPostalCode("05100")).isTrue();
        assertThat(AddressNormalizer.isValidPostalCode("abc")).isFalse();
        assertThat(AddressNormalizer.isValidPostalCode(null)).isFalse();
    }
}
