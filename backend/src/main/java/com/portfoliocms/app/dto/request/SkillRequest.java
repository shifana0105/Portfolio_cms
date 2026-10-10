package com.portfoliocms.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SkillRequest {

    @NotBlank(message = "Skill name is required")
    @Size(max = 100, message = "Skill name must be at most 100 characters")
    private String name;

    @Size(max = 50, message = "Category must be at most 50 characters")
    private String category;

    @Size(max = 20, message = "Proficiency must be at most 20 characters")
    private String proficiency;

    private int displayOrder;
}
