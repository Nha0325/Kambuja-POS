package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.common.BusinessException;
import com.kambujaflow.kambujapos.common.ResourceNotFoundException;
import com.kambujaflow.kambujapos.dto.request.InventoryRequest;
import com.kambujaflow.kambujapos.dto.response.InventoryResponse;
import com.kambujaflow.kambujapos.entity.Inventory;
import com.kambujaflow.kambujapos.entity.Product;
import com.kambujaflow.kambujapos.repository.InventoryRepository;
import com.kambujaflow.kambujapos.security.ShopScopeGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;
    private final ProductService productService;
    private final ShopScopeGuard shopScopeGuard;
    private final MongoTemplate mongoTemplate;
    private final AuditLogService auditLogService;

    public InventoryResponse save(InventoryRequest request) {
        String shopId = shopScopeGuard.currentShopId();
        Product product = productService.getEntity(request.getProductId());
        Inventory inventory = inventoryRepository.findByShopIdAndProductId(shopId, product.getId())
                .orElseGet(Inventory::new);
        String oldValue = inventory.getId() == null ? null : inventory.toString();
        inventory.setShopId(shopId);
        inventory.setProductId(product.getId());
        inventory.setQuantity(request.getQuantity());
        inventory.setReorderLevel(request.getReorderLevel());
        inventory.setCountry(product.getCountry());
        inventory.setProvince(product.getProvince());
        inventory.setCity(product.getCity());
        Inventory saved = inventoryRepository.save(inventory);
        auditLogService.log("UPSERT", "inventory", saved.getId(), oldValue, saved);
        return toResponse(saved, product.getName());
    }

    public InventoryResponse getByProduct(String productId) {
        Product product = productService.getEntity(productId);
        Inventory inventory = getEntity(product.getId());
        return toResponse(inventory, product.getName());
    }

    public List<InventoryResponse> list() {
        return inventoryRepository.findByShopId(shopScopeGuard.currentShopId()).stream()
                .map(inventory -> toResponse(
                        inventory,
                        productService.getEntity(inventory.getProductId()).getName()
                ))
                .toList();
    }

    public List<InventoryResponse> lowStock() {
        return inventoryRepository.findLowStockByShopId(shopScopeGuard.currentShopId()).stream()
                .map(inventory -> toResponse(
                        inventory,
                        productService.getEntity(inventory.getProductId()).getName()
                ))
                .toList();
    }

    public InventoryChange increase(String productId, int quantity) {
        return adjust(productId, quantity, false);
    }

    public InventoryChange decrease(String productId, int quantity) {
        return adjust(productId, -quantity, true);
    }

    public Inventory getEntity(String productId) {
        return inventoryRepository.findByShopIdAndProductId(
                        shopScopeGuard.currentShopId(),
                        productId
                )
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
    }

    private InventoryChange adjust(String productId, int delta, boolean requireStock) {
        if (delta == 0) {
            throw new BusinessException("Inventory adjustment must not be zero");
        }
        Product product = productService.getEntity(productId);
        Criteria criteria = Criteria.where("shopId").is(product.getShopId())
                .and("productId").is(productId);
        if (requireStock) {
            criteria = criteria.and("quantity").gte(Math.abs(delta));
        }
        Inventory before = inventoryRepository.findByShopIdAndProductId(
                        product.getShopId(),
                        productId
                )
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
        Inventory updated = mongoTemplate.findAndModify(
                Query.query(criteria),
                new Update().inc("quantity", delta),
                FindAndModifyOptions.options().returnNew(true),
                Inventory.class
        );
        if (updated == null) {
            throw new BusinessException("Insufficient stock for product " + product.getName());
        }
        return new InventoryChange(before.getQuantity(), updated.getQuantity(), updated);
    }

    private InventoryResponse toResponse(Inventory inventory, String productName) {
        return InventoryResponse.builder()
                .id(inventory.getId())
                .shopId(inventory.getShopId())
                .productId(inventory.getProductId())
                .productName(productName)
                .quantity(inventory.getQuantity())
                .reorderLevel(inventory.getReorderLevel())
                .lowStock(inventory.getQuantity() <= inventory.getReorderLevel())
                .country(inventory.getCountry())
                .province(inventory.getProvince())
                .city(inventory.getCity())
                .build();
    }

    public record InventoryChange(int beforeQuantity, int afterQuantity, Inventory inventory) {
    }
}
