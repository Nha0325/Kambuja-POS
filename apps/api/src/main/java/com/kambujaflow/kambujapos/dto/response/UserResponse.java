package com.kambujaflow.kambujapos.dto.response;

import com.kambujaflow.kambujapos.enums.RoleName;
import com.kambujaflow.kambujapos.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String shopId;
    private String name;
    private String email;
    private String phone;
    private RoleName roleName;
    private UserStatus status;
    private String country;
    private String province;
    private String city;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
}
