package com.kambujaflow.kambujapos;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class KambujaPosApplicationTests {

    @Test
    void applicationClassIsLoadable() {
        assertDoesNotThrow(() -> Class.forName(
                "com.kambujaflow.kambujapos.KambujaPosApplication"
        ));
    }
}
