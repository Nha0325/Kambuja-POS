package com.kambujaflow.kambujapos.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "audit_logs")
public class AuditLog {
    @Id
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

    @CreatedDate
    private LocalDateTime createdAt;
}
