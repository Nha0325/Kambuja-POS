package com.kambujaflow.kambujapos.controller;

import com.kambujaflow.kambujapos.common.ApiResponse;
import com.kambujaflow.kambujapos.dto.request.ShopRequest;
import com.kambujaflow.kambujapos.dto.response.ShopResponse;
import com.kambujaflow.kambujapos.service.ShopService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN_MANAGER')")
public class ShopController {
    private final ShopService shopService;

    @PostMapping
    public ApiResponse<ShopResponse> create(@Valid @RequestBody ShopRequest request) {
        return ApiResponse.success("Shop created", shopService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ShopResponse> update(
            @PathVariable String id,
            @Valid @RequestBody ShopRequest request
    ) {
        return ApiResponse.success("Shop updated", shopService.update(id, request));
    }

    @GetMapping("/{id}")
    public ApiResponse<ShopResponse> get(@PathVariable String id) {
        return ApiResponse.success("Shop loaded", shopService.get(id));
    }

    @GetMapping
    public ApiResponse<List<ShopResponse>> list() {
        return ApiResponse.success("Shops loaded", shopService.list());
    }
}
