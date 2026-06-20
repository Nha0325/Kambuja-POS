package com.kambujaflow.kambujapos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private String id;
    private String shopId;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String country;
    private String city;
    private String province;
    private String postalCode;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
