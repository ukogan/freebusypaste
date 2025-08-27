module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns - only real integration tests
  testMatch: [
    '<rootDir>/test-cases/jest-unit-tests/real-integration.test.js',
    '<rootDir>/test-cases/jest-unit-tests/integration-auth.test.js'
  ],
  
  // Coverage settings
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'main/**/*.js',
    '!main/**/*.test.js',
    '!**/node_modules/**'
  ],
  
  // Module resolution
  moduleDirectories: ['node_modules', '<rootDir>'],
  
  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Test timeout
  testTimeout: 10000,
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test-cases/test-setup.js'],
  
  // Transform settings
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Module name mapping for mocks
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  
  // Verbose output
  verbose: true
};