package com.kambujaflow.kambujapos.util;

import java.util.UUID;

public final class ReceiptNumberUtil {
    private ReceiptNumberUtil() {
    }

    public static String generate() {
        return "RCP-" + System.currentTimeMillis() + "-"
                + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
