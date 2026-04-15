package com.kit.repository;

import com.kit.entity.MeetingNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeetingNoteRepository extends JpaRepository<MeetingNote, Long> {
    List<MeetingNote> findAllByOrderByMeetingDateDescCreatedAtDesc();
}
