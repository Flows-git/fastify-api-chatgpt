const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig')

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  globalSetup: '<rootDir>/tests/app.setup.ts',
  globalTeardown: '<rootDir>/tests/app.teardown.ts',
  collectCoverageFrom: ['./src/**'],
  coveragePathIgnorePatterns: ['<rootDir>/src/types'],
}
