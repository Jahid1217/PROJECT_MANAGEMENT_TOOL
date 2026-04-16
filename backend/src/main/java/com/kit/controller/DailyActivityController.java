package com.kit.controller;

import com.kit.dto.AppDtos;
import com.kit.entity.DailyActivity;
import com.kit.entity.User;
import com.kit.repository.DailyActivityRepository;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/daily-activities")
@RequiredArgsConstructor
public class DailyActivityController {

    private final DailyActivityRepository dailyActivityRepository;
    private final CurrentUserService currentUserService;
    private final ApiMapper apiMapper;
    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<List<AppDtos.DailyActivityResponse>> getDailyActivities() {
        return ResponseEntity.ok(dailyActivityRepository.findAllByOrderByActivityDateDescCreatedAtDesc().stream()
                .map(apiMapper::toDailyActivityResponse)
                .toList());
    }

    @PostMapping
    public ResponseEntity<AppDtos.DailyActivityResponse> createDailyActivity(
            @RequestBody AppDtos.DailyActivityRequest request,
            Authentication authentication
    ) {
        User user = currentUserService.getCurrentUser(authentication);
        DailyActivity activity = DailyActivity.builder()
                .user(user)
                .activityDate(request.activity_date())
                .content(request.content())
                .build();

        DailyActivity savedActivity = dailyActivityRepository.save(activity);
        activityService.log("DAILY_ACTIVITY", savedActivity.getId(), "CREATE", user, "Logged daily activity");
        return ResponseEntity.ok(apiMapper.toDailyActivityResponse(savedActivity));
    }
}
