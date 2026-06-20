package com.kambujaflow.kambujapos.dto.response;

import com.kambujaflow.kambujapos.enums.CodeType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCodeResponse {
    private String id;
    private String shopId;
    private String productId;
    private String code;
    private CodeType codeType;
    private Boolean primaryCode;
    private Integer status;
}
