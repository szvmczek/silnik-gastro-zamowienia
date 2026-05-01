package com.pizzashowcase.shared.error;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;

import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void test01_uniqueConstraint_mapsToConflictWithUniqueMessage() {
        DataIntegrityViolationException ex = divWithHibernateConstraint(
                "delivery_zone_area_city_normalized_postal_code_key");

        ResponseEntity<ProblemDetail> response =
                handler.handleDataIntegrity(ex, request("/api/admin/delivery-zones/1/areas"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        ProblemDetail body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getDetail()).isEqualTo("Konflikt unikalności — wpis już istnieje w bazie.");
    }

    @Test
    void test02_openingHoursTimesCheck_mapsTo422WithFriendlyMessage() {
        DataIntegrityViolationException ex = divWithHibernateConstraint("opening_hours_times");

        ResponseEntity<ProblemDetail> response =
                handler.handleDataIntegrity(ex, request("/api/admin/opening-hours"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getDetail()).isEqualTo("Nieprawidłowe godziny otwarcia.");
    }

    @Test
    void test03_unknownCheckConstraint_mapsTo422Generic() {
        DataIntegrityViolationException ex = divWithHibernateConstraint("orders_status_check");

        ResponseEntity<ProblemDetail> response =
                handler.handleDataIntegrity(ex, request("/api/admin/orders/1/status"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getDetail())
                .contains("Naruszenie reguły walidacji")
                .contains("orders_status_check");
    }

    @Test
    void test04_unknownConstraint_mapsTo409WithoutUniqueWord() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException(
                "violation", new RuntimeException("opaque cause without constraint info"));

        ResponseEntity<ProblemDetail> response =
                handler.handleDataIntegrity(ex, request("/api/admin/whatever"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        String detail = response.getBody().getDetail();
        assertThat(detail).isNotNull();
        assertThat(detail).doesNotContain("unikalności");
        assertThat(detail).contains("Naruszenie integralności danych");
    }

    @Test
    void test05_constraintNameInMessageOnly_extractedViaRegexFallback() {
        SQLException sql = new SQLException(
                "ERROR: new row for relation \"opening_hours\" violates check constraint \"opening_hours_times\"");
        DataIntegrityViolationException ex = new DataIntegrityViolationException("violation", sql);

        ResponseEntity<ProblemDetail> response =
                handler.handleDataIntegrity(ex, request("/api/admin/opening-hours"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getDetail()).isEqualTo("Nieprawidłowe godziny otwarcia.");
    }

    private static HttpServletRequest request(String uri) {
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(req.getRequestURI()).thenReturn(uri);
        return req;
    }

    private static DataIntegrityViolationException divWithHibernateConstraint(String constraintName) {
        SQLException sql = new SQLException(
                "ERROR: violates constraint \"" + constraintName + "\"");
        org.hibernate.exception.ConstraintViolationException hce =
                new org.hibernate.exception.ConstraintViolationException(
                        "constraint violation", sql, constraintName);
        return new DataIntegrityViolationException("violation", hce);
    }
}
