package com.kambujaflow.kambujapos.dto.request;

import com.kambujaflow.kambujapos.enums.CodeType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCodeRequest {
    @NotBlank
    private String productId;

    @NotBlank
    private String code;

    @NotNull
    private CodeType codeType;

    private Boolean primaryCode;
    private Integer status;
}
