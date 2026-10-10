package com.portfoliocms.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-z0-9]([a-z0-9-]*[a-z0-9])?$",
            message = "Username must be lowercase alphanumeric with hyphens only, and cannot start/end with a hyphen")
    private String username;

    @Size(max = 100, message = "Full name must be at most 100 characters")
    private String fullName;

    @Size(max = 200, message = "Headline must be at most 200 characters")
    private String professionalHeadline;

    @Size(max = 5000, message = "Bio must be at most 5000 characters")
    private String bio;

    @Size(max = 100, message = "Location must be at most 100 characters")
    private String location;

    @Size(max = 255, message = "Contact email must be at most 255 characters")
    private String contactEmail;

    @Size(max = 500, message = "LinkedIn URL must be at most 500 characters")
    private String linkedinUrl;

    @Size(max = 500, message = "GitHub URL must be at most 500 characters")
    private String githubUrl;

    @Size(max = 500, message = "Website URL must be at most 500 characters")
    private String websiteUrl;

    @Size(max = 500, message = "Twitter URL must be at most 500 characters")
    private String twitterUrl;

    @com.fasterxml.jackson.annotation.JsonProperty("isPublic")
    private boolean isPublic;

    @com.fasterxml.jackson.annotation.JsonProperty("isPublic")
    public boolean isPublic() {
        return isPublic;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("isPublic")
    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    @Size(max = 30, message = "Theme must be at most 30 characters")
    private String portfolioTheme;
}
