package com.kit.service;

import com.kit.dto.AppDtos;
import com.kit.dto.AuthDto;
import com.kit.entity.AuditLog;
import com.kit.entity.Comment;
import com.kit.entity.DailyActivity;
import com.kit.entity.Issue;
import com.kit.entity.MeetingNote;
import com.kit.entity.Notification;
import com.kit.entity.Project;
import com.kit.entity.Task;
import com.kit.entity.User;
import com.kit.entity.WorkLog;
import org.springframework.stereotype.Service;

@Service
public class ApiMapper {

    public AppDtos.UserSummary toUserSummary(User user) {
        return new AppDtos.UserSummary(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getFullName(),
                user.getProfilePicture(),
                user.getBio()
        );
    }

    public AuthDto.UserDto toAuthUserDto(User user) {
        return AuthDto.UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(user.getFullName())
                .profilePicture(user.getProfilePicture())
                .bio(user.getBio())
                .build();
    }

    public AppDtos.ProjectResponse toProjectResponse(Project project) {
        return new AppDtos.ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getManager() != null ? project.getManager().getId() : null,
                project.getManager() != null ? project.getManager().getFullName() : null,
                project.getStatus(),
                project.getStartDate(),
                project.getEndDate(),
                project.getFeatures(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    public AppDtos.TaskResponse toTaskResponse(Task task) {
        return new AppDtos.TaskResponse(
                task.getId(),
                task.getProject() != null ? task.getProject().getId() : null,
                task.getTitle(),
                task.getDescription(),
                task.getType(),
                task.getStatus(),
                task.getPriority(),
                task.getCodeSnippet(),
                task.getAttachmentUrl(),
                task.getAttachmentType(),
                task.getStartDate(),
                task.getEndDate(),
                task.getEstimatedHours(),
                task.getActualHours(),
                task.getAssignee() != null ? task.getAssignee().getId() : null,
                task.getAssignee() != null ? task.getAssignee().getFullName() : null,
                task.getCreator() != null ? task.getCreator().getId() : null,
                task.getCreator() != null ? task.getCreator().getFullName() : null,
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }

    public AppDtos.IssueResponse toIssueResponse(Issue issue) {
        return new AppDtos.IssueResponse(
                issue.getId(),
                issue.getProject() != null ? issue.getProject().getId() : null,
                issue.getTask() != null ? issue.getTask().getId() : null,
                issue.getTask() != null ? issue.getTask().getTitle() : null,
                issue.getTitle(),
                issue.getDescription(),
                issue.getSeverity(),
                issue.getStatus(),
                issue.getAttachmentUrl(),
                issue.getAttachmentType(),
                issue.getReporter() != null ? issue.getReporter().getId() : null,
                issue.getReporter() != null ? issue.getReporter().getFullName() : null,
                issue.getAssignee() != null ? issue.getAssignee().getId() : null,
                issue.getAssignee() != null ? issue.getAssignee().getFullName() : null,
                issue.getCreatedAt(),
                issue.getUpdatedAt()
        );
    }

    public AppDtos.CommentResponse toCommentResponse(Comment comment) {
        return new AppDtos.CommentResponse(
                comment.getId(),
                comment.getTargetType(),
                comment.getTargetId(),
                comment.getAuthor() != null ? comment.getAuthor().getId() : null,
                comment.getAuthor() != null ? comment.getAuthor().getFullName() : null,
                comment.getContent(),
                comment.getCreatedAt()
        );
    }

    public AppDtos.NotificationResponse toNotificationResponse(Notification notification) {
        return new AppDtos.NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getIsRead(),
                notification.getCreatedAt()
        );
    }

    public AppDtos.MeetingNoteResponse toMeetingNoteResponse(MeetingNote meetingNote) {
        return new AppDtos.MeetingNoteResponse(
                meetingNote.getId(),
                meetingNote.getTitle(),
                meetingNote.getContent(),
                meetingNote.getMeetingDate(),
                meetingNote.getAuthor() != null ? meetingNote.getAuthor().getId() : null,
                meetingNote.getAuthor() != null ? meetingNote.getAuthor().getFullName() : null,
                meetingNote.getCreatedAt()
        );
    }

    public AppDtos.DailyActivityResponse toDailyActivityResponse(DailyActivity dailyActivity) {
        return new AppDtos.DailyActivityResponse(
                dailyActivity.getId(),
                dailyActivity.getUser() != null ? dailyActivity.getUser().getId() : null,
                dailyActivity.getUser() != null ? dailyActivity.getUser().getFullName() : null,
                dailyActivity.getActivityDate(),
                dailyActivity.getContent(),
                dailyActivity.getCreatedAt()
        );
    }

    public AppDtos.WorkLogResponse toWorkLogResponse(WorkLog workLog) {
        return new AppDtos.WorkLogResponse(
                workLog.getId(),
                workLog.getTask() != null ? workLog.getTask().getId() : null,
                workLog.getUser() != null ? workLog.getUser().getId() : null,
                workLog.getUser() != null ? workLog.getUser().getFullName() : null,
                workLog.getLogDate(),
                workLog.getHours(),
                workLog.getDescription(),
                workLog.getCreatedAt()
        );
    }

    public AppDtos.AuditLogResponse toAuditLogResponse(AuditLog auditLog) {
        return new AppDtos.AuditLogResponse(
                auditLog.getId(),
                auditLog.getEntityType(),
                auditLog.getEntityId(),
                auditLog.getAction(),
                auditLog.getUser() != null ? auditLog.getUser().getId() : null,
                auditLog.getUser() != null ? auditLog.getUser().getFullName() : null,
                auditLog.getDetails(),
                auditLog.getCreatedAt()
        );
    }
}
