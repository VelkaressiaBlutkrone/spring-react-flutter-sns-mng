package com.example.sns.controller.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.web.servlet.MockMvc;

import com.example.sns.BaseIntegrationTest;

/**
 * 관리자 API 인가 테스트.
 *
 * RULE 1.2.4: 인가 테스트 (403).
 * Step 7: /api/admin/** ROLE_ADMIN 전용, 일반 사용자 403.
 */
@AutoConfigureMockMvc
@DisplayName("관리자 API 인가 테스트")
class AdminSecurityTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/admin/members - 미인증 시 401을 반환한다")
    void adminMembers_미인증시_401을_반환한다() throws Exception {
        // given
        // when
        var result = mockMvc.perform(get("/api/admin/members"));
        // then
        result.andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("E002"));
    }

    @Test
    @DisplayName("GET /api/admin/members - ROLE_USER로 인증 시 403을 반환한다")
    void adminMembers_ROLE_USER인증시_403을_반환한다() throws Exception {
        // given
        User user = new User("user@example.com", "password",
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
        // when
        var result = mockMvc.perform(get("/api/admin/members")
                .with(user(user)));
        // then
        result.andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("E003"));
    }
}
