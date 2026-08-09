import type { PublicProductDto } from "@/shared/api/menuApi";

/**
 * Paczka pokazuje na kartach badge OSTRA i WEGE. W modelu nie ma pola
 * na tagi produktu i NIE dokładamy go w tej rundzie (to zmiana schematu
 * plus UI w panelu — odłożone w ROADMAP.md).
 *
 * OSTRA da się wywnioskować wiarygodnie ze składu, bo ostre składniki
 * nazywają się wprost. WEGE świadomie pomijamy: „brak mięsa na liście"
 * to wnioskowanie z nieobecności i pomyliłoby się przy pierwszym
 * produkcie opisanym mniej dosłownie. Lepiej nie pokazać niż skłamać
 * o diecie.
 */
const SPICY_PATTERN = /(ostr[aey]|chili|jalape|pepperoni|papryczk)/i;

export function isSpicy(product: PublicProductDto): boolean {
  return SPICY_PATTERN.test(product.description ?? "");
}
