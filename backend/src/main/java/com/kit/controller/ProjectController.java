package com.kit.controller;

import com.kit.dto.AppDtos;
import com.kit.entity.Project;
import com.kit.entity.User;
import com.kit.entity.enums.ProjectStatus;
import com.kit.repository.ProjectRepository;
import com.kit.repository.UserRepository;
import com.kit.service.ActivityService;
import com.kit.service.ApiMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ApiMapper apiMapper;
    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<List<AppDtos.ProjectResponse>> getAllProjects() {
        return ResponseEntity.ok(projectRepository.findByIsDeletedFalse().stream()
                .map(apiMapper::toProjectResponse)
                .toList());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER', 'ADMIN')")
    public ResponseEntity<AppDtos.ProjectResponse> createProject(
            @RequestBody AppDtos.ProjectRequest request,
            Authentication auth
    ) {
        User manager = userRepository.findByEmail(auth.getName()).orElseThrow();
        Project project = Project.builder()
                .name(request.name())
                .description(request.description())
                .manager(manager)
                .status(request.status() != null ? request.status() : ProjectStatus.ACTIVE)
                .startDate(request.start_date())
                .endDate(request.end_date())
                .features(request.features())
                .isDeleted(false)
                .build();

        Project savedProject = projectRepository.save(project);
        activityService.log("PROJECT", savedProject.getId(), "CREATE", manager, "Created project " + savedProject.getName());
        return ResponseEntity.ok(apiMapper.toProjectResponse(savedProject));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER', 'ADMIN')")
    public ResponseEntity<AppDtos.ProjectResponse> updateProject(
            @PathVariable Long id,
            @RequestBody AppDtos.ProjectRequest updates,
            Authentication auth
    ) {
        Project project = projectRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));
        User actor = userRepository.findByEmail(auth.getName()).orElseThrow();

        if (updates.name() != null) project.setName(updates.name());
        if (updates.description() != null) project.setDescription(updates.description());
        if (updates.status() != null) project.setStatus(updates.status());
        if (updates.start_date() != null) project.setStartDate(updates.start_date());
        if (updates.end_date() != null) project.setEndDate(updates.end_date());
        if (updates.features() != null) project.setFeatures(updates.features());

        Project savedProject = projectRepository.save(project);
        activityService.log("PROJECT", savedProject.getId(), "UPDATE", actor, "Updated project " + savedProject.getName());
        return ResponseEntity.ok(apiMapper.toProjectResponse(savedProject));
    }
}
