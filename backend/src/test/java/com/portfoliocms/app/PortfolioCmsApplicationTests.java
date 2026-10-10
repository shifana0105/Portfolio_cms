package com.portfoliocms.app;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * Smoke test: confirms the Spring application context loads, including the
 * Phase 1 security beans (JwtService, JwtAuthFilter, SecurityConfig).
 * Uses an in-memory H2 database so this test doesn't require a real MySQL
 * instance to run, and a throwaway JWT secret so JwtService's startup
 * validation (see JwtService constructor) doesn't fail the context load.
 */
@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=none",
        "app.jwt.secret=test-only-secret-key-not-used-outside-this-test-suite-32bytes",
        "app.jwt.expiration-ms=3600000",
        "app.security.ip-hash-secret=test-only-ip-hash-secret"
})
class PortfolioCmsApplicationTests {

    @Test
    void contextLoads() {
    }
}
