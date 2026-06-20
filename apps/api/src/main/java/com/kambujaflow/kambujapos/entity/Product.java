package com.kambujaflow.kambujapos.entity;

import com.kambujaflow.kambujapos.common.BaseDocument;
import com.kambujaflow.kambujapos.enums.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Document(collection = "products")
@CompoundIndex(name = "shop_product_sku_unique", def = "{'shopId': 1, 'sku': 1}", unique = true)
public class Product extends BaseDocument {
    @Id
    private String id;
    private String shopId;
    private String categoryId;
    private String name;
    private String sku;
    private BigDecimal unitPrice;
    private BigDecimal costPrice;
    private String image;
    private String description;
    private ProductStatus status;
    private String country;
    private String province;
    private String city;
}
