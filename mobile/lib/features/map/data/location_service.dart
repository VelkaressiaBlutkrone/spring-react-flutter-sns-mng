import 'package:geolocator/geolocator.dart';
import 'package:mobile/core/error/app_exception.dart';

/// 위치 서비스 관련 로직을 담당하는 서비스 (래퍼).
///
/// Step 6: Geolocator 플러그인을 사용하여 위치 권한 확인, 권한 요청,
/// 현재 위치 획득 기능을 캡슐화합니다.
/// RULE: 클린 아키텍처에 따라 플랫폼 의존적인 로직을 Data 계층에 둡니다.
class LocationService {
  /// 현재 장치의 위치를 반환합니다.
  ///
  /// 위치 서비스가 비활성화되어 있거나 권한이 거부된 경우 예외를 발생시킵니다.
  /// 권한이 없는 경우 사용자에게 권한을 요청합니다.
  Future<Position> getCurrentPosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    // 1. 위치 서비스 활성화 여부 확인
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      // 위치 서비스가 비활성화되어 있으면 계속 진행할 수 없으므로 에러를 발생시킵니다.
      throw const AppLocationServiceDisabledException();
    }

    // 2. 위치 권한 상태 확인
    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      // 권한이 거부된 경우, 사용자에게 권한을 요청합니다.
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        // 사용자가 권한 요청을 거부한 경우 에러를 발생시킵니다.
        throw const AppLocationPermissionDeniedException();
      }
    }

    if (permission == LocationPermission.deniedForever) {
      // 권한이 영구적으로 거부된 경우, 사용자가 직접 설정에서 변경해야 하므로
      // 에러를 발생시킵니다.
      throw const AppLocationPermissionDeniedForeverException();
    }

    // 3. 권한이 허용된 경우, 현재 위치를 가져옵니다.
    // 'desiredAccuracy' 대신 LocationSettings 사용 (deprecated)
    return await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
      ),
    );
  }
}
