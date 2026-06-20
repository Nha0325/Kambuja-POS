package com.kambujaflow.kambujapos.repository;

import com.kambujaflow.kambujapos.entity.ProductCode;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProductCodeRepository extends MongoRepository<ProductCode, String> {
    Optional<ProductCode> findByShopIdAndCode(String shopId, String code);

    List<ProductCode> findByShopIdAndProductId(String shopId, String productId);

    boolean existsByShopIdAndCode(String shopId, String code);
}
