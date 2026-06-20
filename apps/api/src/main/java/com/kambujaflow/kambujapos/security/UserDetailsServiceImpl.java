package com.kambujaflow.kambujapos.security;

import com.kambujaflow.kambujapos.entity.User;
import com.kambujaflow.kambujapos.enums.UserStatus;
import com.kambujaflow.kambujapos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .disabled(user.getStatus() != UserStatus.ACTIVE)
                .authorities(List.of(
                        new SimpleGrantedAuthority("ROLE_" + user.getRoleName().name())
                ))
                .build();
    }
}
