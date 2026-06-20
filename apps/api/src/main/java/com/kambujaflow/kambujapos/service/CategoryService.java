package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.common.BusinessException;
import com.kambujaflow.kambujapos.common.ResourceNotFoundException;
import com.kambujaflow.kambujapos.dto.request.CategoryRequest;
import com.kambujaflow.kambujapos.entity.Category;
import com.kambujaflow.kambujapos.repository.CategoryRepository;
import com.kambujaflow.kambujapos.security.ShopScopeGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final ShopScopeGuard shopScopeGuard;
    private final AuditLogService auditLogService;

    public Category create(CategoryRequest request) {
        String shopId = shopScopeGuard.currentShopId();
        if (categoryRepository.existsByShopIdAndNameIgnoreCase(shopId, request.getName())) {
            throw new BusinessException("Category name already exists");
        }
        Category category = categoryRepository.save(Category.builder()
                .shopId(shopId)
                .name(request.getName().trim())
                .description(request.getDescription())
                .image(request.getImage())
                .status(request.getStatus() == null ? 1 : request.getStatus())
                .build());
        auditLogService.log("CREATE", "categories", category.getId(), null, category);
        return category;
    }

    public Category update(String id, CategoryRequest request) {
        Category category = getEntity(id);
        categoryRepository.findByShopIdAndNameIgnoreCase(category.getShopId(), request.getName())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException("Category name already exists");
                });
        String oldValue = category.toString();
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        category.setImage(request.getImage());
        category.setStatus(request.getStatus() == null ? category.getStatus() : request.getStatus());
        Category saved = categoryRepository.save(category);
        auditLogService.log("UPDATE", "categories", id, oldValue, saved);
        return saved;
    }

    public void delete(String id) {
        Category category = getEntity(id);
        categoryRepository.delete(category);
        auditLogService.log("DELETE", "categories", id, category, null);
    }

    public List<Category> list() {
        return categoryRepository.findByShopIdOrderByNameAsc(shopScopeGuard.currentShopId())
                .stream().toList();
    }

    public Category getEntity(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        shopScopeGuard.verify(category.getShopId());
        return category;
    }

}
