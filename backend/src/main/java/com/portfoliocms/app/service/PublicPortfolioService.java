package com.portfoliocms.app.service;

import com.portfoliocms.app.dto.response.*;
import com.portfoliocms.app.entity.Profile;
import com.portfoliocms.app.exception.NotFoundException;
import com.portfoliocms.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class PublicPortfolioService {

    private final ProfileRepository profileRepository;
    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;
    private final ExperienceRepository experienceRepository;
    private final EducationRepository educationRepository;
    private final ResumeRepository resumeRepository;

    public PublicPortfolioResponse getPublicPortfolio(String username) {
        Profile profile = profileRepository.findByUsername(username.toLowerCase())
                .orElseThrow(() -> new NotFoundException("Portfolio not found"));

        if (!profile.isPublic()) {
            throw new NotFoundException("Portfolio not found");
        }

        Long userId = profile.getUser().getId();

        // Featured projects first (max 6), then remaining by displayOrder
        var featuredProjects = projectRepository.findByUserIdAndFeaturedTrueOrderByDisplayOrderAsc(userId).stream()
                .limit(6)
                .map(ProjectResponse::from)
                .toList();

        var allProjects = projectRepository.findByUserIdOrderByDisplayOrderAsc(userId).stream()
                .map(ProjectResponse::from)
                .toList();

        // Merge: featured first, then non-featured
        var featuredIds = featuredProjects.stream().map(ProjectResponse::id).toList();
        var otherProjects = allProjects.stream()
                .filter(p -> !featuredIds.contains(p.id()))
                .toList();

        List<ProjectResponse> orderedProjects = Stream.concat(
                featuredProjects.stream(),
                otherProjects.stream()
        ).toList();

        var skills = skillRepository.findByUserIdOrderByDisplayOrderAsc(userId).stream()
                .map(SkillResponse::from)
                .toList();

        var experiences = experienceRepository.findByUserIdOrderByDisplayOrderAsc(userId).stream()
                .map(ExperienceResponse::from)
                .toList();

        var education = educationRepository.findByUserIdOrderByDisplayOrderAsc(userId).stream()
                .map(EducationResponse::from)
                .toList();

        boolean hasResume = resumeRepository.existsByUserId(userId);

        return new PublicPortfolioResponse(
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
                profile.getPortfolioTheme(),
                hasResume,
                orderedProjects,
                skills,
                experiences,
                education
        );
    }
}
