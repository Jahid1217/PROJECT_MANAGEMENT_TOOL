package com.kit.controller;

import com.kit.dto.AppDtos;
import com.kit.entity.Comment;
import com.kit.entity.Issue;
import com.kit.entity.Task;
import com.kit.entity.User;
import com.kit.entity.enums.CommentTargetType;
import com.kit.entity.enums.NotificationType;
import com.kit.repository.CommentRepository;
import com.kit.repository.IssueRepository;
import com.kit.repository.TaskRepository;
import com.kit.service.ActivityService;
import com.kit.service.ApiMapper;
import com.kit.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final IssueRepository issueRepository;
    private final CurrentUserService currentUserService;
    private final ActivityService activityService;
    private final ApiMapper apiMapper;

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<AppDtos.CommentResponse>> getTaskComments(@PathVariable Long taskId) {
        return ResponseEntity.ok(commentRepository
                .findByTargetTypeAndTargetIdOrderByCreatedAtDesc(CommentTargetType.TASK, taskId)
                .stream()
                .map(apiMapper::toCommentResponse)
                .toList());
    }

    @GetMapping("/issue/{issueId}")
    public ResponseEntity<List<AppDtos.CommentResponse>> getIssueComments(@PathVariable Long issueId) {
        return ResponseEntity.ok(commentRepository
                .findByTargetTypeAndTargetIdOrderByCreatedAtDesc(CommentTargetType.ISSUE, issueId)
                .stream()
                .map(apiMapper::toCommentResponse)
                .toList());
    }

    @PostMapping
    public ResponseEntity<AppDtos.CommentResponse> createComment(
            @RequestBody AppDtos.CommentRequest request,
            Authentication authentication
    ) {
        User author = currentUserService.getCurrentUser(authentication);
        Task task = null;
        Issue issue = null;
        if (request.target_type() == CommentTargetType.TASK) {
            task = taskRepository.findByIdAndIsDeletedFalse(request.target_id())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Task not found"));
        } else {
            issue = issueRepository.findById(request.target_id())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Issue not found"));
        }

        Comment comment = Comment.builder()
                .targetType(request.target_type())
                .targetId(request.target_id())
                .author(author)
                .content(request.content())
                .build();

        Comment savedComment = commentRepository.save(comment);
        notifyTargetOwner(author, task, issue);
        return ResponseEntity.ok(apiMapper.toCommentResponse(savedComment));
    }

    private void notifyTargetOwner(User author, Task task, Issue issue) {
        if (task != null) {
            if (task.getCreator() != null && !task.getCreator().getId().equals(author.getId())) {
                activityService.notify(
                        task.getCreator(),
                        "New task comment",
                        author.getFullName() + " commented on task \"" + task.getTitle() + "\".",
                        NotificationType.INFO
                );
            }
            return;
        }

        if (issue != null && issue.getReporter() != null && !issue.getReporter().getId().equals(author.getId())) {
            activityService.notify(
                    issue.getReporter(),
                    "New issue comment",
                    author.getFullName() + " commented on issue \"" + issue.getTitle() + "\".",
                    NotificationType.INFO
            );
        }
    }
}
