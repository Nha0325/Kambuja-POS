package com.kambujaflow.kambujapos.dto.response;

import com.kambujaflow.kambujapos.entity.Sale;
import com.kambujaflow.kambujapos.enums.SaleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleResponse {
    private String id;
    private String shopId;
    private String saleNo;
    private String customerId;
    private String cashierId;
    private LocalDateTime saleDate;
    private SaleStatus status;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal grandTotal;
    private String notes;
    private List<Sale.SaleItem> items;
    private String country;
    private String province;
    private String city;
}
