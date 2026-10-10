package com.portfoliocms.app.controller;

import com.portfoliocms.app.dto.request.ContactRequest;
import com.portfoliocms.app.dto.response.PublicPortfolioResponse;
import com.portfoliocms.app.entity.Profile;
import com.portfoliocms.app.exception.NotFoundException;
import com.portfoliocms.app.repository.ProfileRepository;
import com.portfoliocms.app.service.ContactMessageService;
import com.portfoliocms.app.service.PublicPortfolioService;
import com.portfoliocms.app.service.RecruiterViewService;
import com.portfoliocms.app.service.ResumeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicPortfolioController {

    private final PublicPortfolioService publicPortfolioService;
    private final RecruiterViewService recruiterViewService;
    private final ContactMessageService contactMessageService;
    private final ResumeService resumeService;
    private final ProfileRepository profileRepository;

    @GetMapping("/{username}")
    public ResponseEntity<PublicPortfolioResponse> getPortfolio(
            @PathVariable String username,
            HttpServletRequest request
    ) {
        PublicPortfolioResponse portfolio = publicPortfolioService.getPublicPortfolio(username);

        // Record view asynchronously
        try {
            Profile profile = profileRepository.findByUsername(username.toLowerCase())
                    .orElse(null);
            if (profile != null) {
                String clientIp = getClientIp(request);
                recruiterViewService.recordView(profile.getUser().getId(), clientIp);
            }
        } catch (Exception ignored) {
            // View tracking failure should never block the portfolio response
        }

        return ResponseEntity.ok(portfolio);
    }

    @PostMapping("/{username}/contact")
    public ResponseEntity<Map<String, String>> sendContact(
            @PathVariable String username,
            @Valid @RequestBody ContactRequest contactRequest,
            HttpServletRequest request
    ) {
        String clientIp = getClientIp(request);
        contactMessageService.sendMessage(username, contactRequest, clientIp);
        return ResponseEntity.ok(Map.of("message", "Message sent successfully"));
    }

    @GetMapping("/{username}/resume")
    public ResponseEntity<Resource> getPublicResume(@PathVariable String username) {
        Profile profile = profileRepository.findByUsername(username.toLowerCase())
                .orElseThrow(() -> new NotFoundException("Portfolio not found"));

        if (!profile.isPublic()) {
            throw new NotFoundException("Portfolio not found");
        }

        Long userId = profile.getUser().getId();

        if (!resumeService.existsForUser(userId)) {
            throw new NotFoundException("Resume not available");
        }

        Resource resource = resumeService.loadResumeFile(userId);
        String filename = resumeService.getOriginalFilename(userId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
