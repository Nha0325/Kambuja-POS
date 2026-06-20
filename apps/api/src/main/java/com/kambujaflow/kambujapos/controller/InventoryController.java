package com.kambujaflow.kambujapos.controller;

import com.kambujaflow.kambujapos.common.ApiResponse;
import com.kambujaflow.kambujapos.dto.request.InventoryRequest;
import com.kambujaflow.kambujapos.dto.response.InventoryResponse;
import com.kambujaflow.kambujapos.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
public class InventoryController {
    private final InventoryService inventoryService;

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<InventoryResponse> save(
            @Valid @RequestBody InventoryRequest request
    ) {
        return ApiResponse.success("Inventory saved", inventoryService.save(request));
    }

    @GetMapping
    public ApiResponse<List<InventoryResponse>> list() {
        return ApiResponse.success("Inventory loaded", inventoryService.list());
    }

    @GetMapping("/low-stock")
    public ApiResponse<List<InventoryResponse>> lowStock() {
        return ApiResponse.success("Low stock inventory loaded", inventoryService.lowStock());
    }

    @GetMapping("/product/{productId}")
    public ApiResponse<InventoryResponse> getByProduct(@PathVariable String productId) {
        return ApiResponse.success(
                "Inventory loaded",
                inventoryService.getByProduct(productId)
        );
    }
}
