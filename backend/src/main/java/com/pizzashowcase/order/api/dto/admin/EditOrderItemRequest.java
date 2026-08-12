package com.pizzashowcase.order.api.dto.admin;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Pozycja w żądaniu edycji zamówienia.
 *
 * <p>{@code orderItemId} = null oznacza pozycję nową. Podany identyfikator
 * wskazuje istniejący wiersz: jeśli konfiguracja jest identyczna, wiersz
 * zostaje nietknięty razem ze swoim snapshotem cenowym (AD-006); każda
 * zmiana strukturalna przelicza go po aktualnych cenach menu.
 */
public record EditOrderItemRequest(
        Long orderItemId,
        @NotNull Long productId,
        Long variantId,
        List<Long> addonIds,
        @NotNull @Min(1) @Max(99) Integer quantity,
        @Size(max = 200) String itemNote
) {
}
