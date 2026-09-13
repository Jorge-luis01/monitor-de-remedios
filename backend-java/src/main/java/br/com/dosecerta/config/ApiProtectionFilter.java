package br.com.dosecerta.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/** Single-user local API: no cookies, sessions, or credentials shipped in the client. */
@Component
@Order(1)
public class ApiProtectionFilter extends OncePerRequestFilter {
    private final byte[] token;
    private final TokenBucket authenticatedRequests = new TokenBucket(120, 2);
    private final TokenBucket rejectedRequests = new TokenBucket(60, 1);
    private final TokenBucket publicRequests = new TokenBucket(60, 1);

    public ApiProtectionFilter(@Value("${app.api-token:}") String token) {
        if (!token.isEmpty() && (token.length() < 32 || token.isBlank())) {
            throw new IllegalArgumentException("DOSE_CERTA_API_TOKEN must contain at least 32 characters.");
        }
        this.token = token.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
        // Preflight is validated by Spring MVC CORS; it cannot perform a CRUD operation.
        if (request.getMethod().equals("OPTIONS") ||
                (request.getMethod().equals("GET") && request.getRequestURI().equals("/api/health"))) {
            if (!publicRequests.admit()) {
                rejectRateLimit(response);
                return;
            }
            chain.doFilter(request, response);
            return;
        }
        if (token.length == 0) {
            reject(response, 503, "API não configurada para acesso.");
            return;
        }
        String authorization = request.getHeader("Authorization");
        boolean authenticated = authorization != null && authorization.startsWith("Bearer ") &&
                MessageDigest.isEqual(token, authorization.substring(7).getBytes(StandardCharsets.UTF_8));
        if (!authenticated) {
            if (!rejectedRequests.admit()) {
                rejectRateLimit(response);
                return;
            }
            response.setHeader("WWW-Authenticate", "Bearer");
            reject(response, 401, "Autenticação necessária.");
            return;
        }
        if (!authenticatedRequests.admit()) {
            rejectRateLimit(response);
            return;
        }
        chain.doFilter(request, response);
    }

    private static void rejectRateLimit(HttpServletResponse response) throws IOException {
        response.setHeader("Retry-After", "1");
        reject(response, 429, "Limite de requisições atingido.");
    }

    private static void reject(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"message\":\"" + message + "\"}");
    }

    private static final class TokenBucket {
        private final double capacity;
        private final double refillPerSecond;
        private double available;
        private long lastRefill = System.nanoTime();

        private TokenBucket(double capacity, double refillPerSecond) {
            this.capacity = capacity;
            this.refillPerSecond = refillPerSecond;
            this.available = capacity;
        }

        private synchronized boolean admit() {
            long now = System.nanoTime();
            available = Math.min(capacity,
                    available + (now - lastRefill) / 1_000_000_000.0 * refillPerSecond);
            lastRefill = now;
            if (available < 1) return false;
            available--;
            return true;
        }
    }
}
