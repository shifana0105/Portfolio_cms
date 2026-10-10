package com.portfoliocms.app.repository;

import com.portfoliocms.app.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByUserIdOrderByDisplayOrderAsc(Long userId);
    long countByUserId(Long userId);
}
