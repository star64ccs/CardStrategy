module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'react' }],
      '@babel/preset-typescript'
    ],
    plugins: [
      // React Native 相關插件
      'react-native-reanimated/plugin',

      // 路徑別名解析
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/services': './src/services',
            '@/store': './src/store',
            '@/utils': './src/utils',
            '@/config': './src/config',
            '@/i18n': './src/i18n',
            '@/types': './src/types',
            '@/assets': './assets',
            '@/__tests__': './src/__tests__'
          }
        }
      ],

      // 支持 TypeScript 裝飾器
      ['@babel/plugin-proposal-decorators', { legacy: true }],

      // 支持類屬性
      ['@babel/plugin-transform-class-properties', { loose: true }],

      // 支持私有方法和屬性
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],

      // 支持可選鏈操作符
      '@babel/plugin-transform-optional-chaining',

      // 支持空值合併操作符
      '@babel/plugin-transform-nullish-coalescing-operator'
    ],
    env: {
      test: {
        plugins: [
          // 測試環境下的額外插件
          '@babel/plugin-transform-modules-commonjs'
        ]
      }
    }
  };
};
