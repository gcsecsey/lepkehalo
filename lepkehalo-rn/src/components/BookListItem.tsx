import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Book } from '@/types/book';

interface BookListItemProps {
  book: Book;
  onPress: (book: Book) => void;
}

export function BookListItem({ book, onPress }: BookListItemProps) {
  const hasCover = book.thumbnailUrl && book.thumbnailUrl.length > 0;

  return (
    <TouchableOpacity
      testID="book-list-item"
      style={styles.container}
      onPress={() => onPress(book)}
      activeOpacity={0.7}
    >
      {hasCover ? (
        <Image
          testID="book-cover"
          source={{ uri: book.thumbnailUrl }}
          style={styles.cover}
          resizeMode="cover"
        />
      ) : (
        <View testID="book-cover-placeholder" style={styles.coverPlaceholder}>
          <Text style={styles.placeholderText}>📚</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.author}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  cover: {
    width: 50,
    height: 75,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  coverPlaceholder: {
    width: 50,
    height: 75,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: '#666',
  },
});
