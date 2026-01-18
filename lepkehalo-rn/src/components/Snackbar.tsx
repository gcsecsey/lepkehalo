import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface SnackbarProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  duration?: number;
  visible: boolean;
}

export function Snackbar({
  message,
  actionLabel = 'Visszavonás',
  onAction,
  onDismiss,
  duration = 4000,
  visible,
}: SnackbarProps) {
  const translateY = React.useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, duration]);

  const handleDismiss = () => {
    Animated.timing(translateY, {
      toValue: 100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  const handleAction = () => {
    onAction?.();
    handleDismiss();
  };

  if (!visible) return null;

  return (
    <Animated.View
      testID="undo-snackbar"
      style={[styles.container, { transform: [{ translateY }] }]}
    >
      <Text style={styles.message}>{message}</Text>
      {onAction && (
        <TouchableOpacity onPress={handleAction} style={styles.actionButton}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#323232',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  actionButton: {
    marginLeft: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
