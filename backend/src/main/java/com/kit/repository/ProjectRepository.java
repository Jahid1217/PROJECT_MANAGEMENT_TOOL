package com.kit.repository;

import com.kit.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByIsDeletedFalse();
    Optional<Project> findByIdAndIsDeletedFalse(Long id);
}
