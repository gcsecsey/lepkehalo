import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { useBookStore } from '@/stores/bookStore';
import { Book } from '@/types/book';
import { BookListItem } from '@/components/BookListItem';
import { EmptyState } from '@/components/EmptyState';
import { SwipeableRow } from '@/components/SwipeableRow';
import { Snackbar } from '@/components/Snackbar';
import { getMolyBookUrl } from '@/services/molyApi';

// We'll implement this later with react-native-inappbrowser-reborn
const openBookUrl = async (bookId: string) => {
  const url = getMolyBookUrl(bookId);
  console.log('Opening URL:', url);
  // InAppBrowser.open(url) will be added in Phase 5
};

interface DeletedBook {
  book: Book;
  index: number;
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { books, isLoading, loadBooks, removeBook, restoreBook } = useBookStore();
  const [deletedBook, setDeletedBook] = useState<DeletedBook | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const handleBookPress = useCallback((book: Book) => {
    openBookUrl(book.id);
  }, []);

  const handleDelete = useCallback((bookId: string) => {
    const result = removeBook(bookId);
    if (result) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDeletedBook(result);
      setSnackbarVisible(true);
    }
  }, [removeBook]);

  const handleUndo = useCallback(() => {
    if (deletedBook) {
      restoreBook(deletedBook.book, deletedBook.index);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [deletedBook, restoreBook]);

  const handleSnackbarDismiss = useCallback(() => {
    setSnackbarVisible(false);
    setDeletedBook(null);
  }, []);

  const handleScanPress = useCallback(() => {
    navigation.navigate('Scanner');
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: Book }) => (
    <SwipeableRow onDelete={() => handleDelete(item.id)}>
      <BookListItem book={item} onPress={handleBookPress} />
    </SwipeableRow>
  ), [handleDelete, handleBookPress]);

  if (isLoading) {
    return (
      <View testID="loading-indicator" style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View testID="home-screen" style={styles.container}>
        {books.length === 0 ? (
          <EmptyState />
        ) : (
          <FlashList
            data={books}
            renderItem={renderItem}
            estimatedItemSize={99}
            keyExtractor={(item) => item.id}
          />
        )}

        <TouchableOpacity
          testID="scan-button"
          style={styles.scanButton}
          onPress={handleScanPress}
          activeOpacity={0.8}
        >
          <Text style={styles.scanButtonText}>📷 Beolvasás</Text>
        </TouchableOpacity>

        <Snackbar
          message="Könyv törölve"
          actionLabel="Visszavonás"
          onAction={handleUndo}
          onDismiss={handleSnackbarDismiss}
          visible={snackbarVisible}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  scanButton: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
