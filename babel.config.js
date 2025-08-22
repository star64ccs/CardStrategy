module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'react' }],
      '@babel/preset-flow', // 添加 Flow 支持
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@store': './src/store',
            '@utils': './src/utils',
            '@config': './src/config',
            '@i18n': './src/i18n',
            '@types': './src/types',
            '@assets': './assets',
            '@__tests__': './src/__tests__',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
    env: {
      test: {
        plugins: [
          ['@babel/plugin-transform-flow-strip-types'], // 測試環境移除 Flow 類型
        ],
      },
    },
  };
};
