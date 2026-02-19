package com.example.sns.controller.api;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.sns.aop.AuditLog;
import com.example.sns.aop.ValidCheck;
import com.example.sns.dto.request.AdminMemberCreateRequest;
import com.example.sns.dto.request.AdminMemberUpdateRequest;
import com.example.sns.dto.response.MemberResponse;
import com.example.sns.service.MemberService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 관리자 회원 관리 API — ROLE_ADMIN 전용.
 *
 * Step 15: 회원 목록·상세·추가·수정·삭제.
 * RULE 1.2: ROLE_ADMIN만 접근. RULE 1.4.2: 민감 작업 감사 로그.
 */
@Tag(name = "관리자 - 회원 관리", description = "ROLE_ADMIN 전용. 회원 CRUD")
@RestController
@RequestMapping("/api/admin/members")
@RequiredArgsConstructor
public class AdminMemberController {

    private final MemberService memberService;

    @Operation(summary = "회원 목록", description = "페이징·검색. ROLE_ADMIN 필수")
    @GetMapping
    public ResponseEntity<Page<MemberResponse>> list(
            @Parameter(description = "페이지 번호") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "이메일/닉네임 검색") @RequestParam(required = false) String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(memberService.getListForAdmin(keyword, pageable));
    }

    @Operation(summary = "회원 상세", description = "관리자용 회원 상세")
    @GetMapping("/{id}")
    public ResponseEntity<MemberResponse> get(@PathVariable Long id) {
        MemberResponse response = memberService.getById(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "회원 추가", description = "관리자에 의한 회원 등록")
    @PostMapping
    @ValidCheck
    @AuditLog("ADMIN_MEMBER_CREATE")
    public ResponseEntity<MemberResponse> create(@Valid @RequestBody AdminMemberCreateRequest request) {
        MemberResponse response = memberService.createByAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "회원 수정", description = "프로필·역할 등 수정")
    @PutMapping("/{id}")
    @ValidCheck
    @AuditLog("ADMIN_MEMBER_UPDATE")
    public ResponseEntity<MemberResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AdminMemberUpdateRequest request) {
        MemberResponse response = memberService.updateByAdmin(id, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "회원 삭제", description = "회원 탈퇴/삭제")
    @DeleteMapping("/{id}")
    @AuditLog("ADMIN_MEMBER_DELETE")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        memberService.deleteByAdmin(id);
        return ResponseEntity.noContent().build();
    }
}
