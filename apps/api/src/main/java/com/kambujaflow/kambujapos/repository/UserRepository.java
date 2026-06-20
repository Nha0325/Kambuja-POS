package com.kambujaflow.kambujapos.repository;

import com.kambujaflow.kambujapos.entity.User;
import com.kambujaflow.kambujapos.enums.RoleName;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByRoleName(RoleName roleName);

    List<User> findByShopIdAndRoleName(String shopId, RoleName roleName);

    long countByShopId(String shopId);
}
