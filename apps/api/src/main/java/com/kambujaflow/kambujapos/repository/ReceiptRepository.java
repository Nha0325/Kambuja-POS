package com.kambujaflow.kambujapos.repository;

import com.kambujaflow.kambujapos.entity.Receipt;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ReceiptRepository extends MongoRepository<Receipt, String> {
    Optional<Receipt> findByShopIdAndSaleId(String shopId, String saleId);
}
