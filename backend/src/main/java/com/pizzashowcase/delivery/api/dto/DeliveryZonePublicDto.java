package com.pizzashowcase.delivery.api.dto;

import com.pizzashowcase.delivery.domain.DeliveryZoneType;

import java.math.BigDecimal;
import java.util.List;

/**
 * Publiczny, tylko-do-odczytu widok strefy dostawy — zasila kafle
 * „Dostawa i odbiór" na stronie głównej (design v3, D-01: dane realnie
 * z API stref, nie hardcoded).
 *
 * Świadomie NIE wystawia id ani kodów pocztowych — landing potrzebuje
 * tylko nazwy, kosztu i listy miejscowości. Adres sprawdza się przez
 * POST /check, nie przez pobranie całej mapy stref.
 */
public record DeliveryZonePublicDto(
        String name,
        DeliveryZoneType type,
        BigDecimal fee,
        List<String> cities
) {
}
