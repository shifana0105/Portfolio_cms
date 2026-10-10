package com.portfoliocms.app.dto.response;

import com.portfoliocms.app.entity.Experience;

import java.time.Instant;
import java.time.LocalDate;

public record ExperienceResponse(
        Long id,
        String company,
        String jobTitle,
        String location,
        String employmentType,
        LocalDate startDate,
        LocalDate endDate,
        boolean currentlyWorking,
        String description,
        int displayOrder,
        Instant createdAt,
        Instant updatedAt
) {
    public static ExperienceResponse from(Experience exp) {
        return new ExperienceResponse(
                exp.getId(),
                exp.getCompany(),
                exp.getJobTitle(),
                exp.getLocation(),
                exp.getEmploymentType(),
                exp.getStartDate(),
                exp.getEndDate(),
                exp.isCurrentlyWorking(),
                exp.getDescription(),
                exp.getDisplayOrder(),
                exp.getCreatedAt(),
                exp.getUpdatedAt()
        );
    }
}
