import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { ScannerScreen } from './ScannerScreen';
import { searchBookByISBN } from '@/services/molyApi';
import { useBookStore } from '@/stores/bookStore';

type ScanState = 'scanning' | 'loading' | 'error';

export function ScannerScreenWrapper() {
  const navigation = useNavigation();
  const { addBook, hasBook, moveToTop } = useBookStore();
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleBarcodeScanned = useCallback(
    async (isbn: string) => {
      // Check if book already exists
      if (hasBook(isbn)) {
        // Move existing book to top
        moveToTop(isbn);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.goBack();
        return;
      }

      setScanState('loading');

      try {
        const book = await searchBookByISBN(isbn);

        if (book) {
          // Check again by book ID (in case ISBN differs from stored ISBN)
          if (hasBook(book.id)) {
            moveToTop(book.id);
          } else {
            addBook(book);
          }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          navigation.goBack();
        } else {
          // Book not found on Moly.hu
          setScanState('error');
          setErrorMessage('Az ISBN nem található a Moly-on');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

          // Return to scanning after delay
          setTimeout(() => {
            setScanState('scanning');
            setErrorMessage(null);
          }, 2000);
        }
      } catch (error) {
        console.error('Error searching book:', error);
        setScanState('error');
        setErrorMessage('A moly.hu nem elérhető');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        // Return to scanning after delay
        setTimeout(() => {
          setScanState('scanning');
          setErrorMessage(null);
        }, 2000);
      }
    },
    [navigation, addBook, hasBook, moveToTop]
  );

  // Show loading overlay while fetching book
  if (scanState === 'loading') {
    return (
      <View style={styles.overlayContainer}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Könyv keresése...</Text>
        </View>
      </View>
    );
  }

  // Show error message
  if (scanState === 'error' && errorMessage) {
    return (
      <View style={styles.overlayContainer}>
        <View style={styles.errorBox}>
          <Text style={styles.errorEmoji}>❌</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      </View>
    );
  }

  // Show scanner
  return <ScannerScreen onBarcodeScanned={handleBarcodeScanned} />;
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  errorBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    maxWidth: '80%',
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
