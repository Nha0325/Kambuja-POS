package com.kambujaflow.kambujapos.entity;

import com.kambujaflow.kambujapos.common.BaseDocument;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Document(collection = "inventory")
@CompoundIndex(name = "shop_product_inventory_unique", def = "{'shopId': 1, 'productId': 1}", unique = true)
public class Inventory extends BaseDocument {
    @Id
    private String id;
    private String shopId;
    private String productId;
    private Integer quantity;
    private Integer reorderLevel;
    private String country;
    private String province;
    private String city;
}
