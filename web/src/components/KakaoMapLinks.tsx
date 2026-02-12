/**
 * 카카오 지도 바로가기 링크 (https://apis.map.kakao.com/web/guide/#whatlibrary)
 * 지도 바로가기, 길찾기, 로드뷰 새 탭 링크.
 */
import { mapLink, directionsLink, roadviewLink } from '@/utils/kakaoMapLinks';

export interface KakaoMapLinksProps {
  latitude: number;
  longitude: number;
  /** 위치 이름 (길찾기용) */
  name?: string;
  /** 컴팩트 모드 (아이콘만) */
  compact?: boolean;
}

export function KakaoMapLinks({ latitude, longitude, name, compact }: KakaoMapLinksProps) {
  const mapUrl = mapLink(latitude, longitude, name);
  const dirUrl = directionsLink(latitude, longitude, name);
  const roadUrl = roadviewLink(latitude, longitude);

  const linkClass = compact
    ? 'inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    : 'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100';

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? 'gap-1' : ''}`}>
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        title="카카오맵에서 크게 보기"
      >
        <MapIcon className="size-3.5" />
        {!compact && '지도'}
      </a>
      <a
        href={dirUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        title="길찾기"
      >
        <DirectionsIcon className="size-3.5" />
        {!compact && '길찾기'}
      </a>
      <a
        href={roadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        title="로드뷰"
      >
        <RoadviewIcon className="size-3.5" />
        {!compact && '로드뷰'}
      </a>
    </div>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function DirectionsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function RoadviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
