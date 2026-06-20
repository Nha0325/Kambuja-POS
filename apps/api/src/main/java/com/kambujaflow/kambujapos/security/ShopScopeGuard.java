package com.kambujaflow.kambujapos.security;

import com.kambujaflow.kambujapos.common.BusinessException;
import com.kambujaflow.kambujapos.common.ResourceNotFoundException;
import com.kambujaflow.kambujapos.entity.User;
import com.kambujaflow.kambujapos.enums.RoleName;
import com.kambujaflow.kambujapos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ShopScopeGuard {
    private final UserRepository userRepository;

    public String currentShopId() {
        User user = currentUser();
        if (user.getShopId() == null || user.getShopId().isBlank()) {
            throw new BusinessException("Current user is not assigned to a shop");
        }
        return user.getShopId();
    }

    public User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    public void verify(String shopId) {
        User user = currentUser();
        if (user.getRoleName() == RoleName.ADMIN_MANAGER) {
            return;
        }
        if (!currentShopId().equals(shopId)) {
            throw new BusinessException("Shop access denied");
        }
    }
}
