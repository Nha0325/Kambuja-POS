package com.kambujaflow.kambujapos.repository;

import com.kambujaflow.kambujapos.entity.Shop;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ShopRepository extends MongoRepository<Shop, String> {
    Optional<Shop> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);
}
