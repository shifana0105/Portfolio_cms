package com.portfoliocms.app.dto.response;

import com.portfoliocms.app.entity.Education;

import java.time.Instant;
import java.time.LocalDate;

public record EducationResponse(
        Long id,
        String institution,
        String degree,
        String fieldOfStudy,
        LocalDate startDate,
        LocalDate endDate,
        String grade,
        String description,
        int displayOrder,
        Instant createdAt,
        Instant updatedAt
) {
    public static EducationResponse from(Education edu) {
        return new EducationResponse(
                edu.getId(),
                edu.getInstitution(),
                edu.getDegree(),
                edu.getFieldOfStudy(),
                edu.getStartDate(),
                edu.getEndDate(),
                edu.getGrade(),
                edu.getDescription(),
                edu.getDisplayOrder(),
                edu.getCreatedAt(),
                edu.getUpdatedAt()
        );
    }
}
