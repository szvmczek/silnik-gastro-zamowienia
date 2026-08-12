package com.pizzashowcase.order.api.dto.admin;

import com.pizzashowcase.order.api.dto.OrderTrackingAddonDto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Podgląd wyniku edycji przed zapisem — cena liczona serwerowo tym samym
 * silnikiem co checkout, żeby admin nie zobaczył innej kwoty po zapisaniu
 * niż w trakcie rozmowy z klientem.
 */
public record OrderEditPreviewDto(
        List<Item> items,
        BigDecimal subtotal,
        BigDecimal deliveryFee,
        BigDecimal total,
        BigDecimal cashChangeFrom,
        /** false → zapis zostanie odrzucony, dopóki admin nie ustali reszty na nowo (AD-026). */
        boolean cashChangeSufficient,
        List<String> warnings
) {
    public record Item(
            Long orderItemId,
            String productName,
            String variantName,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal lineTotal,
            String itemNote,
            /** true = pozycja wyceniona na nowo; false = zachowany snapshot z chwili zamówienia. */
            boolean repriced,
            List<OrderTrackingAddonDto> addons
    ) {
    }
}
