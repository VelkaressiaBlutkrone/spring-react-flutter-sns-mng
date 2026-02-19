package com.example.sns.util.haversine;

/**
 * Haversine 공식으로 두 좌표 간 직선 거리(미터) 계산.
 */
public final class HaversineUtil {

    private static final double EARTH_RADIUS_METERS = 6_371_000;

    private HaversineUtil() {
    }

    /**
     * 두 위경도 좌표 간 직선 거리(미터).
     *
     * @param lat1 출발지 위도
     * @param lng1 출발지 경도
     * @param lat2 목적지 위도
     * @param lng2 목적지 경도
     * @return 거리(미터)
     */
    public static double distanceMeters(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_METERS * c;
    }
}
