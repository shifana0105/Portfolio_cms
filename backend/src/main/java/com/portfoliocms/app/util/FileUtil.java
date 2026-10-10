package com.portfoliocms.app.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

/**
 * Sanitizes filenames for safe storage. Prevents path traversal and
 * removes dangerous characters while keeping a human-readable name.
 */
public final class FileUtil {

    private static final Pattern UNSAFE_CHARS = Pattern.compile("[^a-zA-Z0-9._-]");
    private static final int MAX_FILENAME_LENGTH = 200;

    private FileUtil() {}

    public static String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "unnamed";
        }

        // Normalize unicode
        String sanitized = Normalizer.normalize(filename, Normalizer.Form.NFC);

        // Remove path separators (prevent traversal)
        sanitized = sanitized.replace("\\", "/");
        int lastSlash = sanitized.lastIndexOf('/');
        if (lastSlash >= 0) {
            sanitized = sanitized.substring(lastSlash + 1);
        }

        // Remove unsafe characters
        sanitized = UNSAFE_CHARS.matcher(sanitized).replaceAll("_");

        // Truncate
        if (sanitized.length() > MAX_FILENAME_LENGTH) {
            sanitized = sanitized.substring(0, MAX_FILENAME_LENGTH);
        }

        return sanitized.isBlank() ? "unnamed" : sanitized;
    }

    /**
     * Validates that the first bytes of a file match the PDF magic number (%PDF-).
     */
    public static boolean isPdfContent(byte[] fileBytes) {
        if (fileBytes == null || fileBytes.length < 5) {
            return false;
        }
        return fileBytes[0] == 0x25  // %
                && fileBytes[1] == 0x50  // P
                && fileBytes[2] == 0x44  // D
                && fileBytes[3] == 0x46  // F
                && fileBytes[4] == 0x2D; // -
    }
}
