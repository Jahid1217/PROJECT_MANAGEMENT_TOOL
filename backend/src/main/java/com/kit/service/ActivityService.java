package com.kit.service;

import com.kit.entity.AuditLog;
import com.kit.entity.Notification;
import com.kit.entity.User;
import com.kit.entity.enums.NotificationType;
import com.kit.repository.AuditLogRepository;
import com.kit.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;

    public void log(String entityType, Long entityId, String action, User actor, String details) {
        auditLogRepository.save(AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .user(actor)
                .details(details)
                .build());
    }

    public void notify(User user, String title, String message, NotificationType type) {
        if (user == null) {
            return;
        }

        notificationRepository.save(Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build());
    }
}
