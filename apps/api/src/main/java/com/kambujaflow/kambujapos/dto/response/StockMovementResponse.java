package com.kambujaflow.kambujapos.dto.response;

import com.kambujaflow.kambujapos.enums.StockMovementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementResponse {
    private String id;
    private String shopId;
    private String productId;
    private StockMovementType movementType;
    private Integer quantity;
    private Integer beforeQuantity;
    private Integer afterQuantity;
    private String referenceType;
    private String referenceId;
    private String note;
    private String createdBy;
    private LocalDateTime createdAt;
}
