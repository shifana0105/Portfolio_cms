package com.portfoliocms.app.dto.response;

import com.portfoliocms.app.entity.Project;

import java.time.Instant;

public record ProjectResponse(
        Long id,
        String title,
        String description,
        String techStack,
        String liveUrl,
        String githubUrl,
        String thumbnailUrl,
        boolean featured,
        int displayOrder,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProjectResponse from(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getTechStack(),
                project.getLiveUrl(),
                project.getGithubUrl(),
                project.getThumbnailUrl(),
                project.isFeatured(),
                project.getDisplayOrder(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}
