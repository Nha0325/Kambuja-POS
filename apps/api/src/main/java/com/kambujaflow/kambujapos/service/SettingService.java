package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.dto.request.SettingRequest;
import com.kambujaflow.kambujapos.dto.response.SettingResponse;
import com.kambujaflow.kambujapos.entity.Setting;
import com.kambujaflow.kambujapos.repository.SettingRepository;
import com.kambujaflow.kambujapos.security.ShopScopeGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SettingService {
    private final SettingRepository settingRepository;
    private final ShopScopeGuard shopScopeGuard;
    private final AuditLogService auditLogService;

    public SettingResponse save(SettingRequest request) {
        String shopId = shopScopeGuard.currentShopId();
        Setting setting = settingRepository.findByShopIdAndKey(shopId, request.getKey())
                .orElseGet(Setting::new);
        String oldValue = setting.getId() == null ? null : setting.toString();
        setting.setShopId(shopId);
        setting.setType(request.getType());
        setting.setKey(request.getKey().trim());
        setting.setValue(request.getValue());
        setting.setDescription(request.getDescription());
        Setting saved = settingRepository.save(setting);
        auditLogService.log("UPSERT", "settings", saved.getId(), oldValue, saved);
        return toResponse(saved);
    }

    public List<SettingResponse> list() {
        return settingRepository.findByShopIdOrderByKeyAsc(shopScopeGuard.currentShopId())
                .stream().map(this::toResponse).toList();
    }

    public SettingResponse savePlatform(SettingRequest request) {
        Setting setting = settingRepository.findByShopIdIsNullAndKey(request.getKey())
                .orElseGet(Setting::new);
        setting.setShopId(null);
        setting.setType(request.getType());
        setting.setKey(request.getKey().trim());
        setting.setValue(request.getValue());
        setting.setDescription(request.getDescription());
        return toResponse(settingRepository.save(setting));
    }

    public List<SettingResponse> listPlatform() {
        return settingRepository.findByShopIdIsNullOrderByKeyAsc()
                .stream().map(this::toResponse).toList();
    }

    private SettingResponse toResponse(Setting setting) {
        return SettingResponse.builder()
                .id(setting.getId())
                .shopId(setting.getShopId())
                .type(setting.getType())
                .key(setting.getKey())
                .value(setting.getValue())
                .description(setting.getDescription())
                .createdAt(setting.getCreatedAt())
                .updatedAt(setting.getUpdatedAt())
                .build();
    }
}
