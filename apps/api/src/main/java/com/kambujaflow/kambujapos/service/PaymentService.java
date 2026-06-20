package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.common.BusinessException;
import com.kambujaflow.kambujapos.dto.request.PaymentRequest;
import com.kambujaflow.kambujapos.dto.response.PaymentResponse;
import com.kambujaflow.kambujapos.entity.Payment;
import com.kambujaflow.kambujapos.entity.Sale;
import com.kambujaflow.kambujapos.enums.PaymentStatus;
import com.kambujaflow.kambujapos.enums.SaleStatus;
import com.kambujaflow.kambujapos.repository.PaymentRepository;
import com.kambujaflow.kambujapos.security.ShopScopeGuard;
import com.kambujaflow.kambujapos.util.DateUtil;
import com.kambujaflow.kambujapos.util.MoneyUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final SaleService saleService;
    private final ShopScopeGuard shopScopeGuard;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public PaymentResponse pay(PaymentRequest request) {
        Sale sale = saleService.getEntity(request.getSaleId());
        if (sale.getStatus() != SaleStatus.COMPLETED) {
            throw new BusinessException("Only completed sales can be paid");
        }
        BigDecimal alreadyPaid = totalPaid(sale.getId());
        BigDecimal remaining = MoneyUtil.normalize(sale.getGrandTotal().subtract(alreadyPaid));
        if (remaining.signum() <= 0) {
            throw new BusinessException("Sale is already fully paid");
        }

        BigDecimal paidAmount = MoneyUtil.normalize(request.getPaidAmount());
        BigDecimal appliedAmount = paidAmount.min(remaining);
        BigDecimal totalAfterPayment = alreadyPaid.add(appliedAmount);
        PaymentStatus status = totalAfterPayment.compareTo(sale.getGrandTotal()) >= 0
                ? PaymentStatus.PAID
                : PaymentStatus.PARTIAL;
        Payment payment = paymentRepository.save(Payment.builder()
                .shopId(sale.getShopId())
                .saleId(sale.getId())
                .method(request.getMethod())
                .amount(appliedAmount)
                .paidAmount(paidAmount)
                .changeAmount(MoneyUtil.normalize(paidAmount.subtract(appliedAmount)))
                .status(status)
                .referenceNo(request.getReferenceNo())
                .paidAt(DateUtil.now())
                .country(sale.getCountry())
                .province(sale.getProvince())
                .city(sale.getCity())
                .build());
        auditLogService.log("CREATE", "payments", payment.getId(), null, payment);
        notificationService.createPaymentReceived(payment);
        return toResponse(payment);
    }

    public List<PaymentResponse> listBySale(String saleId) {
        Sale sale = saleService.getEntity(saleId);
        return paymentRepository.findByShopIdAndSaleIdOrderByPaidAtAsc(
                sale.getShopId(),
                saleId
        ).stream().map(this::toResponse).toList();
    }

    public BigDecimal totalPaid(String saleId) {
        return MoneyUtil.normalize(paymentRepository.findByShopIdAndSaleIdOrderByPaidAtAsc(
                        shopScopeGuard.currentShopId(),
                        saleId
                ).stream()
                .map(Payment::getAmount)
                .reduce(MoneyUtil.ZERO, BigDecimal::add));
    }

    public Payment getLatestPayment(String saleId) {
        List<Payment> payments = paymentRepository.findByShopIdAndSaleIdOrderByPaidAtAsc(
                shopScopeGuard.currentShopId(),
                saleId
        );
        if (payments.isEmpty()) {
            throw new BusinessException("No payment found for sale");
        }
        return payments.getLast();
    }

    private PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .saleId(payment.getSaleId())
                .method(payment.getMethod())
                .amount(payment.getAmount())
                .paidAmount(payment.getPaidAmount())
                .changeAmount(payment.getChangeAmount())
                .status(payment.getStatus())
                .referenceNo(payment.getReferenceNo())
                .paidAt(payment.getPaidAt())
                .country(payment.getCountry())
                .province(payment.getProvince())
                .city(payment.getCity())
                .build();
    }
}
