package com.kambujaflow.kambujapos.util;

import java.util.UUID;

public final class SaleNumberUtil {
    private SaleNumberUtil() {
    }

    public static String generate() {
        return "SALE-" + System.currentTimeMillis() + "-"
                + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
