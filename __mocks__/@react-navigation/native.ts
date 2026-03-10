// Mock for @react-navigation/native

const mockNavigate = vi.fn();
const mockGoBack = vi.fn();
const mockReset = vi.fn();

export const useNavigation = vi.fn(() => ({
  navigate: mockNavigate,
  goBack: mockGoBack,
  reset: mockReset,
}));

export const useRoute = vi.fn(() => ({
  params: {},
}));

export const useFocusEffect = vi.fn((callback) => {
  callback();
});

export const useIsFocused = vi.fn(() => true);

export const NavigationContainer = ({ children }: { children: React.ReactNode }) => children;

// Export the mock functions for testing
export const __mockNavigate = mockNavigate;
export const __mockGoBack = mockGoBack;
export const __mockReset = mockReset;
