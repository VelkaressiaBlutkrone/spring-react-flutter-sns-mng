/**
 * Haversine 공식으로 두 위경도 간 거리(km) 계산.
 * TASK_WEB Step 5 거리·경로 시각화.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * 두 좌표 간 직선 거리(km) 반환.
 */
export function haversineDistance(a: LatLng, b: LatLng): number {
  const R = 6371; // 지구 반경(km)
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * 거리를 "X.XX km" 또는 "XXX m" 형식으로 포맷.
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(2)} km`;
}
