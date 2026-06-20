package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.common.ResourceNotFoundException;
import com.kambujaflow.kambujapos.dto.response.NotificationResponse;
import com.kambujaflow.kambujapos.entity.Notification;
import com.kambujaflow.kambujapos.entity.Payment;
import com.kambujaflow.kambujapos.entity.Sale;
import com.kambujaflow.kambujapos.entity.Shop;
import com.kambujaflow.kambujapos.enums.NotificationType;
import com.kambujaflow.kambujapos.enums.RoleName;
import com.kambujaflow.kambujapos.repository.NotificationRepository;
import com.kambujaflow.kambujapos.repository.ShopRepository;
import com.kambujaflow.kambujapos.security.ShopScopeGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final ShopRepository shopRepository;
    private final ShopScopeGuard shopScopeGuard;

    public void createSaleCompleted(Sale sale) {
        save(
                sale.getShopId(),
                NotificationType.SALE_COMPLETED,
                "Sale completed",
                sale.getSaleNo() + " total " + sale.getGrandTotal()
        );
    }

    public void createPaymentReceived(Payment payment) {
        save(
                payment.getShopId(),
                NotificationType.PAYMENT_RECEIVED,
                "Payment received",
                "Payment " + payment.getPaidAmount() + " for sale " + payment.getSaleId()
        );
    }

    public Notification createTelegram(String title, String message) {
        return save(
                shopScopeGuard.currentShopId(),
                NotificationType.TELEGRAM,
                title,
                message
        );
    }

    public List<NotificationResponse> list() {
        var user = shopScopeGuard.currentUser();
        List<Notification> notifications = user.getRoleName() == RoleName.ADMIN_MANAGER
                ? notificationRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                : notificationRepository.findByShopIdOrderByCreatedAtDesc(
                        shopScopeGuard.currentShopId()
                );
        return notifications.stream().map(this::toResponse).toList();
    }

    public NotificationResponse markRead(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        shopScopeGuard.verify(notification.getShopId());
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    private Notification save(
            String shopId,
            NotificationType type,
            String title,
            String message
    ) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found"));
        return notificationRepository.save(Notification.builder()
                .shopId(shopId)
                .type(type)
                .title(title)
                .message(message)
                .read(false)
                .country(shop.getCountry())
                .province(shop.getProvince())
                .city(shop.getCity())
                .build());
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .shopId(notification.getShopId())
                .userId(notification.getUserId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(notification.getRead())
                .country(notification.getCountry())
                .province(notification.getProvince())
                .city(notification.getCity())
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .build();
    }
}
