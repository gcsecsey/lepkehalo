import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  const { t } = useTranslation();
  const displayMessage = message ?? t('empty.message');

  return (
    <View
      testID="empty-state"
      style={styles.container}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${displayMessage}. ${t('empty.hint')}`}
    >
      <Text style={styles.emoji} accessibilityElementsHidden={true}>📖</Text>
      <Text style={styles.message}>{displayMessage}</Text>
      <Text style={styles.hint}>
        {t('empty.hint')}
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
