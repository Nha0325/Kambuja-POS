package com.kambujaflow.kambujapos.controller;

import com.kambujaflow.kambujapos.common.ApiResponse;
import com.kambujaflow.kambujapos.dto.request.CashierCreateRequest;
import com.kambujaflow.kambujapos.dto.request.ShopRequest;
import com.kambujaflow.kambujapos.dto.response.DashboardResponse;
import com.kambujaflow.kambujapos.dto.response.ShopResponse;
import com.kambujaflow.kambujapos.dto.response.UserResponse;
import com.kambujaflow.kambujapos.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;

    @PostMapping("/cashiers")
    public ApiResponse<UserResponse> createCashier(
            @Valid @RequestBody CashierCreateRequest request
    ) {
        return ApiResponse.success("Cashier created", adminService.createCashier(request));
    }

    @GetMapping("/dashboard")
    public ApiResponse<DashboardResponse> dashboard() {
        return ApiResponse.success("Dashboard loaded", adminService.dashboard());
    }

    @GetMapping("/shop")
    public ApiResponse<ShopResponse> shop() {
        return ApiResponse.success("Shop loaded", adminService.getShop());
    }

    @PutMapping("/shop")
    public ApiResponse<ShopResponse> updateShop(@Valid @RequestBody ShopRequest request) {
        return ApiResponse.success("Shop updated", adminService.updateShop(request));
    }
}
