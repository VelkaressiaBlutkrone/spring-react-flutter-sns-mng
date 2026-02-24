package com.example.sns.controller.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.example.sns.BaseIntegrationTest;

/**
 * AuthController 통합 테스트.
 *
 * RULE 4.2.2: Given-When-Then.
 * RULE 1.2.4: 인증·인가 테스트 (401).
 */
@AutoConfigureMockMvc
@DisplayName("AuthController 통합 테스트")
class AuthControllerTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/auth/me - 미인증 시 401을 반환한다")
    void me_미인증시_401을_반환한다() throws Exception {
        // given
        // when
        var result = mockMvc.perform(get("/api/auth/me"));
        // then
        result.andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("E002"));
    }

    @Test
    @DisplayName("POST /api/auth/login - 잘못된 자격증명 시 401을 반환한다")
    void login_잘못된자격증명시_401을_반환한다() throws Exception {
        // given
        String requestBody = """
                {"email":"nonexistent@example.com","password":"wrongpassword"}
                """.trim();
        // when
        var result = mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody));
        // then
        result.andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("E007"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Rate limit 초과 시 429 및 Retry-After 반환 (RULE 1.9)")
    void login_rateLimit초과시_429_및_RetryAfter_반환() throws Exception {
        // given: application-test.yml rate-limit login-capacity=3
        String requestBody = """
                {"email":"any@example.com","password":"any"}
                """.trim();
        // when: 동일 IP에서 capacity 초과할 때까지 연속 요청 (최대 10회)
        org.springframework.test.web.servlet.ResultActions last = mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody));
        for (int i = 0; i < 9; i++) {
            if (last.andReturn().getResponse().getStatus() == 429) {
                break;
            }
            last = mockMvc.perform(post("/api/auth/login")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody));
        }
        // then
        last.andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("E429"))
                .andExpect(header().exists("Retry-After"));
    }
}
