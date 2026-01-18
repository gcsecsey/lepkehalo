// Mock for @react-native-async-storage/async-storage
// In-memory storage for testing

let storage: Record<string, string> = {};

const AsyncStorage = {
  getItem: jest.fn(async (key: string) => {
    return storage[key] ?? null;
  }),

  setItem: jest.fn(async (key: string, value: string) => {
    storage[key] = value;
  }),

  removeItem: jest.fn(async (key: string) => {
    delete storage[key];
  }),

  clear: jest.fn(async () => {
    storage = {};
  }),

  getAllKeys: jest.fn(async () => {
    return Object.keys(storage);
  }),

  multiGet: jest.fn(async (keys: string[]) => {
    return keys.map((key) => [key, storage[key] ?? null]);
  }),

  multiSet: jest.fn(async (keyValuePairs: [string, string][]) => {
    keyValuePairs.forEach(([key, value]) => {
      storage[key] = value;
    });
  }),

  multiRemove: jest.fn(async (keys: string[]) => {
    keys.forEach((key) => {
      delete storage[key];
    });
  }),
};

export default AsyncStorage;
