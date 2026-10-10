package com.portfoliocms.app.service;

import com.portfoliocms.app.dto.request.ProjectRequest;
import com.portfoliocms.app.dto.response.ProjectResponse;
import com.portfoliocms.app.entity.Project;
import com.portfoliocms.app.entity.User;
import com.portfoliocms.app.exception.ForbiddenException;
import com.portfoliocms.app.exception.NotFoundException;
import com.portfoliocms.app.repository.ProjectRepository;
import com.portfoliocms.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<ProjectResponse> getAllByUserId(Long userId) {
        return projectRepository.findByUserIdOrderByDisplayOrderAsc(userId).stream()
                .map(ProjectResponse::from)
                .toList();
    }

    public ProjectResponse getById(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found"));
        if (!project.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }
        return ProjectResponse.from(project);
    }

    @Transactional
    public ProjectResponse create(Long userId, ProjectRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Project project = new Project();
        project.setUser(user);
        mapRequestToEntity(request, project);

        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse update(Long projectId, Long userId, ProjectRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found"));
        if (!project.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }

        mapRequestToEntity(request, project);
        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional
    public void delete(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found"));
        if (!project.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }
        projectRepository.delete(project);
    }

    private void mapRequestToEntity(ProjectRequest request, Project project) {
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setTechStack(request.getTechStack());
        project.setLiveUrl(request.getLiveUrl());
        project.setGithubUrl(request.getGithubUrl());
        project.setThumbnailUrl(request.getThumbnailUrl());
        project.setFeatured(request.isFeatured());
        project.setDisplayOrder(request.getDisplayOrder());
    }
}
