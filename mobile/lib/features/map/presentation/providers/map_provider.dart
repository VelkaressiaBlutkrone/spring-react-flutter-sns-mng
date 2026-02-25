// Step 7 지도 반경 조회 Provider
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/app_providers.dart';
import '../../../../domain/models/models.dart';

typedef NearbyQuery = ({
  double lat,
  double lng,
  double radiusKm,
  int page,
  int size,
});

typedef PinPostsQuery = ({
  int pinId,
  int page,
  int size,
});

/// 반경 내 Pin 목록
final nearbyPinsProvider =
    FutureProvider.family<PageResponse<PinResponse>, NearbyQuery>(
  (ref, query) async {
    return pinRepository.getNearby(
      lat: query.lat,
      lng: query.lng,
      radiusKm: query.radiusKm,
      page: query.page,
      size: query.size,
    );
  },
);

/// 반경 내 게시글 목록
final nearbyPostsProvider =
    FutureProvider.family<PageResponse<PostResponse>, NearbyQuery>(
  (ref, query) async {
    return postRepository.getNearby(
      lat: query.lat,
      lng: query.lng,
      radiusKm: query.radiusKm,
      page: query.page,
      size: query.size,
    );
  },
);

/// 반경 내 이미지 게시글 목록
final nearbyImagePostsProvider =
    FutureProvider.family<PageResponse<ImagePostResponse>, NearbyQuery>(
  (ref, query) async {
    return imagePostRepository.getNearby(
      lat: query.lat,
      lng: query.lng,
      radiusKm: query.radiusKm,
      page: query.page,
      size: query.size,
    );
  },
);

/// Pin별 게시글 목록
final pinPostsProvider =
    FutureProvider.family<PageResponse<PostResponse>, PinPostsQuery>(
  (ref, query) async {
    return postRepository.getByPinId(
      query.pinId,
      page: query.page,
      size: query.size,
    );
  },
);

/// Pin별 이미지 게시글 목록
final pinImagePostsProvider =
    FutureProvider.family<PageResponse<ImagePostResponse>, PinPostsQuery>(
  (ref, query) async {
    return imagePostRepository.getByPinId(
      query.pinId,
      page: query.page,
      size: query.size,
    );
  },
);
