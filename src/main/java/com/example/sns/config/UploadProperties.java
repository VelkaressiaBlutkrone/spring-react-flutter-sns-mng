package com.example.sns.config;

import java.util.Set;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 파일 업로드 설정.
 *
 * RULE 1.1: 저장 경로·제한 값은 설정에서 주입.
 * Step 9: 허용 MIME·최대 크기·저장 경로.
 */
@ConfigurationProperties(prefix = "app.upload")
public record UploadProperties(
        /**
         * 저장 루트 경로 (환경 변수 또는 상대 경로).
         */
        String basePath,

        /**
         * 허용 이미지 MIME 타입 (예: image/jpeg, image/png, image/gif).
         */
        Set<String> allowedMimeTypes,

        /**
         * 최대 파일 크기 (바이트).
         */
        long maxFileSizeBytes
) {
}
