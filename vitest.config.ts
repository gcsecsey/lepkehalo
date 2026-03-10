import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Replace react-native entry point with our mock for testing.
// React Native ships Flow-typed .js files that Node.js can't parse.
// The mock provides all the RN APIs needed by tests and @testing-library/react-native.
const rnIndexPath = path.resolve(__dirname, 'node_modules/react-native/index.js');
const rnMockPath = path.resolve(__dirname, '__mocks__/react-native.ts');

// Only patch if the file still has Flow syntax (idempotent)
const rnContent = fs.readFileSync(rnIndexPath, 'utf-8');
if (rnContent.includes('@flow')) {
  // Store original for restoration
  fs.writeFileSync(rnIndexPath + '.flow-backup', rnContent);
  // Replace with a CJS re-export of our mock (compiled at test time)
  fs.writeFileSync(rnIndexPath, `// Patched by vitest.config.ts - original saved as index.js.flow-backup
'use strict';
module.exports = require('${rnMockPath.replace(/\\/g, '\\\\')}');
`);
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname,
    },
  },
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['__tests__/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
    environment: 'jsdom',
    server: {
      deps: {
        inline: [
          '@testing-library/react-native',
          'react-native',
          '@react-native',
          '@react-navigation',
          'expo',
          'expo-camera',
          'expo-haptics',
          'expo-status-bar',
          'expo-web-browser',
          '@shopify/flash-list',
          'react-native-gesture-handler',
          'react-native-screens',
          'react-native-safe-area-context',
          'react-native-inappbrowser-reborn',
          'react-native-vision-camera',
          '@react-native-async-storage/async-storage',
        ],
      },
    },
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.{ts,tsx}'],
    },
  },
});
