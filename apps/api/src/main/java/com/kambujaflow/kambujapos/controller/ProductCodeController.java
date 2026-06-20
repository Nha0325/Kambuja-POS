package com.kambujaflow.kambujapos.controller;

import com.kambujaflow.kambujapos.common.ApiResponse;
import com.kambujaflow.kambujapos.dto.request.ProductCodeRequest;
import com.kambujaflow.kambujapos.dto.response.ProductCodeResponse;
import com.kambujaflow.kambujapos.dto.response.ProductResponse;
import com.kambujaflow.kambujapos.service.ProductCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/product-codes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
public class ProductCodeController {
    private final ProductCodeService productCodeService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ProductCodeResponse> create(
            @Valid @RequestBody ProductCodeRequest request
    ) {
        return ApiResponse.success("Product code created", productCodeService.create(request));
    }

    @GetMapping("/lookup/{code}")
    public ApiResponse<ProductResponse> lookup(@PathVariable String code) {
        return ApiResponse.success("Product loaded", productCodeService.findProduct(code));
    }

    @GetMapping("/product/{productId}")
    public ApiResponse<List<ProductCodeResponse>> listByProduct(
            @PathVariable String productId
    ) {
        return ApiResponse.success(
                "Product codes loaded",
                productCodeService.listByProduct(productId)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable String id) {
        productCodeService.delete(id);
        return ApiResponse.success("Product code deleted", null);
    }
}
