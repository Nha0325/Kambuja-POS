package com.kambujaflow.kambujapos.waf;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Order(30)
public class RateLimitFilter extends WafFilter {
    private static final int REQUEST_LIMIT = 120;
    private static final long WINDOW_SECONDS = 60;
    private final Map<String, RequestWindow> clients = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        long now = Instant.now().getEpochSecond();
        String clientKey = request.getRemoteAddr();
        RequestWindow window = clients.compute(clientKey, (key, existing) -> {
            if (existing == null || now - existing.startedAt >= WINDOW_SECONDS) {
                return new RequestWindow(now, new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });

        if (window.count.get() > REQUEST_LIMIT) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Rate limit exceeded\",\"errors\":[]}"
            );
            return;
        }
        filterChain.doFilter(request, response);
    }

    private record RequestWindow(long startedAt, AtomicInteger count) {
    }
}
