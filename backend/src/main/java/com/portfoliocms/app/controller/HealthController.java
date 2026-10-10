package com.portfoliocms.app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Phase 0 scaffolding endpoint - confirms the backend boots and is reachable
 * before any real feature work begins.
 */
@RestController
public class HealthController {

    @GetMapping("/api/v1/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "service", "portfolio-cms-backend",
                "timestamp", Instant.now().toString()
        );
    }
}
