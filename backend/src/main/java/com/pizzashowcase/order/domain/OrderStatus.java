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
            case NEW -> next == CONFIRMED;
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
