package com.kit.controller;

import com.kit.dto.AppDtos;
import com.kit.entity.Project;
import com.kit.entity.Task;
import com.kit.entity.User;
import com.kit.entity.enums.NotificationType;
import com.kit.entity.enums.Priority;
import com.kit.entity.enums.Role;
import com.kit.entity.enums.TaskStatus;
import com.kit.entity.enums.TaskType;
import com.kit.repository.ProjectRepository;
import com.kit.repository.TaskRepository;
import com.kit.repository.UserRepository;
import com.kit.service.ActivityService;
import com.kit.service.ApiMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ApiMapper apiMapper;
    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<List<AppDtos.TaskResponse>> getTasksByProject(@RequestParam Long projectId) {
        return ResponseEntity.ok(taskRepository.findByProjectIdWithUsers(projectId).stream()
                .map(apiMapper::toTaskResponse)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppDtos.TaskResponse> getTask(@PathVariable Long id) {
        Task task = taskRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Task not found"));
        return ResponseEntity.ok(apiMapper.toTaskResponse(task));
    }

    @PostMapping
    public ResponseEntity<AppDtos.TaskResponse> createTask(
            @RequestBody AppDtos.TaskRequest request,
            Authentication authentication
    ) {
        User creator = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Project project = projectRepository.findByIdAndIsDeletedFalse(request.project_id())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));
        User assignee = resolveAssignee(request.assignee_id(), creator);

        Task task = Task.builder()
                .project(project)
                .title(request.title())
                .description(request.description())
                .type(request.type() != null ? request.type() : TaskType.TASK)
                .status(request.status() != null ? request.status() : TaskStatus.ACTIVE)
                .priority(request.priority() != null ? request.priority() : Priority.MEDIUM)
                .codeSnippet(request.code_snippet())
                .attachmentUrl(request.attachment_url())
                .attachmentType(request.attachment_type())
                .startDate(request.start_date())
                .endDate(request.end_date())
                .estimatedHours(request.estimated_hours() != null ? request.estimated_hours() : 0D)
                .actualHours(0D)
                .assignee(assignee)
                .creator(creator)
                .isDeleted(false)
                .build();

        Task savedTask = taskRepository.save(task);
        activityService.log("TASK", savedTask.getId(), "CREATE", creator, "Created task " + savedTask.getTitle());
        if (assignee != null && !assignee.getId().equals(creator.getId())) {
            activityService.notify(
                    assignee,
                    "Task assigned",
                    "You have been assigned to task \"" + savedTask.getTitle() + "\".",
                    NotificationType.INFO
            );
        }
        return ResponseEntity.ok(apiMapper.toTaskResponse(savedTask));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AppDtos.TaskResponse> updateTask(
            @PathVariable Long id,
            @RequestBody AppDtos.TaskRequest request,
            Authentication authentication
    ) {
        Task task = taskRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Task not found"));
        User actor = userRepository.findByEmail(authentication.getName()).orElseThrow();

        if (request.project_id() != null && !request.project_id().equals(task.getProject().getId())) {
            Project project = projectRepository.findByIdAndIsDeletedFalse(request.project_id())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));
            task.setProject(project);
        }
        if (request.title() != null) task.setTitle(request.title());
        if (request.description() != null) task.setDescription(request.description());
        if (request.type() != null) task.setType(request.type());
        if (request.priority() != null) task.setPriority(request.priority());
        if (request.code_snippet() != null) task.setCodeSnippet(request.code_snippet());
        if (request.attachment_url() != null) task.setAttachmentUrl(request.attachment_url());
        if (request.attachment_type() != null) task.setAttachmentType(request.attachment_type());
        if (request.start_date() != null) task.setStartDate(request.start_date());
        if (request.end_date() != null) task.setEndDate(request.end_date());
        if (request.estimated_hours() != null) task.setEstimatedHours(request.estimated_hours());
        task.setAssignee(resolveExplicitAssignee(request.assignee_id()));

        Task savedTask = taskRepository.save(task);
        activityService.log("TASK", savedTask.getId(), "UPDATE", actor, "Updated task " + savedTask.getTitle());
        return ResponseEntity.ok(apiMapper.toTaskResponse(savedTask));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppDtos.TaskResponse> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody AppDtos.StatusUpdateRequest request,
            Authentication authentication
    ) {
        Task task = taskRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Task not found"));
        User actor = userRepository.findByEmail(authentication.getName()).orElseThrow();
        task.setStatus(request.status());
        Task savedTask = taskRepository.save(task);
        activityService.log("TASK", savedTask.getId(), "STATUS_CHANGE", actor, "Changed status to " + savedTask.getStatus());
        if (savedTask.getCreator() != null && !savedTask.getCreator().getId().equals(actor.getId())) {
            activityService.notify(
                    savedTask.getCreator(),
                    "Task status updated",
                    "Task \"" + savedTask.getTitle() + "\" is now " + savedTask.getStatus() + ".",
                    NotificationType.INFO
            );
        }
        return ResponseEntity.ok(apiMapper.toTaskResponse(savedTask));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, Authentication authentication) {
        Task task = taskRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Task not found"));
        User actor = userRepository.findByEmail(authentication.getName()).orElseThrow();
        task.setIsDeleted(true);
        taskRepository.save(task);
        activityService.log("TASK", task.getId(), "DELETE", actor, "Deleted task " + task.getTitle());
        return ResponseEntity.noContent().build();
    }

    private User resolveAssignee(Long assigneeId, User creator) {
        if (assigneeId != null) {
            return userRepository.findById(assigneeId)
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Assignee not found"));
        }
        if (creator.getRole() == Role.DEVELOPER || creator.getRole() == Role.MOBILE_APP_DEVELOPER) {
            return creator;
        }
        return null;
    }

    private User resolveExplicitAssignee(Long assigneeId) {
        if (assigneeId == null) {
            return null;
        }
        return userRepository.findById(assigneeId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Assignee not found"));
    }
}
