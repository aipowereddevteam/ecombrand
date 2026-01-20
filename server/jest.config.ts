import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverageFrom: [
        'controllers/**/*.ts',
        'middleware/**/*.ts',
        'models/**/*.ts',
        'utils/**/*.ts',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!utils/redis.ts', // Mocked in tests
        '!server.ts' // Server entry point
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 60,
            lines: 60,
            statements: 60
        }
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    testTimeout: 15000, // 15 seconds for DB operations
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
};

export default config;
