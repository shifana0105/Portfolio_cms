package com.portfoliocms.app.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

/**
 * HMAC-SHA256 hashing for IP addresses. Never stores raw IPs - produces a
 * one-way hash using a server-side secret so views can be deduplicated
 * without retaining personally identifiable information.
 */
public final class IpHashUtil {

    private IpHashUtil() {}

    public static String hash(String ip, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(ip.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to hash IP", e);
        }
    }
}
