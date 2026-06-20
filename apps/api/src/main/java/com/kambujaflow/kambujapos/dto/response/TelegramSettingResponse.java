package com.kambujaflow.kambujapos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelegramSettingResponse {
    private String id;
    private String shopId;
    private String chatId;
    private Boolean enabled;
    private Boolean botTokenConfigured;
}
