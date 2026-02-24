package com.example.sns;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

/**
 * 통합 테스트 공통 설정.
 * TestConfig(TokenStore 등)를 로드하여 NoSuchBeanDefinitionException 방지.
 */
@SpringBootTest
@ActiveProfiles("test")
@Import(TestConfig.class)
public abstract class BaseIntegrationTest {
}
