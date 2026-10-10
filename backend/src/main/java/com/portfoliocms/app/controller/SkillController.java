package com.portfoliocms.app.controller;

import com.portfoliocms.app.dto.request.SkillRequest;
import com.portfoliocms.app.dto.response.SkillResponse;
import com.portfoliocms.app.security.UserPrincipal;
import com.portfoliocms.app.service.SkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    public ResponseEntity<List<SkillResponse>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(skillService.getAllByUserId(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<SkillResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SkillRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(skillService.create(principal.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SkillResponse> update(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SkillRequest request
    ) {
        return ResponseEntity.ok(skillService.update(id, principal.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        skillService.delete(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
