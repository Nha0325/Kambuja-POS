package com.kambujaflow.kambujapos.entity;

import com.kambujaflow.kambujapos.common.BaseDocument;
import com.kambujaflow.kambujapos.enums.ShopStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Document(collection = "shops")
public class Shop extends BaseDocument {
    @Id
    private String id;

    @Indexed(unique = true)
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
}
