import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ScannerScreen } from '@/screens/ScannerScreen';
import {
  setMockPermissionGranted,
  mockScanBarcode,
  mockClose,
  NativeBarcodeScannerModule,
} from '../../__mocks__/native-barcode-scanner';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

describe('ScannerScreen', () => {
  beforeEach(() => {
    setMockPermissionGranted(true);
    mockGoBack.mockClear();
    (NativeBarcodeScannerModule.requestCameraPermissionAsync as jest.Mock).mockClear();
  });

  it('should render native scanner view when permission is granted', async () => {
    const { getByTestId } = render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      expect(getByTestId('scanner-screen')).toBeTruthy();
      expect(getByTestId('native-scanner-view')).toBeTruthy();
    });
  });

  it('should show permission denied message when camera not granted', async () => {
    setMockPermissionGranted(false);

    const { getByText } = render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      expect(getByText(/kamera engedély/i)).toBeTruthy();
    });
  });

  it('should request camera permission on mount', async () => {
    render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      expect(NativeBarcodeScannerModule.requestCameraPermissionAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('should have close button when permission denied', async () => {
    setMockPermissionGranted(false);

    const { getByTestId } = render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      expect(getByTestId('close-button')).toBeTruthy();
    });
  });

  it('should call goBack when close button pressed (permission denied)', async () => {
    setMockPermissionGranted(false);

    const { getByTestId } = render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      expect(getByTestId('close-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('close-button'));

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should call onBarcodeScanned when barcode detected by native view', async () => {
    const onBarcodeScanned = jest.fn();
    const { getByTestId } = render(<ScannerScreen onBarcodeScanned={onBarcodeScanned} />);

    // Wait for the native view to render (after async permission resolves)
    await waitFor(() => {
      expect(getByTestId('native-scanner-view')).toBeTruthy();
    });

    // Simulate barcode scan from native view
    act(() => {
      mockScanBarcode('ean13', '9789630778459');
    });

    expect(onBarcodeScanned).toHaveBeenCalledWith('9789630778459');
  });

  it('should call goBack when native close button pressed', async () => {
    const { getByTestId } = render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    // Wait for the native view to render
    await waitFor(() => {
      expect(getByTestId('native-scanner-view')).toBeTruthy();
    });

    act(() => {
      mockClose();
    });

    expect(mockGoBack).toHaveBeenCalled();
  });
});
