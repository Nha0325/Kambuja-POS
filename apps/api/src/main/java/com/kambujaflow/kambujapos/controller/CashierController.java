package com.kambujaflow.kambujapos.controller;

import com.kambujaflow.kambujapos.common.ApiResponse;
import com.kambujaflow.kambujapos.dto.response.UserResponse;
import com.kambujaflow.kambujapos.service.CashierService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cashiers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class CashierController {
    private final CashierService cashierService;

    @GetMapping
    public ApiResponse<List<UserResponse>> list() {
        return ApiResponse.success("Cashiers loaded", cashierService.listCurrentShop());
    }
}
