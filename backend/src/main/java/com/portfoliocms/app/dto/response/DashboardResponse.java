package com.portfoliocms.app.dto.response;

import java.util.List;
import java.util.Map;

public record DashboardResponse(
        String fullName,
        ProfileResponse profile,
        int portfolioCompletion,
        HealthScoreResponse healthScore,
        long totalViews,
        long recentViews,
        long projectCount,
        long skillCount,
        long experienceCount,
        long educationCount,
        long unreadMessages,
        boolean hasResume,
        List<ActivityItem> recentActivity,
        List<String> improvements
) {
    public record ActivityItem(String type, String description, String timestamp) {}
}
