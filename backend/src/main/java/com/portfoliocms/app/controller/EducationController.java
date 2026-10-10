package com.portfoliocms.app.controller;

import com.portfoliocms.app.dto.request.EducationRequest;
import com.portfoliocms.app.dto.response.EducationResponse;
import com.portfoliocms.app.security.UserPrincipal;
import com.portfoliocms.app.service.EducationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/education")
@RequiredArgsConstructor
public class EducationController {

    private final EducationService educationService;

    @GetMapping
    public ResponseEntity<List<EducationResponse>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(educationService.getAllByUserId(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<EducationResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody EducationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(educationService.create(principal.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EducationResponse> update(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody EducationRequest request
    ) {
        return ResponseEntity.ok(educationService.update(id, principal.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        educationService.delete(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
