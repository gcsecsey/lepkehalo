package expo.modules.nativebarcodescanner

import android.Manifest
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

class NativeBarcodeScannerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NativeBarcodeScanner")

    // MARK: - Permission Functions

    AsyncFunction("requestCameraPermissionAsync") { promise: Promise ->
      val context = appContext.reactContext ?: run {
        promise.resolve(
          mapOf("granted" to false, "canAskAgain" to false)
        )
        return@AsyncFunction
      }

      val status = ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA)
      if (status == PackageManager.PERMISSION_GRANTED) {
        promise.resolve(
          mapOf("granted" to true, "canAskAgain" to false)
        )
        return@AsyncFunction
      }

      // Use Expo's permissions manager for runtime permission request
      val permissionsManager = appContext.permissions ?: run {
        promise.resolve(
          mapOf("granted" to false, "canAskAgain" to true)
        )
        return@AsyncFunction
      }

      permissionsManager.askForPermissions(
        { permissionsResponse ->
          val granted = permissionsResponse[Manifest.permission.CAMERA]
            ?.let { it.getBoolean("granted", false) } ?: false
          val canAskAgain = permissionsResponse[Manifest.permission.CAMERA]
            ?.let { it.getBoolean("canAskAgain", true) } ?: true
          promise.resolve(
            mapOf("granted" to granted, "canAskAgain" to canAskAgain)
          )
        },
        Manifest.permission.CAMERA
      )
    }

    Function("getCameraPermissionStatus") {
      val context = appContext.reactContext ?: return@Function mapOf(
        "granted" to false,
        "canAskAgain" to false
      )
      val granted = ContextCompat.checkSelfPermission(
        context, Manifest.permission.CAMERA
      ) == PackageManager.PERMISSION_GRANTED
      mapOf("granted" to granted, "canAskAgain" to !granted)
    }

    // MARK: - Native View

    View(NativeBarcodeScannerView::class) {
      Events("onBarcodeScanned", "onClose")

      Prop("isActive") { view: NativeBarcodeScannerView, isActive: Boolean? ->
        view.setIsActive(isActive ?: true)
      }
    }
  }
}
