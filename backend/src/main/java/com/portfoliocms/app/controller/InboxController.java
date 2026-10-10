package com.portfoliocms.app.controller;

import com.portfoliocms.app.dto.response.ContactMessageResponse;
import com.portfoliocms.app.security.UserPrincipal;
import com.portfoliocms.app.service.ContactMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/inbox")
@RequiredArgsConstructor
public class InboxController {

    private final ContactMessageService messageService;

    @GetMapping
    public ResponseEntity<List<ContactMessageResponse>> getInbox(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(messageService.getInbox(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactMessageResponse> getMessage(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(messageService.getMessage(id, principal.getId()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ContactMessageResponse> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(messageService.markAsRead(id, principal.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        messageService.deleteMessage(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("count", messageService.getUnreadCount(principal.getId())));
    }
}
