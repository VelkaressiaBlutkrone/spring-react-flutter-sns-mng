package com.example.sns.service.map;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.sns.config.map.MapProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Kakao Mobility Directions API — 실제 도로 경로·이동 거리 조회.
 * https://developers.kakaomobility.com/docs/navi-api/directions/
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoMobilityDirectionsService {

    private static final String CAR_API_URL  = "https://apis-navi.kakaomobility.com/v1/directions";
    private static final String WALK_API_URL = "https://apis-navi.kakaomobility.com/v1/directions/walk";
    // 프로젝트가 Gson 기반이라 ObjectMapper Spring 빈이 없음 → Jackson 인스턴스 직접 생성
    private static final ObjectMapper JSON = new ObjectMapper();

    private final MapProperties mapProperties;
    private final RestTemplate restTemplate;

    /** 기본(자동차 최단거리) 경로 조회. */
    public DirectionsResult getDirections(double originLat, double originLng, double destLat, double destLng) {
        return getDirections(originLat, originLng, destLat, destLng, "CAR", "RECOMMEND");
    }

    /** 이동수단 없이 경로 유형만 지정 시 자동차 경로로 위임. */
    public DirectionsResult getDirections(double originLat, double originLng, double destLat, double destLng,
            String routeType) {
        return getDirections(originLat, originLng, destLat, destLng, "CAR", routeType);
    }

    /**
     * 이동수단과 경로 유형을 지정하여 출발지→목적지 도로 경로·거리 조회.
     *
     * <p>이동수단(transportMode) × 경로 유형(routeType) → Kakao Mobility API 매핑:
     * <ul>
     *   <li>WALK + RECOMMEND → 도보 API (기본)</li>
     *   <li>WALK + NO_STAIRS → 도보 API + avoid=stairway</li>
     *   <li>BIKE/CAR + RECOMMEND → 자동차 API priority=DISTANCE (최단거리)</li>
     *   <li>BIKE/CAR + MAIN_ROAD → 자동차 API priority=RECOMMEND + avoid=difficult (큰길 우선)</li>
     * </ul>
     * ※ 자전거·오토바이 전용 API 미제공으로 자동차 API 경로를 대신 사용합니다.
     *
     * @param transportMode WALK | BIKE | CAR
     * @param routeType     RECOMMEND | MAIN_ROAD | NO_STAIRS
     * @return 경로 좌표 리스트 + 이동 거리(미터), 실패 시 null
     */
    @SuppressWarnings("java:S3776")
    public DirectionsResult getDirections(double originLat, double originLng, double destLat, double destLng,
            String transportMode, String routeType) {
        String apiKey = mapProperties.kakaoMobilityApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Kakao Mobility API 키 미설정 — 직선 거리 fallback 사용");
            return null;
        }

        String mode = (transportMode == null || transportMode.isBlank()) ? "CAR" : transportMode.toUpperCase();
        String type = (routeType == null || routeType.isBlank()) ? "RECOMMEND" : routeType.toUpperCase();

        // Kakao Mobility: origin/destination 파라미터는 "경도,위도" (x=lng, y=lat) 순서
        String origin = originLng + "," + originLat;
        String destination = destLng + "," + destLat;

        // 이동수단·경로 유형별 URL 분기
        UriComponentsBuilder builder;
        if ("WALK".equals(mode)) {
            // Walk API: origin/destination 형식이 "name,x(경도),y(위도)" — name 필드 필수
            // name 없이 "lng,lat" 형식으로 전송하면 -404 "route not found" 반환
            String walkOrigin      = "출발지," + origin;
            String walkDestination = "목적지," + destination;
            builder = UriComponentsBuilder.fromUriString(WALK_API_URL)
                    .queryParam("origin", walkOrigin)
                    .queryParam("destination", walkDestination);
            if ("NO_STAIRS".equals(type)) {
                builder = builder.queryParam("avoid", "stairway");
            }
        } else {
            // 자동차·자전거/오토바이 API (BIKE는 전용 API 없으므로 자동차 API 사용)
            if ("MAIN_ROAD".equals(type)) {
                // 큰길 우선: 좁은/어려운 도로 회피
                builder = UriComponentsBuilder.fromUriString(CAR_API_URL)
                        .queryParam("origin", origin)
                        .queryParam("destination", destination)
                        .queryParam("priority", "RECOMMEND")
                        .queryParam("avoid", "difficult");
            } else {
                // RECOMMEND → 최단거리(DISTANCE)
                builder = UriComponentsBuilder.fromUriString(CAR_API_URL)
                        .queryParam("origin", origin)
                        .queryParam("destination", destination)
                        .queryParam("priority", "DISTANCE");
            }
        }

        String url = builder.build().toUriString();

        log.info("Kakao Mobility 경로 요청: origin={}, destination={}, mode={}, routeType={}",
                origin, destination, mode, type);

        try {
            // Kakao Mobility REST API 공식 문서: Authorization + Content-Type 만 필요.
            // KA 헤더는 JavaScript SDK 전용 — REST API 키로 호출 시 불필요.
            // JS 앱 키로 호출하면 KA 헤더 요구 -401 발생 → 카카오디벨로퍼스에서 REST API 키 사용.
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + apiKey);
            headers.set("Content-Type", "application/json");

            // JsonNode.class를 직접 사용하면 Jackson 역직렬화 오류 발생 → String으로 수신 후 readTree
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class);

            String rawBody = response.getBody();
            log.info("Kakao Mobility 응답: status={}, body={}", response.getStatusCode(), rawBody);

            JsonNode body = (rawBody == null || rawBody.isBlank()) ? null : JSON.readTree(rawBody);

            if (body == null || !body.has("routes")) {
                log.warn("Kakao Mobility 응답에 routes 없음: body={}", body);
                return null;
            }

            JsonNode routes = body.get("routes");
            if (routes.isEmpty()) {
                log.warn("Kakao Mobility routes 비어있음");
                return null;
            }

            JsonNode route = routes.get(0);
            int resultCode = route.path("result_code").asInt(-1);
            String resultMsg = route.path("result_msg").asText("unknown");
            if (resultCode != 0) {
                log.warn("Kakao Mobility 경로 탐색 실패: result_code={}, result_msg={}", resultCode, resultMsg);
                return null;
            }

            int distanceMeters = route.path("summary").path("distance").asInt();
            List<double[]> path = new ArrayList<>();

            JsonNode sections = route.path("sections");
            if ("WALK".equals(mode)) {
                // Walk API 응답: sections > guides > { x: 경도, y: 위도 }
                // Car API와 달리 roads/vertexes 없이 guides 배열에 경유 좌표 포함
                for (JsonNode section : sections) {
                    for (JsonNode guide : section.path("guides")) {
                        double lng = guide.path("x").asDouble();
                        double lat = guide.path("y").asDouble();
                        if (lng != 0 && lat != 0) {
                            path.add(new double[]{lat, lng});
                        }
                    }
                }
            } else {
                // Car API 응답: sections > roads > vertexes (평탄 배열 [lng1, lat1, lng2, lat2, ...])
                for (JsonNode section : sections) {
                    for (JsonNode road : section.path("roads")) {
                        JsonNode vertexes = road.path("vertexes");
                        if (vertexes.isArray()) {
                            for (int i = 0; i + 1 < vertexes.size(); i += 2) {
                                double lng = vertexes.get(i).asDouble();
                                double lat = vertexes.get(i + 1).asDouble();
                                path.add(new double[]{lat, lng});
                            }
                        }
                    }
                }
            }

            log.info("Kakao Mobility 경로 추출 완료: mode={}, distanceMeters={}, pathSize={}", mode, distanceMeters, path.size());

            if (path.isEmpty()) {
                log.warn("Kakao Mobility 경로 좌표 없음 — mode={}, routes 구조 확인 필요", mode);
                return null;
            }

            return new DirectionsResult(path, distanceMeters);
        } catch (Exception e) {
            log.warn("Kakao Mobility 경로 조회 예외: {}", e.getMessage());
            return null;
        }
    }

    public record DirectionsResult(List<double[]> path, int distanceMeters) {
    }
}
