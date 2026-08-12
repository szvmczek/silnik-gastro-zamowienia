package com.pizzashowcase.order.api.dto.admin;

import jakarta.validation.constraints.NotNull;

/** Cofnięcie ostatniej edycji. Wersja wymagana z tego samego powodu co przy edycji (AD-009). */
public record UndoOrderEditRequest(@NotNull Long version) {
}
