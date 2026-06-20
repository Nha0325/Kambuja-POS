package com.kambujaflow.kambujapos.controller;

import com.kambujaflow.kambujapos.common.ApiResponse;
import com.kambujaflow.kambujapos.dto.request.PaymentRequest;
import com.kambujaflow.kambujapos.dto.response.PaymentResponse;
import com.kambujaflow.kambujapos.service.PaymentService;
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
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping
    public ApiResponse<PaymentResponse> pay(@Valid @RequestBody PaymentRequest request) {
        return ApiResponse.success("Payment saved", paymentService.pay(request));
    }

    @GetMapping("/sale/{saleId}")
    public ApiResponse<List<PaymentResponse>> listBySale(@PathVariable String saleId) {
        return ApiResponse.success("Payments loaded", paymentService.listBySale(saleId));
    }
}
