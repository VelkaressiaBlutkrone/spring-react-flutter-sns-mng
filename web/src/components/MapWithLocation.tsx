/**
 * 위치 표시 지도 컴포넌트 (TASK_WEB Step 5).
 * 게시글 상세 페이지에서 해당 위치·Pin을 지도에 표시.
 * 카카오 지도 바로가기·길찾기·로드뷰 링크 포함.
 */
import { MapMarker } from 'react-kakao-maps-sdk';
import { MapView } from '@/components/MapView';
import { KakaoMapLinks } from '@/components/KakaoMapLinks';

export interface MapWithLocationProps {
  latitude: number;
  longitude: number;
  /** 마커 라벨 (예: "게시글 위치") */
  label?: string;
  style?: React.CSSProperties;
}

export function MapWithLocation({ latitude, longitude, label = '위치', style }: MapWithLocationProps) {
  const center = { lat: latitude, lng: longitude };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" style={style}>
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <KakaoMapLinks latitude={latitude} longitude={longitude} name={label} compact />
      </div>
      <MapView center={center} level={5} style={{ width: '100%', height: '240px' }}>
        <MapMarker position={center}>
          <div className="rounded bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow">
            {label}
          </div>
        </MapMarker>
      </MapView>
    </div>
  );
}
