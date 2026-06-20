package com.kambujaflow.kambujapos.controller;

import com.kambujaflow.kambujapos.common.ApiResponse;
import com.kambujaflow.kambujapos.dto.request.AdminCreateRequest;
import com.kambujaflow.kambujapos.dto.request.SettingRequest;
import com.kambujaflow.kambujapos.dto.response.AdminManagerDashboardResponse;
import com.kambujaflow.kambujapos.dto.response.AdminResponse;
import com.kambujaflow.kambujapos.dto.response.InventoryResponse;
import com.kambujaflow.kambujapos.dto.response.ReportResponse;
import com.kambujaflow.kambujapos.dto.response.SettingResponse;
import com.kambujaflow.kambujapos.service.AdminManagerService;
import com.kambujaflow.kambujapos.service.SettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin-manager")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN_MANAGER')")
public class AdminManagerController {
    private final AdminManagerService adminManagerService;
    private final SettingService settingService;

    @PostMapping("/admins")
    public ApiResponse<AdminResponse> createAdmin(
            @Valid @RequestBody AdminCreateRequest request
    ) {
        return ApiResponse.success("Admin created", adminManagerService.createAdmin(request));
    }

    @GetMapping("/admins")
    public ApiResponse<List<AdminResponse>> listAdmins() {
        return ApiResponse.success("Admins loaded", adminManagerService.listAdmins());
    }

    @GetMapping("/dashboard")
    public ApiResponse<AdminManagerDashboardResponse> dashboard() {
        return ApiResponse.success("Dashboard loaded", adminManagerService.dashboard());
    }

    @GetMapping("/reports/sales")
    public ApiResponse<List<ReportResponse>> salesReports(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String city
    ) {
        return ApiResponse.success(
                "Platform sales reports loaded",
                adminManagerService.salesReports(from, to, province, city)
        );
    }

    @GetMapping("/reports/stock")
    public ApiResponse<List<InventoryResponse>> stockReports(
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String city
    ) {
        return ApiResponse.success(
                "Platform stock reports loaded",
                adminManagerService.stockReports(province, city)
        );
    }

    @GetMapping("/settings")
    public ApiResponse<List<SettingResponse>> settings() {
        return ApiResponse.success("System settings loaded", settingService.listPlatform());
    }

    @PostMapping("/settings")
    public ApiResponse<SettingResponse> saveSetting(
            @Valid @RequestBody SettingRequest request
    ) {
        return ApiResponse.success("System setting saved", settingService.savePlatform(request));
    }
}
