import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { RootNavigator } from './navigation/RootNavigator';
import { useBookStore } from '@/stores/bookStore';

export default function App() {
  const loadBooks = useBookStore((state) => state.loadBooks);

  useEffect(() => {
    // Load books on app start
    loadBooks();
  }, [loadBooks]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <RootNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
