package com.pizzashowcase.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pizzashowcase.identity.infrastructure.JwtAuthenticationFilter;
import com.pizzashowcase.shared.web.RateLimitFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;

import java.io.IOException;
import java.net.URI;
import java.time.Instant;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtAuthenticationFilter jwtFilter,
                                           RateLimitFilter rateLimitFilter,
                                           CorsConfigurationSource corsConfigurationSource,
                                           ObjectMapper objectMapper,
                                           Environment environment) throws Exception {
        boolean devProfile = Arrays.asList(environment.getActiveProfiles()).contains("dev");
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> {
                auth
                    .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/api/public/**").permitAll();
                if (devProfile) {
                    auth.requestMatchers(
                            "/swagger-ui", "/swagger-ui/**", "/swagger-ui.html",
                            "/v3/api-docs", "/v3/api-docs/**", "/webjars/**"
                    ).permitAll();
                }
                auth
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    .requestMatchers("/api/**").authenticated()
                    .anyRequest().permitAll();
            })
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) -> writeProblem(req, res, HttpStatus.UNAUTHORIZED, objectMapper, "Authentication required"))
                .accessDeniedHandler((req, res, e) -> writeProblem(req, res, HttpStatus.FORBIDDEN, objectMapper, "Access denied"))
            )
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .logout(AbstractHttpConfigurer::disable);
        return http.build();
    }

    private static void writeProblem(HttpServletRequest request,
                                     HttpServletResponse response,
                                     HttpStatus status,
                                     ObjectMapper objectMapper,
                                     String detail) throws IOException {
        if (response.isCommitted()) {
            return;
        }
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(status.getReasonPhrase());
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("timestamp", Instant.now().toString());
        response.getWriter().write(objectMapper.writeValueAsString(problem));
    }
}
