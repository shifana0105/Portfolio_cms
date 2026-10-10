package com.portfoliocms.app.service;

import com.portfoliocms.app.dto.request.ProfileRequest;
import com.portfoliocms.app.dto.response.ProfileResponse;
import com.portfoliocms.app.entity.Profile;
import com.portfoliocms.app.entity.User;
import com.portfoliocms.app.exception.DuplicateUsernameException;
import com.portfoliocms.app.exception.NotFoundException;
import com.portfoliocms.app.repository.ProfileRepository;
import com.portfoliocms.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ProfileResponse getByUserId(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));
        return ProfileResponse.from(profile);
    }

    public boolean existsForUser(Long userId) {
        return profileRepository.existsByUserId(userId);
    }

    @Transactional
    public ProfileResponse createOrUpdate(Long userId, ProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        String normalizedUsername = request.getUsername().trim().toLowerCase();

        Profile profile = profileRepository.findByUserId(userId).orElse(null);

        if (profile == null) {
            // Create new
            if (profileRepository.existsByUsername(normalizedUsername)) {
                throw new DuplicateUsernameException("Username '" + normalizedUsername + "' is already taken");
            }
            profile = new Profile();
            profile.setUser(user);
        } else {
            // Update - check username isn't taken by someone else
            if (!profile.getUsername().equals(normalizedUsername)
                    && profileRepository.existsByUsername(normalizedUsername)) {
                throw new DuplicateUsernameException("Username '" + normalizedUsername + "' is already taken");
            }
        }

        profile.setUsername(normalizedUsername);
        profile.setFullName(request.getFullName());
        profile.setProfessionalHeadline(request.getProfessionalHeadline());
        profile.setBio(request.getBio());
        profile.setLocation(request.getLocation());
        profile.setContactEmail(request.getContactEmail());
        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setWebsiteUrl(request.getWebsiteUrl());
        profile.setTwitterUrl(request.getTwitterUrl());
        profile.setPublic(request.isPublic());
        if (request.getPortfolioTheme() != null && !request.getPortfolioTheme().isBlank()) {
            profile.setPortfolioTheme(request.getPortfolioTheme());
        }

        Profile saved = profileRepository.save(profile);
        return ProfileResponse.from(saved);
    }

    @Transactional
    public ProfileResponse updateAvatar(Long userId, String avatarUrl) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found. Create a profile first."));
        profile.setAvatarUrl(avatarUrl);
        return ProfileResponse.from(profileRepository.save(profile));
    }
}
