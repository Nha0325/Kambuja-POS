package com.kambujaflow.kambujapos.waf;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.regex.Pattern;

@Component
@Order(10)
public class XssProtectionFilter extends WafFilter {
    private static final Pattern XSS_PATTERN = Pattern.compile(
            "(?i)(<\\s*script|javascript:|onerror\\s*=|onload\\s*=|<\\s*iframe)"
    );

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String requestTarget = request.getRequestURI() + "?"
                + (request.getQueryString() == null ? "" : request.getQueryString());
        if (XSS_PATTERN.matcher(requestTarget).find()) {
            reject(response, "Request contains a prohibited pattern");
            return;
        }
        filterChain.doFilter(request, response);
    }
}
