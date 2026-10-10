package com.portfoliocms.app.controller;

import com.portfoliocms.app.dto.request.LoginRequest;
import com.portfoliocms.app.dto.request.RegisterRequest;
import com.portfoliocms.app.dto.response.AuthResponse;
import com.portfoliocms.app.dto.response.UserResponse;
import com.portfoliocms.app.security.UserPrincipal;
import com.portfoliocms.app.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Requires auth (see SecurityConfig - this path is deliberately NOT in
     * the permitAll list). Returns the caller's own record, identified
     * from the validated JWT via the SecurityContext, never from any
     * client-supplied id.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.getCurrentUser(principal.getId()));
    }

    /**
     * JWT is stateless in this MVP - there is no server-side token
     * revocation/blacklist. This endpoint does not (and cannot) invalidate
     * the token; it exists for API symmetry and so the frontend has a
     * single place to call on logout. The actual "log out" effect is the
     * frontend discarding the in-memory token. See README security notes.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        return ResponseEntity.ok(Map.of(
                "message", "Logged out on the client. Tokens are not server-side revoked in this MVP.",
                "timestamp", Instant.now().toString()
        ));
    }
}
