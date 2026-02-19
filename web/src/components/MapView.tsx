/**
 * 지도 뷰 컴포넌트 (TASK_WEB Step 4).
 * Kakao Map 기반, 환경 변수 VITE_MAP_KAKAO_JS_APP_KEY 주입 (RULE 1.1).
 * 기본 커서: default, 드래그 시에만 grab/grabbing.
 */
import { useState } from 'react';
import { Map, useKakaoLoader } from 'react-kakao-maps-sdk';

const KAKAO_APP_KEY = import.meta.env.VITE_MAP_KAKAO_JS_APP_KEY ?? '';

export interface MapViewProps {
  center: { lat: number; lng: number };
  level?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** 지도 클릭 시 (lat, lng) 콜백. Step 5 LocationPicker용. */
  onMapClick?: (lat: number, lng: number) => void;
  /** 지도 드래그 가능 여부. false면 클릭 시 핀 추가만. */
  draggable?: boolean;
  /** 지도 중심 변경 시 (드래그 후) 콜백 */
  onCenterChanged?: (lat: number, lng: number) => void;
}

export function MapView({ center, level = 5, style, children, onMapClick, draggable = true, onCenterChanged }: MapViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, error] = useKakaoLoader({
    appkey: KAKAO_APP_KEY,
    libraries: [],
  });

  if (!KAKAO_APP_KEY) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 text-gray-600"
        style={style ?? { width: '100%', height: '400px' }}
      >
        카카오맵 API 키가 설정되지 않았습니다. .env에 VITE_MAP_KAKAO_JS_APP_KEY를 설정하세요.
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 text-gray-600"
        style={style ?? { width: '100%', height: '400px' }}
      >
        지도 로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center bg-red-50 text-red-600"
        style={style ?? { width: '100%', height: '400px' }}
      >
        지도를 불러오지 못했습니다.
      </div>
    );
  }

  const handleClick = onMapClick
    ? (_map: unknown, mouseEvent: { latLng: { getLat: () => number; getLng: () => number } }) => {
        const latLng = mouseEvent.latLng;
        onMapClick(latLng.getLat(), latLng.getLng());
      }
    : undefined;

  const handleCenterChanged = onCenterChanged
    ? (map: { getCenter: () => { getLat: () => number; getLng: () => number } }) => {
        const c = map.getCenter();
        onCenterChanged(c.getLat(), c.getLng());
      }
    : undefined;

  const mapStyle: React.CSSProperties = {
    ...(style ?? { width: '100%', height: '400px' }),
    cursor: draggable && isDragging ? 'grabbing' : 'default',
  };

  return (
    <Map
      center={center}
      level={level}
      style={mapStyle}
      onClick={handleClick}
      draggable={draggable}
      onCenterChanged={handleCenterChanged}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
    >
      {children}
    </Map>
  );
}
