package com.portfoliocms.app.controller;

import com.portfoliocms.app.dto.request.ProfileRequest;
import com.portfoliocms.app.dto.response.ProfileResponse;
import com.portfoliocms.app.security.UserPrincipal;
import com.portfoliocms.app.service.ProfileService;
import com.portfoliocms.app.util.FileUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @Value("${app.storage.upload-dir}")
    private String uploadDir;

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(profileService.getByUserId(principal.getId()));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> createOrUpdateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProfileRequest request
    ) {
        ProfileResponse response = profileService.createOrUpdate(principal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileResponse> uploadAvatar(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Validate image type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().build();
        }

        // Max 2MB for avatars
        if (file.getSize() > 2 * 1024 * 1024) {
            return ResponseEntity.badRequest().build();
        }

        String extension = switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };

        String storedName = UUID.randomUUID().toString() + extension;
        Path uploadPath = Paths.get(uploadDir, "avatars").toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);
        Files.copy(file.getInputStream(), uploadPath.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);

        // Return URL path (not filesystem path)
        String avatarUrl = "/uploads/avatars/" + storedName;
        ProfileResponse response = profileService.updateAvatar(principal.getId(), avatarUrl);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/exists")
    public ResponseEntity<Map<String, Boolean>> checkProfileExists(@AuthenticationPrincipal UserPrincipal principal) {
        boolean exists = profileService.existsForUser(principal.getId());
        return ResponseEntity.ok(Map.of("exists", exists));
    }
}
