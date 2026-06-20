package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.common.BusinessException;
import com.kambujaflow.kambujapos.dto.request.LoginRequest;
import com.kambujaflow.kambujapos.dto.response.LoginResponse;
import com.kambujaflow.kambujapos.dto.response.UserResponse;
import com.kambujaflow.kambujapos.entity.User;
import com.kambujaflow.kambujapos.repository.UserRepository;
import com.kambujaflow.kambujapos.security.JwtService;
import com.kambujaflow.kambujapos.security.UserDetailsServiceImpl;
import com.kambujaflow.kambujapos.util.DateUtil;
import com.kambujaflow.kambujapos.util.StringUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        String email = StringUtil.normalizeEmail(request.getEmail());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BusinessException("User not found"));
        user.setLastLogin(DateUtil.now());
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        UserResponse response = toResponse(user);
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", user.getRoleName().name());
        if (user.getShopId() != null) {
            claims.put("shopId", user.getShopId());
        }

        return LoginResponse.builder()
                .token(jwtService.generateToken(userDetails, claims))
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationMs())
                .user(response)
                .build();
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
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
