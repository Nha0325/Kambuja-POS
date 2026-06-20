package com.kambujaflow.kambujapos.controller;

import com.kambujaflow.kambujapos.common.ApiResponse;
import com.kambujaflow.kambujapos.dto.request.SaleRequest;
import com.kambujaflow.kambujapos.dto.response.SaleResponse;
import com.kambujaflow.kambujapos.service.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
public class SaleController {
    private final SaleService saleService;

    @PostMapping
    public ApiResponse<SaleResponse> create(@Valid @RequestBody SaleRequest request) {
        return ApiResponse.success("Sale completed", saleService.create(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<SaleResponse> get(@PathVariable String id) {
        return ApiResponse.success("Sale loaded", saleService.get(id));
    }

    @GetMapping
    public ApiResponse<List<SaleResponse>> list() {
        return ApiResponse.success("Sales loaded", saleService.list());
    }
}
