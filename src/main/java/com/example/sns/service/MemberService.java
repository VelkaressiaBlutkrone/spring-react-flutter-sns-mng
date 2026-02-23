package com.example.sns.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.sns.domain.User;
import com.example.sns.domain.UserRole;
import com.example.sns.dto.request.AdminMemberCreateRequest;
import com.example.sns.dto.request.AdminMemberUpdateRequest;
import com.example.sns.dto.request.MemberJoinRequest;
import com.example.sns.dto.request.MemberUpdateRequest;
import com.example.sns.dto.response.MemberResponse;
import com.example.sns.exception.BusinessException;
import com.example.sns.exception.ErrorCode;
import com.example.sns.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 회원 서비스.
 *
 * RULE 2.3: 트랜잭션 경계 Service 계층.
 * RULE 1.5.6: BCrypt 비밀번호 해싱.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 회원가입.
     *
     * @param request 가입 요청
     * @return 생성된 회원 응답
     * @throws BusinessException 중복 이메일 시 DUPLICATE_EMAIL
     */
    @Transactional
    public MemberResponse join(MemberJoinRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            log.warn("회원가입 실패: 중복 이메일, email={}", request.email());
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }

        String passwordHash = passwordEncoder.encode(request.password());
        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordHash)
                .nickname(request.nickname())
                .role(UserRole.USER)
                .build();

        User saved = userRepository.save(user);
        log.info("회원가입 성공: userId={}, email={}", saved.getId(), saved.getEmail());
        return MemberResponse.from(saved);
    }

    /**
     * 개인정보 수정. 본인만.
     *
     * @param currentUser 현재 로그인 사용자
     * @param request     수정 요청 (닉네임 등)
     * @return 수정된 회원 응답
     * @throws BusinessException 존재하지 않으면 NOT_FOUND
     */
    @Transactional
    public MemberResponse updateMe(User currentUser, MemberUpdateRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "회원을 찾을 수 없습니다."));
        user.updateNickname(request.nickname());
        log.info("개인정보 수정: userId={}, nickname={}", user.getId(), request.nickname());
        return MemberResponse.from(user);
    }

    /**
     * 회원 ID로 조회.
     *
     * @param id 회원 ID
     * @return 회원 응답
     * @throws BusinessException 존재하지 않으면 NOT_FOUND
     */
    @Transactional(readOnly = true)
    public MemberResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "회원을 찾을 수 없습니다."));
        return MemberResponse.from(user);
    }

    /**
     * 관리자용 회원 목록. 페이징·검색(이메일·닉네임).
     */
    @Transactional(readOnly = true)
    public Page<MemberResponse> getListForAdmin(String keyword, Pageable pageable) {
        return userRepository.findAllByKeyword(keyword, pageable)
                .map(MemberResponse::from);
    }

    /**
     * 관리자에 의한 회원 등록. 역할 지정 가능.
     */
    @Transactional
    public MemberResponse createByAdmin(AdminMemberCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            log.warn("관리자 회원 추가 실패: 중복 이메일, email={}", request.email());
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }
        String passwordHash = passwordEncoder.encode(request.password());
        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordHash)
                .nickname(request.nickname())
                .role(request.role())
                .build();
        User saved = userRepository.save(user);
        log.info("관리자 회원 추가: userId={}, email={}, role={}", saved.getId(), saved.getEmail(), request.role());
        return MemberResponse.from(saved);
    }

    /**
     * 관리자에 의한 회원 수정. 프로필·역할.
     */
    @Transactional
    public MemberResponse updateByAdmin(Long id, AdminMemberUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "회원을 찾을 수 없습니다."));
        user.updateByAdmin(request.nickname(), request.role());
        log.info("관리자 회원 수정: userId={}, nickname={}, role={}", user.getId(), request.nickname(), request.role());
        return MemberResponse.from(user);
    }

    /**
     * 관리자에 의한 회원 삭제.
     */
    @Transactional
    public void deleteByAdmin(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "회원을 찾을 수 없습니다."));
        userRepository.delete(user);
        log.info("관리자 회원 삭제: userId={}", id);
    }
}
