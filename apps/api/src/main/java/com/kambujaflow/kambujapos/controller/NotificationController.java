package com.kambujaflow.kambujapos.controller;

import com.kambujaflow.kambujapos.common.ApiResponse;
import com.kambujaflow.kambujapos.dto.response.NotificationResponse;
import com.kambujaflow.kambujapos.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN_MANAGER', 'ADMIN')")
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ApiResponse<List<NotificationResponse>> list() {
        return ApiResponse.success("Notifications loaded", notificationService.list());
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<NotificationResponse> markRead(@PathVariable String id) {
        return ApiResponse.success("Notification marked as read", notificationService.markRead(id));
    }
}
