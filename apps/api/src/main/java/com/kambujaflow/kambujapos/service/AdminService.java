package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.dto.request.CashierCreateRequest;
import com.kambujaflow.kambujapos.dto.request.ShopRequest;
import com.kambujaflow.kambujapos.dto.response.DashboardResponse;
import com.kambujaflow.kambujapos.dto.response.ShopResponse;
import com.kambujaflow.kambujapos.dto.response.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final CashierService cashierService;
    private final ReportService reportService;
    private final ShopService shopService;

    public UserResponse createCashier(CashierCreateRequest request) {
        return cashierService.create(request);
    }

    public DashboardResponse dashboard() {
        return reportService.dashboard();
    }

    public ShopResponse getShop() {
        return shopService.getCurrent();
    }

    public ShopResponse updateShop(ShopRequest request) {
        return shopService.updateCurrent(request);
    }
}
