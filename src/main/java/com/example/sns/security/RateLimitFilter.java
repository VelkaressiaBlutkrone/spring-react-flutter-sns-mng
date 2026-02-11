package com.example.sns.security;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.sns.config.RateLimitProperties;
import com.example.sns.exception.ErrorCode;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Rate Limiting 필터 (RULE 1.9, Step 18).
 *
 * 로그인·회원가입·토큰 갱신 등 공개 API에 IP 기준 제한 적용.
 * 초과 시 429 Too Many Requests + Retry-After 헤더 반환.
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private static final List<String> RATE_LIMIT_PATHS = List.of(
            "POST:/api/auth/login",
            "POST:/api/members",
            "POST:/api/auth/refresh"
    );

    private final RateLimitProperties props;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String key = request.getMethod() + ":" + request.getRequestURI();
        return !RATE_LIMIT_PATHS.contains(key);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        String clientKey = resolveClientKey(request);

        Bucket bucket = bucketFor(path, method, clientKey);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (!probe.isConsumed()) {
            long retryAfterSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;
            if (retryAfterSeconds <= 0) {
                retryAfterSeconds = 1;
            }
            response.setStatus(429); // Too Many Requests (RULE 1.9)
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.setContentType("application/json;charset=UTF-8");
            String body = String.format("{\"code\":\"%s\",\"message\":\"%s\"}",
                    ErrorCode.TOO_MANY_REQUESTS.getCode(),
                    ErrorCode.TOO_MANY_REQUESTS.getDefaultMessage());
            response.getWriter().write(body);
            log.warn("Rate limit exceeded: method={}, path={}, clientKey={}, retryAfterSec={}",
                    method, path, maskForLog(clientKey), retryAfterSeconds);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Bucket bucketFor(String path, String method, String clientKey) {
        String bucketKey = bucketKey(path, method, clientKey);
        return buckets.computeIfAbsent(bucketKey, k -> buildBucket(path, method));
    }

    private String bucketKey(String path, String method, String clientKey) {
        if ("/api/auth/login".equals(path) && "POST".equals(method)) {
            return "login:" + clientKey;
        }
        if ("/api/members".equals(path) && "POST".equals(method)) {
            return "signup:" + clientKey;
        }
        if ("/api/auth/refresh".equals(path) && "POST".equals(method)) {
            return "refresh:" + clientKey;
        }
        return "default:" + clientKey;
    }

    private Bucket buildBucket(String path, String method) {
        Bandwidth bandwidth;
        if ("/api/auth/login".equals(path) && "POST".equals(method)) {
            bandwidth = Bandwidth.simple(props.getLoginCapacity(), Duration.ofMinutes(props.getLoginPeriodMinutes()));
        } else if ("/api/members".equals(path) && "POST".equals(method)) {
            bandwidth = Bandwidth.simple(props.getSignupCapacity(), Duration.ofMinutes(props.getSignupPeriodMinutes()));
        } else if ("/api/auth/refresh".equals(path) && "POST".equals(method)) {
            bandwidth = Bandwidth.simple(props.getRefreshCapacity(), Duration.ofMinutes(props.getRefreshPeriodMinutes()));
        } else {
            bandwidth = Bandwidth.simple(100, Duration.ofMinutes(1));
        }
        return Bucket.builder().addLimit(bandwidth).build();
    }

    private String resolveClientKey(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }

    /** 로그용 마스킹: IP 일부만 노출 (RULE 1.4.3 민감정보 최소화). */
    private static String maskForLog(String clientKey) {
        if (clientKey == null || clientKey.length() < 8) {
            return "***";
        }
        return clientKey.substring(0, Math.min(4, clientKey.length())) + "***";
    }
}
