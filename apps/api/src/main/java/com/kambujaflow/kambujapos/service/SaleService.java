package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.common.BusinessException;
import com.kambujaflow.kambujapos.common.ResourceNotFoundException;
import com.kambujaflow.kambujapos.dto.request.SaleRequest;
import com.kambujaflow.kambujapos.dto.response.SaleResponse;
import com.kambujaflow.kambujapos.entity.Product;
import com.kambujaflow.kambujapos.entity.Sale;
import com.kambujaflow.kambujapos.entity.Shop;
import com.kambujaflow.kambujapos.enums.SaleStatus;
import com.kambujaflow.kambujapos.repository.SaleRepository;
import com.kambujaflow.kambujapos.repository.ShopRepository;
import com.kambujaflow.kambujapos.security.ShopScopeGuard;
import com.kambujaflow.kambujapos.util.DateUtil;
import com.kambujaflow.kambujapos.util.MoneyUtil;
import com.kambujaflow.kambujapos.util.SaleNumberUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleService {
    private final SaleRepository saleRepository;
    private final ProductService productService;
    private final CustomerService customerService;
    private final InventoryService inventoryService;
    private final StockMovementService stockMovementService;
    private final ShopScopeGuard shopScopeGuard;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final ShopRepository shopRepository;

    public SaleResponse create(SaleRequest request) {
        if (request.getCustomerId() != null && !request.getCustomerId().isBlank()) {
            customerService.getEntity(request.getCustomerId());
        }
        List<Sale.SaleItem> items = request.getItems().stream()
                .map(this::buildItem)
                .toList();
        for (Sale.SaleItem item : items) {
            if (inventoryService.getEntity(item.getProductId()).getQuantity() < item.getQuantity()) {
                throw new BusinessException("Insufficient stock for product " + item.getProductName());
            }
        }

        BigDecimal subtotal = items.stream()
                .map(Sale.SaleItem::getSubtotal)
                .reduce(MoneyUtil.ZERO, BigDecimal::add);
        BigDecimal discount = MoneyUtil.normalize(request.getDiscountAmount());
        BigDecimal tax = MoneyUtil.normalize(request.getTaxAmount());
        BigDecimal grandTotal = MoneyUtil.normalize(subtotal.subtract(discount).add(tax));
        if (grandTotal.signum() < 0) {
            throw new BusinessException("Grand total must not be negative");
        }

        String shopId = shopScopeGuard.currentShopId();
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new BusinessException("Shop not found"));
        Sale sale = saleRepository.save(Sale.builder()
                .shopId(shopId)
                .saleNo(SaleNumberUtil.generate())
                .customerId(request.getCustomerId())
                .cashierId(shopScopeGuard.currentUser().getId())
                .saleDate(DateUtil.now())
                .status(SaleStatus.DRAFT)
                .subtotal(MoneyUtil.normalize(subtotal))
                .discountAmount(discount)
                .taxAmount(tax)
                .grandTotal(grandTotal)
                .notes(request.getNotes())
                .items(items)
                .country(shop.getCountry())
                .province(shop.getProvince())
                .city(shop.getCity())
                .build());

        List<Sale.SaleItem> adjusted = new ArrayList<>();
        String saleNo = sale.getSaleNo();
        try {
            for (Sale.SaleItem item : items) {
                stockMovementService.recordSaleOut(
                        item.getProductId(),
                        item.getQuantity(),
                        sale.getId(),
                        sale.getSaleNo()
                );
                adjusted.add(item);
            }
            sale.setStatus(SaleStatus.COMPLETED);
            sale = saleRepository.save(sale);
        } catch (RuntimeException exception) {
            adjusted.forEach(item -> stockMovementService.restoreSaleStock(
                    item.getProductId(),
                    item.getQuantity(),
                    saleNo
            ));
            saleRepository.deleteById(sale.getId());
            throw exception;
        }

        auditLogService.log("CREATE", "sales", sale.getId(), null, sale);
        notificationService.createSaleCompleted(sale);
        return toResponse(sale);
    }

    public SaleResponse get(String id) {
        return toResponse(getEntity(id));
    }

    public List<SaleResponse> list() {
        return saleRepository.findByShopIdOrderBySaleDateDesc(
                shopScopeGuard.currentShopId()
        ).stream().map(this::toResponse).toList();
    }

    public Sale getEntity(String id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));
        shopScopeGuard.verify(sale.getShopId());
        return sale;
    }

    public SaleResponse toResponse(Sale sale) {
        return SaleResponse.builder()
                .id(sale.getId())
                .shopId(sale.getShopId())
                .saleNo(sale.getSaleNo())
                .customerId(sale.getCustomerId())
                .cashierId(sale.getCashierId())
                .saleDate(sale.getSaleDate())
                .status(sale.getStatus())
                .subtotal(sale.getSubtotal())
                .discountAmount(sale.getDiscountAmount())
                .taxAmount(sale.getTaxAmount())
                .grandTotal(sale.getGrandTotal())
                .notes(sale.getNotes())
                .items(sale.getItems())
                .country(sale.getCountry())
                .province(sale.getProvince())
                .city(sale.getCity())
                .build();
    }

    private Sale.SaleItem buildItem(SaleRequest.SaleItemRequest request) {
        Product product = productService.getEntity(request.getProductId());
        BigDecimal discount = MoneyUtil.normalize(request.getDiscount());
        BigDecimal gross = MoneyUtil.multiply(product.getUnitPrice(), request.getQuantity());
        if (discount.compareTo(gross) > 0) {
            throw new BusinessException("Item discount exceeds item total");
        }
        return Sale.SaleItem.builder()
                .productId(product.getId())
                .productName(product.getName())
                .quantity(request.getQuantity())
                .unitPrice(MoneyUtil.normalize(product.getUnitPrice()))
                .discount(discount)
                .subtotal(MoneyUtil.normalize(gross.subtract(discount)))
                .build();
    }
}
