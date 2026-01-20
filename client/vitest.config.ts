import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './tests/setup.ts',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'tests/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/mockData.ts',
                '.next/',
                'app/layout.tsx'
            ],
            thresholds: {
                lines: 60,
                functions: 60,
                branches: 50,
                statements: 60
            }
        },
        testTimeout: 10000
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        }
    }
});
