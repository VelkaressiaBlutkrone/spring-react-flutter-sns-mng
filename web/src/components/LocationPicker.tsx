/**
 * 위치 선택 컴포넌트 (TASK_WEB Step 5).
 * 지도 클릭 또는 기존 Pin 선택으로 게시글 작성 시 위치 연결.
 * RULE 1.5.6(XSS) - 사용자 입력 이스케이프.
 */
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapMarker } from 'react-kakao-maps-sdk';
import { MapView } from '@/components/MapView';
import { pinsApi } from '@/api/pins';
import { useGeolocation } from '@/hooks/useGeolocation';
import { KakaoMapLinks } from '@/components/KakaoMapLinks';
import type { PinResponse } from '@/types/pin';

export interface LocationValue {
  latitude: number;
  longitude: number;
  pinId?: number;
}

export interface LocationPickerProps {
  value: LocationValue | null;
  onChange: (value: LocationValue | null) => void;
  /** 지도 높이 (디폴트 320px) */
  mapHeight?: number;
}

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_RADIUS_KM = 20;

export function LocationPicker({ value, onChange, mapHeight = 320 }: LocationPickerProps) {
  const { position } = useGeolocation();
  const center = position ?? DEFAULT_CENTER;
  const [mapCenter, setMapCenter] = useState(center);

  useEffect(() => {
    if (position && !value) {
      setMapCenter(position);
    }
  }, [position, value]);

  const { data: pinsData } = useQuery({
    queryKey: ['pins', 'nearby', center.lat, center.lng, DEFAULT_RADIUS_KM],
    queryFn: () =>
      pinsApi.nearby({
        lat: center.lat,
        lng: center.lng,
        radiusKm: DEFAULT_RADIUS_KM,
        page: 0,
        size: 50,
      }),
  });

  const { data: myPinsData } = useQuery({
    queryKey: ['pins', 'list'],
    queryFn: () => pinsApi.list({ page: 0, size: 50 }),
  });

  const nearbyPins = pinsData?.data?.content ?? [];
  const myPins = myPinsData?.data?.content ?? [];

  const handleMapClick = (lat: number, lng: number) => {
    onChange({ latitude: lat, longitude: lng });
    setMapCenter({ lat, lng });
  };

  const handlePinSelect = (pin: PinResponse) => {
    onChange({
      latitude: pin.latitude,
      longitude: pin.longitude,
      pinId: pin.id,
    });
    setMapCenter({ lat: pin.latitude, lng: pin.longitude });
  };

  const handleClear = () => {
    onChange(null);
    setMapCenter(center);
  };

  const displayCenter = value
    ? { lat: value.latitude, lng: value.longitude }
    : mapCenter;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">위치 (선택)</label>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            선택 해제
          </button>
        )}
      </div>

      {myPins.length > 0 && (
        <div>
          <span className="text-xs font-medium text-gray-500">내 Pin 선택</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {myPins.map((pin) => (
              <button
                key={pin.id}
                type="button"
                onClick={() => handlePinSelect(pin)}
                className={`rounded px-3 py-1 text-sm ${
                  value?.pinId === pin.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pin #{pin.id}
                {pin.description && ` - ${pin.description.slice(0, 15)}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {nearbyPins.length > 0 && myPins.length === 0 && (
        <div>
          <span className="text-xs font-medium text-gray-500">주변 Pin 선택</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {nearbyPins.slice(0, 10).map((pin) => (
              <button
                key={pin.id}
                type="button"
                onClick={() => handlePinSelect(pin)}
                className={`rounded px-3 py-1 text-sm ${
                  value?.pinId === pin.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pin.ownerNickname} Pin #{pin.id}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded border border-gray-200 overflow-hidden">
        <MapView
          center={displayCenter}
          level={6}
          style={{ width: '100%', height: `${mapHeight}px` }}
          onMapClick={handleMapClick}
        >
          {value && (
            <MapMarker position={{ lat: value.latitude, lng: value.longitude }}>
              <div className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded">
                선택된 위치
              </div>
            </MapMarker>
          )}
        </MapView>
      </div>

      {value && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            위도 {value.latitude.toFixed(6)}, 경도 {value.longitude.toFixed(6)}
            {value.pinId && ` (Pin #${value.pinId} 연결)`}
          </p>
          <KakaoMapLinks
            latitude={value.latitude}
            longitude={value.longitude}
            name="선택 위치"
            compact
          />
        </div>
      )}

      <p className="text-xs text-slate-500">지도를 클릭하면 해당 위치가 선택됩니다.</p>
    </div>
  );
}
