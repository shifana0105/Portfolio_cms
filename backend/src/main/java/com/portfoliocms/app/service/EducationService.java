package com.portfoliocms.app.service;

import com.portfoliocms.app.dto.request.EducationRequest;
import com.portfoliocms.app.dto.response.EducationResponse;
import com.portfoliocms.app.entity.Education;
import com.portfoliocms.app.entity.User;
import com.portfoliocms.app.exception.ForbiddenException;
import com.portfoliocms.app.exception.NotFoundException;
import com.portfoliocms.app.repository.EducationRepository;
import com.portfoliocms.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EducationService {

    private final EducationRepository educationRepository;
    private final UserRepository userRepository;

    public List<EducationResponse> getAllByUserId(Long userId) {
        return educationRepository.findByUserIdOrderByDisplayOrderAsc(userId).stream()
                .map(EducationResponse::from)
                .toList();
    }

    @Transactional
    public EducationResponse create(Long userId, EducationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Education edu = new Education();
        edu.setUser(user);
        mapRequestToEntity(request, edu);

        return EducationResponse.from(educationRepository.save(edu));
    }

    @Transactional
    public EducationResponse update(Long eduId, Long userId, EducationRequest request) {
        Education edu = educationRepository.findById(eduId)
                .orElseThrow(() -> new NotFoundException("Education not found"));
        if (!edu.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }

        mapRequestToEntity(request, edu);
        return EducationResponse.from(educationRepository.save(edu));
    }

    @Transactional
    public void delete(Long eduId, Long userId) {
        Education edu = educationRepository.findById(eduId)
                .orElseThrow(() -> new NotFoundException("Education not found"));
        if (!edu.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }
        educationRepository.delete(edu);
    }

    private void mapRequestToEntity(EducationRequest request, Education edu) {
        edu.setInstitution(request.getInstitution());
        edu.setDegree(request.getDegree());
        edu.setFieldOfStudy(request.getFieldOfStudy());
        edu.setStartDate(request.getStartDate());
        edu.setEndDate(request.getEndDate());
        edu.setGrade(request.getGrade());
        edu.setDescription(request.getDescription());
        edu.setDisplayOrder(request.getDisplayOrder());
    }
}
