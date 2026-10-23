import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    // The Shopify Functions under shopify/ have their own test setup.
    include: ['src/**/*.test.ts'],
  },
});
