// Mock for expo-camera
import React from 'react';
import { View, ViewProps } from 'react-native';

// Mock permission status
type PermissionStatus = 'granted' | 'denied' | 'undetermined';

let mockPermissionStatus: PermissionStatus = 'granted';

export const setMockPermissionStatus = (status: PermissionStatus) => {
  mockPermissionStatus = status;
};

// Mock barcode callback storage
let onBarcodeScannedCallback: ((result: { type: string; data: string }) => void) | null = null;

export const mockScanBarcode = (type: string, data: string) => {
  if (onBarcodeScannedCallback) {
    onBarcodeScannedCallback({ type, data });
  }
};

// CameraView component mock
interface CameraViewProps extends ViewProps {
  facing?: 'front' | 'back';
  enableTorch?: boolean;
  barcodeScannerSettings?: {
    barcodeTypes: string[];
  };
  onBarcodeScanned?: (result: { type: string; data: string }) => void;
}

export const CameraView = React.forwardRef<View, CameraViewProps>(
  ({ onBarcodeScanned, children, ...props }, ref) => {
    // Store the callback for testing
    React.useEffect(() => {
      onBarcodeScannedCallback = onBarcodeScanned || null;
      return () => {
        onBarcodeScannedCallback = null;
      };
    }, [onBarcodeScanned]);

    return React.createElement(View, { ...props, ref, testID: 'mock-camera' }, children);
  }
);

// Camera permissions - simple mock that doesn't cause re-renders
export const useCameraPermissions = jest.fn(() => {
  const permission = {
    granted: mockPermissionStatus === 'granted',
    canAskAgain: mockPermissionStatus !== 'denied',
    status: mockPermissionStatus,
  };

  const requestPermission = jest.fn(async () => permission);

  return [permission, requestPermission] as const;
});

// Camera class for static methods
export class Camera {
  static useCameraPermissions = useCameraPermissions;
}

export default {
  CameraView,
  useCameraPermissions,
  Camera,
};
