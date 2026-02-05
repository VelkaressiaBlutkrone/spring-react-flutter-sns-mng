package com.example.sns.controller.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.example.sns.domain.Post;
import com.example.sns.domain.User;
import com.example.sns.domain.UserRole;
import com.example.sns.repository.PostRepository;
import com.example.sns.repository.UserRepository;

/**
 * PostController 통합 테스트.
 *
 * RULE 1.2.4: 인증·인가 테스트 (401, 403).
 * Step 8: 비로그인 조회, 로그인 작성·수정·삭제, 타인 글 403.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("PostController 통합 테스트")
class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    private User author;
    private User otherUser;
    private Post post;

    @BeforeEach
    void setUp() {
        author = User.builder()
                .email("author@example.com")
                .passwordHash("hash")
                .nickname("작성자")
                .role(UserRole.USER)
                .build();
        author = userRepository.save(author);

        otherUser = User.builder()
                .email("other@example.com")
                .passwordHash("hash")
                .nickname("다른사용자")
                .role(UserRole.USER)
                .build();
        otherUser = userRepository.save(otherUser);

        post = Post.builder()
                .author(author)
                .title("테스트 제목")
                .content("테스트 내용")
                .build();
        post = postRepository.save(post);
    }

    @Test
    @DisplayName("GET /api/posts - 비로그인 조회 시 200 반환")
    void list_비로그인_200() throws Exception {
        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("GET /api/posts/{id} - 비로그인 상세 조회 시 200 반환")
    void get_비로그인_200() throws Exception {
        mockMvc.perform(get("/api/posts/{id}", post.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(post.getId()))
                .andExpect(jsonPath("$.title").value("테스트 제목"));
    }

    @Test
    @DisplayName("POST /api/posts - 미인증 시 401 반환")
    void create_미인증_401() throws Exception {
        String body = """
                {"title":"새글","content":"내용"}
                """.trim();
        mockMvc.perform(post("/api/posts")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("E002"));
    }

    @Test
    @DisplayName("POST /api/posts - 로그인 시 201 반환")
    void create_로그인_201() throws Exception {
        var auth = new UsernamePasswordAuthenticationToken(author, null,
                java.util.Collections.singletonList(new SimpleGrantedAuthority(author.getRole().toAuthority())));

        String body = """
                {"title":"새글","content":"내용"}
                """.trim();
        mockMvc.perform(post("/api/posts")
                .with(csrf())
                .with(authentication(auth))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("새글"))
                .andExpect(jsonPath("$.authorId").value(author.getId()));
    }

    @Test
    @DisplayName("PUT /api/posts/{id} - 타인 글 수정 시 403 반환")
    void update_타인글_403() throws Exception {
        var auth = new UsernamePasswordAuthenticationToken(otherUser, null,
                java.util.Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

        String body = """
                {"title":"수정제목","content":"수정내용"}
                """.trim();
        mockMvc.perform(put("/api/posts/{id}", post.getId())
                .with(csrf())
                .with(authentication(auth))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("E003"));
    }

    @Test
    @DisplayName("DELETE /api/posts/{id} - 타인 글 삭제 시 403 반환")
    void delete_타인글_403() throws Exception {
        var auth = new UsernamePasswordAuthenticationToken(otherUser, null,
                java.util.Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

        mockMvc.perform(delete("/api/posts/{id}", post.getId())
                .with(csrf())
                .with(authentication(auth)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("E003"));
    }
}
