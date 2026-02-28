// Mock for react-native-vision-camera
// This mock is used for unit tests where camera functionality is not needed

import React from 'react';
import { View, ViewProps } from 'react-native';

// Mock Camera component
export const Camera = React.forwardRef<View, ViewProps & { device?: any; isActive?: boolean }>(
  (props, ref) => {
    return React.createElement(View, { ...props, ref, testID: 'mock-camera' });
  }
);

// Mock camera permission functions
export const requestCameraPermission = jest.fn().mockResolvedValue('granted');
export const getCameraPermissionStatus = jest.fn().mockReturnValue('granted');

// Mock camera device hooks
export const useCameraDevice = jest.fn().mockReturnValue({
  id: 'back-camera',
  position: 'back',
  hasFlash: true,
  hasTorch: true,
});

export const useCameraDevices = jest.fn().mockReturnValue({
  back: {
    id: 'back-camera',
    position: 'back',
    hasFlash: true,
    hasTorch: true,
  },
  front: {
    id: 'front-camera',
    position: 'front',
    hasFlash: false,
    hasTorch: false,
  },
});

// Mock barcode scanner types
type CodeType = 'ean-13' | 'ean-8' | 'upc-a' | 'upc-e' | 'code-128' | 'code-39' | 'qr';

interface Code {
  type: CodeType;
  value: string;
}

interface CodeScannerOptions {
  codeTypes: CodeType[];
  onCodeScanned: (codes: Code[]) => void;
}

// Store for simulating barcode scans in tests
let _onCodeScannedCallback: ((codes: Code[]) => void) | null = null;

// Mock code scanner hook
export const useCodeScanner = jest.fn((options: CodeScannerOptions) => {
  _onCodeScannedCallback = options.onCodeScanned;
  return {
    props: {},
  };
});

// Helper function to simulate a barcode scan in tests
export const mockScanBarcode = (code: Code) => {
  if (_onCodeScannedCallback) {
    _onCodeScannedCallback([code]);
  }
};

// Helper to simulate scanning an ISBN
export const mockScanISBN = (isbn: string) => {
  mockScanBarcode({ type: 'ean-13', value: isbn });
};

// Export types for TypeScript
export type { Code, CodeType, CodeScannerOptions };
