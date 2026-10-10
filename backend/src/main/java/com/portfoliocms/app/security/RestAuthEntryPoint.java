package com.portfoliocms.app.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfoliocms.app.dto.response.ErrorResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * A request with no token, a malformed token, or an expired token never
 * reaches a controller - Spring Security rejects it before the
 * DispatcherServlet, so @RestControllerAdvice (GlobalExceptionHandler)
 * never sees it and can't shape the response. Without this, those
 * requests fall through to Spring Security's default behaviour, which is
 * an empty 403 body - not the ErrorResponse shape the rest of the API
 * returns and the frontend's apiError.js expects.
 *
 * This wires the same ErrorResponse contract at the point Spring Security
 * itself rejects the request, so 401s look identical whether they come
 * from here or from a controller/service throwing.
 */
@Component
public class RestAuthEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public RestAuthEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException, ServletException {

        // Deliberately generic - never echo back why the token failed
        // (missing vs. expired vs. tampered vs. user no longer exists);
        // that distinction is not something a client needs and could
        // help someone probe the auth mechanism.
        ErrorResponse body = ErrorResponse.of("Authentication required");

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
