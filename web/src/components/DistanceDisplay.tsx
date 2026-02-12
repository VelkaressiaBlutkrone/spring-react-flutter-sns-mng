/**
 * 거리 표시 컴포넌트 (TASK_WEB Step 5).
 * Haversine 공식으로 출발(사용자 위치)→도착(목적지) 거리 표시.
 */
import { useGeolocation } from '@/hooks/useGeolocation';
import { haversineDistance, formatDistance } from '@/utils/haversine';

export interface DistanceDisplayProps {
  /** 도착지 위도 */
  destLat: number;
  /** 도착지 경도 */
  destLng: number;
  /** 라벨 (예: "현재 위치에서") */
  label?: string;
}

export function DistanceDisplay({ destLat, destLng, label = '현재 위치에서' }: DistanceDisplayProps) {
  const { position, loading, error } = useGeolocation();

  if (loading) {
    return (
      <p className="text-sm text-gray-500">
        {label} 거리 계산 중...
      </p>
    );
  }

  if (error || !position) {
    return (
      <p className="text-sm text-gray-500">
        {label} 거리를 계산하려면 위치 권한을 허용해 주세요.
      </p>
    );
  }

  const distanceKm = haversineDistance(
    { lat: position.lat, lng: position.lng },
    { lat: destLat, lng: destLng }
  );

  return (
    <p className="text-sm text-gray-600">
      {label} <strong>{formatDistance(distanceKm)}</strong>
    </p>
  );
}
