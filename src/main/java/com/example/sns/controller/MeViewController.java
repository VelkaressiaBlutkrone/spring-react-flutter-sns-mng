package com.example.sns.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.example.sns.domain.User;
import com.example.sns.dto.request.MemberUpdateRequest;
import com.example.sns.exception.BusinessException;
import com.example.sns.exception.ErrorCode;
import com.example.sns.service.AuthService;
import com.example.sns.service.ImagePostService;
import com.example.sns.service.MemberService;
import com.example.sns.service.PinService;
import com.example.sns.service.PostService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 마이페이지·About 웹 뷰 컨트롤러.
 *
 * Step 14: 내 게시글·이미지 게시글·Pin 목록, 개인정보 수정, About 페이지.
 * RULE 1.2: 로그인 필수.
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class MeViewController {

    private final PostService postService;
    private final ImagePostService imagePostService;
    private final PinService pinService;
    private final MemberService memberService;
    private final AuthService authService;

    /**
     * 마이페이지. 내 게시글·이미지 게시글·Pin 목록.
     */
    @GetMapping("/me")
    public String myPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Model model) {
        User currentUser = authService.getCurrentUserEntity()
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        Pageable pageable = PageRequest.of(page, size);

        model.addAttribute("member", memberService.getById(currentUser.getId()));
        model.addAttribute("posts", postService.getListByAuthor(currentUser, pageable));
        model.addAttribute("imagePosts", imagePostService.getListByAuthor(currentUser, pageable));
        model.addAttribute("pins", pinService.getListByOwner(currentUser, pageable));
        return "my-page";
    }

    /**
     * 개인정보 수정 폼.
     */
    @GetMapping("/me/edit")
    public String editProfileForm(Model model) {
        User currentUser = authService.getCurrentUserEntity()
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        model.addAttribute("member", memberService.getById(currentUser.getId()));
        return "me-edit";
    }

    /**
     * 개인정보 수정 제출.
     */
    @PostMapping("/me/edit")
    public String editProfileSubmit(
            @RequestParam String nickname,
            RedirectAttributes redirectAttributes) {
        User currentUser = authService.getCurrentUserEntity()
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        memberService.updateMe(currentUser, new MemberUpdateRequest(nickname));
        log.info("웹 개인정보 수정: userId={}", currentUser.getId());
        redirectAttributes.addFlashAttribute("message", "개인정보가 수정되었습니다.");
        return "redirect:/me";
    }

    /**
     * About 페이지. 서비스 소개·지도 SNS 컨셉·기술 스택.
     */
    @GetMapping("/about")
    public String about() {
        return "about";
    }
}
