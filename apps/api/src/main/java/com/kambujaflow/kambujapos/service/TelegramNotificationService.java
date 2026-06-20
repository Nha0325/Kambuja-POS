package com.kambujaflow.kambujapos.service;

import com.kambujaflow.kambujapos.common.BusinessException;
import com.kambujaflow.kambujapos.dto.request.TelegramSettingRequest;
import com.kambujaflow.kambujapos.dto.response.TelegramSettingResponse;
import com.kambujaflow.kambujapos.entity.TelegramSetting;
import com.kambujaflow.kambujapos.repository.TelegramSettingRepository;
import com.kambujaflow.kambujapos.security.ShopScopeGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class TelegramNotificationService {
    private static final String SEND_MESSAGE_URL =
            "https://api.telegram.org/bot{token}/sendMessage";

    private final TelegramSettingRepository telegramSettingRepository;
    private final ShopScopeGuard shopScopeGuard;
    private final NotificationService notificationService;
    private final RestTemplate telegramRestTemplate;

    @Value("${telegram.bot.token}")
    private String botToken;

    public TelegramSettingResponse saveSetting(TelegramSettingRequest request) {
        String shopId = shopScopeGuard.currentShopId();
        TelegramSetting setting = telegramSettingRepository.findByShopId(shopId)
                .orElseGet(TelegramSetting::new);
        setting.setShopId(shopId);
        setting.setBotToken(null);
        setting.setChatId(request.getChatId().trim());
        setting.setEnabled(request.getEnabled() == null || request.getEnabled());
        TelegramSetting saved = telegramSettingRepository.save(setting);
        return masked(saved);
    }

    public TelegramSettingResponse getSetting() {
        TelegramSetting setting = telegramSettingRepository
                .findByShopId(shopScopeGuard.currentShopId())
                .orElseThrow(() -> new BusinessException("Telegram setting not found"));
        return masked(setting);
    }

    public void send(String message) {
        TelegramSetting setting = telegramSettingRepository
                .findByShopId(shopScopeGuard.currentShopId())
                .orElseThrow(() -> new BusinessException("Telegram setting not found"));
        if (!Boolean.TRUE.equals(setting.getEnabled())) {
            throw new BusinessException("Telegram notifications are disabled");
        }
        sendMessage(setting.getChatId(), message);
        notificationService.createTelegram("Telegram sent", message);
    }

    public void sendMessage(String chatId, String message) {
        if (botToken == null
                || botToken.isBlank()
                || "<TELEGRAM_BOT_TOKEN>".equals(botToken.trim())) {
            throw new BusinessException("Telegram bot token is not configured");
        }
        if (chatId == null || chatId.isBlank()) {
            throw new BusinessException("Telegram chat ID is required");
        }
        if (message == null || message.isBlank()) {
            throw new BusinessException("Telegram message is required");
        }

        try {
            telegramRestTemplate.postForEntity(
                    SEND_MESSAGE_URL,
                    Map.of(
                            "chat_id", chatId.trim(),
                            "text", message.trim()
                    ),
                    Void.class,
                    botToken
            );
        } catch (RestClientException exception) {
            throw new BusinessException("Telegram message could not be sent");
        }
    }

    public void sendLowStockAlert(
            String chatId,
            String shopName,
            String productName,
            int currentQty,
            int lowStockQty
    ) {
        sendMessage(
                chatId,
                """
                Kambuja POS low stock alert
                Shop: %s
                Product: %s
                Current quantity: %d
                Low stock threshold: %d
                """.formatted(shopName, productName, currentQty, lowStockQty).trim()
        );
    }

    public void sendSaleAlert(
            String chatId,
            String shopName,
            String cashierName,
            String saleNo,
            String totalAmount
    ) {
        sendMessage(
                chatId,
                """
                Kambuja POS sale completed
                Shop: %s
                Cashier: %s
                Sale number: %s
                Total: %s
                """.formatted(shopName, cashierName, saleNo, totalAmount).trim()
        );
    }

    private TelegramSettingResponse masked(TelegramSetting setting) {
        return TelegramSettingResponse.builder()
                .id(setting.getId())
                .shopId(setting.getShopId())
                .chatId(setting.getChatId())
                .enabled(Boolean.TRUE.equals(setting.getEnabled()))
                .botTokenConfigured(
                        botToken != null
                                && !botToken.isBlank()
                                && !"<TELEGRAM_BOT_TOKEN>".equals(botToken.trim())
                )
                .build();
    }
}
