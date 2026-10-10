package com.portfoliocms.app.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "recruiter_views", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "ip_hash", "view_date"})
})
public class RecruiterView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "ip_hash", nullable = false, length = 64)
    private String ipHash;

    @Column(name = "view_date", nullable = false)
    private LocalDate viewDate;

    @Column(name = "viewed_at", nullable = false)
    private Instant viewedAt;
}
