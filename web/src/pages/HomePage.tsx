/**
 * 홈 페이지 — 지도 + 최근 게시글 5건 + 최근 이미지 게시글 5건.
 * - 반경 500m 내 게시글/이미지 게시글 핀 표시, 클릭 시 해당 글로 이동
 * - 경로 확인: 두 지점 추가 후 경로 유형 선택(추천길/빠른길/최단길) 및 거리 표시
 * - 두 지점 설정 완료 후 지도 드래그 가능
 */
import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapMarker, Polyline } from 'react-kakao-maps-sdk';
import { authApi } from '@/api/auth';
import { postsApi } from '@/api/posts';
import { imagePostsApi } from '@/api/imagePosts';
import { pinsApi } from '@/api/pins';
import {
  mapApi,
  ROUTE_PRIORITY_LABELS,
  ROUTE_PRIORITY_COLORS,
  TRANSPORT_MODE_LABELS,
  TRANSPORT_ROUTE_OPTIONS,
} from '@/api/map';
import type { RoutePriority, TransportMode } from '@/api/map';
import { useAuthStore } from '@/store/authStore';
import { MapView } from '@/components/MapView';
import { PinMarker } from '@/components/PinMarker';
import { PostMarker } from '@/components/PostMarker';
import { KakaoMapLinks } from '@/components/KakaoMapLinks';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getImageUrl } from '@/utils/imageUrl';
import { haversineDistance, formatDistance } from '@/utils/haversine';
import type { PostMarkerData } from '@/components/PostMarker';

const PIN_RADIUS_KM = 10;
const POST_RADIUS_KM = 0.5; // 500m

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { position, loading: geoLoading, error: geoError, refetch } = useGeolocation();
  const initialCenter = position ?? { lat: 37.5665, lng: 126.978 };
  const centerLat = initialCenter.lat;
  const centerLng = initialCenter.lng;

  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<Array<{ lat: number; lng: number }>>([]);
  const [transportMode, setTransportMode] = useState<TransportMode>('CAR');
  const [routePriority, setRoutePriority] = useState<RoutePriority>('RECOMMEND');
  const pointsComplete = measurePoints.length === 2;

  // 이동수단 변경 시 현재 경로 유형이 유효하지 않으면 첫 번째 옵션으로 초기화
  const handleTransportModeChange = useCallback((mode: TransportMode) => {
    setTransportMode(mode);
    setRoutePriority((prev) => {
      const options = TRANSPORT_ROUTE_OPTIONS[mode];
      return options.includes(prev) ? prev : options[0];
    });
  }, []);

  useEffect(() => {
    setMapCenter({ lat: centerLat, lng: centerLng });
  }, [centerLat, centerLng]);

  const handleCenterChanged = useCallback((lat: number, lng: number) => {
    setMapCenter({ lat, lng });
  }, []);

  const handleMeasureClick = useCallback((lat: number, lng: number) => {
    setMeasurePoints((prev) => {
      if (prev.length >= 2) return [{ lat, lng }];
      return [...prev, { lat, lng }];
    });
  }, []);

  const handleClearMeasure = useCallback(() => {
    setMeasurePoints([]);
  }, []);

  const { data: pinsData } = useQuery({
    queryKey: ['pins', 'nearby', mapCenter.lat, mapCenter.lng, PIN_RADIUS_KM],
    queryFn: () =>
      pinsApi.nearby({
        lat: mapCenter.lat,
        lng: mapCenter.lng,
        radiusKm: PIN_RADIUS_KM,
        page: 0,
        size: 100,
      }),
    enabled: !geoLoading,
  });

  const { data: postsNearbyData } = useQuery({
    queryKey: ['posts', 'nearby', mapCenter.lat, mapCenter.lng, POST_RADIUS_KM],
    queryFn: () =>
      postsApi.nearby({
        lat: mapCenter.lat,
        lng: mapCenter.lng,
        radiusKm: POST_RADIUS_KM,
        page: 0,
        size: 50,
      }),
    enabled: !geoLoading,
  });

  const { data: imagePostsNearbyData } = useQuery({
    queryKey: ['image-posts', 'nearby', mapCenter.lat, mapCenter.lng, POST_RADIUS_KM],
    queryFn: () =>
      imagePostsApi.nearby({
        lat: mapCenter.lat,
        lng: mapCenter.lng,
        radiusKm: POST_RADIUS_KM,
        page: 0,
        size: 50,
      }),
    enabled: !geoLoading,
  });

  const [p0, p1] = measurePoints;
  const { data: directionsData } = useQuery({
    queryKey: ['map', 'directions', p0?.lat, p0?.lng, p1?.lat, p1?.lng, transportMode, routePriority],
    queryFn: () =>
      mapApi.directions({
        originLat: p0!.lat,
        originLng: p0!.lng,
        destLat: p1!.lat,
        destLng: p1!.lng,
        transportMode,
        routeType: routePriority,
      }),
    enabled: pointsComplete && p0 != null && p1 != null,
    staleTime: 0,
    gcTime: 0,
  });

  const { data: postsData } = useQuery({
    queryKey: ['posts', 'recent', 5],
    queryFn: () => postsApi.list({ page: 0, size: 5 }),
  });

  const { data: imagePostsData } = useQuery({
    queryKey: ['image-posts', 'recent', 5],
    queryFn: () => imagePostsApi.list({ page: 0, size: 5 }),
  });

  const pins = pinsData?.data?.content ?? [];
  const postsNearby = postsNearbyData?.data?.content ?? [];
  const imagePostsNearby = imagePostsNearbyData?.data?.content ?? [];
  const recentPosts = postsData?.data?.content ?? [];
  const recentImagePosts = imagePostsData?.data?.content ?? [];

  const postMarkers: PostMarkerData[] = [
    ...postsNearby
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => ({
        id: p.id,
        title: p.title,
        latitude: p.latitude!,
        longitude: p.longitude!,
        type: 'post' as const,
      })),
    ...imagePostsNearby
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => ({
        id: p.id,
        title: p.title,
        latitude: p.latitude!,
        longitude: p.longitude!,
        type: 'imagePost' as const,
      })),
  ];

  const directionsResponse = directionsData?.data;
  const measurePath = directionsResponse?.path ?? (pointsComplete ? measurePoints : null);
  const straightDistance = pointsComplete ? haversineDistance(measurePoints[0], measurePoints[1]) : null;
  const measureDistanceKm =
    directionsResponse != null ? directionsResponse.distanceMeters / 1000 : straightDistance;
  const isRoadRoute = directionsResponse?.isRoadRoute ?? false;
  const nextPointLabel = measurePoints.length > 0 ? '도착지(2번째)' : '출발지(1번째)';
  const bikeNote = transportMode === 'BIKE' ? ' ※ 자전거/오토바이는 자동차 경로 기반으로 표시됩니다.' : '';

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-xl font-bold text-slate-900">
            지도 SNS
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              게시글
            </Link>
            <Link to="/image-posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              이미지
            </Link>
            <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              About
            </Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin/members" className="text-sm font-medium text-amber-600 hover:text-amber-500">
                관리자
              </Link>
            )}
            {accessToken ? (
              <>
                {user && (
                  <Link to="/me" className="text-sm text-slate-600 hover:text-slate-900">
                    {user.nickname}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  로그인
                </Link>
                <Link to="/signup" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {geoError && (
          <div className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {geoError} 기본 위치(서울)로 표시됩니다.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3 space-y-2">
                {/* ── 1행: 제목 + 상단 버튼 ── */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold text-slate-900">지도</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* 경로 확인 토글 */}
                    <button
                      type="button"
                      onClick={() => {
                        setMeasureMode((m) => !m);
                        if (measureMode) setMeasurePoints([]);
                      }}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                        measureMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      경로 확인
                    </button>
                    {measureMode && measurePoints.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearMeasure}
                        className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                      >
                        초기화
                      </button>
                    )}
                    {/* 거리 표시 */}
                    {measureDistanceKm != null && (
                      <span
                        className="text-sm font-semibold"
                        style={{ color: isRoadRoute ? ROUTE_PRIORITY_COLORS[routePriority] : '#64748b' }}
                      >
                        거리: {formatDistance(measureDistanceKm)}
                        {isRoadRoute && (
                          <span className="ml-1 text-xs font-normal text-slate-500">(도로)</span>
                        )}
                      </span>
                    )}
                    <KakaoMapLinks
                      latitude={mapCenter.lat}
                      longitude={mapCenter.lng}
                      name="지도 중심"
                      compact
                    />
                    <button
                      type="button"
                      onClick={refetch}
                      className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                      위치 새로고침
                    </button>
                  </div>
                </div>

                {/* ── 2행: 이동수단 선택 (경로 확인 모드에서만 표시) ── */}
                {measureMode && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500 shrink-0">이동수단</span>
                    <div className="flex rounded-md border border-slate-200 overflow-hidden text-xs font-medium">
                      {(Object.keys(TRANSPORT_MODE_LABELS) as TransportMode[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => handleTransportModeChange(mode)}
                          className={`px-3 py-1.5 transition ${
                            transportMode === mode
                              ? 'bg-slate-700 text-white'
                              : 'bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {TRANSPORT_MODE_LABELS[mode]}
                        </button>
                      ))}
                    </div>
                    {/* 경로 유형 선택 (두 지점 완료 후 표시) */}
                    {pointsComplete && (
                      <div className="flex rounded-md border border-slate-200 overflow-hidden text-xs font-medium">
                        {TRANSPORT_ROUTE_OPTIONS[transportMode].map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setRoutePriority(key)}
                            style={
                              routePriority === key
                                ? { backgroundColor: ROUTE_PRIORITY_COLORS[key], color: '#fff' }
                                : {}
                            }
                            className={`px-3 py-1.5 transition ${
                              routePriority === key
                                ? ''
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {ROUTE_PRIORITY_LABELS[key]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="h-[400px] lg:h-[500px]">
                <MapView
                  center={initialCenter}
                  style={{ width: '100%', height: '100%' }}
                  // 두 지점 설정 완료 후에는 드래그로 지도 탐색 허용
                  draggable={true}
                  onCenterChanged={handleCenterChanged}
                  onMapClick={measureMode ? handleMeasureClick : undefined}
                >
                  {position && (
                    <MapMarker position={position}>
                      <div className="rounded bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow">
                        현재 위치
                      </div>
                    </MapMarker>
                  )}
                  {!geoLoading && pins.map((pin) => <PinMarker key={`pin-${pin.id}`} pin={pin} />)}
                  {postMarkers.map((p) => (
                    <PostMarker key={`${p.type}-${p.id}`} post={p} />
                  ))}
                  {measurePoints.map((pt, i) => (
                    <MapMarker key={`measure-${i}`} position={pt}>
                      <div
                        className="rounded px-2 py-1 text-xs font-medium text-white"
                        style={{ backgroundColor: i === 0 ? '#2563eb' : '#dc2626' }}
                      >
                        {i === 0 ? '출발' : '도착'}
                      </div>
                    </MapMarker>
                  ))}
                  {measurePath != null && measurePath.length >= 2 && (
                    <Polyline
                      path={measurePath}
                      strokeColor={isRoadRoute ? ROUTE_PRIORITY_COLORS[routePriority] : '#94a3b8'}
                      strokeWeight={5}
                      strokeOpacity={0.85}
                    />
                  )}
                </MapView>
              </div>
              {measureMode && (
                <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
                  {pointsComplete
                    ? `이동수단·경로 유형을 변경해 경로를 비교할 수 있습니다. 지도 드래그로 탐색 가능합니다.${bikeNote}`
                    : `이동수단을 선택하고 지도를 클릭해 ${nextPointLabel} 지점을 선택하세요.`}
                </p>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">최근 게시글</h2>
                  <Link to="/posts" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    전체
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {recentPosts.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    게시글이 없습니다.
                  </div>
                ) : (
                  recentPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/posts/${post.id}`}
                      className="block px-4 py-3 hover:bg-slate-50"
                    >
                      <div className="font-medium text-slate-900 line-clamp-1">{post.title}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {post.authorNickname} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">최근 이미지</h2>
                  <Link to="/image-posts" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    전체
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-slate-100 p-4">
                {recentImagePosts.length === 0 ? (
                  <div className="py-6 text-center text-sm text-slate-500">
                    이미지 게시글이 없습니다.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {recentImagePosts.map((post) => (
                      <Link
                        key={post.id}
                        to={`/image-posts/${post.id}`}
                        className="group overflow-hidden rounded-lg border border-slate-100"
                      >
                        <div className="aspect-square overflow-hidden bg-slate-100">
                          <img
                            src={getImageUrl(post.imageUrl)}
                            alt={post.title}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        </div>
                        <div className="truncate px-2 py-1.5 text-xs font-medium text-slate-700">
                          {post.title}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
