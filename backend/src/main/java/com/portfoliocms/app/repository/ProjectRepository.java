package com.portfoliocms.app.repository;

import com.portfoliocms.app.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserIdOrderByDisplayOrderAsc(Long userId);
    List<Project> findByUserIdAndFeaturedTrueOrderByDisplayOrderAsc(Long userId);
    long countByUserId(Long userId);
}
