package com.pizzashowcase.realtime;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class SseEmitterRegistry {

    private static final Logger log = LoggerFactory.getLogger(SseEmitterRegistry.class);
    private static final long HEARTBEAT_SECONDS = 25L;

    private final ConcurrentHashMap<UUID, SseEmitter> emitters = new ConcurrentHashMap<>();
    private ScheduledExecutorService heartbeatExecutor;

    @PostConstruct
    void start() {
        heartbeatExecutor = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "sse-heartbeat");
            t.setDaemon(true);
            return t;
        });
        heartbeatExecutor.scheduleAtFixedRate(
                this::sendHeartbeat, HEARTBEAT_SECONDS, HEARTBEAT_SECONDS, TimeUnit.SECONDS);
    }

    @PreDestroy
    void stop() {
        if (heartbeatExecutor != null) {
            heartbeatExecutor.shutdownNow();
        }
        emitters.values().forEach(SseEmitter::complete);
        emitters.clear();
    }

    public UUID register(SseEmitter emitter) {
        UUID id = UUID.randomUUID();
        emitter.onCompletion(() -> remove(id, "completion"));
        emitter.onTimeout(() -> {
            remove(id, "timeout");
            emitter.complete();
        });
        emitter.onError(ex -> {
            remove(id, "error: " + ex.getClass().getSimpleName());
            emitter.complete();
        });
        emitters.put(id, emitter);
        return id;
    }

    public void broadcast(SseEventEnvelope envelope) {
        for (var entry : emitters.entrySet()) {
            try {
                entry.getValue().send(SseEmitter.event()
                        .name(envelope.type())
                        .data(envelope.payload()));
            } catch (IOException | IllegalStateException ex) {
                remove(entry.getKey(), "send failed: " + ex.getClass().getSimpleName());
            }
        }
    }

    public int size() {
        return emitters.size();
    }

    private void sendHeartbeat() {
        for (var entry : emitters.entrySet()) {
            try {
                entry.getValue().send(SseEmitter.event().comment("hb"));
            } catch (IOException | IllegalStateException ex) {
                remove(entry.getKey(), "heartbeat failed: " + ex.getClass().getSimpleName());
            }
        }
    }

    private void remove(UUID id, String reason) {
        if (emitters.remove(id) != null) {
            log.debug("SSE emitter {} removed ({}); active={}", id, reason, emitters.size());
        }
    }
}
