package com.pizzashowcase.shared.util;

import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class SlugGeneratorTest {

    @Test
    void slugifiesPolishDiacritics() {
        assertThat(SlugGenerator.slugify("Łomianki")).isEqualTo("lomianki");
        assertThat(SlugGenerator.slugify("Nowy Dwór")).isEqualTo("nowy-dwor");
        assertThat(SlugGenerator.slugify("ąęćłńóśźż")).isEqualTo("aeclnoszz");
    }

    @Test
    void slugifiesPunctuationAndSpaces() {
        assertThat(SlugGenerator.slugify("Pizza Margherita!")).isEqualTo("pizza-margherita");
        assertThat(SlugGenerator.slugify("  spacje  ")).isEqualTo("spacje");
    }

    @Test
    void nullAndEmptyHandled() {
        assertThat(SlugGenerator.slugify(null)).isEmpty();
        assertThat(SlugGenerator.slugify("")).isEmpty();
    }

    @Test
    void uniqueSlugAppendsSuffixOnCollision() {
        Set<String> taken = new HashSet<>(Set.of("pizza", "pizza-2"));
        String result = SlugGenerator.uniqueSlug("Pizza", taken::contains);
        assertThat(result).isEqualTo("pizza-3");
    }

    @Test
    void uniqueSlugUsesBaseWhenFree() {
        String result = SlugGenerator.uniqueSlug("Margherita", s -> false);
        assertThat(result).isEqualTo("margherita");
    }
}
