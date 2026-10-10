package com.portfoliocms.app.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfoliocms.app.dto.response.ErrorResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Companion to RestAuthEntryPoint: that one handles "who are you"
 * (401, no/invalid token); this handles "I know who you are, but no" (403,
 * authenticated but not permitted). Nothing in Phase 1 actually triggers
 * this yet - every authenticated user has identical baseline access (see
 * UserPrincipal.getAuthorities()) - but wiring it now means later phases
 * that add ownership checks or roles get the same ErrorResponse contract
 * for free instead of Spring's default empty 403 body.
 */
@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public RestAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException, ServletException {

        ErrorResponse body = ErrorResponse.of("You do not have permission to perform this action");

        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
