package com.pizzashowcase.order.application.event;

import java.math.BigDecimal;

/**
 * Treść zamówienia zmieniła się (edycja z panelu albo cofnięcie edycji).
 *
 * <p>Osobne zdarzenie od {@code OrderStatusChangedEvent} celowo: widoki
 * operacyjne mają odświeżyć listę, ale NIE zagrać dźwiękiem — tabela
 * dźwięków per widok z Fazy 4.5 zostaje bez zmian.
 */
public record OrderEditedEvent(Long orderId,
                               String orderNumber,
                               BigDecimal total,
                               Kind kind) {

    public enum Kind {
        EDIT,
        UNDO
    }
}
