const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// 優化配置
module.exports = {
  ...config,
  
  // 解析器配置
  resolver: {
    ...config.resolver,
    // 優先解析的文件擴展名
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
    // 平台特定文件擴展名
    platformExts: ['ios', 'android', 'native', 'web'],
    // 別名配置
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/screens': path.resolve(__dirname, 'src/screens'),
      '@/services': path.resolve(__dirname, 'src/services'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
      '@/config': path.resolve(__dirname, 'src/config'),
      '@/assets': path.resolve(__dirname, 'assets'),
    },
    // 排除不需要打包的模組
    blacklistRE: /node_modules\/.*\/node_modules\/react-native\/.*/,
  },

  // 轉換器配置
  transformer: {
    ...config.transformer,
    // 啟用 Hermes 引擎
    enableHermes: true,
    // 優化圖片處理
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
    // 啟用 Fast Refresh
    enableFastRefresh: true,
    // 優化 TypeScript 編譯
    typescript: {
      enableBabelRCLookup: false,
    },
  },

  // 打包配置
  serializer: {
    ...config.serializer,
    // 優化打包大小
    createModuleIdFactory: () => {
      const fileToIdMap = new Map();
      let nextId = 1;
      return (path) => {
        let id = fileToIdMap.get(path);
        if (typeof id !== 'number') {
          id = nextId++;
          fileToIdMap.set(path, id);
        }
        return id;
      };
    },
    // 自定義模組處理
    processModuleFilter: (module) => {
      // 排除測試文件
      if (module.path.includes('__tests__') || module.path.includes('.test.')) {
        return false;
      }
      // 排除開發工具
      if (module.path.includes('react-native-debugger') || 
          module.path.includes('flipper')) {
        return false;
      }
      return true;
    },
  },

  // 緩存配置
  cacheStores: [
    {
      name: 'metro-cache',
      type: 'file',
      options: {
        maxSize: 100 * 1024 * 1024, // 100MB
        ttl: 24 * 60 * 60 * 1000, // 24小時
      },
    },
  ],

  // 監控配置
  watchFolders: [
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'assets'),
  ],

  // 開發服務器配置
  server: {
    port: 8081,
    enhanceMiddleware: (middleware, server) => {
      // 添加效能監控中間件
      return (req, res, next) => {
        const start = Date.now();
        middleware(req, res, () => {
          const duration = Date.now() - start;
          if (duration > 1000) {
            console.warn(`Slow request: ${req.url} took ${duration}ms`);
          }
          next();
        });
      };
    },
  },

  // 打包優化
  maxWorkers: 4, // 限制工作進程數量
  resetCache: false, // 開發時保持緩存
};
