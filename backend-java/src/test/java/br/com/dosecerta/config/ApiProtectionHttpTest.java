package br.com.dosecerta.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "app.api-token=http-test-only-token-at-least-32-characters")
@ActiveProfiles("test")
class ApiProtectionHttpTest {
    @LocalServerPort private int port;

    @Test void runningServerProtectsTheApiAndRejectsUntrustedOrigins() throws Exception {
        try (var client = HttpClient.newHttpClient()) {
            var base = "http://127.0.0.1:" + port;
            var health = client.send(HttpRequest.newBuilder(URI.create(base + "/api/health")).build(),
                    HttpResponse.BodyHandlers.discarding());
            assertEquals(200, health.statusCode());
            var unauthorized = client.send(HttpRequest.newBuilder(URI.create(base + "/api/medications")).build(),
                    HttpResponse.BodyHandlers.discarding());
            assertEquals(401, unauthorized.statusCode());
            var authorized = HttpRequest.newBuilder(URI.create(base + "/api/medications"))
                    .header("Authorization", "Bearer http-test-only-token-at-least-32-characters");
            assertEquals(200, client.send(authorized.build(), HttpResponse.BodyHandlers.discarding()).statusCode());
            authorized.header("Origin", "https://untrusted.invalid");
            assertEquals(403, client.send(authorized.build(), HttpResponse.BodyHandlers.discarding()).statusCode());
        }
    }
}
