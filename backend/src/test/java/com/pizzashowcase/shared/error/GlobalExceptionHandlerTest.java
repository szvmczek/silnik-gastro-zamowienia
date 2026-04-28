package com.pizzashowcase.shared.error;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    @Test
    void test01_dataIntegrityViolation_mapsToConflictWithGenericMessage() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(req.getRequestURI()).thenReturn("/api/admin/delivery-zones/1/areas");
        DataIntegrityViolationException ex = new DataIntegrityViolationException(
                "duplicate key value violates unique constraint",
                new RuntimeException("UNIQUE NULLS NOT DISTINCT"));

        ResponseEntity<ProblemDetail> response = handler.handleDataIntegrity(ex, req);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        ProblemDetail body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getDetail()).isEqualTo("Konflikt unikalności — wpis już istnieje w bazie.");
        assertThat(body.getTitle()).isEqualTo(HttpStatus.CONFLICT.getReasonPhrase());
    }
}
