package com.kambujaflow.kambujapos.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.*;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

@RestController
@RequestMapping("/api/i18n")
public class I18nController {

    @GetMapping("/messages")
    public Map<String, String> getMessages(@RequestParam(defaultValue = "en") String lang) {
        String filename = "km".equalsIgnoreCase(lang) ? "messages_km.properties" : "messages_en.properties";
        Map<String, String> messages = new HashMap<>();
        
        try {
            ClassPathResource resource = new ClassPathResource(filename);
            if (resource.exists()) {
                Properties properties = new Properties();
                properties.load(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8));
                
                for (String key : properties.stringPropertyNames()) {
                    messages.put(key, properties.getProperty(key));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return messages;
    }
}
