package com.pizzashowcase.order.domain;

import com.pizzashowcase.shared.error.ApiException;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * AD-026: nominał, z którego ma być wydana reszta, musi pokryć kwotę
 * zamówienia. „Reszta ze 100 zł" przy rachunku na 132 zł to nie
 * preferencja, tylko błąd danych, którego kurier nie rozwiąże na miejscu.
 *
 * <p>Reguła jest wspólna dla checkoutu i dla edycji zamówienia w panelu —
 * podbicie sumy edycją nie może zostawić po cichu nieaktualnej kwoty.
 * {@code null} znaczy „brak danych o reszcie" (patrz P10 z rundy poprawek
 * 2026-08-10) i jest dopuszczalne w obu ścieżkach.
 */
public final class CashChangePolicy {

    private CashChangePolicy() {
    }

    public static BigDecimal normalize(BigDecimal requested, BigDecimal total) {
        if (requested == null) {
            return null;
        }
        BigDecimal scaled = requested.setScale(2, RoundingMode.HALF_UP);
        if (scaled.compareTo(total) < 0) {
            throw ApiException.unprocessable(
                    "Kwota, z której ma być wydana reszta, jest niższa niż wartość zamówienia.");
        }
        return scaled;
    }

    /** Podgląd bez rzucania wyjątku — dla live preview edycji. */
    public static boolean isSufficient(BigDecimal requested, BigDecimal total) {
        return requested == null || requested.setScale(2, RoundingMode.HALF_UP).compareTo(total) >= 0;
    }
}
