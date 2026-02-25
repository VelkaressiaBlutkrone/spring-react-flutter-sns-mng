import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../../core/router/app_router.dart';
import '../../../../domain/models/models.dart';
import '../../../../shared/widgets/common/app_error_view.dart';
import '../../../../shared/widgets/common/loading_widget.dart';
import '../../data/location_service.dart';
import '../providers/map_provider.dart';

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

/// 지도 및 반경 기반 Pin/게시글 조회 화면.
///
/// Step 6: 현재 위치·지도 표시.
/// Step 7: 반경 조회 API 연동, Pin 마커/상세 하단 시트 제공.
class MapScreen extends ConsumerStatefulWidget {
  const MapScreen({super.key});

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  GoogleMapController? _mapController;
  LatLng? _queryCenter;
  LatLng? _pendingCenter;
  double _radiusKm = 5;
  int? _selectedPinId;

  static const List<double> _radiusOptions = [1, 5, 10];

  Future<void> _moveToCurrentPosition(Position position) async {
    final target = LatLng(position.latitude, position.longitude);
    setState(() {
      _queryCenter = target;
      _pendingCenter = target;
    });
    await _mapController?.animateCamera(
      CameraUpdate.newLatLng(target),
    );
  }

  Future<void> _refreshNearby(NearbyQuery query) async {
    ref.invalidate(nearbyPinsProvider(query));
    ref.invalidate(nearbyPostsProvider(query));
    ref.invalidate(nearbyImagePostsProvider(query));
  }

  Set<Marker> _buildMarkers(
    BuildContext context,
    List<PinResponse> pins,
  ) {
    return pins
        .map(
          (pin) => Marker(
            markerId: MarkerId('pin_${pin.id}'),
            position: LatLng(pin.latitude, pin.longitude),
            icon: BitmapDescriptor.defaultMarkerWithHue(
              _selectedPinId == pin.id
                  ? BitmapDescriptor.hueAzure
                  : BitmapDescriptor.hueRed,
            ),
            infoWindow: InfoWindow(
              title: 'Pin #${pin.id}',
              snippet: pin.description?.isNotEmpty == true
                  ? pin.description
                  : '설명 없음',
            ),
            onTap: () {
              setState(() {
                _selectedPinId = pin.id;
              });
              showModalBottomSheet<void>(
                context: context,
                isScrollControlled: true,
                builder: (_) => _PinDetailSheet(pin: pin),
              );
            },
          ),
        )
        .toSet();
  }

  @override
  Widget build(BuildContext context) {
    final asyncPosition = ref.watch(currentPositionProvider);

    return asyncPosition.when(
      loading: () => const Scaffold(
        appBar: _MapAppBar(),
        body: LoadingWidget(message: '현재 위치를 확인하고 있습니다.'),
      ),
      error: (err, stack) => Scaffold(
        appBar: const _MapAppBar(),
        body: AppErrorView(
          message: '위치를 가져올 수 없습니다.\n${err.toString()}',
          onRetry: () => ref.invalidate(currentPositionProvider),
        ),
      ),
      data: (position) {
        final center = _queryCenter ??=
            LatLng(position.latitude, position.longitude);
        final query = (
          lat: center.latitude,
          lng: center.longitude,
          radiusKm: _radiusKm,
          page: 0,
          size: 50,
        );

        final nearbyPinsAsync = ref.watch(nearbyPinsProvider(query));
        final nearbyPostsAsync = ref.watch(nearbyPostsProvider(query));
        final nearbyImagePostsAsync = ref.watch(nearbyImagePostsProvider(query));

        final markers = nearbyPinsAsync.maybeWhen(
          data: (page) => _buildMarkers(context, page.content),
          orElse: () => <Marker>{},
        );

        return Scaffold(
          appBar: const _MapAppBar(),
          floatingActionButton: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              FloatingActionButton.small(
                heroTag: 'map_refresh',
                onPressed: () => _refreshNearby(query),
                child: const Icon(Icons.refresh),
              ),
              const SizedBox(height: 10),
              FloatingActionButton.small(
                heroTag: 'map_my_location',
                onPressed: () => _moveToCurrentPosition(position),
                child: const Icon(Icons.my_location),
              ),
            ],
          ),
          body: Stack(
            children: [
              GoogleMap(
                initialCameraPosition: CameraPosition(
                  target: center,
                  zoom: 15,
                ),
                myLocationEnabled: true,
                myLocationButtonEnabled: true,
                markers: markers,
                onMapCreated: (controller) {
                  _mapController = controller;
                },
                onCameraMove: (cameraPosition) {
                  _pendingCenter = cameraPosition.target;
                },
                onCameraIdle: () {
                  if (_pendingCenter == null) return;
                  final nextCenter = _pendingCenter!;
                  if (_queryCenter == nextCenter) return;
                  setState(() {
                    _queryCenter = nextCenter;
                  });
                },
              ),
              Positioned(
                top: 12,
                left: 12,
                right: 12,
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        const Text('반경'),
                        for (final radius in _radiusOptions)
                          ChoiceChip(
                            label: Text('${radius.toInt()}km'),
                            selected: _radiusKm == radius,
                            onSelected: (_) {
                              setState(() {
                                _radiusKm = radius;
                              });
                            },
                          ),
                      ],
                    ),
                  ),
                ),
              ),
              Positioned(
                left: 12,
                right: 12,
                bottom: 16,
                child: _NearbySummaryCard(
                  nearbyPinsAsync: nearbyPinsAsync,
                  nearbyPostsAsync: nearbyPostsAsync,
                  nearbyImagePostsAsync: nearbyImagePostsAsync,
                  onRetry: () => _refreshNearby(query),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _MapAppBar extends StatelessWidget implements PreferredSizeWidget {
  const _MapAppBar();

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: const Text('지도'),
      centerTitle: true,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}

class _NearbySummaryCard extends StatelessWidget {
  const _NearbySummaryCard({
    required this.nearbyPinsAsync,
    required this.nearbyPostsAsync,
    required this.nearbyImagePostsAsync,
    required this.onRetry,
  });

  final AsyncValue<PageResponse<PinResponse>> nearbyPinsAsync;
  final AsyncValue<PageResponse<PostResponse>> nearbyPostsAsync;
  final AsyncValue<PageResponse<ImagePostResponse>> nearbyImagePostsAsync;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final isLoading = nearbyPinsAsync.isLoading ||
        nearbyPostsAsync.isLoading ||
        nearbyImagePostsAsync.isLoading;

    final hasError = nearbyPinsAsync.hasError ||
        nearbyPostsAsync.hasError ||
        nearbyImagePostsAsync.hasError;

    final pinsCount = nearbyPinsAsync.valueOrNull?.totalElements;
    final postsCount = nearbyPostsAsync.valueOrNull?.totalElements;
    final imagePostsCount = nearbyImagePostsAsync.valueOrNull?.totalElements;

    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(
          children: [
            if (isLoading) ...[
              const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
              const SizedBox(width: 8),
            ],
            Expanded(
              child: Text(
                'Pin ${pinsCount ?? '-'}개 · 게시글 ${postsCount ?? '-'}개 · 이미지 ${imagePostsCount ?? '-'}개',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
            if (hasError)
              TextButton(
                onPressed: onRetry,
                child: const Text('재시도'),
              ),
          ],
        ),
      ),
    );
  }
}

class _PinDetailSheet extends ConsumerWidget {
  const _PinDetailSheet({required this.pin});

  final PinResponse pin;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final postsAsync = ref.watch(
      pinPostsProvider((pinId: pin.id, page: 0, size: 20)),
    );
    final imagePostsAsync = ref.watch(
      pinImagePostsProvider((pinId: pin.id, page: 0, size: 20)),
    );

    final router = GoRouter.of(context);

    return SafeArea(
      child: SizedBox(
        height: 520,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Pin #${pin.id}',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  pin.description?.isNotEmpty == true ? pin.description! : '설명 없음',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 8),
                Text(
                  '좌표: ${pin.latitude.toStringAsFixed(5)}, ${pin.longitude.toStringAsFixed(5)}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                if (pin.ownerNickname != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    '작성자: ${pin.ownerNickname}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
                const SizedBox(height: 20),
                Text(
                  '연결된 게시글',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                postsAsync.when(
                  data: (page) {
                    if (page.content.isEmpty) {
                      return const Text('연결된 게시글이 없습니다.');
                    }
                    return Column(
                      children: page.content
                          .map(
                            (post) => ListTile(
                              contentPadding: EdgeInsets.zero,
                              leading: const Icon(Icons.article_outlined),
                              title: Text(post.title),
                              subtitle: Text(post.authorNickname),
                              trailing: const Icon(Icons.chevron_right),
                              onTap: () {
                                Navigator.of(context).pop();
                                router.push('${AppRoutes.posts}/${post.id}');
                              },
                            ),
                          )
                          .toList(),
                    );
                  },
                  loading: () => const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8),
                    child: CircularProgressIndicator(),
                  ),
                  error: (e, _) => Text('게시글 조회 실패: ${e.toString()}'),
                ),
                const SizedBox(height: 16),
                Text(
                  '연결된 이미지 게시글',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                imagePostsAsync.when(
                  data: (page) {
                    if (page.content.isEmpty) {
                      return const Text('연결된 이미지 게시글이 없습니다.');
                    }
                    return Column(
                      children: page.content
                          .map(
                            (post) => ListTile(
                              contentPadding: EdgeInsets.zero,
                              leading: const Icon(Icons.image_outlined),
                              title: Text(post.title),
                              subtitle: Text(post.authorNickname),
                              trailing: const Icon(Icons.chevron_right),
                              onTap: () {
                                Navigator.of(context).pop();
                                router.push(
                                  '${AppRoutes.imagePosts}/${post.id}',
                                );
                              },
                            ),
                          )
                          .toList(),
                    );
                  },
                  loading: () => const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8),
                    child: CircularProgressIndicator(),
                  ),
                  error: (e, _) => Text('이미지 게시글 조회 실패: ${e.toString()}'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
