/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  moduleNameMapper: {
    '^mat-password-meter$': '<rootDir>/src/public-api.ts',
  },
  transform: {
    '^.+\\.(ts|js|mjs|cjs|html|svg)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$',
      },
    ],
  },
  // Exclude build output from Jest's module map to prevent Haste naming collisions
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  // Scope coverage reporting to library source only (run with: jest --coverage)
  collectCoverageFrom: ['src/**/*.ts', '!src/public-api.ts', '!src/**/index.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
};
