package com.pizzashowcase.shared.error;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.net.URI;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ProblemDetail> handleApi(ApiException ex, HttpServletRequest request) {
        return buildResponse(ex.getStatus(), ex.getMessage(), request, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleBeanValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<Map<String, String>> fields = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> Map.of("field", f.getField(), "message", f.getDefaultMessage() == null ? "invalid" : f.getDefaultMessage()))
                .toList();
        return buildResponse(HttpStatus.BAD_REQUEST, "Validation failed", request, Map.of("errors", fields));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ProblemDetail> handleConstraint(ConstraintViolationException ex, HttpServletRequest request) {
        List<Map<String, String>> fields = ex.getConstraintViolations().stream()
                .map(v -> Map.of("field", v.getPropertyPath().toString(), "message", v.getMessage()))
                .toList();
        return buildResponse(HttpStatus.BAD_REQUEST, "Validation failed", request, Map.of("errors", fields));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ProblemDetail> handleUnreadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Malformed JSON request", request, null);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ProblemDetail> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String required = ex.getRequiredType() == null ? "expected" : ex.getRequiredType().getSimpleName();
        String detail = "Parameter '" + ex.getName() + "' has invalid format (expected " + required + ")";
        return buildResponse(HttpStatus.BAD_REQUEST, detail, request, null);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ProblemDetail> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Invalid email or password", request, null);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ProblemDetail> handleAuth(AuthenticationException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Authentication required", request, null);
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ProblemDetail> handleForbidden(AuthorizationDeniedException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.FORBIDDEN, "Access denied", request, null);
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<ProblemDetail> handleOptimisticLock(OptimisticLockingFailureException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.CONFLICT, "Resource was modified by another session. Reload and retry.", request, null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ProblemDetail> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest request) {
        String constraint = extractConstraintName(ex);
        Throwable mostSpecific = ex.getMostSpecificCause();
        log.warn("Data integrity violation at {} (constraint={}): {}",
                request.getRequestURI(), constraint, mostSpecific.getMessage(), mostSpecific);

        ConstraintMapping mapping = mapConstraint(constraint);
        return buildResponse(mapping.status(), mapping.message(), request, null);
    }

    private static ConstraintMapping mapConstraint(String constraint) {
        if (constraint != null) {
            ConstraintMapping known = NAMED_CONSTRAINTS.get(constraint);
            if (known != null) {
                return known;
            }
            if (constraint.endsWith("_key") || constraint.endsWith("_pkey") || constraint.startsWith("uk_")) {
                return UNIQUE_CONFLICT;
            }
            if (constraint.contains("_check") || constraint.startsWith("ck_")) {
                return new ConstraintMapping(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Naruszenie reguły walidacji (" + constraint + ").");
            }
        }
        return GENERIC_INTEGRITY;
    }

    private static String extractConstraintName(DataIntegrityViolationException ex) {
        Throwable cause = ex.getCause();
        while (cause != null) {
            if (cause instanceof org.hibernate.exception.ConstraintViolationException hce) {
                String name = hce.getConstraintName();
                if (name != null && !name.isBlank()) {
                    return name;
                }
                break;
            }
            cause = cause.getCause();
        }
        Throwable mostSpecific = ex.getMostSpecificCause();
        String msg = mostSpecific == null ? null : mostSpecific.getMessage();
        if (msg != null) {
            Matcher m = CONSTRAINT_NAME_PATTERN.matcher(msg);
            if (m.find()) {
                return m.group(1);
            }
        }
        return null;
    }

    private static final Pattern CONSTRAINT_NAME_PATTERN = Pattern.compile("constraint \"([^\"]+)\"");

    private static final ConstraintMapping UNIQUE_CONFLICT =
            new ConstraintMapping(HttpStatus.CONFLICT, "Konflikt unikalności — wpis już istnieje w bazie.");

    private static final ConstraintMapping GENERIC_INTEGRITY =
            new ConstraintMapping(HttpStatus.CONFLICT, "Naruszenie integralności danych.");

    private static final Map<String, ConstraintMapping> NAMED_CONSTRAINTS = Map.of(
            "opening_hours_times",
            new ConstraintMapping(HttpStatus.UNPROCESSABLE_ENTITY, "Nieprawidłowe godziny otwarcia."),
            "opening_hours_day_values",
            new ConstraintMapping(HttpStatus.UNPROCESSABLE_ENTITY, "Nieprawidłowy dzień tygodnia.")
    );

    private record ConstraintMapping(HttpStatus status, String message) {}

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ProblemDetail> handleNoResource(NoResourceFoundException ex,
                                                          HttpServletRequest request,
                                                          HttpServletResponse response) throws Exception {
        String path = request.getRequestURI();
        if (!path.startsWith("/api/") && !path.startsWith("/actuator/") && acceptsHtml(request)) {
            request.getRequestDispatcher("/index.html").forward(request, response);
            return null;
        }
        return buildResponse(HttpStatus.NOT_FOUND, "Resource not found", request, null);
    }

    private boolean acceptsHtml(HttpServletRequest request) {
        String accept = request.getHeader("Accept");
        if (accept == null || accept.isBlank()) {
            return false;
        }
        try {
            for (MediaType mt : MediaType.parseMediaTypes(accept)) {
                if (mt.includes(MediaType.TEXT_HTML)) {
                    return true;
                }
            }
            return false;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleFallback(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at {}", request.getRequestURI(), ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error", request, null);
    }

    private ResponseEntity<ProblemDetail> buildResponse(HttpStatus status, String detail, HttpServletRequest request, Map<String, Object> extra) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(status.getReasonPhrase());
        problem.setInstance(URI.create(request.getRequestURI()));
        Map<String, Object> props = new LinkedHashMap<>();
        props.put("timestamp", Instant.now().toString());
        if (extra != null) {
            props.putAll(extra);
        }
        props.forEach(problem::setProperty);
        return ResponseEntity.status(status).body(problem);
    }
}
