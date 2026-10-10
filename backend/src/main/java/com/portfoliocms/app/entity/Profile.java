package com.portfoliocms.app.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "profiles", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username")
})
public class Profile extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "professional_headline", length = 200)
    private String professionalHeadline;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 100)
    private String location;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;

    @Column(name = "github_url", length = 500)
    private String githubUrl;

    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    @Column(name = "twitter_url", length = 500)
    private String twitterUrl;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic = false;

    @Column(name = "portfolio_theme", length = 30)
    private String portfolioTheme = "default";
}
