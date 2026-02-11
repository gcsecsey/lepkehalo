import ExpoModulesCore
import AVFoundation

public class NativeBarcodeScannerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("NativeBarcodeScanner")

    // MARK: - Permission Functions

    AsyncFunction("requestCameraPermissionAsync") { (promise: Promise) in
      let currentStatus = AVCaptureDevice.authorizationStatus(for: .video)

      if currentStatus == .authorized {
        promise.resolve([
          "granted": true,
          "canAskAgain": false
        ])
        return
      }

      if currentStatus == .denied || currentStatus == .restricted {
        promise.resolve([
          "granted": false,
          "canAskAgain": false
        ])
        return
      }

      // Status is .notDetermined — request permission
      AVCaptureDevice.requestAccess(for: .video) { granted in
        promise.resolve([
          "granted": granted,
          "canAskAgain": !granted
        ])
      }
    }

    Function("getCameraPermissionStatus") { () -> [String: Any] in
      let status = AVCaptureDevice.authorizationStatus(for: .video)
      return [
        "granted": status == .authorized,
        "canAskAgain": status == .notDetermined
      ]
    }

    // MARK: - Native View

    View(NativeBarcodeScannerView.self) {
      Events("onBarcodeScanned", "onClose")

      Prop("isActive") { (view, isActive: Bool?) in
        view.isActive = isActive ?? true
      }
    }
  }
}
