/**
 * 지도 API — 경로·거리 조회.
 * Kakao Mobility Directions API로 실제 도로 경로 및 이동 거리.
 */
import { apiClient } from './client';

export interface DirectionsParams {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
}

export interface DirectionsResponse {
  path: Array<{ lat: number; lng: number }>;
  distanceMeters: number;
  isRoadRoute: boolean;
}

export const mapApi = {
  /** 출발지→목적지 경로·거리 조회. 실제 도로 경로 또는 직선 거리 */
  directions: (params: DirectionsParams) =>
    apiClient.get<DirectionsResponse>('/api/map/directions', {
      params: {
        originLat: params.originLat,
        originLng: params.originLng,
        destLat: params.destLat,
        destLng: params.destLng,
      },
    }),
};
