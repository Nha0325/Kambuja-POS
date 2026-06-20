package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.dto.request.StockMovementRequest;
import com.kambujaflow.kambujapos.dto.response.StockMovementResponse;
import com.kambujaflow.kambujapos.entity.StockMovement;
import com.kambujaflow.kambujapos.enums.StockMovementType;
import com.kambujaflow.kambujapos.repository.StockMovementRepository;
import com.kambujaflow.kambujapos.security.ShopScopeGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockMovementService {
    private final InventoryService inventoryService;
    private final StockMovementRepository stockMovementRepository;
    private final ShopScopeGuard shopScopeGuard;
    private final AuditLogService auditLogService;

    public StockMovementResponse create(StockMovementRequest request) {
        boolean stockIn = request.getMovementType() == StockMovementType.STOCK_IN
                || request.getMovementType() == StockMovementType.RETURN_IN
                || request.getMovementType() == StockMovementType.ADJUSTMENT_IN;
        InventoryService.InventoryChange change = stockIn
                ? inventoryService.increase(request.getProductId(), request.getQuantity())
                : inventoryService.decrease(request.getProductId(), request.getQuantity());
        StockMovement movement = saveMovement(
                request.getProductId(),
                request.getMovementType(),
                request.getQuantity(),
                change,
                request.getReferenceType(),
                request.getReferenceId(),
                request.getNote()
        );
        auditLogService.log("CREATE", "stock_movements", movement.getId(), null, movement);
        return toResponse(movement);
    }

    public StockMovement recordSaleOut(
            String productId,
            int quantity,
            String saleId,
            String saleNo
    ) {
        InventoryService.InventoryChange change = inventoryService.decrease(productId, quantity);
        return saveMovement(
                productId,
                StockMovementType.SALE_OUT,
                quantity,
                change,
                "SALE",
                saleId,
                "Sale " + saleNo
        );
    }

    public void restoreSaleStock(String productId, int quantity, String saleNo) {
        InventoryService.InventoryChange change = inventoryService.increase(productId, quantity);
        saveMovement(
                productId,
                StockMovementType.RETURN_IN,
                quantity,
                change,
                "SALE_ROLLBACK",
                null,
                "Rollback " + saleNo
        );
    }

    public List<StockMovementResponse> list() {
        return stockMovementRepository.findByShopIdOrderByCreatedAtDesc(
                shopScopeGuard.currentShopId()
        ).stream().map(this::toResponse).toList();
    }

    public List<StockMovementResponse> listByProduct(String productId) {
        return stockMovementRepository.findByShopIdAndProductIdOrderByCreatedAtDesc(
                shopScopeGuard.currentShopId(),
                productId
        ).stream().map(this::toResponse).toList();
    }

    private StockMovement saveMovement(
            String productId,
            StockMovementType type,
            int quantity,
            InventoryService.InventoryChange change,
            String referenceType,
            String referenceId,
            String note
    ) {
        return stockMovementRepository.save(StockMovement.builder()
                .shopId(shopScopeGuard.currentShopId())
                .productId(productId)
                .movementType(type)
                .quantity(quantity)
                .beforeQuantity(change.beforeQuantity())
                .afterQuantity(change.afterQuantity())
                .referenceType(referenceType)
                .referenceId(referenceId)
                .note(note)
                .createdBy(shopScopeGuard.currentUser().getId())
                .build());
    }

    private StockMovementResponse toResponse(StockMovement movement) {
        return StockMovementResponse.builder()
                .id(movement.getId())
                .shopId(movement.getShopId())
                .productId(movement.getProductId())
                .movementType(movement.getMovementType())
                .quantity(movement.getQuantity())
                .beforeQuantity(movement.getBeforeQuantity())
                .afterQuantity(movement.getAfterQuantity())
                .referenceType(movement.getReferenceType())
                .referenceId(movement.getReferenceId())
                .note(movement.getNote())
                .createdBy(movement.getCreatedBy())
                .createdAt(movement.getCreatedAt())
                .build();
    }
}
