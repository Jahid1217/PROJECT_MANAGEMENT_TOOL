package com.kit.controller;

import com.kit.dto.AppDtos;
import com.kit.entity.Notification;
import com.kit.entity.User;
import com.kit.repository.NotificationRepository;
import com.kit.service.ApiMapper;
import com.kit.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;
    private final ApiMapper apiMapper;

    @GetMapping
    public ResponseEntity<List<AppDtos.NotificationResponse>> getNotifications(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        return ResponseEntity.ok(notificationRepository.findTop50ByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(apiMapper::toNotificationResponse)
                .toList());
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<AppDtos.NotificationResponse> markAsRead(@PathVariable Long id, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(NOT_FOUND, "Notification not found");
        }
        notification.setIsRead(true);
        return ResponseEntity.ok(apiMapper.toNotificationResponse(notificationRepository.save(notification)));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clear(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        notificationRepository.deleteByUserId(user.getId());
        return ResponseEntity.noContent().build();
    }
}
