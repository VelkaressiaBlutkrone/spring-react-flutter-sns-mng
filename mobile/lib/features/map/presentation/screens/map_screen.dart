import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:mobile/features/map/data/location_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'map_screen.g.dart';

// RULE 7.3.5: @riverpod 어노테이션을 사용하여 Provider를 정의합니다.
@riverpod
LocationService locationService(Ref ref) {
  return LocationService();
}

@riverpod
Future<Position> currentPosition(Ref ref) {
  return ref.watch(locationServiceProvider).getCurrentPosition();
}

/// 지도 및 현재 위치를 표시하는 화면.
///
/// Step 6: 지도 SDK 연동, 위치 권한 요청, 현재 위치 획득 및 표시.
/// RULE: `FutureProvider`를 사용하여 비동기 로직을 UI와 분리.
class MapScreen extends ConsumerWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // currentPositionProvider를 watch하여 상태 변화를 감지.
    final asyncPosition = ref.watch(currentPositionProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('지도'),
        centerTitle: true,
      ),
      body: asyncPosition.when(
        // 데이터 로딩 중일 때 표시할 위젯
        loading: () => const Center(child: CircularProgressIndicator()),
        
        // 에러 발생 시 표시할 위젯
        error: (err, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('위치를 가져올 수 없습니다: ${err.toString()}'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  // 프로바이더를 새로고침하여 위치 정보를 다시 가져오도록 시도.
                  ref.invalidate(currentPositionProvider);
                },
                child: const Text('다시 시도'),
              ),
            ],
          ),
        ),

        // 데이터 로딩 성공 시 표시할 위젯
        data: (position) {
          final initialCameraPosition = CameraPosition(
            target: LatLng(position.latitude, position.longitude),
            zoom: 16.0,
          );

          return GoogleMap(
            initialCameraPosition: initialCameraPosition,
            myLocationEnabled: true, // 내 위치 파란 점 표시
            myLocationButtonEnabled: true, // 내 위치로 이동하는 버튼 활성화
            mapType: MapType.normal,
            onMapCreated: (GoogleMapController controller) {
              // 필요 시 맵 컨트롤러 사용
            },
          );
        },
      ),
    );
  }
}
