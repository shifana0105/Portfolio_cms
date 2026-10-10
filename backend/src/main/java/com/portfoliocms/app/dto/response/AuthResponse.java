package com.portfoliocms.app.dto.response;

/**
 * Returned by both /auth/register and /auth/login. tokenType is included
 * explicitly so the frontend never has to hardcode "Bearer" in two places.
 */
public record AuthResponse(String accessToken, String tokenType, long expiresInMs, UserResponse user) {

    public static AuthResponse of(String accessToken, long expiresInMs, UserResponse user) {
        return new AuthResponse(accessToken, "Bearer", expiresInMs, user);
    }
}
