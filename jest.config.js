/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(svg|png|jpg|jpeg|gif|webp|avif)$': '<rootDir>/test/__mocks__/fileMock.js',
    '^next/navigation$': '<rootDir>/test/__mocks__/nextNavigationMock.js',
    '^next/link$': '<rootDir>/test/__mocks__/nextLinkMock.js'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(?:@firebase)/)'
  ],
};
