package com.kambujaflow.kambujapos.entity;

import com.kambujaflow.kambujapos.common.BaseDocument;
import com.kambujaflow.kambujapos.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Document(collection = "notifications")
public class Notification extends BaseDocument {
    @Id
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
}
