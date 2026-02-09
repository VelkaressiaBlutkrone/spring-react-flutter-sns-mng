package com.example.sns.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.example.sns.domain.UserRole;
import com.example.sns.dto.request.AdminMemberCreateRequest;
import com.example.sns.dto.request.AdminMemberUpdateRequest;
import com.example.sns.exception.BusinessException;
import com.example.sns.exception.ErrorCode;
import com.example.sns.service.AuthService;
import com.example.sns.service.MemberService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 관리자 회원 관리 웹 뷰 컨트롤러.
 *
 * Step 15: ROLE_ADMIN 전용. 회원 목록·추가·수정·삭제.
 * RULE 1.2: ROLE_ADMIN만 접근.
 */
@Slf4j
@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminMemberViewController {

    private final MemberService memberService;
    private final AuthService authService;

    /**
     * 관리자 대시보드. 회원 관리로 리다이렉트.
     */
    @GetMapping
    public String adminHome() {
        return "redirect:/admin/members";
    }

    /**
     * 회원 목록. 페이징·검색.
     */
    @GetMapping("/members")
    public String memberList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            Model model) {
        ensureAdmin();
        Pageable pageable = PageRequest.of(page, size);
        model.addAttribute("members", memberService.getListForAdmin(keyword, pageable));
        model.addAttribute("keyword", keyword);
        return "admin/member-list";
    }

    /**
     * 회원 추가 폼.
     */
    @GetMapping("/members/new")
    public String memberCreateForm(Model model) {
        ensureAdmin();
        model.addAttribute("roles", UserRole.values());
        return "admin/member-form";
    }

    /**
     * 회원 추가 제출.
     */
    @PostMapping("/members")
    public String memberCreateSubmit(
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String nickname,
            @RequestParam UserRole role,
            RedirectAttributes redirectAttributes) {
        ensureAdmin();
        try {
            var request = new AdminMemberCreateRequest(email, password, nickname, role);
            memberService.createByAdmin(request);
            redirectAttributes.addFlashAttribute("message", "회원이 등록되었습니다.");
        } catch (BusinessException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            redirectAttributes.addFlashAttribute("email", email);
            redirectAttributes.addFlashAttribute("nickname", nickname);
            return "redirect:/admin/members/new";
        }
        return "redirect:/admin/members";
    }

    /**
     * 회원 상세·수정 폼.
     */
    @GetMapping("/members/{id}")
    public String memberEditForm(@PathVariable Long id, Model model) {
        ensureAdmin();
        model.addAttribute("member", memberService.getById(id));
        model.addAttribute("roles", UserRole.values());
        return "admin/member-edit";
    }

    /**
     * 회원 수정 제출.
     */
    @PostMapping("/members/{id}")
    public String memberUpdateSubmit(
            @PathVariable Long id,
            @RequestParam String nickname,
            @RequestParam UserRole role,
            RedirectAttributes redirectAttributes) {
        ensureAdmin();
        memberService.updateByAdmin(id, new AdminMemberUpdateRequest(nickname, role));
        redirectAttributes.addFlashAttribute("message", "회원 정보가 수정되었습니다.");
        return "redirect:/admin/members/" + id;
    }

    /**
     * 회원 삭제.
     */
    @PostMapping("/members/{id}/delete")
    public String memberDelete(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        ensureAdmin();
        memberService.deleteByAdmin(id);
        redirectAttributes.addFlashAttribute("message", "회원이 삭제되었습니다.");
        return "redirect:/admin/members";
    }

    private void ensureAdmin() {
        authService.getCurrentUserEntity()
                .filter(u -> u.getRole() == UserRole.ADMIN)
                .orElseThrow(() -> new BusinessException(ErrorCode.FORBIDDEN, "관리자만 접근할 수 있습니다."));
    }
}
