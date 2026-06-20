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
@Document(collection = "categories")
@CompoundIndex(name = "shop_category_name_unique", def = "{'shopId': 1, 'name': 1}", unique = true)
public class Category extends BaseDocument {
    @Id
    private String id;
    private String shopId;
    private String name;

    private String description;
    private String image;
    private Integer status;
}
