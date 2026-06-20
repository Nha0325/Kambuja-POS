package com.kambujaflow.kambujapos.dto.request;

import com.kambujaflow.kambujapos.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    @NotBlank
    private String saleId;

    @NotNull
    private PaymentMethod method;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal paidAmount;

    private String referenceNo;
}
