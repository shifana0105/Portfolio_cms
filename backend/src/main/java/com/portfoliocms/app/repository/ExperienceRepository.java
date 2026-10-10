package com.portfoliocms.app.repository;

import com.portfoliocms.app.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExperienceRepository extends JpaRepository<Experience, Long> {
    List<Experience> findByUserIdOrderByDisplayOrderAsc(Long userId);
    long countByUserId(Long userId);
}
