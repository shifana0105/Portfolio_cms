package com.portfoliocms.app.dto.response;

import java.util.List;
import java.util.Map;

public record PublicPortfolioResponse(
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
        String portfolioTheme,
        boolean hasResume,
        List<ProjectResponse> projects,
        List<SkillResponse> skills,
        List<ExperienceResponse> experiences,
        List<EducationResponse> education
) {}
