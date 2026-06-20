package com.kambujaflow.kambujapos.entity;

import com.kambujaflow.kambujapos.common.BaseDocument;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Document(collection = "receipts")
public class Receipt extends BaseDocument {
    @Id
    private String id;
    private String shopId;
    private String saleId;
    private String paymentId;

    @Indexed(unique = true)
    private String receiptNo;

    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal grandTotal;
    private LocalDateTime issuedAt;
    private String country;
    private String province;
    private String city;
}
