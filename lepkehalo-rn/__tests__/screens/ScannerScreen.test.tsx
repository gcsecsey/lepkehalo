import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ScannerScreen } from '@/screens/ScannerScreen';
import { setMockPermissionStatus, mockScanBarcode } from '../../__mocks__/expo-camera';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

describe('ScannerScreen', () => {
  beforeEach(() => {
    setMockPermissionStatus('granted');
    mockGoBack.mockClear();
  });

  it('should render camera when permission is granted', async () => {
    const { getByTestId } = render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      expect(getByTestId('scanner-screen')).toBeTruthy();
      expect(getByTestId('mock-camera')).toBeTruthy();
    });
  });

  it('should show permission denied message when camera not granted', async () => {
    setMockPermissionStatus('denied');

    const { getByText } = render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      expect(getByText(/kamera engedély/i)).toBeTruthy();
    });
  });

  it('should have flash toggle button', async () => {
    const { getByTestId } = render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      expect(getByTestId('flash-toggle')).toBeTruthy();
    });
  });

  it('should toggle flash state when flash button pressed', async () => {
    const { getByTestId } = render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      const flashButton = getByTestId('flash-toggle');
      expect(flashButton).toBeTruthy();

      // Initially off - check for the "off" icon
      expect(getByTestId('flash-off-icon')).toBeTruthy();

      fireEvent.press(flashButton);
    });

    // After press, should show "on" icon
    await waitFor(() => {
      expect(getByTestId('flash-on-icon')).toBeTruthy();
    });
  });

  it('should have close button', async () => {
    const { getByTestId } = render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      expect(getByTestId('close-button')).toBeTruthy();
    });
  });

  it('should call goBack when close button pressed', async () => {
    const { getByTestId } = render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      expect(getByTestId('close-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('close-button'));

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should call onBarcodeScanned when barcode detected', async () => {
    const onBarcodeScanned = jest.fn();
    render(<ScannerScreen onBarcodeScanned={onBarcodeScanned} />);

    await waitFor(() => {
      // Simulate barcode scan
      act(() => {
        mockScanBarcode('ean13', '9789630778459');
      });
    });

    expect(onBarcodeScanned).toHaveBeenCalledWith('9789630778459');
  });

  it('should show scanner overlay', async () => {
    const { getByTestId } = render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      expect(getByTestId('scanner-overlay')).toBeTruthy();
    });
  });
});
