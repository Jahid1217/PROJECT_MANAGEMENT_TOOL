package com.kit.controller;

import com.kit.dto.AppDtos;
import com.kit.entity.Issue;
import com.kit.entity.Project;
import com.kit.entity.Task;
import com.kit.entity.User;
import com.kit.entity.enums.IssueStatus;
import com.kit.entity.enums.NotificationType;
import com.kit.repository.IssueRepository;
import com.kit.repository.ProjectRepository;
import com.kit.repository.TaskRepository;
import com.kit.repository.UserRepository;
import com.kit.service.ActivityService;
import com.kit.service.ApiMapper;
import com.kit.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final ApiMapper apiMapper;
    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<List<AppDtos.IssueResponse>> getIssues(@RequestParam Long projectId) {
        return ResponseEntity.ok(issueRepository.findByProjectId(projectId).stream()
                .sorted(Comparator.comparing(Issue::getCreatedAt).reversed())
                .map(apiMapper::toIssueResponse)
                .toList());
    }

    @PostMapping
    public ResponseEntity<AppDtos.IssueResponse> createIssue(
            @RequestBody AppDtos.IssueRequest request,
            Authentication authentication
    ) {
        User reporter = currentUserService.getCurrentUser(authentication);
        Project project = projectRepository.findByIdAndIsDeletedFalse(request.project_id())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));
        Task task = request.task_id() != null
                ? taskRepository.findByIdAndIsDeletedFalse(request.task_id())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Task not found"))
                : null;
        User assignee = request.assignee_id() != null
                ? userRepository.findById(request.assignee_id())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Assignee not found"))
                : task != null ? task.getAssignee() : null;

        Issue issue = Issue.builder()
                .project(project)
                .task(task)
                .title(request.title())
                .description(request.description())
                .severity(request.severity())
                .status(request.status() != null ? request.status() : IssueStatus.OPEN)
                .attachmentUrl(request.attachment_url())
                .attachmentType(request.attachment_type())
                .reporter(reporter)
                .assignee(assignee)
                .build();

        Issue savedIssue = issueRepository.save(issue);
        activityService.log("ISSUE", savedIssue.getId(), "CREATE", reporter, "Reported issue " + savedIssue.getTitle());
        if (assignee != null && !assignee.getId().equals(reporter.getId())) {
            activityService.notify(
                    assignee,
                    "Issue assigned",
                    "You have been assigned to issue \"" + savedIssue.getTitle() + "\".",
                    NotificationType.WARNING
            );
        }
        return ResponseEntity.ok(apiMapper.toIssueResponse(savedIssue));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AppDtos.IssueResponse> updateIssue(
            @PathVariable Long id,
            @RequestBody AppDtos.IssueRequest request,
            Authentication authentication
    ) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Issue not found"));
        User actor = currentUserService.getCurrentUser(authentication);

        if (request.project_id() != null && !request.project_id().equals(issue.getProject().getId())) {
            Project project = projectRepository.findByIdAndIsDeletedFalse(request.project_id())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));
            issue.setProject(project);
        }
        if (request.task_id() != null) {
            Task task = taskRepository.findByIdAndIsDeletedFalse(request.task_id())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Task not found"));
            issue.setTask(task);
        }
        if (request.title() != null) issue.setTitle(request.title());
        if (request.description() != null) issue.setDescription(request.description());
        if (request.severity() != null) issue.setSeverity(request.severity());
        if (request.status() != null) issue.setStatus(request.status());
        if (request.attachment_url() != null) issue.setAttachmentUrl(request.attachment_url());
        if (request.attachment_type() != null) issue.setAttachmentType(request.attachment_type());
        if (request.assignee_id() != null) {
            User assignee = userRepository.findById(request.assignee_id())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Assignee not found"));
            issue.setAssignee(assignee);
        }

        Issue savedIssue = issueRepository.save(issue);
        activityService.log("ISSUE", savedIssue.getId(), "UPDATE", actor, "Updated issue " + savedIssue.getTitle());
        return ResponseEntity.ok(apiMapper.toIssueResponse(savedIssue));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppDtos.IssueResponse> updateIssueStatus(
            @PathVariable Long id,
            @RequestBody AppDtos.IssueStatusRequest request,
            Authentication authentication
    ) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Issue not found"));
        User actor = currentUserService.getCurrentUser(authentication);
        issue.setStatus(request.status());
        Issue savedIssue = issueRepository.save(issue);
        activityService.log("ISSUE", savedIssue.getId(), "STATUS_CHANGE", actor, "Changed status to " + savedIssue.getStatus());
        if (savedIssue.getReporter() != null && !savedIssue.getReporter().getId().equals(actor.getId())) {
            activityService.notify(
                    savedIssue.getReporter(),
                    "Issue updated",
                    "Issue \"" + savedIssue.getTitle() + "\" is now " + savedIssue.getStatus() + ".",
                    NotificationType.INFO
            );
        }
        return ResponseEntity.ok(apiMapper.toIssueResponse(savedIssue));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id, Authentication authentication) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Issue not found"));
        User actor = currentUserService.getCurrentUser(authentication);
        issueRepository.delete(issue);
        activityService.log("ISSUE", id, "DELETE", actor, "Deleted issue " + issue.getTitle());
        return ResponseEntity.noContent().build();
    }
}
