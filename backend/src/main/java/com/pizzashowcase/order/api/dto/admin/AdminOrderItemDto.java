package com.pizzashowcase.order.api.dto.admin;

import java.math.BigDecimal;
import java.util.List;

/**
 * Pozycja w detalu zamówienia dla panelu. Nadzbiór
 * {@code OrderTrackingItemDto} o identyfikatory, których potrzebuje tryb
 * edycji, żeby zbudować żądanie (który wiersz, jaki produkt, wariant,
 * dodatki).
 *
 * <p>Publiczny tracking dalej dostaje wersję bez identyfikatorów —
 * klientowi nie są do niczego potrzebne.
 */
public record AdminOrderItemDto(
        Long orderItemId,
        Long productId,
        Long variantId,
        String productName,
        String variantName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal,
        String itemNote,
        List<Addon> addons
) {
    public record Addon(
            Long addonId,
            String groupName,
            String name,
            BigDecimal unitPrice
    ) {
    }
}
