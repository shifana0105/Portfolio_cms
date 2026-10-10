package com.portfoliocms.app.dto.response;

import com.portfoliocms.app.entity.Resume;

import java.time.Instant;

public record ResumeResponse(
        Long id,
        String originalFilename,
        String contentType,
        long fileSize,
        Instant createdAt,
        Instant updatedAt
) {
    public static ResumeResponse from(Resume resume) {
        return new ResumeResponse(
                resume.getId(),
                resume.getOriginalFilename(),
                resume.getContentType(),
                resume.getFileSize(),
                resume.getCreatedAt(),
                resume.getUpdatedAt()
        );
    }
}
