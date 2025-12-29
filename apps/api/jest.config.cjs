const path = require('path');

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    // .js 확장자를 제거하여 TypeScript 파일로 매핑
    '^@/(.*)\\.js$': '<rootDir>/$1',
    '^@/(.*)$': '<rootDir>/$1',
    // 상대 경로 .js 확장자 제거 (모든 경로에서)
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@locus/shared$': path.resolve(__dirname, '../../packages/shared/src'),
    '^@locus/shared/(.*)$':
      path.resolve(__dirname, '../../packages/shared/src') + '/$1',
  },
};
