package com.kambujaflow.kambujapos.dto.request;

import com.kambujaflow.kambujapos.enums.StockMovementType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementRequest {
    @NotBlank
    private String productId;

    @NotNull
    private StockMovementType movementType;

    @NotNull
    @Positive
    private Integer quantity;

    private String referenceType;
    private String referenceId;
    private String note;
}
