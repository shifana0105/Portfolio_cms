package com.portfoliocms.app.service;

import com.portfoliocms.app.dto.request.ContactRequest;
import com.portfoliocms.app.dto.response.ContactMessageResponse;
import com.portfoliocms.app.entity.ContactMessage;
import com.portfoliocms.app.entity.User;
import com.portfoliocms.app.exception.ForbiddenException;
import com.portfoliocms.app.exception.NotFoundException;
import com.portfoliocms.app.exception.RateLimitExceededException;
import com.portfoliocms.app.repository.ContactMessageRepository;
import com.portfoliocms.app.repository.ProfileRepository;
import com.portfoliocms.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * In-memory rate limiter is acceptable for MVP.
 * For horizontal scaling, use Redis/Bucket4j.
 */
@Service
@RequiredArgsConstructor
public class ContactMessageService {

    private final ContactMessageRepository messageRepository;
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    // In-memory rate limiter: IP -> list of timestamps
    private final Map<String, CopyOnWriteArrayList<Long>> rateLimitMap = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_HOUR = 3;

    @Transactional
    public void sendMessage(String username, ContactRequest request, String senderIp) {
        // Rate limit
        checkRateLimit(senderIp);

        var profile = profileRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Portfolio not found"));

        if (!profile.isPublic()) {
            throw new NotFoundException("Portfolio not found");
        }

        ContactMessage message = new ContactMessage();
        message.setUser(profile.getUser());
        message.setSenderName(request.getSenderName().trim());
        message.setSenderEmail(request.getSenderEmail().trim().toLowerCase());
        message.setMessage(request.getMessage().trim());

        messageRepository.save(message);
    }

    public List<ContactMessageResponse> getInbox(Long userId) {
        return messageRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(ContactMessageResponse::from)
                .toList();
    }

    public ContactMessageResponse getMessage(Long messageId, Long userId) {
        ContactMessage msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new NotFoundException("Message not found"));
        if (!msg.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }
        return ContactMessageResponse.from(msg);
    }

    @Transactional
    public ContactMessageResponse markAsRead(Long messageId, Long userId) {
        ContactMessage msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new NotFoundException("Message not found"));
        if (!msg.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }
        msg.setRead(true);
        return ContactMessageResponse.from(messageRepository.save(msg));
    }

    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        ContactMessage msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new NotFoundException("Message not found"));
        if (!msg.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }
        messageRepository.delete(msg);
    }

    public long getUnreadCount(Long userId) {
        return messageRepository.countByUserIdAndIsReadFalse(userId);
    }

    private void checkRateLimit(String ip) {
        long now = System.currentTimeMillis();
        long oneHourAgo = now - 3600_000;

        rateLimitMap.compute(ip, (key, timestamps) -> {
            if (timestamps == null) {
                timestamps = new CopyOnWriteArrayList<>();
            }
            // Remove expired entries
            timestamps.removeIf(t -> t < oneHourAgo);
            return timestamps;
        });

        CopyOnWriteArrayList<Long> timestamps = rateLimitMap.get(ip);
        if (timestamps.size() >= MAX_REQUESTS_PER_HOUR) {
            throw new RateLimitExceededException("Too many contact requests. Please try again later.");
        }
        timestamps.add(now);
    }
}
