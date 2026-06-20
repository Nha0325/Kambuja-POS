package com.kambujaflow.kambujapos.controller;

import com.kambujaflow.kambujapos.common.ApiResponse;
import com.kambujaflow.kambujapos.dto.request.TelegramSettingRequest;
import com.kambujaflow.kambujapos.dto.response.TelegramSettingResponse;
import com.kambujaflow.kambujapos.service.TelegramNotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/telegram")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class TelegramController {
    private final TelegramNotificationService telegramNotificationService;

    @PutMapping("/settings")
    public ApiResponse<TelegramSettingResponse> saveSetting(
            @Valid @RequestBody TelegramSettingRequest request
    ) {
        return ApiResponse.success(
                "Telegram setting saved",
                telegramNotificationService.saveSetting(request)
        );
    }

    @GetMapping("/settings")
    public ApiResponse<TelegramSettingResponse> getSetting() {
        return ApiResponse.success(
                "Telegram setting loaded",
                telegramNotificationService.getSetting()
        );
    }

    @PostMapping("/test")
    public ApiResponse<Void> sendTest(
            @RequestParam String chatId,
            @RequestParam String message
    ) {
        telegramNotificationService.sendMessage(chatId, message);
        return ApiResponse.success("Telegram message sent", null);
    }
}
