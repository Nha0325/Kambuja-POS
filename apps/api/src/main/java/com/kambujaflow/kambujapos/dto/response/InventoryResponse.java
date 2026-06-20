package com.kambujaflow.kambujapos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {
    private String id;
    private String shopId;
    private String productId;
    private String productName;
    private Integer quantity;
    private Integer reorderLevel;
    private Boolean lowStock;
    private String country;
    private String province;
    private String city;
}
