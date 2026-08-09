package com.pizzashowcase.shared.web;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.autoconfigure.web.servlet.error.ErrorViewResolver;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;
import java.util.Map;

@Component
public class SpaErrorViewResolver implements ErrorViewResolver {

    private static final String FORWARD_TO_INDEX = "forward:/index.html";
    private static final String REQUEST_URI_ATTR = "jakarta.servlet.error.request_uri";

    @Override
    public ModelAndView resolveErrorView(HttpServletRequest request,
                                         HttpStatus status,
                                         Map<String, Object> model) {
        if (status != HttpStatus.NOT_FOUND) {
            return null;
        }
        String path = (String) request.getAttribute(REQUEST_URI_ATTR);
        if (path == null || path.startsWith("/api/") || path.startsWith("/actuator/")) {
            return null;
        }
        if (!acceptsHtml(request)) {
            return null;
        }
        return new ModelAndView(FORWARD_TO_INDEX, model);
    }

    private boolean acceptsHtml(HttpServletRequest request) {
        String accept = request.getHeader("Accept");
        if (accept == null || accept.isBlank()) {
            return false;
        }
        try {
            // Jawne `text/html` (nawigacja przeglądarki), NIE `*/*` — patrz
            // komentarz w GlobalExceptionHandler.acceptsHtml. Oba miejsca muszą
            // trzymać tę samą regułę, bo pokrywają dwie różne ścieżki 404.
            List<MediaType> parsed = MediaType.parseMediaTypes(accept);
            for (MediaType mt : parsed) {
                if (MediaType.TEXT_HTML.equalsTypeAndSubtype(mt)) {
                    return true;
                }
            }
            return false;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }
}
