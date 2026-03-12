package com.example.sns.controller.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.sns.service.AuthService;
import com.example.sns.service.PostLikeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PostLikeController {

    private final PostLikeService postLikeService;
    private final AuthService authService;

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<Void> like(@PathVariable Long id,
                                     @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = authService.getCurrentUser(userDetails.getUsername()).getId();
        postLikeService.like(userId, id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/posts/{id}/like")
    public ResponseEntity<Void> unlike(@PathVariable Long id,
                                       @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = authService.getCurrentUser(userDetails.getUsername()).getId();
        postLikeService.unlike(userId, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile/liked-post-ids")
    public ResponseEntity<List<Long>> getLikedPostIds(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = authService.getCurrentUser(userDetails.getUsername()).getId();
        return ResponseEntity.ok(postLikeService.getLikedPostIds(userId));
    }
}
