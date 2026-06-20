package com.kambujaflow.kambujapos.entity;

import com.kambujaflow.kambujapos.common.BaseDocument;
import com.kambujaflow.kambujapos.enums.PaymentMethod;
import com.kambujaflow.kambujapos.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Document(collection = "payments")
public class Payment extends BaseDocument {
    @Id
    private String id;
    private String shopId;
    private String saleId;
    private PaymentMethod method;
    private BigDecimal amount;
    private BigDecimal paidAmount;
    private BigDecimal changeAmount;
    private PaymentStatus status;
    private String referenceNo;
    private LocalDateTime paidAt;
    private String country;
    private String province;
    private String city;
}
