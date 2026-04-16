package com.kit.controller;

import com.kit.dto.AppDtos;
import com.kit.repository.AuditLogRepository;
import com.kit.service.ApiMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditLogRepository auditLogRepository;
    private final ApiMapper apiMapper;

    @GetMapping
    public ResponseEntity<List<AppDtos.AuditLogResponse>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findTop100ByOrderByCreatedAtDesc().stream()
                .map(apiMapper::toAuditLogResponse)
                .toList());
    }
}
