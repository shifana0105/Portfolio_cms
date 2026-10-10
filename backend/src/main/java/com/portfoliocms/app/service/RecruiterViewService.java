package com.portfoliocms.app.service;

import com.portfoliocms.app.dto.response.AnalyticsResponse;
import com.portfoliocms.app.entity.RecruiterView;
import com.portfoliocms.app.entity.User;
import com.portfoliocms.app.exception.NotFoundException;
import com.portfoliocms.app.repository.ProfileRepository;
import com.portfoliocms.app.repository.RecruiterViewRepository;
import com.portfoliocms.app.repository.UserRepository;
import com.portfoliocms.app.util.IpHashUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RecruiterViewService {

    private final RecruiterViewRepository viewRepository;
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Value("${app.security.ip-hash-secret:default-dev-secret-change-me}")
    private String ipHashSecret;

    /**
     * Records a portfolio view. Deduplicates by user+ip_hash+date.
     * If the same IP visits the same portfolio on the same day,
     * updates viewedAt instead of inserting.
     */
    @Transactional
    public void recordView(Long userId, String rawIp) {
        String ipHash = IpHashUtil.hash(rawIp, ipHashSecret);
        LocalDate today = LocalDate.now();

        Optional<RecruiterView> existing = viewRepository.findByUserIdAndIpHashAndViewDate(userId, ipHash, today);

        if (existing.isPresent()) {
            existing.get().setViewedAt(Instant.now());
            viewRepository.save(existing.get());
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException("User not found"));

            RecruiterView view = new RecruiterView();
            view.setUser(user);
            view.setIpHash(ipHash);
            view.setViewDate(today);
            view.setViewedAt(Instant.now());
            viewRepository.save(view);
        }
    }

    public AnalyticsResponse getAnalytics(Long userId) {
        long totalViews = viewRepository.countByUserId(userId);
        long last7Days = viewRepository.countByUserIdAndViewDateAfter(userId, LocalDate.now().minusDays(7));
        long last30Days = viewRepository.countByUserIdAndViewDateAfter(userId, LocalDate.now().minusDays(30));

        List<Object[]> rawData = viewRepository.countByUserIdGroupedByDate(userId, LocalDate.now().minusDays(30));
        List<Map<String, Object>> viewsByDate = new ArrayList<>();
        for (Object[] row : rawData) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("date", row[0].toString());
            entry.put("views", row[1]);
            viewsByDate.add(entry);
        }

        return new AnalyticsResponse(totalViews, last7Days, last30Days, viewsByDate);
    }
}
