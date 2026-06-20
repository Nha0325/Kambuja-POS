package com.kambujaflow.kambujapos.entity;

import com.kambujaflow.kambujapos.enums.StockMovementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "stock_movements")
public class StockMovement {
    @Id
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

    @CreatedDate
    private LocalDateTime createdAt;
}
