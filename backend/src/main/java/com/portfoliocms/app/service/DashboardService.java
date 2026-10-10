package com.portfoliocms.app.service;

import com.portfoliocms.app.dto.response.*;
import com.portfoliocms.app.entity.*;
import com.portfoliocms.app.exception.NotFoundException;
import com.portfoliocms.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;
    private final ExperienceRepository experienceRepository;
    private final EducationRepository educationRepository;
    private final ResumeRepository resumeRepository;
    private final RecruiterViewRepository viewRepository;
    private final ContactMessageRepository messageRepository;

    public DashboardResponse getDashboard(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        ProfileResponse profileResp = profileRepository.findByUserId(userId)
                .map(ProfileResponse::from)
                .orElse(null);

        long projectCount = projectRepository.countByUserId(userId);
        long skillCount = skillRepository.countByUserId(userId);
        long experienceCount = experienceRepository.countByUserId(userId);
        long educationCount = educationRepository.countByUserId(userId);
        boolean hasResume = resumeRepository.existsByUserId(userId);
        long unreadMessages = messageRepository.countByUserIdAndIsReadFalse(userId);
        long totalViews = viewRepository.countByUserId(userId);
        long recentViews = viewRepository.countByUserIdAndViewDateAfter(userId, LocalDate.now().minusDays(7));

        int completion = calculateCompletion(profileResp, projectCount, skillCount, experienceCount, educationCount, hasResume);
        HealthScoreResponse healthScore = calculateHealthScore(profileResp, projectCount, skillCount, experienceCount, educationCount, hasResume);

        List<DashboardResponse.ActivityItem> activities = buildActivityTimeline(userId);
        List<String> improvements = buildImprovements(profileResp, projectCount, skillCount, experienceCount, educationCount, hasResume);

        return new DashboardResponse(
                user.getFullName(),
                profileResp,
                completion,
                healthScore,
                totalViews,
                recentViews,
                projectCount,
                skillCount,
                experienceCount,
                educationCount,
                unreadMessages,
                hasResume,
                activities,
                improvements
        );
    }

    private int calculateCompletion(ProfileResponse profile, long projects, long skills, long experience, long education, boolean hasResume) {
        int score = 0;
        int total = 9;

        if (profile != null) {
            score++;
            if (profile.bio() != null && !profile.bio().isBlank()) score++;
            if (profile.avatarUrl() != null && !profile.avatarUrl().isBlank()) score++;
            if (profile.linkedinUrl() != null || profile.githubUrl() != null) score++;
        }
        if (projects > 0) score++;
        if (skills > 0) score++;
        if (experience > 0) score++;
        if (education > 0) score++;
        if (hasResume) score++;

        return Math.round((float) score / total * 100);
    }

    private HealthScoreResponse calculateHealthScore(ProfileResponse profile, long projects, long skills, long experience, long education, boolean hasResume) {
        List<String> improvements = new ArrayList<>();
        int score = 0;

        // Profile (20 points)
        if (profile != null) {
            score += 5;
            if (profile.professionalHeadline() != null && !profile.professionalHeadline().isBlank()) score += 5;
            else improvements.add("Add a professional headline");
            if (profile.bio() != null && !profile.bio().isBlank()) score += 5;
            else improvements.add("Write your bio/about section");
            if (profile.avatarUrl() != null && !profile.avatarUrl().isBlank()) score += 5;
            else improvements.add("Upload a profile photo");
        } else {
            improvements.add("Create your profile");
        }

        // Social links (10 points)
        if (profile != null) {
            if (profile.githubUrl() != null && !profile.githubUrl().isBlank()) score += 5;
            else improvements.add("Add your GitHub profile");
            if (profile.linkedinUrl() != null && !profile.linkedinUrl().isBlank()) score += 5;
            else improvements.add("Add your LinkedIn profile");
        } else {
            improvements.add("Add GitHub and LinkedIn links");
        }

        // Projects (25 points)
        if (projects >= 3) score += 25;
        else if (projects >= 1) { score += 15; improvements.add("Add more projects (aim for 3+)"); }
        else improvements.add("Add your first project");

        // Skills (15 points)
        if (skills >= 5) score += 15;
        else if (skills >= 1) { score += 8; improvements.add("Add more skills (aim for 5+)"); }
        else improvements.add("Add your technical skills");

        // Experience (15 points)
        if (experience >= 1) score += 15;
        else improvements.add("Add your work experience");

        // Education (5 points)
        if (education >= 1) score += 5;
        else improvements.add("Add your education");

        // Resume (10 points)
        if (hasResume) score += 10;
        else improvements.add("Upload your resume");

        // Public portfolio
        if (profile != null && !profile.isPublic()) {
            improvements.add("Publish your portfolio to make it visible");
        }

        String rating;
        if (score >= 90) rating = "Excellent";
        else if (score >= 70) rating = "Strong";
        else if (score >= 50) rating = "Good";
        else if (score >= 30) rating = "Getting started";
        else rating = "Needs work";

        return HealthScoreResponse.of(score, rating, improvements);
    }

    private List<DashboardResponse.ActivityItem> buildActivityTimeline(Long userId) {
        List<DashboardResponse.ActivityItem> items = new ArrayList<>();

        // Gather recent activity from all entities
        profileRepository.findByUserId(userId).ifPresent(p -> {
            if (p.getUpdatedAt() != null) {
                items.add(new DashboardResponse.ActivityItem("profile", "Profile updated", p.getUpdatedAt().toString()));
            }
        });

        projectRepository.findByUserIdOrderByDisplayOrderAsc(userId).forEach(p -> {
            items.add(new DashboardResponse.ActivityItem("project",
                    p.getCreatedAt().equals(p.getUpdatedAt()) ? "Added project: " + p.getTitle() : "Updated project: " + p.getTitle(),
                    p.getUpdatedAt().toString()));
        });

        skillRepository.findByUserIdOrderByDisplayOrderAsc(userId).forEach(s -> {
            items.add(new DashboardResponse.ActivityItem("skill", "Added skill: " + s.getName(), s.getCreatedAt().toString()));
        });

        experienceRepository.findByUserIdOrderByDisplayOrderAsc(userId).forEach(e -> {
            items.add(new DashboardResponse.ActivityItem("experience", "Added experience: " + e.getJobTitle() + " at " + e.getCompany(), e.getCreatedAt().toString()));
        });

        educationRepository.findByUserIdOrderByDisplayOrderAsc(userId).forEach(e -> {
            items.add(new DashboardResponse.ActivityItem("education", "Added education: " + e.getDegree() + " at " + e.getInstitution(), e.getCreatedAt().toString()));
        });

        resumeRepository.findByUserId(userId).ifPresent(r -> {
            items.add(new DashboardResponse.ActivityItem("resume", "Resume uploaded", r.getUpdatedAt().toString()));
        });

        // Sort by timestamp descending, take top 10
        items.sort((a, b) -> b.timestamp().compareTo(a.timestamp()));
        return items.stream().limit(10).toList();
    }

    private List<String> buildImprovements(ProfileResponse profile, long projects, long skills, long experience, long education, boolean hasResume) {
        List<String> improvements = new ArrayList<>();
        if (profile == null) improvements.add("Create your profile to get started");
        else {
            if (profile.avatarUrl() == null || profile.avatarUrl().isBlank()) improvements.add("Add a profile photo");
            if (profile.professionalHeadline() == null || profile.professionalHeadline().isBlank()) improvements.add("Add a professional headline");
            if (profile.githubUrl() == null || profile.githubUrl().isBlank()) improvements.add("Add your GitHub profile");
            if (profile.linkedinUrl() == null || profile.linkedinUrl().isBlank()) improvements.add("Add your LinkedIn profile");
            if (!profile.isPublic()) improvements.add("Publish your portfolio");
        }
        if (projects == 0) improvements.add("Add your first project");
        if (skills == 0) improvements.add("Add your technical skills");
        if (experience == 0) improvements.add("Add your work experience");
        if (education == 0) improvements.add("Add your education background");
        if (!hasResume) improvements.add("Upload your resume");
        return improvements.stream().limit(5).toList();
    }
}
