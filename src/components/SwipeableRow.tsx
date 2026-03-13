import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
}

export function SwipeableRow({ children, onDelete }: SwipeableRowProps) {
  const { t } = useTranslation();
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    swipeableRef.current?.close();
    onDelete();
  };

  const renderRightActions = () => {
    return (
      <View style={styles.actionsContainer}>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>{t('common.delete')}</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      overshootRight={false}
      rightThreshold={40}
      renderRightActions={renderRightActions}
      childrenContainerStyle={styles.foreground}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  foreground: {
    backgroundColor: '#fff',
  },
  actionsContainer: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
