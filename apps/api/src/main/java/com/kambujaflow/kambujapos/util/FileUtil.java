package com.kambujaflow.kambujapos.util;

import java.nio.file.Path;

public final class FileUtil {
    private FileUtil() {
    }

    public static String safeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "";
        }
        return Path.of(fileName).getFileName().toString()
                .replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
