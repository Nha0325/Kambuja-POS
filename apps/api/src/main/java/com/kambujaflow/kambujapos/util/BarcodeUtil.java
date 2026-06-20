package com.kambujaflow.kambujapos.util;

import java.security.SecureRandom;

public final class BarcodeUtil {
    private static final SecureRandom RANDOM = new SecureRandom();

    private BarcodeUtil() {
    }

    public static String generateEan13() {
        StringBuilder firstTwelve = new StringBuilder(12);
        for (int index = 0; index < 12; index++) {
            firstTwelve.append(RANDOM.nextInt(10));
        }
        return firstTwelve.toString() + calculateCheckDigit(firstTwelve.toString());
    }

    private static int calculateCheckDigit(String digits) {
        int sum = 0;
        for (int index = 0; index < digits.length(); index++) {
            int digit = Character.digit(digits.charAt(index), 10);
            sum += index % 2 == 0 ? digit : digit * 3;
        }
        return (10 - (sum % 10)) % 10;
    }
}
