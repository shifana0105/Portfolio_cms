package com.portfoliocms.app.dto.response;

import java.util.List;

public record HealthScoreResponse(
        int score,
        String rating,
        List<String> improvements
) {
    public static HealthScoreResponse of(int score, String rating, List<String> improvements) {
        return new HealthScoreResponse(score, rating, improvements);
    }
}
