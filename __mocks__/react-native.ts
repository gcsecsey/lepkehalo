// Lightweight react-native mock for Vitest
// Replaces the real react-native module to avoid Flow type parsing issues
import React from 'react';

// Basic component factory
const createMockComponent = (name: string) => {
  const Component = React.forwardRef((props: any, ref: any) => {
    return React.createElement(name, { ...props, ref });
  });
  Component.displayName = name;
  return Component;
};

// Core components
export const View = createMockComponent('View');
export const Text = createMockComponent('Text');
export const Image = createMockComponent('Image');
export const ScrollView = createMockComponent('ScrollView');
export const TextInput = createMockComponent('TextInput');
export const TouchableOpacity = createMockComponent('TouchableOpacity');
export const TouchableHighlight = createMockComponent('TouchableHighlight');
export const TouchableWithoutFeedback = createMockComponent('TouchableWithoutFeedback');
export const Pressable = createMockComponent('Pressable');
// FlatList needs to actually render items for tests
export const FlatList = React.forwardRef(({ data, renderItem, keyExtractor, ListEmptyComponent, ListHeaderComponent, ListFooterComponent, ...props }: any, ref: any) => {
  const items = data?.map((item: any, index: number) => {
    const key = keyExtractor ? keyExtractor(item, index) : item.key ?? item.id ?? String(index);
    return React.createElement(React.Fragment, { key }, renderItem({ item, index, separators: {} }));
  }) ?? [];
  return React.createElement(
    'FlatList',
    { ...props, ref },
    ListHeaderComponent ? React.createElement(React.Fragment, null, typeof ListHeaderComponent === 'function' ? React.createElement(ListHeaderComponent) : ListHeaderComponent) : null,
    items.length > 0 ? items : (ListEmptyComponent ? (typeof ListEmptyComponent === 'function' ? React.createElement(ListEmptyComponent) : ListEmptyComponent) : null),
    ListFooterComponent ? React.createElement(React.Fragment, null, typeof ListFooterComponent === 'function' ? React.createElement(ListFooterComponent) : ListFooterComponent) : null,
  );
});
export const SectionList = createMockComponent('SectionList');
export const ActivityIndicator = createMockComponent('ActivityIndicator');
export const Modal = createMockComponent('Modal');
export const SafeAreaView = createMockComponent('SafeAreaView');
export const StatusBar = createMockComponent('StatusBar');
export const KeyboardAvoidingView = createMockComponent('KeyboardAvoidingView');

// StyleSheet
export const StyleSheet = {
  create: (styles: any) => styles,
  flatten: (style: any) => (Array.isArray(style) ? Object.assign({}, ...style) : style),
  absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  hairlineWidth: 1,
};

// Platform
export const Platform = {
  OS: 'ios' as const,
  Version: 17,
  select: (obj: any) => obj.ios ?? obj.default,
  isPad: false,
  isTV: false,
  isTesting: true,
};

// Dimensions
export const Dimensions = {
  get: () => ({ width: 375, height: 812, scale: 2, fontScale: 1 }),
  addEventListener: () => ({ remove: () => {} }),
};

// Animated
const AnimatedValue = class {
  _value: number;
  constructor(value: number) { this._value = value; }
  setValue(value: number) { this._value = value; }
  interpolate() { return this; }
  addListener() { return ''; }
  removeListener() {}
  removeAllListeners() {}
};

export const Animated = {
  View: createMockComponent('Animated.View'),
  Text: createMockComponent('Animated.Text'),
  Image: createMockComponent('Animated.Image'),
  ScrollView: createMockComponent('Animated.ScrollView'),
  FlatList: createMockComponent('Animated.FlatList'),
  Value: AnimatedValue,
  ValueXY: class { x = new AnimatedValue(0); y = new AnimatedValue(0); },
  timing: () => ({ start: (cb?: () => void) => cb?.() }),
  spring: () => ({ start: (cb?: () => void) => cb?.() }),
  decay: () => ({ start: (cb?: () => void) => cb?.() }),
  sequence: () => ({ start: (cb?: () => void) => cb?.() }),
  parallel: () => ({ start: (cb?: () => void) => cb?.() }),
  delay: () => ({ start: (cb?: () => void) => cb?.() }),
  event: () => () => {},
  createAnimatedComponent: (c: any) => c,
};

// Other APIs
export const Alert = { alert: () => {} };
export const Linking = { openURL: async () => {}, canOpenURL: async () => true, addEventListener: () => ({ remove: () => {} }) };
export const AppState = { currentState: 'active', addEventListener: () => ({ remove: () => {} }) };
export const Keyboard = { dismiss: () => {}, addListener: () => ({ remove: () => {} }) };
export const BackHandler = { addEventListener: () => ({ remove: () => {} }), exitApp: () => {} };
export const PixelRatio = { get: () => 2, getFontScale: () => 1, getPixelSizeForLayoutSize: (size: number) => size * 2, roundToNearestPixel: (size: number) => size };
export const useColorScheme = () => 'light';
export const useWindowDimensions = () => ({ width: 375, height: 812, scale: 2, fontScale: 1 });
export const NativeModules = {};
export const NativeEventEmitter = class { addListener() { return { remove: () => {} }; } removeAllListeners() {} };
export const requireNativeComponent = (name: string) => createMockComponent(name);

export default {
  View, Text, Image, ScrollView, TextInput,
  TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback, Pressable,
  FlatList, SectionList, ActivityIndicator, Modal, SafeAreaView, StatusBar,
  KeyboardAvoidingView, StyleSheet, Platform, Dimensions, Animated,
  Alert, Linking, AppState, Keyboard, BackHandler, PixelRatio,
  useColorScheme, useWindowDimensions, NativeModules, NativeEventEmitter,
  requireNativeComponent,
};
