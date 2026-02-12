/**
 * 브라우저 Geolocation API 훅 (TASK_WEB Step 4).
 * navigator.geolocation, 권한 거부 시 폴백 처리.
 */
import { useState, useEffect, useCallback } from 'react';

export interface UseGeolocationResult {
  position: { lat: number; lng: number } | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** 서울 중심 기본 좌표 (폴백) */
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export function useGeolocation(): UseGeolocationResult {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setPosition(DEFAULT_CENTER);
      setError('위치 기능을 지원하지 않는 브라우저입니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setError(null);
        setLoading(false);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('위치 권한이 거부되었습니다.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('위치 정보를 사용할 수 없습니다.');
            break;
          case err.TIMEOUT:
            setError('위치 권한 요청 시간이 초과되었습니다.');
            break;
          default:
            setError('위치를 가져올 수 없습니다.');
        }
        setPosition(DEFAULT_CENTER);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  return { position, loading, error, refetch: fetchPosition };
}
