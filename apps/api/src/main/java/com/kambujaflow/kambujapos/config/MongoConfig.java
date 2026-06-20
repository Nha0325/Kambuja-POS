package com.kambujaflow.kambujapos.config;

import com.kambujaflow.kambujapos.entity.User;
import com.kambujaflow.kambujapos.enums.RoleName;
import com.kambujaflow.kambujapos.enums.UserStatus;
import com.kambujaflow.kambujapos.repository.UserRepository;
import com.kambujaflow.kambujapos.util.StringUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableMongoAuditing
public class MongoConfig {

    @Bean
    ApplicationRunner seedAdminManager(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.admin-manager.email}") String email,
            @Value("${app.bootstrap.admin-manager.password}") String password,
            @Value("${app.bootstrap.admin-manager.name}") String name
    ) {
        return arguments -> {
            if (userRepository.count() == 0) {
                userRepository.save(User.builder()
                        .roleName(RoleName.ADMIN_MANAGER)
                        .name(name)
                        .email(StringUtil.normalizeEmail(email))
                        .password(passwordEncoder.encode(password))
                        .status(UserStatus.ACTIVE)
                        .build());
            }
        };
    }
}
