package com.portfoliocms.app.dto.response;

import java.util.Map;

/**
 * The API's single error contract: every error response body - whether it
 * comes from GlobalExceptionHandler (inside a controller) or from
 * RestAuthEntryPoint/RestAccessDeniedHandler (Spring Security rejecting a
 * request before it reaches a controller) - is one of these, so a client
 * only ever has to parse one shape.
 *
 * {@code errors} is null (and, per app.jackson.default-property-inclusion
 * = non_null, omitted from the JSON entirely) for anything that isn't a
 * field-validation failure - a duplicate-email or invalid-credentials
 * error has one message and no per-field breakdown.
 */
public record ErrorResponse(boolean success, String message, Map<String, String> errors) {

    public static ErrorResponse of(String message) {
        return new ErrorResponse(false, message, null);
    }

    public static ErrorResponse of(String message, Map<String, String> errors) {
        return new ErrorResponse(false, message, errors);
    }
}
