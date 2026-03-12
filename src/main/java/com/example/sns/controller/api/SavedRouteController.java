package com.example.sns.controller.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.sns.dto.request.SavedRouteCreateRequest;
import com.example.sns.dto.response.SavedRouteResponse;
import com.example.sns.service.AuthService;
import com.example.sns.service.SavedRouteService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/saved-routes")
@RequiredArgsConstructor
public class SavedRouteController {

    private final SavedRouteService savedRouteService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<SavedRouteResponse>> getMyRoutes(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = authService.getCurrentUser(userDetails.getUsername()).getId();
        return ResponseEntity.ok(savedRouteService.getByUser(userId));
    }

    @PostMapping
    public ResponseEntity<SavedRouteResponse> saveRoute(
            @Valid @RequestBody SavedRouteCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = authService.getCurrentUser(userDetails.getUsername()).getId();
        return ResponseEntity.ok(savedRouteService.save(userId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoute(@PathVariable Long id,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = authService.getCurrentUser(userDetails.getUsername()).getId();
        savedRouteService.delete(id, userId);
        return ResponseEntity.ok().build();
    }
}
