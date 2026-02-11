import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  NativeBarcodeScannerView,
  NativeBarcodeScannerModule,
} from '../../modules/native-barcode-scanner';

interface ScannerScreenProps {
  onBarcodeScanned: (isbn: string) => void;
}

export function ScannerScreen({ onBarcodeScanned }: ScannerScreenProps) {
  const navigation = useNavigation();
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  // Request camera permission on mount
  useEffect(() => {
    NativeBarcodeScannerModule.requestCameraPermissionAsync().then((result) => {
      setPermissionGranted(result.granted);
    });
  }, []);

  const handleBarcodeScanned = useCallback(
    (event: { nativeEvent: { data: string; type: string } }) => {
      onBarcodeScanned(event.nativeEvent.data);
    },
    [onBarcodeScanned]
  );

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Permission not determined yet
  if (permissionGranted === null) {
    return (
      <View testID="scanner-screen" style={styles.container}>
        <Text style={styles.message}>Kamera inicializálása...</Text>
      </View>
    );
  }

  // Permission denied
  if (!permissionGranted) {
    return (
      <View testID="scanner-screen" style={styles.container}>
        <Text style={styles.message}>Kamera engedély szükséges</Text>
        <Text style={styles.subMessage}>
          Kérjük, engedélyezze a kamera használatát a beállításokban
        </Text>
        <TouchableOpacity
          testID="close-button"
          style={styles.closeButton}
          onPress={handleClose}
        >
          <Text style={styles.closeButtonText}>Vissza</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render native scanner view.
  // Camera preview, barcode detection, scan overlay, corner markers,
  // flash toggle, and close button are all rendered natively
  // (SwiftUI on iOS, Jetpack Compose on Android).
  return (
    <View testID="scanner-screen" style={styles.container}>
      <NativeBarcodeScannerView
        style={StyleSheet.absoluteFillObject}
        isActive={true}
        onBarcodeScanned={handleBarcodeScanned}
        onClose={handleClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subMessage: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  closeButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
