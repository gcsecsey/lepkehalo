import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ScannerScreen } from '@/screens/ScannerScreen';
import {
  setMockPermissionGranted,
  NativeBarcodeScannerModule,
} from '../../__mocks__/native-barcode-scanner';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
}));

describe('ScannerScreen permission request', () => {
  beforeEach(() => {
    (NativeBarcodeScannerModule.requestCameraPermissionAsync as jest.Mock).mockClear();
  });

  it('should call requestCameraPermissionAsync on mount', async () => {
    setMockPermissionGranted(true);

    render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      expect(NativeBarcodeScannerModule.requestCameraPermissionAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('should show native scanner view when permission granted', async () => {
    setMockPermissionGranted(true);

    const { getByTestId } = render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      expect(getByTestId('native-scanner-view')).toBeTruthy();
    });
  });

  it('should show permission denied UI when not granted', async () => {
    setMockPermissionGranted(false);

    const { getByText, getByTestId } = render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      expect(getByText(/kamera engedély/i)).toBeTruthy();
      expect(getByTestId('close-button')).toBeTruthy();
    });
  });
});
