package com.kambujaflow.kambujapos.dto.response;

import com.kambujaflow.kambujapos.enums.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private String id;
    private String shopId;
    private String categoryId;
    private String name;
    private String sku;
    private BigDecimal unitPrice;
    private BigDecimal costPrice;
    private String image;
    private String description;
    private ProductStatus status;
    private String country;
    private String province;
    private String city;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
