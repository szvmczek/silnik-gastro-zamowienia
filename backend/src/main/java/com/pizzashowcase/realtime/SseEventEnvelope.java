package com.pizzashowcase.realtime;

public record SseEventEnvelope(String type, Object payload) {
}
