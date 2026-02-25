import Flutter
import UIKit
import GoogleMaps // Step 6: Google Maps import

@main
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    
    // Step 6 / RULE 7.3.11: Google Maps API Key 설정
    // 키 값은 --dart-define=MAP_API_KEY=... 로 빌드 시 주입되며, Info.plist에 포함됩니다.
    let googleMapsApiKey = Bundle.main.object(forInfoDictionaryKey: "MAP_API_KEY") as? String
    GMSServices.provideAPIKey(googleMapsApiKey ?? "")

    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
