package com.pizzashowcase.shared.error;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
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

    // --- SPA fallback (handleNoResource) ---

    private static final String BROWSER_NAVIGATION_ACCEPT =
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,*/*;q=0.8";

    @Test
    void test06_browserNavigation_forwardsToIndexHtml() throws Exception {
        HttpServletRequest req = request("/menu/pizza-ogrodowa", BROWSER_NAVIGATION_ACCEPT);
        HttpServletResponse res = mock(HttpServletResponse.class);
        RequestDispatcher dispatcher = mock(RequestDispatcher.class);
        when(req.getRequestDispatcher("/index.html")).thenReturn(dispatcher);

        ResponseEntity<ProblemDetail> response = handler.handleNoResource(
                new NoResourceFoundException(HttpMethod.GET, "/menu/pizza-ogrodowa"), req, res);

        assertThat(response).isNull();
        verify(dispatcher).forward(req, res);
    }

    @Test
    void test07_missingAssetWithWildcardAccept_returns404NotIndexHtml() throws Exception {
        // Przeglądarka wysyła `*/*` dla <script src>, <img> i fetch(). Gdyby to
        // łapało fallback, brakujący asset dostawałby index.html z kodem 200.
        HttpServletRequest req = request("/assets/index-stale-hash.js", "*/*");
        HttpServletResponse res = mock(HttpServletResponse.class);

        ResponseEntity<ProblemDetail> response = handler.handleNoResource(
                new NoResourceFoundException(HttpMethod.GET, "/assets/index-stale-hash.js"), req, res);

        assertThat(response).isNotNull();
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(req, never()).getRequestDispatcher(anyString());
    }

    @Test
    void test08_apiPathWithHtmlAccept_returns404NotIndexHtml() throws Exception {
        HttpServletRequest req = request("/api/public/nope", BROWSER_NAVIGATION_ACCEPT);
        HttpServletResponse res = mock(HttpServletResponse.class);

        ResponseEntity<ProblemDetail> response = handler.handleNoResource(
                new NoResourceFoundException(HttpMethod.GET, "/api/public/nope"), req, res);

        assertThat(response).isNotNull();
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(req, never()).getRequestDispatcher(anyString());
    }

    private static HttpServletRequest request(String uri) {
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(req.getRequestURI()).thenReturn(uri);
        return req;
    }

    private static HttpServletRequest request(String uri, String acceptHeader) {
        HttpServletRequest req = request(uri);
        when(req.getHeader("Accept")).thenReturn(acceptHeader);
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
