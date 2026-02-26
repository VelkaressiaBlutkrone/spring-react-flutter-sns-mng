import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../../data/location/location_service.dart';

typedef PickedLocation = ({double latitude, double longitude});

/// 게시글 작성/수정에서 위치 좌표를 선택하는 지도 화면.
class LocationPickerScreen extends StatefulWidget {
  const LocationPickerScreen({
    super.key,
    this.initialLatitude,
    this.initialLongitude,
  });

  final double? initialLatitude;
  final double? initialLongitude;

  @override
  State<LocationPickerScreen> createState() => _LocationPickerScreenState();
}

class _LocationPickerScreenState extends State<LocationPickerScreen> {
  static const LatLng _fallbackCenter = LatLng(37.5665, 126.9780);

  final LocationService _locationService = LocationService();
  GoogleMapController? _mapController;
  LatLng _initialCenter = _fallbackCenter;
  LatLng? _selected;
  bool _isLoading = true;
  String? _message;

  @override
  void initState() {
    super.initState();
    _initCenter();
  }

  Future<void> _initCenter() async {
    setState(() {
      _isLoading = true;
      _message = null;
    });

    try {
      if (widget.initialLatitude != null && widget.initialLongitude != null) {
        final preset = LatLng(widget.initialLatitude!, widget.initialLongitude!);
        setState(() {
          _initialCenter = preset;
          _selected = preset;
          _isLoading = false;
        });
        return;
      }

      final Position position = await _locationService.getCurrentPosition();
      setState(() {
        _initialCenter = LatLng(position.latitude, position.longitude);
        _isLoading = false;
      });
    } catch (_) {
      setState(() {
        _initialCenter = _fallbackCenter;
        _isLoading = false;
        _message = '현재 위치를 확인하지 못해 기본 좌표로 시작합니다.';
      });
    }
  }

  Future<void> _moveToCurrentPosition() async {
    try {
      final position = await _locationService.getCurrentPosition();
      final current = LatLng(position.latitude, position.longitude);
      setState(() {
        _initialCenter = current;
      });
      await _mapController?.animateCamera(CameraUpdate.newLatLng(current));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('현재 위치를 가져오지 못했습니다.')),
      );
    }
  }

  void _confirm() {
    if (_selected == null) return;
    Navigator.of(context).pop((
      latitude: _selected!.latitude,
      longitude: _selected!.longitude,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('위치 선택'),
        actions: [
          TextButton(
            onPressed: _selected == null ? null : _confirm,
            child: const Text('확인'),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.small(
        onPressed: _moveToCurrentPosition,
        child: const Icon(Icons.my_location),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Stack(
              children: [
                GoogleMap(
                  initialCameraPosition: CameraPosition(
                    target: _initialCenter,
                    zoom: 15,
                  ),
                  myLocationEnabled: true,
                  myLocationButtonEnabled: false,
                  onMapCreated: (controller) {
                    _mapController = controller;
                  },
                  onTap: (point) {
                    setState(() {
                      _selected = point;
                    });
                  },
                  onLongPress: (point) {
                    setState(() {
                      _selected = point;
                    });
                  },
                  markers: {
                    if (_selected != null)
                      Marker(
                        markerId: const MarkerId('picked_location'),
                        position: _selected!,
                      ),
                  },
                ),
                Positioned(
                  top: 12,
                  left: 12,
                  right: 12,
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Text(
                        _message ??
                            '지도를 탭하거나 길게 눌러 게시글 위치를 선택하세요.',
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
