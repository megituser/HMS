package com.saad.hms.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginRateLimiterService {

    // one bucket per IP address
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String ipAddress) {
        return buckets.computeIfAbsent(ipAddress, this::newBucket);
    }

    private Bucket newBucket(String ipAddress) {
        // allow 5 attempts, refill 5 tokens every 1 minute
        Bandwidth limit = Bandwidth.classic(
                5, Refill.intervally(5, Duration.ofMinutes(1))
        );
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    public boolean isAllowed(String ipAddress) {
        Bucket bucket = resolveBucket(ipAddress);
        return bucket.tryConsume(1);
    }
}