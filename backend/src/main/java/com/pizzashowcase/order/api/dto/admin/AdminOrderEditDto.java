package com.pizzashowcase.order.api.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Wpis historii edycji dla panelu. Wystawiamy gotowe linie opisu, nigdy
 * surowego snapshotu — historia ma być czytelna dla człowieka.
 *
 * <p>{@code canUndo} liczy backend (najnowszy niecofnięty wpis + status
 * dalej edytowalny), żeby front nie musiał powielać tej reguły.
 */
public record AdminOrderEditDto(
        Long id,
        Instant editedAt,
        String editedBy,
        List<String> summaryLines,
        BigDecimal totalBefore,
        BigDecimal totalAfter,
        Instant undoneAt,
        String undoneBy,
        boolean canUndo
) {
}
