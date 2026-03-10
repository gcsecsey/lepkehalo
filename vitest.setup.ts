// React Native globals
(globalThis as any).__DEV__ = true;

// Vitest setup file for React Native Testing Library

// Extend expect with custom matchers from React Native Testing Library
// import '@testing-library/react-native/build/matchers/extend-expect';

// MSW server setup for API mocking
import { server } from './__mocks__/server';

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test (important for test isolation)
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());

// Mock native modules and RN ecosystem packages with native code
vi.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 375, height: 812 }),
}));
vi.mock('react-native-screens', () => ({
  enableScreens: vi.fn(),
  Screen: ({ children }: any) => children,
  ScreenContainer: ({ children }: any) => children,
  NativeScreen: ({ children }: any) => children,
  NativeScreenContainer: ({ children }: any) => children,
}));
vi.mock('@react-navigation/native');
vi.mock('react-native-vision-camera');
vi.mock('@react-native-async-storage/async-storage');
vi.mock('react-native-inappbrowser-reborn');
vi.mock('expo-camera');
vi.mock('expo-web-browser', () => ({
  openBrowserAsync: vi.fn(),
  WebBrowserPresentationStyle: { FULL_SCREEN: 'fullScreen' },
}));
vi.mock('expo-haptics', () => ({
  notificationAsync: vi.fn(),
  impactAsync: vi.fn(),
  selectionAsync: vi.fn(),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));
