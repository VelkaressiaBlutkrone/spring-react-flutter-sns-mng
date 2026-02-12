package com.example.sns;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * test_data.sql용 BCrypt 해시 검증.
 * password → 해시 생성 및 matches 검증.
 */
@DisplayName("Password Hash 검증")
class PasswordHashTest {

    /** test_data.sql에 사용된 해시 (BCryptPasswordEncoder.encode("password")) */
    private static final String TEST_DATA_HASH = "$2a$10$l2plFKZEt9GCNmSFEIReTe750sekSAaWb29idZcLKoBEKwNzI2vmq";

    @Test
    @DisplayName("test_data.sql 해시가 password와 일치하는지 검증")
    void testDataHash_matchesPassword() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        assertThat(encoder.matches("password", TEST_DATA_HASH)).isTrue();
    }
}
