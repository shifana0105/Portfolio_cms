package com.portfoliocms.app.dto.response;

import com.portfoliocms.app.entity.Profile;

import java.time.Instant;

public record ProfileResponse(
        Long id,
        String username,
        String fullName,
        String professionalHeadline,
        String bio,
        String location,
        String avatarUrl,
        String contactEmail,
        String linkedinUrl,
        String githubUrl,
        String websiteUrl,
        String twitterUrl,
        boolean isPublic,
        String portfolioTheme,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProfileResponse from(Profile profile) {
        return new ProfileResponse(
                profile.getId(),
                profile.getUsername(),
                profile.getFullName(),
                profile.getProfessionalHeadline(),
                profile.getBio(),
                profile.getLocation(),
                profile.getAvatarUrl(),
                profile.getContactEmail(),
                profile.getLinkedinUrl(),
                profile.getGithubUrl(),
                profile.getWebsiteUrl(),
                profile.getTwitterUrl(),
                profile.isPublic(),
                profile.getPortfolioTheme(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}
