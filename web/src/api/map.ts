/**
 * 지도 API — 경로·거리 조회.
 * Kakao Mobility Directions API로 실제 도로 경로 및 이동 거리.
 */
import { apiClient } from './client';

/** 이동수단 */
export type TransportMode = 'WALK' | 'BIKE' | 'CAR';

/**
 * 경로 유형
 * - RECOMMEND : 추천길(최단거리)
 * - MAIN_ROAD : 큰길 우선 (자동차/자전거, 좁은 도로 회피)
 * - NO_STAIRS : 계단회피 (도보, stairway 회피)
 */
export type RoutePriority = 'RECOMMEND' | 'MAIN_ROAD' | 'NO_STAIRS';

export const TRANSPORT_MODE_LABELS: Record<TransportMode, string> = {
  WALK: '도보',
  BIKE: '자전거/오토바이',
  CAR:  '자동차',
};

/** 이동수단별 사용 가능한 경로 유형 */
export const TRANSPORT_ROUTE_OPTIONS: Record<TransportMode, RoutePriority[]> = {
  WALK: ['RECOMMEND', 'NO_STAIRS'],
  BIKE: ['RECOMMEND', 'MAIN_ROAD'],
  CAR:  ['RECOMMEND', 'MAIN_ROAD'],
};

export const ROUTE_PRIORITY_LABELS: Record<RoutePriority, string> = {
  RECOMMEND: '추천길(최단거리)',
  MAIN_ROAD: '큰길 우선',
  NO_STAIRS: '계단회피',
};

export const ROUTE_PRIORITY_COLORS: Record<RoutePriority, string> = {
  RECOMMEND:  '#2563eb', // blue  — 추천길
  MAIN_ROAD:  '#16a34a', // green — 큰길 우선
  NO_STAIRS:  '#9333ea', // purple — 계단회피 도보
};

export interface DirectionsParams {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  transportMode?: TransportMode;
  routeType?: RoutePriority;
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
        transportMode: params.transportMode ?? 'CAR',
        routeType: params.routeType ?? 'RECOMMEND',
      },
    }),
};
