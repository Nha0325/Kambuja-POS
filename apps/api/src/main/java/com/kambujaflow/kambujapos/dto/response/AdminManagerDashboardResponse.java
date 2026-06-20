package com.kambujaflow.kambujapos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminManagerDashboardResponse {
    private long totalShops;
    private long totalAdmins;
    private long totalCashiers;
    private long totalProducts;
    private long totalSalesCount;
    private BigDecimal totalSales;
}
