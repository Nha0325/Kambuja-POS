package com.kambujaflow.kambujapos.repository;

import com.kambujaflow.kambujapos.entity.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByShopIdAndSaleIdOrderByPaidAtAsc(String shopId, String saleId);
}
