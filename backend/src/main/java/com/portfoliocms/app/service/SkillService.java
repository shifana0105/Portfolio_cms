package com.portfoliocms.app.service;

import com.portfoliocms.app.dto.request.SkillRequest;
import com.portfoliocms.app.dto.response.SkillResponse;
import com.portfoliocms.app.entity.Skill;
import com.portfoliocms.app.entity.User;
import com.portfoliocms.app.exception.ForbiddenException;
import com.portfoliocms.app.exception.NotFoundException;
import com.portfoliocms.app.repository.SkillRepository;
import com.portfoliocms.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    public List<SkillResponse> getAllByUserId(Long userId) {
        return skillRepository.findByUserIdOrderByDisplayOrderAsc(userId).stream()
                .map(SkillResponse::from)
                .toList();
    }

    @Transactional
    public SkillResponse create(Long userId, SkillRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Skill skill = new Skill();
        skill.setUser(user);
        mapRequestToEntity(request, skill);

        return SkillResponse.from(skillRepository.save(skill));
    }

    @Transactional
    public SkillResponse update(Long skillId, Long userId, SkillRequest request) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new NotFoundException("Skill not found"));
        if (!skill.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }

        mapRequestToEntity(request, skill);
        return SkillResponse.from(skillRepository.save(skill));
    }

    @Transactional
    public void delete(Long skillId, Long userId) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new NotFoundException("Skill not found"));
        if (!skill.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }
        skillRepository.delete(skill);
    }

    private void mapRequestToEntity(SkillRequest request, Skill skill) {
        skill.setName(request.getName());
        skill.setCategory(request.getCategory());
        skill.setProficiency(request.getProficiency());
        skill.setDisplayOrder(request.getDisplayOrder());
    }
}
