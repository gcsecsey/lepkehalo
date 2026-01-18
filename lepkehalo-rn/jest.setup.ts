// Jest setup file for React Native Testing Library

// Extend expect with custom matchers from React Native Testing Library
import '@testing-library/react-native/build/matchers/extend-expect';

// MSW server setup for API mocking
import { server } from './__mocks__/server';

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test (important for test isolation)
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());

// Mock native modules
jest.mock('react-native-vision-camera');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native-inappbrowser-reborn');
