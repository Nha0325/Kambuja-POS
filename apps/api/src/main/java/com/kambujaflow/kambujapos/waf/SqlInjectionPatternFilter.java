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
@Order(20)
public class SqlInjectionPatternFilter extends WafFilter {
    private static final Pattern SQL_PATTERN = Pattern.compile(
            "(?i)(\\bunion\\s+select\\b|\\bdrop\\s+(table|database)\\b|"
                    + "\\binsert\\s+into\\b|\\bdelete\\s+from\\b|--|;\\s*shutdown\\b)"
    );

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String query = request.getQueryString();
        if (query != null && SQL_PATTERN.matcher(query).find()) {
            reject(response, "Request contains a prohibited pattern");
            return;
        }
        filterChain.doFilter(request, response);
    }
}
