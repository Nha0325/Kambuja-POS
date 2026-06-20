package com.kambujaflow.kambujapos.repository;

import com.kambujaflow.kambujapos.entity.TelegramSetting;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface TelegramSettingRepository extends MongoRepository<TelegramSetting, String> {
    Optional<TelegramSetting> findByShopId(String shopId);
}
