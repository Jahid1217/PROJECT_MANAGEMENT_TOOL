package com.kit.controller;

import com.kit.entity.Task;
import com.kit.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository taskRepository;

    @GetMapping
    public ResponseEntity<List<Task>> getTasksByProject(@RequestParam Long projectId) {
        return ResponseEntity.ok(taskRepository.findByProjectIdWithUsers(projectId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setIsDeleted(true);
        taskRepository.save(task);
        return ResponseEntity.noContent().build();
    }
}
