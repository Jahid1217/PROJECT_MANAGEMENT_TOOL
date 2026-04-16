package com.kit.dto;

import com.kit.entity.enums.AttachmentType;
import com.kit.entity.enums.CommentTargetType;
import com.kit.entity.enums.IssueStatus;
import com.kit.entity.enums.NotificationType;
import com.kit.entity.enums.Priority;
import com.kit.entity.enums.ProjectStatus;
import com.kit.entity.enums.Role;
import com.kit.entity.enums.TaskStatus;
import com.kit.entity.enums.TaskType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class AppDtos {

    private AppDtos() {
    }

    public record UserSummary(
            Long id,
            String email,
            Role role,
            String fullName,
            String profilePicture,
            String bio
    ) {
    }

    public record UserProfileUpdateRequest(
            String full_name,
            String password,
            String bio,
            String profile_picture
    ) {
    }

    public record ProjectRequest(
            String name,
            String description,
            ProjectStatus status,
            LocalDate start_date,
            LocalDate end_date,
            String features
    ) {
    }

    public record ProjectResponse(
            Long id,
            String name,
            String description,
            Long manager_id,
            String manager_name,
            ProjectStatus status,
            LocalDate start_date,
            LocalDate end_date,
            String features,
            LocalDateTime created_at,
            LocalDateTime updated_at
    ) {
    }

    public record TaskRequest(
            Long project_id,
            String title,
            String description,
            TaskType type,
            TaskStatus status,
            Priority priority,
            String code_snippet,
            String attachment_url,
            AttachmentType attachment_type,
            LocalDate start_date,
            LocalDate end_date,
            Double estimated_hours,
            Long assignee_id
    ) {
    }

    public record TaskResponse(
            Long id,
            Long project_id,
            String title,
            String description,
            TaskType type,
            TaskStatus status,
            Priority priority,
            String code_snippet,
            String attachment_url,
            AttachmentType attachment_type,
            LocalDate start_date,
            LocalDate end_date,
            Double estimated_hours,
            Double actual_hours,
            Long assignee_id,
            String assignee_name,
            Long creator_id,
            String creator_name,
            LocalDateTime created_at,
            LocalDateTime updated_at
    ) {
    }

    public record StatusUpdateRequest(TaskStatus status) {
    }

    public record IssueRequest(
            Long project_id,
            Long task_id,
            String title,
            String description,
            Priority severity,
            IssueStatus status,
            String attachment_url,
            AttachmentType attachment_type,
            Long assignee_id
    ) {
    }

    public record IssueStatusRequest(IssueStatus status) {
    }

    public record IssueResponse(
            Long id,
            Long project_id,
            Long task_id,
            String task_title,
            String title,
            String description,
            Priority severity,
            IssueStatus status,
            String attachment_url,
            AttachmentType attachment_type,
            Long reporter_id,
            String reporter_name,
            Long assignee_id,
            String assignee_name,
            LocalDateTime created_at,
            LocalDateTime updated_at
    ) {
    }

    public record CommentRequest(
            CommentTargetType target_type,
            Long target_id,
            String content
    ) {
    }

    public record CommentResponse(
            Long id,
            CommentTargetType target_type,
            Long target_id,
            Long author_id,
            String author_name,
            String content,
            LocalDateTime created_at
    ) {
    }

    public record NotificationResponse(
            Long id,
            String title,
            String message,
            NotificationType type,
            Boolean is_read,
            LocalDateTime created_at
    ) {
    }

    public record MeetingNoteRequest(
            String title,
            String content,
            LocalDate meeting_date
    ) {
    }

    public record MeetingNoteResponse(
            Long id,
            String title,
            String content,
            LocalDate meeting_date,
            Long author_id,
            String author_name,
            LocalDateTime created_at
    ) {
    }

    public record DailyActivityRequest(
            String content,
            LocalDate activity_date
    ) {
    }

    public record DailyActivityResponse(
            Long id,
            Long user_id,
            String user_name,
            LocalDate activity_date,
            String content,
            LocalDateTime created_at
    ) {
    }

    public record WorkLogRequest(
            Long task_id,
            Double hours,
            String description,
            LocalDate log_date
    ) {
    }

    public record WorkLogResponse(
            Long id,
            Long task_id,
            Long user_id,
            String user_name,
            LocalDate log_date,
            Double hours,
            String description,
            LocalDateTime created_at
    ) {
    }

    public record AuditLogResponse(
            Long id,
            String entity_type,
            Long entity_id,
            String action,
            Long user_id,
            String user_name,
            String details,
            LocalDateTime created_at
    ) {
    }
}
