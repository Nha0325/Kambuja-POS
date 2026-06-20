package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.common.BusinessException;
import com.kambujaflow.kambujapos.dto.request.CashierCreateRequest;
import com.kambujaflow.kambujapos.dto.response.UserResponse;
import com.kambujaflow.kambujapos.entity.Shop;
import com.kambujaflow.kambujapos.entity.User;
import com.kambujaflow.kambujapos.enums.RoleName;
import com.kambujaflow.kambujapos.enums.UserStatus;
import com.kambujaflow.kambujapos.repository.ShopRepository;
import com.kambujaflow.kambujapos.repository.UserRepository;
import com.kambujaflow.kambujapos.security.ShopScopeGuard;
import com.kambujaflow.kambujapos.util.StringUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CashierService {
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final PasswordEncoder passwordEncoder;
    private final ShopScopeGuard shopScopeGuard;

    public UserResponse create(CashierCreateRequest request) {
        String shopId = shopScopeGuard.currentShopId();
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new BusinessException("Shop not found"));
        String email = StringUtil.normalizeEmail(request.getEmail());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException("Email is already registered");
        }
        User user = userRepository.save(User.builder()
                .shopId(shopId)
                .roleName(RoleName.CASHIER)
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(StringUtil.trimToNull(request.getPhone()))
                .status(UserStatus.ACTIVE)
                .country(shop.getCountry())
                .province(shop.getProvince())
                .city(shop.getCity())
                .build());
        return toResponse(user);
    }

    public List<UserResponse> listCurrentShop() {
        return userRepository.findByShopIdAndRoleName(
                        shopScopeGuard.currentShopId(),
                        RoleName.CASHIER
                ).stream()
                .map(this::toResponse)
                .toList();
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .shopId(user.getShopId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .roleName(user.getRoleName())
                .status(user.getStatus())
                .country(user.getCountry())
                .province(user.getProvince())
                .city(user.getCity())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .build();
    }
}
