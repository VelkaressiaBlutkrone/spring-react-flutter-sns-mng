package com.example.sns.controller.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.sns.dto.response.UserProfileResponse;
import com.example.sns.service.FollowService;
import com.example.sns.service.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final MemberService memberService;
    private final FollowService followService;

    @GetMapping("/search")
    public ResponseEntity<List<UserProfileResponse>> searchUsers(@RequestParam String q) {
        return ResponseEntity.ok(memberService.searchUsers(q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(followService.getPublicProfile(id));
    }
}
