package com.kambujaflow.kambujapos.repository;

import com.kambujaflow.kambujapos.entity.Setting;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SettingRepository extends MongoRepository<Setting, String> {
    List<Setting> findByShopIdOrderByKeyAsc(String shopId);

    Optional<Setting> findByShopIdAndKey(String shopId, String key);

    List<Setting> findByShopIdIsNullOrderByKeyAsc();

    Optional<Setting> findByShopIdIsNullAndKey(String key);
}
