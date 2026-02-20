package com.example.sns.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.sns.config.upload.UploadProperties;
import com.example.sns.exception.BusinessException;
import com.example.sns.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 파일 저장 서비스.
 *
 * RULE 1.3: 파일 타입·크기 검증, 경로 traversal 방지.
 * Step 9: Multipart 검증·저장.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final UploadProperties uploadProperties;

    /**
     * 이미지 파일 검증 후 저장하고, 저장 경로(상대) 반환.
     *
     * @param file 업로드된 파일
     * @param subDir 저장 서브디렉터리 (예: image-posts)
     * @return DB에 저장할 경로 문자열 (basePath 내 상대 경로)
     */
    public String storeImage(MultipartFile file, String subDir) {
        validateImageFile(file);

        Path basePath = Paths.get(uploadProperties.basePath()).toAbsolutePath().normalize();
        Path subPath = sanitizePathSegment(subDir);
        Path targetDir = basePath.resolve(subPath);

        try {
            Files.createDirectories(targetDir);
        } catch (IOException e) {
            log.error("업로드 디렉터리 생성 실패: basePath={}", basePath);
            throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED, "업로드 디렉터리를 생성할 수 없습니다.");
        }

        String safeFilename = generateSafeFilename(file.getOriginalFilename());
        Path targetFile = targetDir.resolve(safeFilename);

        // 경로 traversal 방지: targetFile이 targetDir 내에 있는지 검증
        if (!targetFile.normalize().startsWith(targetDir.normalize())) {
            log.warn("경로 traversal 시도 차단: originalFilename={}", sanitizeForLog(file.getOriginalFilename()));
            throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED, "잘못된 파일 경로입니다.");
        }

        try {
            file.transferTo(targetFile.toFile());
        } catch (IOException e) {
            log.error("파일 저장 실패: subDir={}, filename={}", subDir, sanitizeForLog(safeFilename));
            throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED, "파일 저장에 실패했습니다.");
        }

        // DB에는 basePath 기준 상대 경로 저장 (이식성)
        String relativePath = subPath.resolve(safeFilename).toString().replace('\\', '/');
        log.info("이미지 저장 완료: subDir={}, storedPath={}", subDir, relativePath);
        return relativePath;
    }

    /**
     * 저장된 파일의 전체 경로 반환.
     */
    public Path resolveStoredPath(String relativePath) {
        if (relativePath == null || relativePath.contains("..")) {
            log.warn("저장 경로 traversal 시도 차단: relativePath={}", sanitizeForLog(relativePath));
            throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED, "잘못된 파일 경로입니다.");
        }
        Path base = Paths.get(uploadProperties.basePath()).toAbsolutePath().normalize();
        Path resolved = base.resolve(relativePath.replace('\\', '/')).normalize();
        if (!resolved.startsWith(base)) {
            log.warn("저장 경로 traversal 시도 차단: relativePath={}", sanitizeForLog(relativePath));
            throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED, "잘못된 파일 경로입니다.");
        }
        return resolved;
    }

    /**
     * 파일이 존재하면 삭제.
     */
    public void deleteIfExists(String relativePath) {
        Path path = resolveStoredPath(relativePath);
        try {
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("저장 파일 삭제: path={}", sanitizeForLog(relativePath));
            }
        } catch (IOException e) {
            log.warn("파일 삭제 실패(무시): path={}", sanitizeForLog(relativePath), e);
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "이미지 파일이 필요합니다.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !uploadProperties.allowedMimeTypes().contains(contentType)) {
            log.warn("허용되지 않는 MIME 타입: contentType={}", contentType);
            throw new BusinessException(ErrorCode.INVALID_FILE_TYPE);
        }

        if (file.getSize() > uploadProperties.maxFileSizeBytes()) {
            log.warn("파일 크기 초과: size={}, max={}", file.getSize(), uploadProperties.maxFileSizeBytes());
            throw new BusinessException(ErrorCode.FILE_TOO_LARGE);
        }
    }

    /**
     * 경로 traversal 방지: "..", "/", "\" 등 제거, 정규화.
     */
    private Path sanitizePathSegment(String segment) {
        if (segment == null || segment.isBlank()) {
            return Paths.get("default");
        }
        String cleaned = segment.replace("..", "")
                .replace("\\", "/")
                .replaceAll("^/+", "")
                .trim();
        if (cleaned.isEmpty()) {
            return Paths.get("default");
        }
        return Paths.get(cleaned);
    }

    private String generateSafeFilename(String originalFilename) {
        String ext = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            int lastDot = originalFilename.lastIndexOf('.');
            String maybeExt = originalFilename.substring(lastDot);
            if (maybeExt.matches("\\.[a-zA-Z0-9]{1,10}")) {
                ext = maybeExt.toLowerCase();
            }
        }
        return UUID.randomUUID().toString() + ext;
    }

    /**
     * 로그 출력 시 민감정보(전체 경로 등) 마스킹. RULE 1.4.1.
     */
    private String sanitizeForLog(String value) {
        if (value == null || value.length() <= 20) {
            return value;
        }
        return value.substring(0, 10) + "..." + value.substring(value.length() - 5);
    }
}
