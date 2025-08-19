module.exports = {
  // 測試環境
  testEnvironment: 'node',

  // 測試文件模式
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],

  // 忽略的文件
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],

  // 收集覆蓋率的文件
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/database.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],

  // 覆蓋率報告器
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],

  // 覆蓋率目錄
  coverageDirectory: 'coverage',

  // 設置文件
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // 測試超時時間
  testTimeout: 30000,

  // 詳細輸出
  verbose: true,

  // 強制退出
  forceExit: true,

  // 清理模擬
  clearMocks: true,

  // 重置模擬
  resetMocks: true,

  // 恢復模擬
  restoreMocks: true,

  // 模擬文件擴展名
  moduleFileExtensions: ['js', 'json'],

  // 模塊名稱映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // 轉換器
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // 轉換忽略模式
  transformIgnorePatterns: [
    '/node_modules/'
  ],

  // 全局設置
  globals: {
    NODE_ENV: 'test'
  },

  // 報告器
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'reports/junit',
      outputName: 'js-test-results.xml',
      classNameTemplate: '{classname}-{title}',
      titleTemplate: '{classname}-{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ],

  // 通知
  notify: false,

  // 通知模式
  notifyMode: 'failure-change',

  // 監視插件
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
};
