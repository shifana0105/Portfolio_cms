package com.portfoliocms.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * Shared audit-field convention for all domain entities introduced from
 * Phase 1 onward (User, Profile, Project, Skill, Experience, Education,
 * Resume, RecruiterView, ContactMessage).
 *
 * Every entity that extends this gets createdAt/updatedAt automatically via
 * Spring Data JPA auditing (enabled in PortfolioCmsApplication). This is what
 * lets the Dashboard "Activity Timeline" (Phase 7) derive recent activity
 * from real timestamps instead of a dedicated Activity table, per spec.
 *
 * No entities are defined yet in Phase 0 - this class exists only to lock in
 * the convention before feature phases begin.
 */
@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseAuditableEntity {

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
