package com.kit.repository;

import com.kit.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectIdAndIsDeletedFalse(Long projectId);
    Optional<Task> findByIdAndIsDeletedFalse(Long id);

    @Query("SELECT t FROM Task t JOIN FETCH t.creator LEFT JOIN FETCH t.assignee WHERE t.project.id = :projectId AND t.isDeleted = false")
    List<Task> findByProjectIdWithUsers(@Param("projectId") Long projectId);
}
