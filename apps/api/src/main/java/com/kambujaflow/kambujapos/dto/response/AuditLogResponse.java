package com.kambujaflow.kambujapos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private String id;
    private String shopId;
    private String userId;
    private String action;
    private String collectionName;
    private String recordId;
    private String oldValue;
    private String newValue;
    private String ipAddress;
    private String country;
    private String province;
    private String city;
    private LocalDateTime createdAt;
}
