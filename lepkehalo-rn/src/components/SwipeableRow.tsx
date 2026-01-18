import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
}

export function SwipeableRow({ children, onDelete }: SwipeableRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.deleteContainer}>
        <Animated.Text style={[styles.deleteText, { transform: [{ scale }] }]}>
          Törlés
        </Animated.Text>
      </View>
    );
  };

  const handleSwipeOpen = () => {
    onDelete();
    swipeableRef.current?.close();
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
      onSwipeableOpen={handleSwipeOpen}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  deleteContainer: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
