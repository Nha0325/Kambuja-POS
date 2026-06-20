package com.kambujaflow.kambujapos.repository;

import com.kambujaflow.kambujapos.entity.Inventory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends MongoRepository<Inventory, String> {
    Optional<Inventory> findByShopIdAndProductId(String shopId, String productId);

    List<Inventory> findByShopId(String shopId);

    @Query("{'shopId': ?0, $expr: {$lte: ['$quantity', '$reorderLevel']}}")
    List<Inventory> findLowStockByShopId(String shopId);
}
