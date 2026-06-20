package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.common.BusinessException;
import com.kambujaflow.kambujapos.common.ResourceNotFoundException;
import com.kambujaflow.kambujapos.dto.request.ShopRequest;
import com.kambujaflow.kambujapos.dto.response.ShopResponse;
import com.kambujaflow.kambujapos.entity.Shop;
import com.kambujaflow.kambujapos.enums.ShopStatus;
import com.kambujaflow.kambujapos.repository.ShopRepository;
import com.kambujaflow.kambujapos.security.ShopScopeGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShopService {
    private final ShopRepository shopRepository;
    private final ShopScopeGuard shopScopeGuard;

    public ShopResponse create(ShopRequest request) {
        if (shopRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new BusinessException("Shop code already exists");
        }
        return toResponse(shopRepository.save(map(new Shop(), request)));
    }

    public ShopResponse update(String id, ShopRequest request) {
        Shop shop = getEntity(id);
        shopRepository.findByCodeIgnoreCase(request.getCode())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException("Shop code already exists");
                });
        return toResponse(shopRepository.save(map(shop, request)));
    }

    public ShopResponse get(String id) {
        return toResponse(getEntity(id));
    }

    public List<ShopResponse> list() {
        return shopRepository.findAll(Sort.by(Sort.Direction.ASC, "name")).stream()
                .map(this::toResponse)
                .toList();
    }

    public ShopResponse getCurrent() {
        return toResponse(getEntity(shopScopeGuard.currentShopId()));
    }

    public ShopResponse updateCurrent(ShopRequest request) {
        return update(shopScopeGuard.currentShopId(), request);
    }

    public Shop getEntity(String id) {
        return shopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found"));
    }

    private Shop map(Shop shop, ShopRequest request) {
        shop.setCode(request.getCode().trim().toUpperCase());
        shop.setName(request.getName().trim());
        shop.setOwnerUserId(request.getOwnerUserId());
        shop.setPhone(request.getPhone());
        shop.setEmail(request.getEmail());
        shop.setAddress(request.getAddress());
        shop.setCountry(request.getCountry());
        shop.setProvince(request.getProvince());
        shop.setCity(request.getCity());
        shop.setStatus(request.getStatus() == null ? ShopStatus.ACTIVE : request.getStatus());
        return shop;
    }

    private ShopResponse toResponse(Shop shop) {
        return ShopResponse.builder()
                .id(shop.getId())
                .code(shop.getCode())
                .name(shop.getName())
                .ownerUserId(shop.getOwnerUserId())
                .phone(shop.getPhone())
                .email(shop.getEmail())
                .address(shop.getAddress())
                .country(shop.getCountry())
                .province(shop.getProvince())
                .city(shop.getCity())
                .status(shop.getStatus())
                .createdAt(shop.getCreatedAt())
                .updatedAt(shop.getUpdatedAt())
                .build();
    }
}
