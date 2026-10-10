package com.portfoliocms.app.dto.response;

import com.portfoliocms.app.entity.ContactMessage;

import java.time.Instant;

public record ContactMessageResponse(
        Long id,
        String senderName,
        String senderEmail,
        String message,
        boolean isRead,
        Instant createdAt
) {
    public static ContactMessageResponse from(ContactMessage msg) {
        return new ContactMessageResponse(
                msg.getId(),
                msg.getSenderName(),
                msg.getSenderEmail(),
                msg.getMessage(),
                msg.isRead(),
                msg.getCreatedAt()
        );
    }
}
