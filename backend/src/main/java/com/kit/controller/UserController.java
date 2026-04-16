package com.kit.controller;

import com.kit.dto.AppDtos;
import com.kit.entity.User;
import com.kit.repository.UserRepository;
import com.kit.service.ApiMapper;
import com.kit.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final PasswordEncoder passwordEncoder;
    private final ApiMapper apiMapper;

    @GetMapping
    public ResponseEntity<List<AppDtos.UserSummary>> getUsers() {
        return ResponseEntity.ok(userRepository.findAll().stream()
                .sorted(Comparator.comparing(user -> user.getFullName() != null ? user.getFullName() : user.getEmail(), String.CASE_INSENSITIVE_ORDER))
                .map(apiMapper::toUserSummary)
                .toList());
    }

    @PatchMapping("/me")
    public ResponseEntity<AppDtos.UserSummary> updateProfile(
            @RequestBody AppDtos.UserProfileUpdateRequest request,
            Authentication authentication
    ) {
        User user = currentUserService.getCurrentUser(authentication);
        if (request.full_name() != null) {
            user.setFullName(request.full_name());
        }
        if (request.bio() != null) {
            user.setBio(request.bio());
        }
        if (request.profile_picture() != null) {
            user.setProfilePicture(request.profile_picture());
        }
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        return ResponseEntity.ok(apiMapper.toUserSummary(userRepository.save(user)));
    }
}
