package com.kambujaflow.kambujapos.repository;

import com.kambujaflow.kambujapos.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByShopIdOrderByCreatedAtDesc(String shopId);
}
