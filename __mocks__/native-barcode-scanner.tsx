/**
 * Mock for the native-barcode-scanner Expo local module.
 * Provides test utilities to simulate barcode scans and control permission state.
 */
import React from 'react';
import { View, type ViewProps } from 'react-native';

// MARK: - Mock state

let mockPermissionGranted = true;

/** Set the mock permission status for tests. */
export const setMockPermissionGranted = (granted: boolean) => {
  mockPermissionGranted = granted;
};

// MARK: - Event callback storage

let onBarcodeScannedCallback: ((event: {
  nativeEvent: { data: string; type: string };
}) => void) | null = null;

let onCloseCallback: (() => void) | null = null;

/** Simulate a barcode scan in tests. */
export const mockScanBarcode = (type: string, data: string) => {
  if (onBarcodeScannedCallback) {
    onBarcodeScannedCallback({ nativeEvent: { type, data } });
  }
};

/** Simulate the close button press in tests. */
export const mockClose = () => {
  if (onCloseCallback) {
    onCloseCallback();
  }
};

// MARK: - NativeBarcodeScannerView mock

interface MockViewProps extends ViewProps {
  isActive?: boolean;
  onBarcodeScanned?: (event: {
    nativeEvent: { data: string; type: string };
  }) => void;
  onClose?: () => void;
}

export const NativeBarcodeScannerView = React.forwardRef<View, MockViewProps>(
  ({ onBarcodeScanned, onClose, ...props }, ref) => {
    React.useEffect(() => {
      onBarcodeScannedCallback = onBarcodeScanned || null;
      onCloseCallback = onClose || null;
      return () => {
        onBarcodeScannedCallback = null;
        onCloseCallback = null;
      };
    }, [onBarcodeScanned, onClose]);

    return React.createElement(View, {
      ...props,
      ref,
      testID: 'native-scanner-view',
    });
  }
);

// MARK: - NativeBarcodeScannerModule mock

export const NativeBarcodeScannerModule = {
  requestCameraPermissionAsync: jest.fn(async () => ({
    granted: mockPermissionGranted,
    canAskAgain: !mockPermissionGranted,
  })),
  getCameraPermissionStatus: jest.fn(() => ({
    granted: mockPermissionGranted,
    canAskAgain: !mockPermissionGranted,
  })),
};

export default {
  NativeBarcodeScannerView,
  NativeBarcodeScannerModule,
};
