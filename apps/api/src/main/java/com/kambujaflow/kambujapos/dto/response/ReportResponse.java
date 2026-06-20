package com.kambujaflow.kambujapos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private String shopId;
    private String shopName;
    private String country;
    private String province;
    private String city;
    private LocalDate from;
    private LocalDate to;
    private long completedSales;
    private BigDecimal grossSales;
    private BigDecimal discounts;
    private BigDecimal taxes;
    private BigDecimal netSales;
}
