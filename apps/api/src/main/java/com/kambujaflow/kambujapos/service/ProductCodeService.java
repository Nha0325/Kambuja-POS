package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.common.BusinessException;
import com.kambujaflow.kambujapos.common.ResourceNotFoundException;
import com.kambujaflow.kambujapos.dto.request.ProductCodeRequest;
import com.kambujaflow.kambujapos.dto.response.ProductCodeResponse;
import com.kambujaflow.kambujapos.dto.response.ProductResponse;
import com.kambujaflow.kambujapos.entity.Product;
import com.kambujaflow.kambujapos.entity.ProductCode;
import com.kambujaflow.kambujapos.repository.ProductCodeRepository;
import com.kambujaflow.kambujapos.security.ShopScopeGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductCodeService {
    private final ProductCodeRepository productCodeRepository;
    private final ProductService productService;
    private final ShopScopeGuard shopScopeGuard;
    private final AuditLogService auditLogService;

    public ProductCodeResponse create(ProductCodeRequest request) {
        String shopId = shopScopeGuard.currentShopId();
        Product product = productService.getEntity(request.getProductId());
        if (!shopId.equals(product.getShopId())) {
            throw new BusinessException("Product does not belong to current shop");
        }
        if (productCodeRepository.existsByShopIdAndCode(shopId, request.getCode())) {
            throw new BusinessException("Product code already exists");
        }
        ProductCode code = productCodeRepository.save(ProductCode.builder()
                .shopId(shopId)
                .productId(product.getId())
                .code(request.getCode().trim())
                .codeType(request.getCodeType())
                .primaryCode(Boolean.TRUE.equals(request.getPrimaryCode()))
                .status(request.getStatus() == null ? 1 : request.getStatus())
                .build());
        auditLogService.log("CREATE", "product_codes", code.getId(), null, code);
        return toResponse(code);
    }

    public ProductResponse findProduct(String code) {
        ProductCode productCode = productCodeRepository
                .findByShopIdAndCode(shopScopeGuard.currentShopId(), code)
                .orElseThrow(() -> new ResourceNotFoundException("Product code not found"));
        return productService.get(productCode.getProductId());
    }

    public List<ProductCodeResponse> listByProduct(String productId) {
        productService.getEntity(productId);
        return productCodeRepository.findByShopIdAndProductId(
                        shopScopeGuard.currentShopId(),
                        productId
                ).stream().map(this::toResponse).toList();
    }

    public void delete(String id) {
        ProductCode code = productCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product code not found"));
        shopScopeGuard.verify(code.getShopId());
        productCodeRepository.delete(code);
        auditLogService.log("DELETE", "product_codes", id, code, null);
    }

    private ProductCodeResponse toResponse(ProductCode code) {
        return ProductCodeResponse.builder()
                .id(code.getId())
                .shopId(code.getShopId())
                .productId(code.getProductId())
                .code(code.getCode())
                .codeType(code.getCodeType())
                .primaryCode(code.getPrimaryCode())
                .status(code.getStatus())
                .build();
    }
}
