package com.kambujaflow.kambujapos.dto.request;

import com.kambujaflow.kambujapos.enums.SettingType;
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
public class SettingRequest {
    @NotNull
    private SettingType type;

    @NotBlank
    private String key;

    @NotBlank
    private String value;

    private String description;
}
