package expo.modules.nativebarcodescanner

import android.annotation.SuppressLint
import android.content.Context
import android.util.Size
import android.view.HapticFeedbackConstants
import androidx.camera.core.CameraControl
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.platform.ComposeView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView

@SuppressLint("UnsafeOptInUsageError")
class NativeBarcodeScannerView(context: Context, appContext: AppContext) :
  ExpoView(context, appContext) {

  // Events dispatched back to JS
  val onBarcodeScanned by EventDispatcher()
  val onClose by EventDispatcher()

  // Camera state
  private var cameraProvider: ProcessCameraProvider? = null
  private var cameraControl: CameraControl? = null
  private val previewView = PreviewView(context)
  private val composeOverlay = ComposeView(context)

  // Scanner state
  private var hasDetectedBarcode = false
  private var isActive = true
  private val isFlashOn = mutableStateOf(false)

  // ML Kit barcode scanner
  private val barcodeScannerOptions = BarcodeScannerOptions.Builder()
    .setBarcodeFormats(
      Barcode.FORMAT_EAN_13,
      Barcode.FORMAT_EAN_8,
      Barcode.FORMAT_UPC_E,
      Barcode.FORMAT_UPC_A,
      Barcode.FORMAT_CODE_128,
      Barcode.FORMAT_CODE_39,
      Barcode.FORMAT_QR_CODE,
      Barcode.FORMAT_PDF417
    )
    .build()
  private val barcodeScanner = BarcodeScanning.getClient(barcodeScannerOptions)

  init {
    // Add camera preview (behind)
    addView(
      previewView,
      LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    )

    // Add Compose overlay (on top)
    addView(
      composeOverlay,
      LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    )

    composeOverlay.setContent {
      ScannerOverlay(
        isFlashOn = isFlashOn.value,
        onFlashToggle = { toggleFlash() },
        onClose = { onClose(emptyMap<String, Any>()) }
      )
    }

    startCamera()
  }

  fun setIsActive(active: Boolean) {
    isActive = active
    if (active) {
      hasDetectedBarcode = false
      startCamera()
    } else {
      stopCamera()
    }
  }

  // MARK: - Camera Setup

  private fun startCamera() {
    val cameraProviderFuture = ProcessCameraProvider.getInstance(context)

    cameraProviderFuture.addListener({
      val provider = cameraProviderFuture.get()
      cameraProvider = provider
      bindCameraUseCases(provider)
    }, ContextCompat.getMainExecutor(context))
  }

  private fun bindCameraUseCases(provider: ProcessCameraProvider) {
    // Find the lifecycle owner (Activity)
    val lifecycleOwner = findLifecycleOwner() ?: return

    // Unbind any previous use cases
    provider.unbindAll()

    // Camera preview
    val preview = Preview.Builder().build().also {
      it.surfaceProvider = previewView.surfaceProvider
    }

    // Image analysis for barcode scanning
    val imageAnalysis = ImageAnalysis.Builder()
      .setTargetResolution(Size(1280, 720))
      .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
      .build()

    imageAnalysis.setAnalyzer(ContextCompat.getMainExecutor(context)) { imageProxy ->
      if (hasDetectedBarcode || !isActive) {
        imageProxy.close()
        return@setAnalyzer
      }

      val mediaImage = imageProxy.image
      if (mediaImage == null) {
        imageProxy.close()
        return@setAnalyzer
      }

      val inputImage = InputImage.fromMediaImage(
        mediaImage,
        imageProxy.imageInfo.rotationDegrees
      )

      barcodeScanner.process(inputImage)
        .addOnSuccessListener { barcodes ->
          val barcode = barcodes.firstOrNull()
          if (barcode != null && barcode.rawValue != null && !hasDetectedBarcode) {
            hasDetectedBarcode = true

            // Haptic feedback
            performHapticFeedback(HapticFeedbackConstants.CONFIRM)

            // Dispatch event to JS
            onBarcodeScanned(
              mapOf(
                "data" to (barcode.rawValue ?: ""),
                "type" to mapBarcodeFormat(barcode.format)
              )
            )
          }
        }
        .addOnCompleteListener {
          imageProxy.close()
        }
    }

    // Bind to lifecycle
    val camera = provider.bindToLifecycle(
      lifecycleOwner,
      CameraSelector.DEFAULT_BACK_CAMERA,
      preview,
      imageAnalysis
    )

    cameraControl = camera.cameraControl
  }

  private fun stopCamera() {
    cameraProvider?.unbindAll()
  }

  private fun toggleFlash() {
    val newState = !isFlashOn.value
    isFlashOn.value = newState
    cameraControl?.enableTorch(newState)

    // Haptic feedback for flash toggle
    performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK)
  }

  // MARK: - Cleanup

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    stopCamera()
    barcodeScanner.close()
  }

  // MARK: - Helpers

  private fun findLifecycleOwner(): LifecycleOwner? {
    var ctx = context
    while (ctx != null) {
      if (ctx is LifecycleOwner) return ctx
      ctx = if (ctx is android.content.ContextWrapper) ctx.baseContext else null
    }
    return null
  }

  private fun mapBarcodeFormat(format: Int): String {
    return when (format) {
      Barcode.FORMAT_EAN_13 -> "ean13"
      Barcode.FORMAT_EAN_8 -> "ean8"
      Barcode.FORMAT_UPC_E -> "upc_e"
      Barcode.FORMAT_UPC_A -> "upc_a"
      Barcode.FORMAT_CODE_128 -> "code128"
      Barcode.FORMAT_CODE_39 -> "code39"
      Barcode.FORMAT_QR_CODE -> "qr"
      Barcode.FORMAT_PDF417 -> "pdf417"
      else -> "unknown"
    }
  }
}
