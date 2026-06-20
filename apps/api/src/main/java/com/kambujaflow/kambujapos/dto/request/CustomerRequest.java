package com.kambujaflow.kambujapos.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {
    @NotBlank
    @Size(max = 180)
    private String name;

    private String phone;

    @Email
    private String email;

    private String address;
    private String country;
    private String city;
    private String province;
    private String postalCode;
    private Integer status;
}
