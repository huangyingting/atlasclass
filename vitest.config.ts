import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['tests/api.test.ts'],
    environment: 'node',
    testTimeout: 30000,
    server: {
      deps: {
        inline: ['next-auth', '@auth/core'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/server': path.resolve(__dirname, './node_modules/next/server.js'),
      'next/headers': path.resolve(__dirname, './node_modules/next/headers.js'),
    },
  },
});
