package com.kambujaflow.kambujapos.repository;

import com.kambujaflow.kambujapos.entity.Category;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.List;

public interface CategoryRepository extends MongoRepository<Category, String> {
    Optional<Category> findByShopIdAndNameIgnoreCase(String shopId, String name);

    boolean existsByShopIdAndNameIgnoreCase(String shopId, String name);

    List<Category> findByShopIdOrderByNameAsc(String shopId);
}
