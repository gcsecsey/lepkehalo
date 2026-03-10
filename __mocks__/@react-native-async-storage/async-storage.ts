// Mock for @react-native-async-storage/async-storage
// In-memory storage for testing

let storage: Record<string, string> = {};

const AsyncStorage = {
  getItem: vi.fn(async (key: string) => {
    return storage[key] ?? null;
  }),

  setItem: vi.fn(async (key: string, value: string) => {
    storage[key] = value;
  }),

  removeItem: vi.fn(async (key: string) => {
    delete storage[key];
  }),

  clear: vi.fn(async () => {
    storage = {};
  }),

  getAllKeys: vi.fn(async () => {
    return Object.keys(storage);
  }),

  multiGet: vi.fn(async (keys: string[]) => {
    return keys.map((key) => [key, storage[key] ?? null]);
  }),

  multiSet: vi.fn(async (keyValuePairs: [string, string][]) => {
    keyValuePairs.forEach(([key, value]) => {
      storage[key] = value;
    });
  }),

  multiRemove: vi.fn(async (keys: string[]) => {
    keys.forEach((key) => {
      delete storage[key];
    });
  }),
};

export default AsyncStorage;
