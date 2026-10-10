package com.portfoliocms.app.dto.response;

import java.util.List;
import java.util.Map;

public record AnalyticsResponse(
        long totalViews,
        long last7DaysViews,
        long last30DaysViews,
        List<Map<String, Object>> viewsByDate
) {}
