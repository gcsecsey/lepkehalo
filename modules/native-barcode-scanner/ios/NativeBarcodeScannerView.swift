import ExpoModulesCore
import AVFoundation
import SwiftUI
import UIKit

class NativeBarcodeScannerView: ExpoView,
  AVCaptureMetadataOutputObjectsDelegate
{
  // MARK: - Events
  let onBarcodeScanned = EventDispatcher()
  let onClose = EventDispatcher()

  // MARK: - Camera
  private let captureSession = AVCaptureSession()
  private var previewLayer: AVCaptureVideoPreviewLayer?
  private let metadataOutput = AVCaptureMetadataOutput()
  private let sessionQueue = DispatchQueue(label: "barcode.scanner.session")

  // MARK: - State
  private var hasDetectedBarcode = false
  private var isFlashOn = false

  var isActive: Bool = true {
    didSet {
      if isActive {
        hasDetectedBarcode = false
        startSession()
      } else {
        stopSession()
      }
    }
  }

  // MARK: - SwiftUI Overlay
  private var overlayHostController: UIHostingController<ScannerOverlayView>?
  private var overlayState = ScannerOverlayState()

  // MARK: - Init

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    setupCamera()
    setupOverlay()
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  // MARK: - Lifecycle

  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil && isActive {
      startSession()
    } else {
      stopSession()
    }
  }

  override func removeFromSuperview() {
    stopSession()
    super.removeFromSuperview()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    previewLayer?.frame = bounds
    overlayHostController?.view.frame = bounds
  }

  // MARK: - Camera Setup

  private func setupCamera() {
    captureSession.beginConfiguration()

    guard
      let videoDevice = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
      let videoInput = try? AVCaptureDeviceInput(device: videoDevice)
    else {
      captureSession.commitConfiguration()
      return
    }

    if captureSession.canAddInput(videoInput) {
      captureSession.addInput(videoInput)
    }

    if captureSession.canAddOutput(metadataOutput) {
      captureSession.addOutput(metadataOutput)
      metadataOutput.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
      metadataOutput.metadataObjectTypes = [
        .ean13, .ean8, .upce, .code128, .code39, .qr, .pdf417,
      ]
    }

    captureSession.commitConfiguration()

    // Camera preview layer
    let preview = AVCaptureVideoPreviewLayer(session: captureSession)
    preview.videoGravity = .resizeAspectFill
    preview.frame = bounds
    layer.insertSublayer(preview, at: 0)
    previewLayer = preview
  }

  // MARK: - SwiftUI Overlay Setup

  private func setupOverlay() {
    let overlayView = ScannerOverlayView(
      state: overlayState,
      onClose: { [weak self] in
        self?.onClose()
      },
      onFlashToggle: { [weak self] in
        self?.toggleFlash()
      }
    )

    let hostController = UIHostingController(rootView: overlayView)
    hostController.view.backgroundColor = .clear
    hostController.view.frame = bounds
    addSubview(hostController.view)
    overlayHostController = hostController
  }

  // MARK: - Session Control

  private func startSession() {
    sessionQueue.async { [weak self] in
      guard let self = self, !self.captureSession.isRunning else { return }
      self.captureSession.startRunning()
    }
  }

  private func stopSession() {
    sessionQueue.async { [weak self] in
      guard let self = self, self.captureSession.isRunning else { return }
      self.captureSession.stopRunning()
    }
  }

  // MARK: - Flash Control

  private func toggleFlash() {
    guard
      let device = AVCaptureDevice.default(for: .video),
      device.hasTorch
    else { return }

    do {
      try device.lockForConfiguration()
      isFlashOn.toggle()
      device.torchMode = isFlashOn ? .on : .off
      device.unlockForConfiguration()

      overlayState.isFlashOn = isFlashOn

      // Haptic feedback for flash toggle
      let impact = UIImpactFeedbackGenerator(style: .light)
      impact.impactOccurred()
    } catch {
      // Torch unavailable — ignore
    }
  }

  // MARK: - AVCaptureMetadataOutputObjectsDelegate

  func metadataOutput(
    _ output: AVCaptureMetadataOutput,
    didOutput metadataObjects: [AVMetadataObject],
    from connection: AVCaptureConnection
  ) {
    guard !hasDetectedBarcode,
      let metadataObject = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
      let stringValue = metadataObject.stringValue
    else { return }

    hasDetectedBarcode = true

    // Haptic feedback for barcode detection
    let feedback = UINotificationFeedbackGenerator()
    feedback.notificationOccurred(.success)

    // Map AVMetadata type to a readable string
    let barcodeType = mapBarcodeType(metadataObject.type)

    onBarcodeScanned([
      "data": stringValue,
      "type": barcodeType,
    ])
  }

  private func mapBarcodeType(_ type: AVMetadataObject.ObjectType) -> String {
    switch type {
    case .ean13: return "ean13"
    case .ean8: return "ean8"
    case .upce: return "upc_e"
    case .code128: return "code128"
    case .code39: return "code39"
    case .qr: return "qr"
    case .pdf417: return "pdf417"
    default: return type.rawValue
    }
  }
}
