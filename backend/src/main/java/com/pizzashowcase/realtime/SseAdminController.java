package com.pizzashowcase.realtime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class SseAdminController {

    private static final Logger log = LoggerFactory.getLogger(SseAdminController.class);
    private static final long EMITTER_TIMEOUT_MS = Duration.ofMinutes(30).toMillis();

    private final SseEmitterRegistry registry;

    public SseAdminController(SseEmitterRegistry registry) {
        this.registry = registry;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT_MS);
        UUID id = registry.register(emitter);
        try {
            emitter.send(SseEmitter.event().name("READY").data("connected"));
        } catch (IOException ex) {
            emitter.completeWithError(ex);
        }
        log.debug("SSE emitter {} opened; active={}", id, registry.size());
        return emitter;
    }
}
