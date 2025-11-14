# jest.config.js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/apps'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: [
    'apps/services/**/src/**/*.{js,ts}',
    '!apps/services/**/src/**/*.d.ts',
    '!apps/services/**/src/config/**',
    '!apps/services/**/src/models/**', // Models are mostly schema definitions
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 15000,
};