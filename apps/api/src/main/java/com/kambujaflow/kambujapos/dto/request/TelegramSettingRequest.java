package com.kambujaflow.kambujapos.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelegramSettingRequest {
    @NotBlank
    private String chatId;

    private Boolean enabled;
}
