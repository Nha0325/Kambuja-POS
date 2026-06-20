package com.kambujaflow.kambujapos.repository;

import com.kambujaflow.kambujapos.entity.Sale;
import com.kambujaflow.kambujapos.enums.SaleStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SaleRepository extends MongoRepository<Sale, String> {
    List<Sale> findByShopIdOrderBySaleDateDesc(String shopId);

    List<Sale> findByShopIdAndStatus(String shopId, SaleStatus status);

    List<Sale> findByShopIdAndSaleDateBetweenAndStatus(
            String shopId,
            LocalDateTime start,
            LocalDateTime end,
            SaleStatus status
    );

    List<Sale> findTop10ByShopIdOrderBySaleDateDesc(String shopId);
}
