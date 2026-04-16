package com.kit.controller;

import com.kit.dto.AppDtos;
import com.kit.entity.MeetingNote;
import com.kit.entity.User;
import com.kit.repository.MeetingNoteRepository;
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
@RequestMapping("/api/meeting-notes")
@RequiredArgsConstructor
public class MeetingNoteController {

    private final MeetingNoteRepository meetingNoteRepository;
    private final CurrentUserService currentUserService;
    private final ApiMapper apiMapper;
    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<List<AppDtos.MeetingNoteResponse>> getMeetingNotes() {
        return ResponseEntity.ok(meetingNoteRepository.findAllByOrderByMeetingDateDescCreatedAtDesc().stream()
                .map(apiMapper::toMeetingNoteResponse)
                .toList());
    }

    @PostMapping
    public ResponseEntity<AppDtos.MeetingNoteResponse> createMeetingNote(
            @RequestBody AppDtos.MeetingNoteRequest request,
            Authentication authentication
    ) {
        User author = currentUserService.getCurrentUser(authentication);
        MeetingNote meetingNote = MeetingNote.builder()
                .title(request.title())
                .content(request.content())
                .meetingDate(request.meeting_date())
                .author(author)
                .build();

        MeetingNote savedMeetingNote = meetingNoteRepository.save(meetingNote);
        activityService.log("MEETING_NOTE", savedMeetingNote.getId(), "CREATE", author, "Created meeting note " + savedMeetingNote.getTitle());
        return ResponseEntity.ok(apiMapper.toMeetingNoteResponse(savedMeetingNote));
    }
}
