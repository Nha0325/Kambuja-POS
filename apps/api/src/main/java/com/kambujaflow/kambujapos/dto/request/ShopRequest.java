package com.kambujaflow.kambujapos.dto.request;

import com.kambujaflow.kambujapos.enums.ShopStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String name;

    private String ownerUserId;
    private String phone;

    @Email
    private String email;

    private String address;
    private String country;
    private String province;
    private String city;
    private ShopStatus status;
}
