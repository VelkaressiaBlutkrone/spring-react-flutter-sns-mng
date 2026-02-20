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
import lombok.extern.slf4j.Slf4j;

/**
 * 지도 API — 경로·거리 조회.
 *
 * <p>
 * Kakao Mobility Directions API로 실제 도로 경로 및 이동 거리 제공.
 * API 키 미설정 시 직선 거리(Haversine)만 반환.
 */
@Slf4j
@Tag(name = "Map", description = "지도 경로·거리 조회")
@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
public class MapController {

    private final KakaoMobilityDirectionsService directionsService;

    @Operation(summary = "경로·거리 조회",
            description = "출발지→목적지 경로·거리. transportMode: WALK|BIKE|CAR, routeType: RECOMMEND|MAIN_ROAD|NO_STAIRS")
    @GetMapping("/directions")
    public ResponseEntity<DirectionsResponse> getDirections(
            @Parameter(description = "출발지 위도") @RequestParam double originLat,
            @Parameter(description = "출발지 경도") @RequestParam double originLng,
            @Parameter(description = "목적지 위도") @RequestParam double destLat,
            @Parameter(description = "목적지 경도") @RequestParam double destLng,
            @Parameter(description = "이동수단: WALK(도보)|BIKE(자전거/오토바이)|CAR(자동차)")
            @RequestParam(defaultValue = "CAR") String transportMode,
            @Parameter(description = "경로 유형: RECOMMEND(추천길/최단거리)|MAIN_ROAD(큰길 우선)|NO_STAIRS(계단회피 도보)")
            @RequestParam(defaultValue = "RECOMMEND") String routeType) {

        log.info("[MapController] directions 요청: ({},{}) → ({},{}), mode={}, routeType={}",
                originLat, originLng, destLat, destLng, transportMode, routeType);
        DirectionsResult result = directionsService.getDirections(
                originLat, originLng, destLat, destLng, transportMode, routeType);

        if (result != null) {
            List<Coord> path = result.path().stream()
                    .map(p -> new Coord(p[0], p[1]))
                    .toList();
            log.info("[MapController] 도로 경로 반환: pathSize={}, distanceMeters={}", path.size(), result.distanceMeters());
            return ResponseEntity.ok(new DirectionsResponse(path, result.distanceMeters(), true));
        }

        // Fallback: 직선 거리
        double distanceMeters = HaversineUtil.distanceMeters(originLat, originLng, destLat, destLng);
        List<Coord> path = List.of(
                new Coord(originLat, originLng),
                new Coord(destLat, destLng));
        log.warn("[MapController] 직선 fallback 반환: distanceMeters={}", (int) Math.round(distanceMeters));
        return ResponseEntity.ok(new DirectionsResponse(path, (int) Math.round(distanceMeters), false));
    }

    public record Coord(double lat, double lng) {
    }

    public record DirectionsResponse(List<Coord> path, int distanceMeters, boolean isRoadRoute) {
    }
}
