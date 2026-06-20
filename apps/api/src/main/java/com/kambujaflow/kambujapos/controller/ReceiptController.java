package com.kambujaflow.kambujapos.controller;

import com.kambujaflow.kambujapos.common.ApiResponse;
import com.kambujaflow.kambujapos.dto.response.ReceiptResponse;
import com.kambujaflow.kambujapos.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
public class ReceiptController {
    private final ReceiptService receiptService;

    @PostMapping("/sale/{saleId}")
    public ApiResponse<ReceiptResponse> generate(@PathVariable String saleId) {
        return ApiResponse.success("Receipt generated", receiptService.generate(saleId));
    }

    @GetMapping("/sale/{saleId}")
    public ApiResponse<ReceiptResponse> getBySale(@PathVariable String saleId) {
        return ApiResponse.success("Receipt loaded", receiptService.getBySale(saleId));
    }
}
