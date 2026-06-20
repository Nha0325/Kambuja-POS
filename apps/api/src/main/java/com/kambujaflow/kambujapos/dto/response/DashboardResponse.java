package com.kambujaflow.kambujapos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalShops;
    private long totalUsers;
    private long totalProducts;
    private long totalSalesCount;
    private BigDecimal totalSales;
    private BigDecimal todaySales;
    private List<InventoryResponse> lowStockProducts;
    private List<SaleResponse> recentSales;
}
