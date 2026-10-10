package com.portfoliocms.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EducationRequest {

    @NotBlank(message = "Institution is required")
    @Size(max = 200, message = "Institution must be at most 200 characters")
    private String institution;

    @NotBlank(message = "Degree is required")
    @Size(max = 150, message = "Degree must be at most 150 characters")
    private String degree;

    @Size(max = 150, message = "Field of study must be at most 150 characters")
    private String fieldOfStudy;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    @Size(max = 20, message = "Grade must be at most 20 characters")
    private String grade;

    @Size(max = 5000, message = "Description must be at most 5000 characters")
    private String description;

    private int displayOrder;
}
