package com.portfoliocms.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ExperienceRequest {

    @NotBlank(message = "Company is required")
    @Size(max = 150, message = "Company must be at most 150 characters")
    private String company;

    @NotBlank(message = "Job title is required")
    @Size(max = 150, message = "Job title must be at most 150 characters")
    private String jobTitle;

    @Size(max = 100, message = "Location must be at most 100 characters")
    private String location;

    @Size(max = 50, message = "Employment type must be at most 50 characters")
    private String employmentType;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    private boolean currentlyWorking;

    @Size(max = 5000, message = "Description must be at most 5000 characters")
    private String description;

    private int displayOrder;
}
