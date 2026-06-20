package com.kambujaflow.kambujapos.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
public class SaleRequest {
    private String customerId;

    @DecimalMin("0.00")
    private BigDecimal discountAmount;

    @DecimalMin("0.00")
    private BigDecimal taxAmount;

    private String notes;

    @Valid
    @NotEmpty
    private List<SaleItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaleItemRequest {
        @NotBlank
        private String productId;

        @NotNull
        @Min(1)
        private Integer quantity;

        @DecimalMin("0.00")
        private BigDecimal discount;
    }
}
