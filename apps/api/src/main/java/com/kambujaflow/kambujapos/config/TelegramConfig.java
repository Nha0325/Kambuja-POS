package com.kambujaflow.kambujapos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class TelegramConfig {

    @Bean
    RestTemplate telegramRestTemplate() {
        return new RestTemplate();
    }
}
