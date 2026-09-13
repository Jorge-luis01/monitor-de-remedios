package br.com.dosecerta.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import java.util.concurrent.atomic.AtomicBoolean;
import static org.junit.jupiter.api.Assertions.*;

class ApiProtectionFilterTest {
    private static final String TOKEN = "test-only-token-with-at-least-32-characters";

    private MockHttpServletResponse request(ApiProtectionFilter filter, String method, String path,
                                           String authorization, AtomicBoolean reached) throws Exception {
        var request = new MockHttpServletRequest(method, path);
        if (authorization != null) request.addHeader("Authorization", authorization);
        var response = new MockHttpServletResponse();
        filter.doFilter(request, response, (req, res) -> reached.set(true));
        return response;
    }

    @Test void blocksEveryCrudMethodWithoutToken() throws Exception {
        var filter = new ApiProtectionFilter(TOKEN);
        for (String method : new String[]{"GET", "POST", "PUT", "PATCH", "DELETE"}) {
            var reached = new AtomicBoolean();
            assertEquals(401, request(filter, method, "/api/medications", null, reached).getStatus());
            assertFalse(reached.get());
        }
    }

    @Test void rejectsWrongToken() throws Exception {
        var reached = new AtomicBoolean();
        assertEquals(401, request(new ApiProtectionFilter(TOKEN), "GET", "/api/medications",
                "Bearer wrong", reached).getStatus());
        assertFalse(reached.get());
    }

    @Test void acceptsCorrectTokenAndAddsHeaders() throws Exception {
        var reached = new AtomicBoolean();
        var response = request(new ApiProtectionFilter(TOKEN), "GET", "/api/medications", "Bearer " + TOKEN, reached);
        assertTrue(reached.get());
        assertEquals("no-store", response.getHeader("Cache-Control"));
        assertEquals("nosniff", response.getHeader("X-Content-Type-Options"));
    }

    @Test void missingConfigurationFailsClosed() throws Exception {
        var reached = new AtomicBoolean();
        assertEquals(503, request(new ApiProtectionFilter(""), "GET", "/api/medications", null, reached).getStatus());
        assertFalse(reached.get());
    }

    @Test void healthIsPublicButOtherMethodsAreNot() throws Exception {
        var filter = new ApiProtectionFilter(TOKEN);
        var reached = new AtomicBoolean();
        request(filter, "GET", "/api/health", null, reached);
        assertTrue(reached.get());
        assertEquals(401, request(filter, "POST", "/api/health", null, new AtomicBoolean()).getStatus());
    }

    @Test void rejectsWeakConfiguration() {
        assertThrows(IllegalArgumentException.class, () -> new ApiProtectionFilter("short"));
        assertThrows(IllegalArgumentException.class, () -> new ApiProtectionFilter(" ".repeat(32)));
    }

    @Test void limitsRejectedBurstWithoutBlockingAuthenticatedRequests() throws Exception {
        var filter = new ApiProtectionFilter(TOKEN);
        MockHttpServletResponse response = null;
        for (int i = 0; i < 70; i++) response = request(filter, "GET", "/api/medications", null, new AtomicBoolean());
        assertEquals(429, response.getStatus());
        assertEquals("1", response.getHeader("Retry-After"));

        var reached = new AtomicBoolean();
        assertEquals(200, request(filter, "GET", "/api/medications", "Bearer " + TOKEN, reached).getStatus());
        assertTrue(reached.get());
    }

    @Test void publicBurstDoesNotBlockAuthenticatedRequests() throws Exception {
        var filter = new ApiProtectionFilter(TOKEN);
        for (int i = 0; i < 70; i++) {
            request(filter, "GET", "/api/health", null, new AtomicBoolean());
        }
        var reached = new AtomicBoolean();
        assertEquals(200, request(filter, "GET", "/api/medications", "Bearer " + TOKEN, reached).getStatus());
        assertTrue(reached.get());
    }
}
