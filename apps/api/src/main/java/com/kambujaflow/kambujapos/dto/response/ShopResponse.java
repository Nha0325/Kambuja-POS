package com.kambujaflow.kambujapos.dto.response;

import com.kambujaflow.kambujapos.enums.ShopStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopResponse {
    private String id;
    private String code;
    private String name;
    private String ownerUserId;
    private String phone;
    private String email;
    private String address;
    private String country;
    private String province;
    private String city;
    private ShopStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
