package com.pizzashowcase.shared.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.annotation.PreDestroy;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Duration ENTRY_TTL = Duration.ofMinutes(10);

    private static final List<Rule> RULES = List.of(
            new Rule("POST", "/api/auth/login",
                    Bandwidth.builder().capacity(10).refillGreedy(10, Duration.ofMinutes(1)).build(),
                    "Too many login attempts. Try again later."),
            new Rule("POST", "/api/public/orders",
                    Bandwidth.builder().capacity(10).refillGreedy(10, Duration.ofMinutes(1)).build(),
                    "Too many order submissions. Try again later."),
            new Rule("GET", "/api/admin/orders/stream",
                    Bandwidth.builder().capacity(30).refillGreedy(30, Duration.ofMinutes(1)).build(),
                    "Too many SSE connection attempts. Try again later.")
    );

    private final Map<String, BucketEntry> buckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;
    private final ScheduledExecutorService scheduler;

    public RateLimitFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "rate-limit-evictor");
            t.setDaemon(true);
            return t;
        });
        this.scheduler.scheduleAtFixedRate(this::evictStale, 1, 1, TimeUnit.MINUTES);
    }

    @PreDestroy
    void shutdown() {
        scheduler.shutdownNow();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return matchRule(request) == null;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {
        Rule rule = matchRule(request);
        if (rule == null) {
            chain.doFilter(request, response);
            return;
        }
        String key = rule.path() + "|" + clientKey(request);
        BucketEntry entry = buckets.computeIfAbsent(key, k -> new BucketEntry(newBucket(rule.bandwidth())));
        entry.touch();
        ConsumptionProbe probe = entry.bucket.tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed()) {
            chain.doFilter(request, response);
            return;
        }
        long retryAfterSeconds = TimeUnit.NANOSECONDS.toSeconds(probe.getNanosToWaitForRefill()) + 1;
        writeRateLimit(request, response, retryAfterSeconds, rule.detail());
    }

    private Rule matchRule(HttpServletRequest request) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        for (Rule r : RULES) {
            if (r.method().equalsIgnoreCase(method) && r.path().equals(uri)) {
                return r;
            }
        }
        return null;
    }

    private Bucket newBucket(Bandwidth bandwidth) {
        return Bucket.builder().addLimit(bandwidth).build();
    }

    private String clientKey(HttpServletRequest request) {
        // Rely on server.forward-headers-strategy=framework (prod) so Spring
        // resolves X-Forwarded-* through trusted proxy chain only. Reading the
        // header directly would let attackers spoof the bucket key.
        return request.getRemoteAddr();
    }

    private void evictStale() {
        long cutoff = System.nanoTime() - ENTRY_TTL.toNanos();
        buckets.entrySet().removeIf(e -> e.getValue().lastAccessNanos < cutoff);
    }

    private static final class BucketEntry {
        final Bucket bucket;
        volatile long lastAccessNanos;

        BucketEntry(Bucket bucket) {
            this.bucket = bucket;
            this.lastAccessNanos = System.nanoTime();
        }

        void touch() {
            this.lastAccessNanos = System.nanoTime();
        }
    }

    private record Rule(String method, String path, Bandwidth bandwidth, String detail) {
    }

    private void writeRateLimit(HttpServletRequest request,
                                HttpServletResponse response,
                                long retryAfter,
                                String detail) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setHeader("Retry-After", Long.toString(retryAfter));
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.TOO_MANY_REQUESTS, detail);
        problem.setTitle(HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase());
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("timestamp", Instant.now().toString());
        problem.setProperty("retryAfterSeconds", retryAfter);
        response.getWriter().write(objectMapper.writeValueAsString(problem));
    }
}
