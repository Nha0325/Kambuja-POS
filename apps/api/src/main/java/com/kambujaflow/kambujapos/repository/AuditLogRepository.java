package com.kambujaflow.kambujapos.repository;

import com.kambujaflow.kambujapos.entity.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
    List<AuditLog> findTop100ByShopIdOrderByCreatedAtDesc(String shopId);
}
