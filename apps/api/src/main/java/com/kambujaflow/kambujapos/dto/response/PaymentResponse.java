package com.kambujaflow.kambujapos.dto.response;

import com.kambujaflow.kambujapos.enums.PaymentMethod;
import com.kambujaflow.kambujapos.enums.PaymentStatus;
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
public class PaymentResponse {
    private String id;
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
