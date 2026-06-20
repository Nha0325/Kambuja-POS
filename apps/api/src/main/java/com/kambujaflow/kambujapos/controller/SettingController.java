package com.kambujaflow.kambujapos.controller;

import com.kambujaflow.kambujapos.common.ApiResponse;
import com.kambujaflow.kambujapos.dto.request.SettingRequest;
import com.kambujaflow.kambujapos.dto.response.SettingResponse;
import com.kambujaflow.kambujapos.service.SettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SettingController {
    private final SettingService settingService;

    @PutMapping
    public ApiResponse<SettingResponse> save(@Valid @RequestBody SettingRequest request) {
        return ApiResponse.success("Setting saved", settingService.save(request));
    }

    @GetMapping
    public ApiResponse<List<SettingResponse>> list() {
        return ApiResponse.success("Settings loaded", settingService.list());
    }
}
