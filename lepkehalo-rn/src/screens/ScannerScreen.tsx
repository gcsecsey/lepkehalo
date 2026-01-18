import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

interface ScannerScreenProps {
  onBarcodeScanned: (isbn: string) => void;
}

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export function ScannerScreen({ onBarcodeScanned }: ScannerScreenProps) {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);
  const lastScannedRef = useRef<string | null>(null);

  const handleBarcodeScanned = useCallback(
    ({ data }: { type: string; data: string }) => {
      // Prevent duplicate scans
      if (scanned || data === lastScannedRef.current) {
        return;
      }

      lastScannedRef.current = data;
      setScanned(true);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onBarcodeScanned(data);
    },
    [scanned, onBarcodeScanned]
  );

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const toggleFlash = useCallback(() => {
    setFlashEnabled((prev) => !prev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Request permission on first render
  React.useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, []);

  // Permission not determined yet
  if (!permission) {
    return (
      <View testID="scanner-screen" style={styles.container}>
        <Text style={styles.message}>Kamera inicializálása...</Text>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
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

  return (
    <View testID="scanner-screen" style={styles.container}>
      <CameraView
        testID="camera-view"
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={flashEnabled}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {/* Overlay */}
      <View testID="scanner-overlay" style={styles.overlay}>
        {/* Top dark area */}
        <View style={styles.darkArea} />

        {/* Middle row with scan area */}
        <View style={styles.middleRow}>
          <View style={styles.darkArea} />
          <View style={styles.scanArea}>
            {/* Corner markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.darkArea} />
        </View>

        {/* Bottom dark area with instructions */}
        <View style={[styles.darkArea, styles.bottomArea]}>
          <Text style={styles.instruction}>
            Helyezze a vonalkódot a keretbe
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          testID="close-button"
          style={styles.controlButton}
          onPress={handleClose}
        >
          <Text style={styles.controlIcon}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="flash-toggle"
          style={styles.controlButton}
          onPress={toggleFlash}
        >
          {flashEnabled ? (
            <Text testID="flash-on-icon" style={styles.controlIcon}>⚡</Text>
          ) : (
            <Text testID="flash-off-icon" style={styles.controlIcon}>🔦</Text>
          )}
        </TouchableOpacity>
      </View>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  darkArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleRow: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  bottomArea: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 24,
  },
  instruction: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  controls: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 20,
    color: '#fff',
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
