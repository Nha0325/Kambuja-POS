package com.kambujaflow.kambujapos.controller;

import com.kambujaflow.kambujapos.common.ApiResponse;
import com.kambujaflow.kambujapos.dto.request.StockMovementRequest;
import com.kambujaflow.kambujapos.dto.response.StockMovementResponse;
import com.kambujaflow.kambujapos.service.StockMovementService;
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
@RequestMapping("/api/stock-movements")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class StockMovementController {
    private final StockMovementService stockMovementService;

    @PostMapping
    public ApiResponse<StockMovementResponse> create(
            @Valid @RequestBody StockMovementRequest request
    ) {
        return ApiResponse.success(
                "Stock movement created",
                stockMovementService.create(request)
        );
    }

    @GetMapping
    public ApiResponse<List<StockMovementResponse>> list() {
        return ApiResponse.success("Stock movements loaded", stockMovementService.list());
    }

    @GetMapping("/product/{productId}")
    public ApiResponse<List<StockMovementResponse>> listByProduct(
            @PathVariable String productId
    ) {
        return ApiResponse.success(
                "Stock movements loaded",
                stockMovementService.listByProduct(productId)
        );
    }
}
