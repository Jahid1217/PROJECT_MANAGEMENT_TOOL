package com.kit.controller;

import com.kit.dto.AppDtos;
import com.kit.entity.Task;
import com.kit.entity.User;
import com.kit.entity.WorkLog;
import com.kit.entity.enums.NotificationType;
import com.kit.repository.TaskRepository;
import com.kit.repository.WorkLogRepository;
import com.kit.service.ActivityService;
import com.kit.service.ApiMapper;
import com.kit.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/work-logs")
@RequiredArgsConstructor
public class WorkLogController {

    private final WorkLogRepository workLogRepository;
    private final TaskRepository taskRepository;
    private final CurrentUserService currentUserService;
    private final ApiMapper apiMapper;
    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<List<AppDtos.WorkLogResponse>> getWorkLogs(@RequestParam(required = false) Long taskId) {
        List<WorkLog> workLogs = taskId != null
                ? workLogRepository.findByTaskIdOrderByLogDateDescCreatedAtDesc(taskId)
                : workLogRepository.findAllByOrderByLogDateDescCreatedAtDesc();
        return ResponseEntity.ok(workLogs.stream().map(apiMapper::toWorkLogResponse).toList());
    }

    @PostMapping
    public ResponseEntity<AppDtos.WorkLogResponse> createWorkLog(
            @RequestBody AppDtos.WorkLogRequest request,
            Authentication authentication
    ) {
        User user = currentUserService.getCurrentUser(authentication);
        Task task = taskRepository.findByIdAndIsDeletedFalse(request.task_id())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Task not found"));

        WorkLog workLog = WorkLog.builder()
                .task(task)
                .user(user)
                .logDate(request.log_date())
                .hours(request.hours())
                .description(request.description())
                .build();

        WorkLog savedWorkLog = workLogRepository.save(workLog);
        task.setActualHours((task.getActualHours() != null ? task.getActualHours() : 0D) + request.hours());
        taskRepository.save(task);
        activityService.log("WORK_LOG", savedWorkLog.getId(), "CREATE", user, "Logged " + request.hours() + "h on task " + task.getTitle());
        if (task.getCreator() != null && !task.getCreator().getId().equals(user.getId())) {
            activityService.notify(
                    task.getCreator(),
                    "Work log added",
                    user.getFullName() + " logged work on task \"" + task.getTitle() + "\".",
                    NotificationType.INFO
            );
        }
        return ResponseEntity.ok(apiMapper.toWorkLogResponse(savedWorkLog));
    }
}
