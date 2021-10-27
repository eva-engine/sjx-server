const {pathsToModuleNameMapper} = require('ts-jest/utils');
const tsconfig = require('./tsconfig');

const moduleNameMapper = pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {prefix: '<rootDir>/'});

module.exports = {
  preset: 'ts-jest',
  rootDir: __dirname,
  setupFilesAfterEnv: ['./scripts/setupJestEnv.ts'],
  globals: {
    DEV: true,
    __DEV__: true,
    __TEST__: true,
  },
  testURL: 'http://www.anxyser.xyz',
  verbose: true,
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'json', 'lcov'],
  collectCoverageFrom: [],
  moduleNameMapper,
  transform: {
    '^.+\\.(ts|js)?$': 'ts-jest',
  },
  transformIgnorePatterns: [],
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.git/',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['<rootDir>/**/*.spec.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/resource-loader/',
    'packages/plugin-renderer-test',
    'packages/eva-plugin-tiny',
    'packages/plugin-alive',
    'packages/plugin-render',
  ],
};
export {};