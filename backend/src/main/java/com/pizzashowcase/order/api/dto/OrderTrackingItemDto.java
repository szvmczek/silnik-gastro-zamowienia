package com.pizzashowcase.order.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record OrderTrackingItemDto(
        String productName,
        String variantName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal,
        // Komentarz klienta do tej pozycji („bez cebuli"). Ten sam rekord
        // obsługuje tracking klienta, detal admina i listę (AD-022), więc
        // notatka dociera na wszystkie ekrany operacyjne jednym polem.
        String itemNote,
        List<OrderTrackingAddonDto> addons
) {
}
