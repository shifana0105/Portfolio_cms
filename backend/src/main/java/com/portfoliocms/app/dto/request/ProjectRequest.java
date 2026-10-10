package com.portfoliocms.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must be at most 150 characters")
    private String title;

    @Size(max = 5000, message = "Description must be at most 5000 characters")
    private String description;

    @Size(max = 500, message = "Tech stack must be at most 500 characters")
    private String techStack;

    @Size(max = 500, message = "Live URL must be at most 500 characters")
    private String liveUrl;

    @Size(max = 500, message = "GitHub URL must be at most 500 characters")
    private String githubUrl;

    @Size(max = 500, message = "Thumbnail URL must be at most 500 characters")
    private String thumbnailUrl;

    private boolean featured;

    private int displayOrder;
}
