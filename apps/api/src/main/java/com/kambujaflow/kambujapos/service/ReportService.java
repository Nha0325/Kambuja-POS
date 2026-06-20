package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.dto.response.DashboardResponse;
import com.kambujaflow.kambujapos.dto.response.ReportResponse;
import com.kambujaflow.kambujapos.entity.Sale;
import com.kambujaflow.kambujapos.entity.Shop;
import com.kambujaflow.kambujapos.enums.SaleStatus;
import com.kambujaflow.kambujapos.repository.ProductRepository;
import com.kambujaflow.kambujapos.repository.SaleRepository;
import com.kambujaflow.kambujapos.repository.ShopRepository;
import com.kambujaflow.kambujapos.repository.UserRepository;
import com.kambujaflow.kambujapos.security.ShopScopeGuard;
import com.kambujaflow.kambujapos.util.DateUtil;
import com.kambujaflow.kambujapos.util.MoneyUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final SaleService saleService;
    private final ShopScopeGuard shopScopeGuard;
    private final ShopRepository shopRepository;

    public DashboardResponse dashboard() {
        String shopId = shopScopeGuard.currentShopId();
        List<Sale> completed = saleRepository.findByShopIdAndStatus(shopId, SaleStatus.COMPLETED);
        LocalDate today = LocalDate.now();
        List<Sale> todaySales = saleRepository.findByShopIdAndSaleDateBetweenAndStatus(
                shopId,
                DateUtil.startOfDay(today),
                DateUtil.endOfDay(today),
                SaleStatus.COMPLETED
        );
        return DashboardResponse.builder()
                .totalShops(1)
                .totalUsers(userRepository.countByShopId(shopId))
                .totalProducts(productRepository.countByShopId(shopId))
                .totalSalesCount(completed.size())
                .totalSales(sumGrandTotal(completed))
                .todaySales(sumGrandTotal(todaySales))
                .lowStockProducts(inventoryService.lowStock())
                .recentSales(saleRepository.findTop10ByShopIdOrderBySaleDateDesc(shopId)
                        .stream().map(saleService::toResponse).toList())
                .build();
    }

    public ReportResponse sales(LocalDate from, LocalDate to) {
        String shopId = shopScopeGuard.currentShopId();
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new com.kambujaflow.kambujapos.common.ResourceNotFoundException(
                        "Shop not found"
                ));
        List<Sale> sales = saleRepository.findByShopIdAndSaleDateBetweenAndStatus(
                shopId,
                DateUtil.startOfDay(from),
                DateUtil.endOfDay(to),
                SaleStatus.COMPLETED
        );
        return ReportResponse.builder()
                .shopId(shopId)
                .shopName(shop.getName())
                .country(shop.getCountry())
                .province(shop.getProvince())
                .city(shop.getCity())
                .from(from)
                .to(to)
                .completedSales(sales.size())
                .grossSales(sum(sales, Sale::getSubtotal))
                .discounts(sum(sales, Sale::getDiscountAmount))
                .taxes(sum(sales, Sale::getTaxAmount))
                .netSales(sumGrandTotal(sales))
                .build();
    }

    private BigDecimal sumGrandTotal(List<Sale> sales) {
        return sum(sales, Sale::getGrandTotal);
    }

    private BigDecimal sum(
            List<Sale> sales,
            java.util.function.Function<Sale, BigDecimal> getter
    ) {
        return MoneyUtil.normalize(sales.stream()
                .map(getter)
                .reduce(MoneyUtil.ZERO, BigDecimal::add));
    }
}
