/**
 * 카카오 지도 바로가기 URL 유틸 (https://apis.map.kakao.com/web/guide/#whatlibrary)
 * 지도 바로가기, 길찾기, 로드뷰 링크 생성.
 */

const KAKAO_MAP_BASE = 'https://map.kakao.com/link';

export interface LatLng {
  lat: number;
  lng: number;
}

/** 지도 바로가기: 해당 위치를 카카오맵에서 크게 보기 */
export function mapLink(lat: number, lng: number, name?: string): string {
  const coords = `${lat},${lng}`;
  return name ? `${KAKAO_MAP_BASE}/map/${encodeURIComponent(name)},${coords}` : `${KAKAO_MAP_BASE}/map/${coords}`;
}

/** 길찾기 바로가기: 현재 위치 → 목적지 */
export function directionsLink(destLat: number, destLng: number, destName?: string): string {
  const dest = destName ? `${encodeURIComponent(destName)},${destLat},${destLng}` : `${destLat},${destLng}`;
  return `${KAKAO_MAP_BASE}/to/${dest}`;
}

/** 출발지→도착지 길찾기 (이동수단: car, traffic, walk, bicycle) */
export function directionsFromToLink(
  from: LatLng & { name?: string },
  to: LatLng & { name?: string },
  by?: 'car' | 'traffic' | 'walk' | 'bicycle'
): string {
  const fromStr = from.name ? `${encodeURIComponent(from.name)},${from.lat},${from.lng}` : `${from.lat},${from.lng}`;
  const toStr = to.name ? `${encodeURIComponent(to.name)},${to.lat},${to.lng}` : `${to.lat},${to.lng}`;
  if (by) {
    return `${KAKAO_MAP_BASE}/by/${by}/${fromStr}/${toStr}`;
  }
  return `${KAKAO_MAP_BASE}/from/${fromStr}/to/${toStr}`;
}

/** 로드뷰 바로가기 */
export function roadviewLink(lat: number, lng: number): string {
  return `${KAKAO_MAP_BASE}/roadview/${lat},${lng}`;
}
