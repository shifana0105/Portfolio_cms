package com.portfoliocms.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Phase 1: the account a person authenticates as. This is intentionally
 * separate from Profile (Phase 2) - User owns credentials/auth concerns
 * only; portfolio-facing data (username, bio, social links, etc.) lives on
 * Profile in a later phase.
 */
@Getter
@Setter
@Entity
@Table(name = "users")
public class User extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    /**
     * BCrypt hash only - the plaintext password is never persisted or
     * logged. Named passwordHash (not "password") so it's obvious at every
     * call site that this field never holds plaintext.
     */
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;
}
