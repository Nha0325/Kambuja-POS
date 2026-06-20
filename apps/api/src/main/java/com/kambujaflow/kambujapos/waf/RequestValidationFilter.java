package com.kambujaflow.kambujapos.waf;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Set;

@Component
@Order(40)
public class RequestValidationFilter extends WafFilter {
    private static final long MAX_CONTENT_LENGTH = 2 * 1024 * 1024;
    private static final Set<String> ALLOWED_METHODS =
            Set.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (!ALLOWED_METHODS.contains(request.getMethod())) {
            reject(response, "HTTP method is not allowed");
            return;
        }
        if (request.getContentLengthLong() > MAX_CONTENT_LENGTH) {
            response.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Request body is too large\",\"errors\":[]}"
            );
            return;
        }
        if (request.getRequestURI().indexOf('\0') >= 0) {
            reject(response, "Request path is invalid");
            return;
        }
        filterChain.doFilter(request, response);
    }
}
