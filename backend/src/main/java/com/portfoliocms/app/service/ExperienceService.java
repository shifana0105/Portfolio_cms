package com.portfoliocms.app.service;

import com.portfoliocms.app.dto.request.ExperienceRequest;
import com.portfoliocms.app.dto.response.ExperienceResponse;
import com.portfoliocms.app.entity.Experience;
import com.portfoliocms.app.entity.User;
import com.portfoliocms.app.exception.ForbiddenException;
import com.portfoliocms.app.exception.NotFoundException;
import com.portfoliocms.app.repository.ExperienceRepository;
import com.portfoliocms.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExperienceService {

    private final ExperienceRepository experienceRepository;
    private final UserRepository userRepository;

    public List<ExperienceResponse> getAllByUserId(Long userId) {
        return experienceRepository.findByUserIdOrderByDisplayOrderAsc(userId).stream()
                .map(ExperienceResponse::from)
                .toList();
    }

    @Transactional
    public ExperienceResponse create(Long userId, ExperienceRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        validateDates(request);

        Experience exp = new Experience();
        exp.setUser(user);
        mapRequestToEntity(request, exp);

        return ExperienceResponse.from(experienceRepository.save(exp));
    }

    @Transactional
    public ExperienceResponse update(Long expId, Long userId, ExperienceRequest request) {
        Experience exp = experienceRepository.findById(expId)
                .orElseThrow(() -> new NotFoundException("Experience not found"));
        if (!exp.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }

        validateDates(request);
        mapRequestToEntity(request, exp);

        return ExperienceResponse.from(experienceRepository.save(exp));
    }

    @Transactional
    public void delete(Long expId, Long userId) {
        Experience exp = experienceRepository.findById(expId)
                .orElseThrow(() -> new NotFoundException("Experience not found"));
        if (!exp.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }
        experienceRepository.delete(exp);
    }

    private void validateDates(ExperienceRequest request) {
        if (request.isCurrentlyWorking()) {
            request.setEndDate(null);
        } else if (request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }
    }

    private void mapRequestToEntity(ExperienceRequest request, Experience exp) {
        exp.setCompany(request.getCompany());
        exp.setJobTitle(request.getJobTitle());
        exp.setLocation(request.getLocation());
        exp.setEmploymentType(request.getEmploymentType());
        exp.setStartDate(request.getStartDate());
        exp.setEndDate(request.getEndDate());
        exp.setCurrentlyWorking(request.isCurrentlyWorking());
        exp.setDescription(request.getDescription());
        exp.setDisplayOrder(request.getDisplayOrder());
    }
}
