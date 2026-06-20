package com.kambujaflow.kambujapos.entity;

import com.kambujaflow.kambujapos.common.BaseDocument;
import com.kambujaflow.kambujapos.enums.RoleName;
import com.kambujaflow.kambujapos.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Document(collection = "users")
public class User extends BaseDocument {
    @Id
    private String id;
    private String shopId;
    private RoleName roleName;
    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;
    private String phone;
    private UserStatus status;
    private String country;
    private String province;
    private String city;
    private LocalDateTime lastLogin;
}
