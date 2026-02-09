package com.example.sns.controller.api;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.sns.aop.AuditLog;
import com.example.sns.aop.ValidCheck;
import com.example.sns.domain.User;
import com.example.sns.dto.request.MemberUpdateRequest;
import com.example.sns.dto.response.ImagePostResponse;
import com.example.sns.dto.response.MemberResponse;
import com.example.sns.dto.response.PinResponse;
import com.example.sns.dto.response.PostResponse;
import com.example.sns.exception.BusinessException;
import com.example.sns.exception.ErrorCode;
import com.example.sns.service.AuthService;
import com.example.sns.service.ImagePostService;
import com.example.sns.service.MemberService;
import com.example.sns.service.PinService;
import com.example.sns.service.PostService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 마이페이지 API — 내 게시글·이미지 게시글·Pin 목록·개인정보 수정.
 *
 * Step 14: 로그인 사용자 본인 데이터만 조회.
 * RULE 1.2: 리소스 소유권 검증.
 */
@Tag(name = "마이페이지 (Me)", description = "내 게시글, 이미지 게시글, Pin 목록, 개인정보 수정")
@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final PostService postService;
    private final ImagePostService imagePostService;
    private final PinService pinService;
    private final MemberService memberService;
    private final AuthService authService;

    @Operation(summary = "내 게시글 목록", description = "로그인 필수. 본인 게시글만")
    @GetMapping("/posts")
    public ResponseEntity<Page<PostResponse>> myPosts(
            @Parameter(description = "페이지 번호") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size) {
        User currentUser = authService.getCurrentUserEntity()
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(postService.getListByAuthor(currentUser, pageable));
    }

    @Operation(summary = "내 이미지 게시글 목록", description = "로그인 필수")
    @GetMapping("/image-posts")
    public ResponseEntity<Page<ImagePostResponse>> myImagePosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User currentUser = authService.getCurrentUserEntity()
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(imagePostService.getListByAuthor(currentUser, pageable));
    }

    @Operation(summary = "내 Pin 목록", description = "로그인 필수")
    @GetMapping("/pins")
    public ResponseEntity<Page<PinResponse>> myPins(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User currentUser = authService.getCurrentUserEntity()
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(pinService.getListByOwner(currentUser, pageable));
    }

    @Operation(summary = "개인정보 수정", description = "로그인 필수. 닉네임 등. RULE 1.4.2: 민감 작업 감사 로그")
    @PutMapping
    @ValidCheck
    @AuditLog("PROFILE_UPDATE")
    public ResponseEntity<MemberResponse> updateMe(@Valid @RequestBody MemberUpdateRequest request) {
        User currentUser = authService.getCurrentUserEntity()
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        MemberResponse response = memberService.updateMe(currentUser, request);
        return ResponseEntity.ok(response);
    }
}
