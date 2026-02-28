import { requireNativeModule } from 'expo-modules-core';
import type { PermissionResult } from './NativeBarcodeScanner.types';

interface NativeBarcodeScannerModuleType {
  requestCameraPermissionAsync(): Promise<PermissionResult>;
  getCameraPermissionStatus(): PermissionResult;
}

export default requireNativeModule<NativeBarcodeScannerModuleType>(
  'NativeBarcodeScanner'
);
