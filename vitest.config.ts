import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    exclude: ['**/node_modules/**', 'les-cz/**'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: ['src/lib/**/*.ts'],
      thresholds: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
    },
  },
});
