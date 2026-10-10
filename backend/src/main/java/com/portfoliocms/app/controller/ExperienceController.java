package com.portfoliocms.app.controller;

import com.portfoliocms.app.dto.request.ExperienceRequest;
import com.portfoliocms.app.dto.response.ExperienceResponse;
import com.portfoliocms.app.security.UserPrincipal;
import com.portfoliocms.app.service.ExperienceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/experience")
@RequiredArgsConstructor
public class ExperienceController {

    private final ExperienceService experienceService;

    @GetMapping
    public ResponseEntity<List<ExperienceResponse>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(experienceService.getAllByUserId(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<ExperienceResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ExperienceRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(experienceService.create(principal.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExperienceResponse> update(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ExperienceRequest request
    ) {
        return ResponseEntity.ok(experienceService.update(id, principal.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        experienceService.delete(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
