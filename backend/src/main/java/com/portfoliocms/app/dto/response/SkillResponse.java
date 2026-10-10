package com.portfoliocms.app.dto.response;

import com.portfoliocms.app.entity.Skill;

import java.time.Instant;

public record SkillResponse(
        Long id,
        String name,
        String category,
        String proficiency,
        int displayOrder,
        Instant createdAt,
        Instant updatedAt
) {
    public static SkillResponse from(Skill skill) {
        return new SkillResponse(
                skill.getId(),
                skill.getName(),
                skill.getCategory(),
                skill.getProficiency(),
                skill.getDisplayOrder(),
                skill.getCreatedAt(),
                skill.getUpdatedAt()
        );
    }
}
