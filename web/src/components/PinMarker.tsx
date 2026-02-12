/**
 * Pin 마커 컴포넌트 (TASK_WEB Step 4).
 * Pin 클릭 시 관련 게시글 목록 페이지로 이동.
 * 카카오 지도 바로가기·길찾기·로드뷰 링크 포함.
 */
import { MapMarker } from 'react-kakao-maps-sdk';
import { Link } from 'react-router-dom';
import { KakaoMapLinks } from '@/components/KakaoMapLinks';
import type { PinResponse } from '@/types/pin';

export interface PinMarkerProps {
  pin: PinResponse;
}

export function PinMarker({ pin }: PinMarkerProps) {
  const position = { lat: pin.latitude, lng: pin.longitude };
  const pinName = pin.description ? `${pin.ownerNickname} Pin` : `Pin #${pin.id}`;

  return (
    <MapMarker position={position}>
      <div className="min-w-[220px] rounded-lg border border-slate-200 bg-white p-3 shadow">
        <div className="text-sm font-medium text-slate-900">{pin.ownerNickname}</div>
        {pin.description && (
          <div className="mt-1 text-xs text-slate-600 line-clamp-2">{pin.description}</div>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          <KakaoMapLinks
            latitude={pin.latitude}
            longitude={pin.longitude}
            name={pinName}
            compact
          />
          <Link
            to={`/pins/${pin.id}/posts`}
            className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
          >
            게시글
          </Link>
        </div>
      </div>
    </MapMarker>
  );
}
