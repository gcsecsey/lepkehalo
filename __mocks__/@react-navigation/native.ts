// Mock for @react-navigation/native

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();

export const useNavigation = jest.fn(() => ({
  navigate: mockNavigate,
  goBack: mockGoBack,
  reset: mockReset,
}));

export const useRoute = jest.fn(() => ({
  params: {},
}));

export const useFocusEffect = jest.fn((callback) => {
  callback();
});

export const useIsFocused = jest.fn(() => true);

export const NavigationContainer = ({ children }: { children: React.ReactNode }) => children;

// Export the mock functions for testing
export const __mockNavigate = mockNavigate;
export const __mockGoBack = mockGoBack;
export const __mockReset = mockReset;
