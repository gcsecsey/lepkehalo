import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ScannerScreen } from '@/screens/ScannerScreen';
import { setMockPermissionStatus, useCameraPermissions } from '../../__mocks__/expo-camera';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
}));

describe('ScannerScreen permission request', () => {
  beforeEach(() => {
    (useCameraPermissions as jest.Mock).mockClear();
  });

  it('should call requestPermission when status is undetermined', async () => {
    setMockPermissionStatus('undetermined');

    render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      // Get the requestPermission function from the last call to useCameraPermissions
      const lastCall = (useCameraPermissions as jest.Mock).mock.results;
      const [, requestPermission] = lastCall[lastCall.length - 1].value;
      expect(requestPermission).toHaveBeenCalled();
    });
  });

  it('should not request permission when already granted', async () => {
    setMockPermissionStatus('granted');

    render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      const lastCall = (useCameraPermissions as jest.Mock).mock.results;
      const [, requestPermission] = lastCall[lastCall.length - 1].value;
      expect(requestPermission).not.toHaveBeenCalled();
    });
  });

  it('should not request permission when permanently denied', async () => {
    setMockPermissionStatus('denied');

    render(<ScannerScreen onBarcodeScanned={jest.fn()} />);

    await waitFor(() => {
      const lastCall = (useCameraPermissions as jest.Mock).mock.results;
      const [, requestPermission] = lastCall[lastCall.length - 1].value;
      expect(requestPermission).not.toHaveBeenCalled();
    });
  });
});
