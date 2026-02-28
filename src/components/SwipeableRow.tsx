import React, { useRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
}

export function SwipeableRow({ children, onDelete }: SwipeableRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    swipeableRef.current?.close();
    onDelete();
  };

  const renderRightActions = () => (
    <RectButton style={styles.deleteButton} onPress={handleDelete}>
      <Text style={styles.deleteText}>Törlés</Text>
    </RectButton>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      overshootRight={false}
      renderRightActions={renderRightActions}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
