package com.kambujaflow.kambujapos.security;

import com.kambujaflow.kambujapos.enums.RoleName;
import com.kambujaflow.kambujapos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("roleGuard")
@RequiredArgsConstructor
public class RoleGuard {
    private final UserRepository userRepository;

    public boolean hasRole(RoleName roleName) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailIgnoreCase(email)
                .map(user -> user.getRoleName() == roleName)
                .orElse(false);
    }
}
