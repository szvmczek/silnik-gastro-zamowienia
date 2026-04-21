package com.pizzashowcase.realtime;

import com.pizzashowcase.order.application.event.OrderCreatedEvent;
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
        registry.broadcast(new SseEventEnvelope("ORDER_STATUS_CHANGED", payload));
    }
}
