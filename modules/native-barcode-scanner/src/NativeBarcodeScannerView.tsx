import { requireNativeViewManager } from 'expo-modules-core';
import React from 'react';
import type { NativeBarcodeScannerViewProps } from './NativeBarcodeScanner.types';

const NativeView: React.ComponentType<NativeBarcodeScannerViewProps> =
  requireNativeViewManager('NativeBarcodeScanner');

export function NativeBarcodeScannerView(props: NativeBarcodeScannerViewProps) {
  return <NativeView {...props} />;
}
