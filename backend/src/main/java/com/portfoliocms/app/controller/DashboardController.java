package com.portfoliocms.app.controller;

import com.portfoliocms.app.dto.response.AnalyticsResponse;
import com.portfoliocms.app.dto.response.DashboardResponse;
import com.portfoliocms.app.security.UserPrincipal;
import com.portfoliocms.app.service.DashboardService;
import com.portfoliocms.app.service.RecruiterViewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final RecruiterViewService recruiterViewService;

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dashboardService.getDashboard(principal.getId()));
    }

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(recruiterViewService.getAnalytics(principal.getId()));
    }
}
