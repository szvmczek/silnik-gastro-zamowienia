package com.pizzashowcase.realtime;

import com.pizzashowcase.order.application.event.OrderCreatedEvent;
import com.pizzashowcase.order.application.event.OrderEditedEvent;
import com.pizzashowcase.order.application.event.OrderStatusChangedEvent;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class SseEventBroadcaster {

    private final SseEmitterRegistry registry;

    public SseEventBroadcaster(SseEmitterRegistry registry) {
        this.registry = registry;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderCreated(OrderCreatedEvent event) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("orderId", event.orderId());
        payload.put("orderNumber", event.orderNumber());
        payload.put("total", event.total());
        payload.put("placedAt", event.placedAt());
        registry.broadcast(new SseEventEnvelope("ORDER_CREATED", payload));
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderStatusChanged(OrderStatusChangedEvent event) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("orderId", event.orderId());
        payload.put("orderNumber", event.orderNumber());
        payload.put("newStatus", event.newStatus());
        payload.put("fulfillmentType", event.fulfillmentType());
        registry.broadcast(new SseEventEnvelope("ORDER_STATUS_CHANGED", payload));
    }

    /**
     * Treść zamówienia zmieniła się — kuchnia ma zobaczyć nowe pozycje
     * natychmiast. Osobny typ zdarzenia, nie ORDER_STATUS_CHANGED: widoki
     * mają odświeżyć listę, ale nie zagrać dźwiękiem (tabela dźwięków
     * per widok z Fazy 4.5 zostaje bez zmian).
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderEdited(OrderEditedEvent event) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("orderId", event.orderId());
        payload.put("orderNumber", event.orderNumber());
        payload.put("total", event.total());
        payload.put("kind", event.kind());
        registry.broadcast(new SseEventEnvelope("ORDER_EDITED", payload));
    }
}
