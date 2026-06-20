package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.common.BusinessException;
import com.kambujaflow.kambujapos.dto.request.AdminCreateRequest;
import com.kambujaflow.kambujapos.dto.response.AdminManagerDashboardResponse;
import com.kambujaflow.kambujapos.dto.response.AdminResponse;
import com.kambujaflow.kambujapos.dto.response.InventoryResponse;
import com.kambujaflow.kambujapos.dto.response.ReportResponse;
import com.kambujaflow.kambujapos.entity.Inventory;
import com.kambujaflow.kambujapos.entity.Product;
import com.kambujaflow.kambujapos.entity.Sale;
import com.kambujaflow.kambujapos.entity.Shop;
import com.kambujaflow.kambujapos.entity.User;
import com.kambujaflow.kambujapos.enums.RoleName;
import com.kambujaflow.kambujapos.enums.SaleStatus;
import com.kambujaflow.kambujapos.enums.UserStatus;
import com.kambujaflow.kambujapos.repository.InventoryRepository;
import com.kambujaflow.kambujapos.repository.ProductRepository;
import com.kambujaflow.kambujapos.repository.SaleRepository;
import com.kambujaflow.kambujapos.repository.ShopRepository;
import com.kambujaflow.kambujapos.repository.UserRepository;
import com.kambujaflow.kambujapos.util.DateUtil;
import com.kambujaflow.kambujapos.util.MoneyUtil;
import com.kambujaflow.kambujapos.util.StringUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminManagerService {
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final SaleRepository saleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminResponse createAdmin(AdminCreateRequest request) {
        Shop shop = shopRepository.findById(request.getShopId())
                .orElseThrow(() -> new BusinessException("Shop not found"));
        String email = StringUtil.normalizeEmail(request.getEmail());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException("Email is already registered");
        }
        User user = userRepository.save(User.builder()
                .shopId(request.getShopId())
                .roleName(RoleName.ADMIN)
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(StringUtil.trimToNull(request.getPhone()))
                .status(UserStatus.ACTIVE)
                .country(shop.getCountry())
                .province(shop.getProvince())
                .city(shop.getCity())
                .build());
        return toResponse(user);
    }

    public List<AdminResponse> listAdmins() {
        return userRepository.findByRoleName(RoleName.ADMIN).stream()
                .map(this::toResponse)
                .toList();
    }

    public AdminManagerDashboardResponse dashboard() {
        var completedSales = saleRepository.findAll().stream()
                .filter(sale -> sale.getStatus() == SaleStatus.COMPLETED)
                .toList();
        BigDecimal totalSales = completedSales.stream()
                .map(sale -> sale.getGrandTotal())
                .reduce(MoneyUtil.ZERO, BigDecimal::add);
        return AdminManagerDashboardResponse.builder()
                .totalShops(shopRepository.count())
                .totalAdmins(userRepository.findByRoleName(RoleName.ADMIN).size())
                .totalCashiers(userRepository.findByRoleName(RoleName.CASHIER).size())
                .totalProducts(productRepository.count())
                .totalSalesCount(completedSales.size())
                .totalSales(MoneyUtil.normalize(totalSales))
                .build();
    }

    public List<ReportResponse> salesReports(
            LocalDate from,
            LocalDate to,
            String province,
            String city
    ) {
        Map<String, Shop> shops = shopRepository.findAll().stream()
                .filter(shop -> matchesLocation(shop.getProvince(), province))
                .filter(shop -> matchesLocation(shop.getCity(), city))
                .collect(Collectors.toMap(Shop::getId, Function.identity()));
        return saleRepository.findAll().stream()
                .filter(sale -> sale.getStatus() == SaleStatus.COMPLETED)
                .filter(sale -> shops.containsKey(sale.getShopId()))
                .filter(sale -> !sale.getSaleDate().isBefore(DateUtil.startOfDay(from)))
                .filter(sale -> !sale.getSaleDate().isAfter(DateUtil.endOfDay(to)))
                .collect(Collectors.groupingBy(Sale::getShopId))
                .entrySet().stream()
                .map(entry -> toReport(
                        shops.get(entry.getKey()),
                        entry.getValue(),
                        from,
                        to
                ))
                .sorted(Comparator.comparing(ReportResponse::getShopName))
                .toList();
    }

    public List<InventoryResponse> stockReports(String province, String city) {
        Map<String, Product> products = productRepository.findAll().stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));
        return inventoryRepository.findAll().stream()
                .filter(inventory -> matchesLocation(inventory.getProvince(), province))
                .filter(inventory -> matchesLocation(inventory.getCity(), city))
                .map(inventory -> toInventoryResponse(inventory, products.get(inventory.getProductId())))
                .toList();
    }

    private AdminResponse toResponse(User user) {
        return AdminResponse.builder()
                .id(user.getId())
                .shopId(user.getShopId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .status(user.getStatus())
                .country(user.getCountry())
                .province(user.getProvince())
                .city(user.getCity())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .build();
    }

    private ReportResponse toReport(
            Shop shop,
            List<Sale> sales,
            LocalDate from,
            LocalDate to
    ) {
        return ReportResponse.builder()
                .shopId(shop.getId())
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
                .netSales(sum(sales, Sale::getGrandTotal))
                .build();
    }

    private InventoryResponse toInventoryResponse(Inventory inventory, Product product) {
        return InventoryResponse.builder()
                .id(inventory.getId())
                .shopId(inventory.getShopId())
                .productId(inventory.getProductId())
                .productName(product == null ? null : product.getName())
                .quantity(inventory.getQuantity())
                .reorderLevel(inventory.getReorderLevel())
                .lowStock(inventory.getQuantity() <= inventory.getReorderLevel())
                .country(inventory.getCountry())
                .province(inventory.getProvince())
                .city(inventory.getCity())
                .build();
    }

    private BigDecimal sum(List<Sale> sales, Function<Sale, BigDecimal> getter) {
        return MoneyUtil.normalize(sales.stream()
                .map(getter)
                .reduce(MoneyUtil.ZERO, BigDecimal::add));
    }

    private boolean matchesLocation(String value, String filter) {
        return filter == null
                || filter.isBlank()
                || value != null && value.equalsIgnoreCase(filter.trim());
    }
}
