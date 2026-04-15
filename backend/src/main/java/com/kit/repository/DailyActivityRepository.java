package com.kit.repository;

import com.kit.entity.DailyActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DailyActivityRepository extends JpaRepository<DailyActivity, Long> {
    List<DailyActivity> findAllByOrderByActivityDateDescCreatedAtDesc();
}
