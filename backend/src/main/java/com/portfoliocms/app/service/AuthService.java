package com.portfoliocms.app.service;

import com.portfoliocms.app.dto.request.LoginRequest;
import com.portfoliocms.app.dto.request.RegisterRequest;
import com.portfoliocms.app.dto.response.AuthResponse;
import com.portfoliocms.app.dto.response.UserResponse;
import com.portfoliocms.app.entity.User;
import com.portfoliocms.app.exception.DuplicateEmailException;
import com.portfoliocms.app.exception.InvalidCredentialsException;
import com.portfoliocms.app.repository.UserRepository;
import com.portfoliocms.app.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Concrete service (no interface) per the "avoid unnecessary abstractions"
 * rule - there is exactly one implementation of auth in this project.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateEmailException("An account with this email already exists");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setFullName(request.getFullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        User saved = userRepository.save(user);

        return issueTokenFor(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                // Same message for "no such user" and "wrong password" -
                // never reveal which one it was, that itself leaks whether
                // an email is registered.
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return issueTokenFor(user);
    }

    /**
     * Backs GET /auth/me. userId comes from the SecurityContext
     * (UserPrincipal, set by JwtAuthFilter from the validated token) -
     * never from a path or query param - so this can only ever return
     * the caller's own record.
     *
     * The lookup-miss case (valid token, but the account was deleted
     * after the token was issued) is intentionally left unhandled beyond
     * this exception: it's an edge case with no dedicated exception type
     * yet, and GlobalExceptionHandler's generic 500 handler is an
     * acceptable fallback until later phases (which add a real
     * NotFoundException) revisit it.
     */
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists"));
        return UserResponse.from(user);
    }

    private AuthResponse issueTokenFor(User user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return AuthResponse.of(token, jwtService.getExpirationMs(), UserResponse.from(user));
    }
}
