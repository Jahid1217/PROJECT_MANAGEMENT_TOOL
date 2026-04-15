package com.kit.controller;

import com.kit.entity.Project;
import com.kit.entity.User;
import com.kit.repository.ProjectRepository;
import com.kit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectRepository.findByIsDeletedFalse());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER', 'ADMIN')")
    public ResponseEntity<Project> createProject(@RequestBody Project project, Authentication auth) {
        User manager = userRepository.findByEmail(auth.getName()).orElseThrow();
        project.setManager(manager);
        return ResponseEntity.ok(projectRepository.save(project));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROJECT_MANAGER', 'ADMIN')")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project updates) {
        Project project = projectRepository.findById(id).orElseThrow();
        if (updates.getName() != null) project.setName(updates.getName());
        if (updates.getDescription() != null) project.setDescription(updates.getDescription());
        if (updates.getStatus() != null) project.setStatus(updates.getStatus());
        if (updates.getStartDate() != null) project.setStartDate(updates.getStartDate());
        if (updates.getEndDate() != null) project.setEndDate(updates.getEndDate());
        if (updates.getFeatures() != null) project.setFeatures(updates.getFeatures());
        
        return ResponseEntity.ok(projectRepository.save(project));
    }
}
