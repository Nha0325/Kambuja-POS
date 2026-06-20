package com.kambujaflow.kambujapos.dto.request;

import com.kambujaflow.kambujapos.enums.ProductStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    @NotBlank
    private String categoryId;

    @NotBlank
    @Size(max = 180)
    private String name;

    @NotBlank
    @Size(max = 100)
    private String sku;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal unitPrice;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal costPrice;

    private String image;
    private String description;
    private ProductStatus status;
}
