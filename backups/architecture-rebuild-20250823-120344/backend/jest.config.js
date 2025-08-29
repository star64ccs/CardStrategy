module.exports = {
  // 測試環境
  testEnvironment: 'node',

  // 測試文件模式
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
    '**/tests/**/*.js',
  ],

  // 忽略的文件
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/logs/',
    '/backups/',
  ],

  // 收集覆蓋率的文件
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/config/**',
    '!src/migrations/**',
    '!src/seeders/**',
  ],

  // 覆蓋率閾值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // 覆蓋率報告器
  coverageReporters: ['text', 'lcov', 'html', 'json'],

  // 設置文件
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // 測試超時
  testTimeout: 10000,

  // 詳細輸出
  verbose: true,

  // 強制退出
  forceExit: true,

  // 清除模擬
  clearMocks: true,

  // 重置模擬
  resetMocks: true,

  // 恢復模擬
  restoreMocks: true,

  // 模塊名稱映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
  },

  // 轉換器
  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  // 轉換忽略
  transformIgnorePatterns: ['/node_modules/(?!(ioredis|bull|sequelize)/)'],

  // 測試結果輸出
  testResultsProcessor: 'jest-junit',

  // 報告器
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports/junit',
        outputName: 'js-test-results.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
  ],
};
