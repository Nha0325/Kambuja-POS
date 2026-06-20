package com.kambujaflow.kambujapos.repository;

import com.kambujaflow.kambujapos.entity.StockMovement;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StockMovementRepository extends MongoRepository<StockMovement, String> {
    List<StockMovement> findByShopIdOrderByCreatedAtDesc(String shopId);

    List<StockMovement> findByShopIdAndProductIdOrderByCreatedAtDesc(
            String shopId,
            String productId
    );
}
