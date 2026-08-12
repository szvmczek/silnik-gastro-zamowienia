package com.pizzashowcase.order.application;

import com.pizzashowcase.order.domain.Order;
import com.pizzashowcase.order.domain.OrderItem;
import com.pizzashowcase.order.domain.OrderItemAddon;

import java.math.BigDecimal;
import java.util.List;

/**
 * Stan zamówienia sprzed edycji, serializowany do {@code order_edit
 * .snapshot_before}. Cofnięcie odtwarza pozycje WPROST z tej struktury,
 * bez odpytywania menu — dzięki temu jest wierne nawet wtedy, gdy produkt
 * zdążył zniknąć z karty.
 *
 * <p>Struktura jest zapisywana w bazie, więc pola można dokładać, ale nie
 * wolno ich usuwać ani zmieniać znaczenia — stare wpisy muszą się dalej
 * deserializować.
 */
public record OrderEditSnapshot(
        List<Item> items,
        BigDecimal subtotal,
        BigDecimal total,
        BigDecimal cashChangeFrom,
        String customerNotes
) {

    public record Item(
            Long productId,
            Long variantId,
            String productName,
            String variantName,
            BigDecimal unitPrice,
            int quantity,
            BigDecimal lineTotal,
            String itemNote,
            List<Addon> addons
    ) {
    }

    public record Addon(
            Long addonId,
            String groupName,
            String name,
            BigDecimal unitPrice
    ) {
    }

    public static OrderEditSnapshot of(Order order) {
        List<Item> items = order.getItems().stream()
                .map(OrderEditSnapshot::toItem)
                .toList();
        return new OrderEditSnapshot(
                items,
                order.getSubtotal(),
                order.getTotal(),
                order.getCashChangeFrom(),
                order.getCustomerNotes());
    }

    private static Item toItem(OrderItem item) {
        List<Addon> addons = item.getAddons().stream()
                .map(a -> new Addon(
                        a.getAddonId(),
                        a.getAddonGroupNameSnapshot(),
                        a.getAddonNameSnapshot(),
                        a.getUnitPriceSnapshot()))
                .toList();
        return new Item(
                item.getProductId(),
                item.getVariantId(),
                item.getProductNameSnapshot(),
                item.getVariantNameSnapshot(),
                item.getUnitPriceSnapshot(),
                item.getQuantity(),
                item.getLineTotal(),
                item.getItemNote(),
                addons);
    }

    /** Odtworzenie encji z zapisu — bez zaglądania do menu. */
    public static OrderItem toEntity(Item snap) {
        OrderItem item = new OrderItem(
                snap.productId(),
                snap.variantId(),
                snap.productName(),
                snap.variantName(),
                snap.unitPrice(),
                snap.quantity(),
                snap.lineTotal());
        item.setItemNote(snap.itemNote());
        for (Addon addon : snap.addons()) {
            item.addAddon(new OrderItemAddon(
                    addon.addonId(),
                    addon.groupName(),
                    addon.name(),
                    addon.unitPrice()));
        }
        return item;
    }
}
