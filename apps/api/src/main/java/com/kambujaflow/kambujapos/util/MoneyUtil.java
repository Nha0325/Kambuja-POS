package com.kambujaflow.kambujapos.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class MoneyUtil {
    public static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

    private MoneyUtil() {
    }

    public static BigDecimal normalize(BigDecimal value) {
        return value == null ? ZERO : value.setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal multiply(BigDecimal amount, int quantity) {
        return normalize(normalize(amount).multiply(BigDecimal.valueOf(quantity)));
    }
}
