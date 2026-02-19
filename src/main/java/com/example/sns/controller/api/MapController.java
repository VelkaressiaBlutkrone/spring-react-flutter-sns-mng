package com.example.sns.controller.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.sns.service.map.KakaoMobilityDirectionsService;
import com.example.sns.service.map.KakaoMobilityDirectionsService.DirectionsResult;
import com.example.sns.util.haversine.HaversineUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 지도 API — 경로·거리 조회.
 *
 * <p>
 * Kakao Mobility Directions API로 실제 도로 경로 및 이동 거리 제공.
 * API 키 미설정 시 직선 거리(Haversine)만 반환.
 */
@Tag(name = "Map", description = "지도 경로·거리 조회")
@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
public class MapController {

    private final KakaoMobilityDirectionsService directionsService;

    @Operation(summary = "경로·거리 조회", description = "출발지→목적지 실제 도로 경로 및 이동 거리. API 미설정 시 직선 거리만 반환")
    @GetMapping("/directions")
    public ResponseEntity<DirectionsResponse> getDirections(
            @Parameter(description = "출발지 위도") @RequestParam double originLat,
            @Parameter(description = "출발지 경도") @RequestParam double originLng,
            @Parameter(description = "목적지 위도") @RequestParam double destLat,
            @Parameter(description = "목적지 경도") @RequestParam double destLng) {

        DirectionsResult result = directionsService.getDirections(originLat, originLng, destLat, destLng);

        if (result != null) {
            List<Coord> path = result.path().stream()
                    .map(p -> new Coord(p[0], p[1]))
                    .toList();
            return ResponseEntity.ok(new DirectionsResponse(path, result.distanceMeters(), true));
        }

        // Fallback: 직선 거리
        double distanceMeters = HaversineUtil.distanceMeters(originLat, originLng, destLat, destLng);
        List<Coord> path = List.of(
                new Coord(originLat, originLng),
                new Coord(destLat, destLng));
        return ResponseEntity.ok(new DirectionsResponse(path, (int) Math.round(distanceMeters), false));
    }

    public record Coord(double lat, double lng) {
    }

    public record DirectionsResponse(List<Coord> path, int distanceMeters, boolean isRoadRoute) {
    }
}
