package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.dto.response.AuditLogResponse;
import com.kambujaflow.kambujapos.entity.AuditLog;
import com.kambujaflow.kambujapos.repository.AuditLogRepository;
import com.kambujaflow.kambujapos.security.ShopScopeGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;
    private final ShopScopeGuard shopScopeGuard;

    public void log(
            String action,
            String collectionName,
            String recordId,
            Object oldValue,
            Object newValue
    ) {
        var user = shopScopeGuard.currentUser();
        auditLogRepository.save(AuditLog.builder()
                .shopId(user.getShopId())
                .userId(user.getId())
                .action(action)
                .collectionName(collectionName)
                .recordId(recordId)
                .oldValue(oldValue == null ? null : oldValue.toString())
                .newValue(newValue == null ? null : newValue.toString())
                .ipAddress(currentIpAddress())
                .country(user.getCountry())
                .province(user.getProvince())
                .city(user.getCity())
                .build());
    }

    public List<AuditLogResponse> listCurrentShop() {
        return auditLogRepository.findTop100ByShopIdOrderByCreatedAtDesc(
                shopScopeGuard.currentShopId()
        ).stream().map(this::toResponse).toList();
    }

    private String currentIpAddress() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            return attributes.getRequest().getRemoteAddr();
        }
        return null;
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .shopId(log.getShopId())
                .userId(log.getUserId())
                .action(log.getAction())
                .collectionName(log.getCollectionName())
                .recordId(log.getRecordId())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .ipAddress(log.getIpAddress())
                .country(log.getCountry())
                .province(log.getProvince())
                .city(log.getCity())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
