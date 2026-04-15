package com.kit.repository;

import com.kit.entity.WorkLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkLogRepository extends JpaRepository<WorkLog, Long> {
    List<WorkLog> findByTaskIdOrderByLogDateDescCreatedAtDesc(Long taskId);
    List<WorkLog> findAllByOrderByLogDateDescCreatedAtDesc();
}
