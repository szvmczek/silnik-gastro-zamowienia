package com.pizzashowcase.order.api.dto.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

/**
 * Pełny stan docelowy zamówienia po edycji — nie delta. Backend porównuje
 * go z bieżącym stanem i sam ustala, co się zmieniło.
 *
 * <p>{@code cashChangeFrom} przychodzi zawsze jawnie ({@code null} = brak
 * danych o reszcie, patrz P10), więc podbicie sumy nie może po cichu
 * zostawić nieaktualnego nominału — walidacja AD-026 zadziała na nowej
 * kwocie.
 *
 * <p>{@code version} jest wymagane: dwóch adminów na jednym zamówieniu
 * kończy się 409, nie cichym nadpisaniem (AD-009).
 */
public record EditOrderRequest(
        @NotNull Long version,
        @NotEmpty @Valid List<EditOrderItemRequest> items,
        @Size(max = 500) String customerNotes,
        BigDecimal cashChangeFrom,
        @Size(max = 500) String reason
) {
}
