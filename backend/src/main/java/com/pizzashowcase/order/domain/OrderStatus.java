package com.pizzashowcase.order.domain;

public enum OrderStatus {
    NEW,
    CONFIRMED,
    IN_PREPARATION,
    READY,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELED;

    public boolean isTerminal() {
        return this == DELIVERED || this == CANCELED;
    }

    /**
     * Czy admin może jeszcze zmienić TREŚĆ zamówienia (pozycje, dodatki,
     * notatki). Oś niezależna od tranzycji statusów (D-05): po
     * {@code READY} jedzenie jest spakowane albo w drodze, więc zmiana
     * pozycji nie ma pokrycia w rzeczywistości — zostaje anulowanie.
     * Backend jest tu źródłem prawdy, front ma mirror (wzorzec AD-017).
     */
    public boolean isContentEditable() {
        return this == NEW || this == CONFIRMED || this == IN_PREPARATION;
    }

    public boolean canTransitionTo(OrderStatus next, FulfillmentType fulfillmentType) {
        if (next == null || fulfillmentType == null || next == this) {
            return false;
        }
        if (isTerminal()) {
            return false;
        }
        if (next == CANCELED) {
            return true;
        }
        return switch (this) {
            // AD-023: NEW -> IN_PREPARATION skips the optional CONFIRMED step
            // for the kitchen single-tap workflow.
            case NEW -> next == CONFIRMED || next == IN_PREPARATION;
            case CONFIRMED -> next == IN_PREPARATION;
            case IN_PREPARATION -> next == READY;
            case READY -> switch (fulfillmentType) {
                case DELIVERY -> next == OUT_FOR_DELIVERY;
                case PICKUP -> next == DELIVERED;
            };
            case OUT_FOR_DELIVERY -> switch (fulfillmentType) {
                case DELIVERY -> next == DELIVERED;
                case PICKUP -> false;
            };
            case DELIVERED, CANCELED -> false;
        };
    }
}
