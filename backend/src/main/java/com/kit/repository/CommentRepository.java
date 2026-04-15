package com.kit.repository;

import com.kit.entity.Comment;
import com.kit.entity.enums.CommentTargetType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(CommentTargetType targetType, Long targetId);
}
