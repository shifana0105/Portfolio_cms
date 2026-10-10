package com.portfoliocms.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfoliocms.app.entity.User;
import com.portfoliocms.app.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end coverage of the Phase 1 auth surface: register, login, and
 * /auth/me, through the real Spring Security filter chain (JwtAuthFilter,
 * RestAuthEntryPoint, GlobalExceptionHandler) against an in-memory H2
 * database - no mocking of the security layer, so these exercise exactly
 * what a real client would hit.
 *
 * @Transactional rolls back every test's DB writes afterward, so tests
 * can run in any order without one test's registered user leaking into
 * another (e.g. the duplicate-email test doesn't collide with the
 * successful-registration test over the same table).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:authtestdb;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=update",
        "app.jwt.secret=test-only-secret-key-not-used-outside-this-test-suite-32bytes",
        "app.jwt.expiration-ms=3600000",
        "app.security.ip-hash-secret=test-only-ip-hash-secret"
})
class AuthControllerTest {

    private static final String JWT_SECRET = "test-only-secret-key-not-used-outside-this-test-suite-32bytes";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ---- registration ----------------------------------------------

    @Test
    void register_withNewEmail_returns201WithTokenAndUser() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("Ada Lovelace", "ada@example.com", "password123")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken", not(emptyOrNullString())))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("ada@example.com"))
                .andExpect(jsonPath("$.user.fullName").value("Ada Lovelace"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
    }

    @Test
    void register_persistsPasswordAsBcryptHash_neverPlaintext() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("Grace Hopper", "grace@example.com", "password123")))
                .andExpect(status().isCreated());

        User saved = userRepository.findByEmail("grace@example.com").orElseThrow();

        assertThat(saved.getPasswordHash()).isNotEqualTo("password123");
        // BCrypt hashes always start with one of these version prefixes.
        assertThat(saved.getPasswordHash()).matches("^\\$2[aby]?\\$.*");
        assertThat(passwordEncoder.matches("password123", saved.getPasswordHash())).isTrue();
    }

    @Test
    void register_duplicateEmail_returns409() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("First User", "duplicate@example.com", "password123")))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("Second User", "duplicate@example.com", "password123")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("An account with this email already exists"));
    }

    @Test
    void register_invalidData_returns400WithFieldErrors() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("Someone", "not-an-email", "short")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.email").value("Email must be a valid address"))
                .andExpect(jsonPath("$.errors.password").exists());
    }

    // ---- login -------------------------------------------------------

    @Test
    void login_withCorrectPassword_returns200WithToken() throws Exception {
        registerUser("Login Success", "login-success@example.com", "password123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("login-success@example.com", "password123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", not(emptyOrNullString())))
                .andExpect(jsonPath("$.user.email").value("login-success@example.com"));
    }

    @Test
    void login_withWrongPassword_returns401GenericMessage() throws Exception {
        registerUser("Wrong Password", "wrong-password@example.com", "password123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("wrong-password@example.com", "not-the-password")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void login_withUnknownEmail_returnsSameGeneric401AsWrongPassword() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("no-such-user@example.com", "whatever123")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                // Same message as the wrong-password case above - must never
                // reveal whether the email exists.
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    // ---- /auth/me ------------------------------------------------------

    @Test
    void me_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Authentication required"));
    }

    @Test
    void me_withValidToken_returns200WithOwnUser() throws Exception {
        String token = registerAndGetToken("Me Endpoint", "me-endpoint@example.com", "password123");

        mockMvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("me-endpoint@example.com"))
                .andExpect(jsonPath("$.fullName").value("Me Endpoint"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void me_withMalformedToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer not.a.real.jwt"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Authentication required"));
    }

    @Test
    void me_withExpiredToken_returns401() throws Exception {
        registerUser("Expired Token", "expired-token@example.com", "password123");
        String expiredToken = buildExpiredToken("expired-token@example.com");

        mockMvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Authentication required"));
    }

    // ---- helpers -------------------------------------------------------

    private String registerBody(String fullName, String email, String password) throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("fullName", fullName);
        body.put("email", email);
        body.put("password", password);
        return objectMapper.writeValueAsString(body);
    }

    private String loginBody(String email, String password) throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("email", email);
        body.put("password", password);
        return objectMapper.writeValueAsString(body);
    }

    private void registerUser(String fullName, String email, String password) throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody(fullName, email, password)))
                .andExpect(status().isCreated());
    }

    private String registerAndGetToken(String fullName, String email, String password) throws Exception {
        String response = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody(fullName, email, password)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(response).get("accessToken").asText();
    }

    /**
     * Built directly with jjwt against the same secret configured for this
     * test class, independent of JwtService (whose generateToken() always
     * sets a future expiry) - this is the only way to produce a token
     * that is otherwise perfectly valid but already expired.
     */
    @Test
    void cors_preflight_optionsRequest_shouldSucceedForAllowedOrigin() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options("/api/v1/auth/register")
                        .header("Origin", "http://localhost:5175")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "authorization,content-type"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Access-Control-Allow-Origin", "http://localhost:5175"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().exists("Access-Control-Allow-Methods"));
    }

    @Test
    void cors_registration_withAllowedOrigin_shouldIncludeCorsHeaders() throws Exception {
        Map<String, String> payload = Map.of(
                "fullName", "Cors User",
                "email", "corsuser@example.com",
                "password", "Password123!"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .header("Origin", "http://localhost:5175")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Access-Control-Allow-Origin", "http://localhost:5175"));
    }

    private String buildExpiredToken(String email) {
        SecretKey key = Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8));
        Date issuedAt = new Date(System.currentTimeMillis() - 60_000);
        Date expiry = new Date(System.currentTimeMillis() - 30_000);

        return Jwts.builder()
                .subject(email)
                .claim("userId", 1L)
                .issuedAt(issuedAt)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }
}
