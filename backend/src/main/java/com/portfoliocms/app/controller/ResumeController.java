package com.portfoliocms.app.controller;

import com.portfoliocms.app.dto.response.ResumeResponse;
import com.portfoliocms.app.security.UserPrincipal;
import com.portfoliocms.app.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @GetMapping
    public ResponseEntity<ResumeResponse> getResume(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(resumeService.getByUserId(principal.getId()));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeResponse> upload(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return ResponseEntity.ok(resumeService.upload(principal.getId(), file));
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal) {
        resumeService.delete(principal.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> download(@AuthenticationPrincipal UserPrincipal principal) {
        Resource resource = resumeService.loadResumeFile(principal.getId());
        String filename = resumeService.getOriginalFilename(principal.getId());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }
}
