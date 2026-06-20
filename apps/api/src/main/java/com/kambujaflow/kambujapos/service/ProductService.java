package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.common.BusinessException;
import com.kambujaflow.kambujapos.common.PageResponse;
import com.kambujaflow.kambujapos.common.ResourceNotFoundException;
import com.kambujaflow.kambujapos.dto.request.ProductRequest;
import com.kambujaflow.kambujapos.dto.response.ProductResponse;
import com.kambujaflow.kambujapos.entity.Category;
import com.kambujaflow.kambujapos.entity.Product;
import com.kambujaflow.kambujapos.entity.Shop;
import com.kambujaflow.kambujapos.enums.ProductStatus;
import com.kambujaflow.kambujapos.repository.CategoryRepository;
import com.kambujaflow.kambujapos.repository.ProductRepository;
import com.kambujaflow.kambujapos.repository.ShopRepository;
import com.kambujaflow.kambujapos.security.ShopScopeGuard;
import com.kambujaflow.kambujapos.util.MoneyUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ShopRepository shopRepository;
    private final ShopScopeGuard shopScopeGuard;
    private final AuditLogService auditLogService;

    public ProductResponse create(ProductRequest request) {
        String shopId = shopScopeGuard.currentShopId();
        validateCategory(shopId, request.getCategoryId());
        if (productRepository.existsByShopIdAndSku(shopId, request.getSku())) {
            throw new BusinessException("SKU already exists");
        }
        Product product = productRepository.save(map(new Product(), shopId, request));
        auditLogService.log("CREATE", "products", product.getId(), null, product);
        return toResponse(product);
    }

    public ProductResponse update(String id, ProductRequest request) {
        Product product = getEntity(id);
        validateCategory(product.getShopId(), request.getCategoryId());
        productRepository.findByShopIdAndSku(product.getShopId(), request.getSku())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException("SKU already exists");
                });
        String oldValue = product.toString();
        Product saved = productRepository.save(map(product, product.getShopId(), request));
        auditLogService.log("UPDATE", "products", id, oldValue, saved);
        return toResponse(saved);
    }

    public void delete(String id) {
        Product product = getEntity(id);
        productRepository.delete(product);
        auditLogService.log("DELETE", "products", id, product, null);
    }

    public ProductResponse get(String id) {
        return toResponse(getEntity(id));
    }

    public PageResponse<ProductResponse> list(String search, int page, int size) {
        String shopId = shopScopeGuard.currentShopId();
        PageRequest pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );
        Page<Product> products = search == null || search.isBlank()
                ? productRepository.findByShopId(shopId, pageable)
                : productRepository
                        .findByShopIdAndNameContainingIgnoreCaseOrShopIdAndSkuContainingIgnoreCase(
                                shopId, search, shopId, search, pageable
                        );
        return PageResponse.from(products.map(this::toResponse));
    }

    public Product getEntity(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        shopScopeGuard.verify(product.getShopId());
        return product;
    }

    public ProductResponse toResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .shopId(product.getShopId())
                .categoryId(product.getCategoryId())
                .name(product.getName())
                .sku(product.getSku())
                .unitPrice(product.getUnitPrice())
                .costPrice(product.getCostPrice())
                .image(product.getImage())
                .description(product.getDescription())
                .status(product.getStatus())
                .country(product.getCountry())
                .province(product.getProvince())
                .city(product.getCity())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private Product map(Product product, String shopId, ProductRequest request) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new BusinessException("Shop not found"));
        product.setShopId(shopId);
        product.setCategoryId(request.getCategoryId());
        product.setName(request.getName().trim());
        product.setSku(request.getSku().trim());
        product.setUnitPrice(MoneyUtil.normalize(request.getUnitPrice()));
        product.setCostPrice(MoneyUtil.normalize(request.getCostPrice()));
        product.setImage(request.getImage());
        product.setDescription(request.getDescription());
        product.setStatus(request.getStatus() == null ? ProductStatus.ACTIVE : request.getStatus());
        product.setCountry(shop.getCountry());
        product.setProvince(shop.getProvince());
        product.setCity(shop.getCity());
        return product;
    }

    private void validateCategory(String shopId, String categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessException("Category not found"));
        if (!shopId.equals(category.getShopId())) {
            throw new BusinessException("Category does not belong to current shop");
        }
    }
}
