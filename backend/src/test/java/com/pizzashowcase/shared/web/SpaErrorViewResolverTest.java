package com.pizzashowcase.shared.web;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.ModelAndView;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SpaErrorViewResolverTest {

    private static final String REQUEST_URI_ATTR = "jakarta.servlet.error.request_uri";
    private static final String BROWSER_NAVIGATION_ACCEPT =
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,*/*;q=0.8";

    private final SpaErrorViewResolver resolver = new SpaErrorViewResolver();

    @Test
    void test01_browserNavigation_forwardsToIndexHtml() {
        ModelAndView mav = resolve("/menu/pizza-ogrodowa", BROWSER_NAVIGATION_ACCEPT, HttpStatus.NOT_FOUND);

        assertThat(mav).isNotNull();
        assertThat(mav.getViewName()).isEqualTo("forward:/index.html");
    }

    @Test
    void test02_missingAssetWithWildcardAccept_doesNotForward() {
        // `*/*` to nagłówek <script src>, <img> i fetch() — brakujący asset ma
        // dostać czyste 404, nie index.html z kodem 200.
        assertThat(resolve("/assets/index-stale-hash.js", "*/*", HttpStatus.NOT_FOUND)).isNull();
    }

    @Test
    void test03_apiPath_doesNotForward() {
        assertThat(resolve("/api/public/nope", BROWSER_NAVIGATION_ACCEPT, HttpStatus.NOT_FOUND)).isNull();
    }

    @Test
    void test04_actuatorPath_doesNotForward() {
        assertThat(resolve("/actuator/nope", BROWSER_NAVIGATION_ACCEPT, HttpStatus.NOT_FOUND)).isNull();
    }

    @Test
    void test05_nonNotFoundStatus_doesNotForward() {
        assertThat(resolve("/menu", BROWSER_NAVIGATION_ACCEPT, HttpStatus.INTERNAL_SERVER_ERROR)).isNull();
    }

    @Test
    void test06_missingAcceptHeader_doesNotForward() {
        assertThat(resolve("/menu", null, HttpStatus.NOT_FOUND)).isNull();
    }

    @Test
    void test07_malformedAcceptHeader_doesNotForward() {
        assertThat(resolve("/menu", "!!!not-a-media-type!!!", HttpStatus.NOT_FOUND)).isNull();
    }

    private ModelAndView resolve(String uri, String acceptHeader, HttpStatus status) {
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(req.getAttribute(REQUEST_URI_ATTR)).thenReturn(uri);
        when(req.getHeader("Accept")).thenReturn(acceptHeader);
        return resolver.resolveErrorView(req, status, Map.of());
    }
}
