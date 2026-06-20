package com.kambujaflow.kambujapos.util;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UtilityTests {

    @Test
    void normalizesMoneyToTwoDecimalPlaces() {
        assertEquals(new BigDecimal("12.35"), MoneyUtil.normalize(new BigDecimal("12.345")));
    }

    @Test
    void generatesValidLengthEan13Barcode() {
        String barcode = BarcodeUtil.generateEan13();
        assertEquals(13, barcode.length());
        assertTrue(barcode.chars().allMatch(Character::isDigit));
    }
}
