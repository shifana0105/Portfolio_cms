package com.portfoliocms.app.repository;

import com.portfoliocms.app.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EducationRepository extends JpaRepository<Education, Long> {
    List<Education> findByUserIdOrderByDisplayOrderAsc(Long userId);
    long countByUserId(Long userId);
}
