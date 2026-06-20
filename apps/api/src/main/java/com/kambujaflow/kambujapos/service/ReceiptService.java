package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.common.BusinessException;
import com.kambujaflow.kambujapos.dto.response.ReceiptResponse;
import com.kambujaflow.kambujapos.entity.Payment;
import com.kambujaflow.kambujapos.entity.Receipt;
import com.kambujaflow.kambujapos.entity.Sale;
import com.kambujaflow.kambujapos.repository.ReceiptRepository;
import com.kambujaflow.kambujapos.security.ShopScopeGuard;
import com.kambujaflow.kambujapos.util.DateUtil;
import com.kambujaflow.kambujapos.util.ReceiptNumberUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReceiptService {
    private final ReceiptRepository receiptRepository;
    private final SaleService saleService;
    private final PaymentService paymentService;
    private final ShopScopeGuard shopScopeGuard;

    public ReceiptResponse generate(String saleId) {
        Sale sale = saleService.getEntity(saleId);
        if (paymentService.totalPaid(saleId).compareTo(sale.getGrandTotal()) < 0) {
            throw new BusinessException("Sale is not fully paid");
        }
        Receipt receipt = receiptRepository.findByShopIdAndSaleId(
                        shopScopeGuard.currentShopId(),
                        saleId
                )
                .orElseGet(() -> createReceipt(sale, paymentService.getLatestPayment(saleId)));
        return toResponse(receipt);
    }

    public ReceiptResponse getBySale(String saleId) {
        saleService.getEntity(saleId);
        Receipt receipt = receiptRepository.findByShopIdAndSaleId(
                        shopScopeGuard.currentShopId(),
                        saleId
                )
                .orElseThrow(() -> new BusinessException("Receipt not found"));
        return toResponse(receipt);
    }

    private Receipt createReceipt(Sale sale, Payment payment) {
        return receiptRepository.save(Receipt.builder()
                .shopId(sale.getShopId())
                .saleId(sale.getId())
                .paymentId(payment.getId())
                .receiptNo(ReceiptNumberUtil.generate())
                .subtotal(sale.getSubtotal())
                .discountAmount(sale.getDiscountAmount())
                .taxAmount(sale.getTaxAmount())
                .grandTotal(sale.getGrandTotal())
                .issuedAt(DateUtil.now())
                .country(sale.getCountry())
                .province(sale.getProvince())
                .city(sale.getCity())
                .build());
    }

    private ReceiptResponse toResponse(Receipt receipt) {
        return ReceiptResponse.builder()
                .id(receipt.getId())
                .receiptNo(receipt.getReceiptNo())
                .saleId(receipt.getSaleId())
                .paymentId(receipt.getPaymentId())
                .subtotal(receipt.getSubtotal())
                .discountAmount(receipt.getDiscountAmount())
                .taxAmount(receipt.getTaxAmount())
                .grandTotal(receipt.getGrandTotal())
                .issuedAt(receipt.getIssuedAt())
                .country(receipt.getCountry())
                .province(receipt.getProvince())
                .city(receipt.getCity())
                .build();
    }
}
