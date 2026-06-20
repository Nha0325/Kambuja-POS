package com.kambujaflow.kambujapos.repository;

import com.kambujaflow.kambujapos.entity.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CustomerRepository extends MongoRepository<Customer, String> {
    List<Customer> findByShopIdOrderByNameAsc(String shopId);
}
