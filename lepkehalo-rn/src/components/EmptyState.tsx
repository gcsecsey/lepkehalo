import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'Nincsenek beolvasott könyvek' }: EmptyStateProps) {
  return (
    <View
      testID="empty-state"
      style={styles.container}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${message}. Nyomj a beolvasás gombra egy könyv hozzáadásához`}
    >
      <Text style={styles.emoji} accessibilityElementsHidden={true}>📖</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.hint}>
        Nyomj a beolvasás gombra egy könyv hozzáadásához
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
