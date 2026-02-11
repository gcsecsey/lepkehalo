import type { ViewProps } from 'react-native';

/**
 * Event payload when a barcode is detected by the native scanner.
 */
export type BarcodeScannedEvent = {
  /** The barcode string value (e.g. ISBN) */
  data: string;
  /** The barcode symbology type (e.g. 'ean13', 'ean8', 'upc_a', 'upc_e') */
  type: string;
};

/**
 * Props for the native barcode scanner view.
 * The view renders a full camera preview with scan overlay, corner markers,
 * flash toggle, and close button — all using native UI (SwiftUI / Jetpack Compose).
 */
export type NativeBarcodeScannerViewProps = ViewProps & {
  /** Whether the scanner is actively detecting barcodes. Default: true */
  isActive?: boolean;
  /** Called when a barcode is detected. Fires once per scan session. */
  onBarcodeScanned?: (event: { nativeEvent: BarcodeScannedEvent }) => void;
  /** Called when the user taps the close button in the native overlay. */
  onClose?: () => void;
};

/**
 * Result of a camera permission request.
 */
export type PermissionResult = {
  granted: boolean;
  canAskAgain: boolean;
};
