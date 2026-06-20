package com.kambujaflow.kambujapos.entity;

import com.kambujaflow.kambujapos.common.BaseDocument;
import com.kambujaflow.kambujapos.enums.SaleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Document(collection = "sales")
public class Sale extends BaseDocument {
    @Id
    private String id;
    private String shopId;

    @Indexed(unique = true)
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
    private List<SaleItem> items;
    private String country;
    private String province;
    private String city;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaleItem {
        private String productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discount;
        private BigDecimal subtotal;
    }
}
