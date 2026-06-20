package com.kambujaflow.kambujapos.repository;

import com.kambujaflow.kambujapos.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ProductRepository extends MongoRepository<Product, String> {
    Optional<Product> findByShopIdAndSku(String shopId, String sku);

    boolean existsByShopIdAndSku(String shopId, String sku);

    Page<Product> findByShopIdAndNameContainingIgnoreCaseOrShopIdAndSkuContainingIgnoreCase(
            String shopIdForName,
            String name,
            String shopIdForSku,
            String sku,
            Pageable pageable
    );

    Page<Product> findByShopId(String shopId, Pageable pageable);

    long countByShopId(String shopId);
}
