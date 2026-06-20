package com.kambujaflow.kambujapos.dto.response;

import com.kambujaflow.kambujapos.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private String id;
    private String shopId;
    private String userId;
    private NotificationType type;
    private String title;
    private String message;
    private Boolean read;
    private String country;
    private String province;
    private String city;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
