package com.kambujaflow.kambujapos.entity;

import com.kambujaflow.kambujapos.common.BaseDocument;
import com.kambujaflow.kambujapos.enums.CodeType;
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
@Document(collection = "product_codes")
@CompoundIndex(name = "shop_product_code_unique", def = "{'shopId': 1, 'code': 1}", unique = true)
public class ProductCode extends BaseDocument {
    @Id
    private String id;
    private String shopId;
    private String productId;
    private String code;
    private CodeType codeType;
    private Boolean primaryCode;
    private Integer status;
}
