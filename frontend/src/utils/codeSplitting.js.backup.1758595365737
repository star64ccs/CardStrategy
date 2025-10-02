// 代碼分割工具
import { lazy, Suspense } from 'react';

// 懶加載組件
export const LazyComponents = {
  // 路由級別分割
  HomePage: lazy(() => import('../pages/HomePage')),
  CardDetailPage: lazy(() => import('../pages/CardDetailPage')),
  UserProfilePage: lazy(() => import('../pages/UserProfilePage')),
  AdminPanel: lazy(() => import('../pages/AdminPanel')),

  // 功能級別分割
  CardScanner: lazy(() => import('../components/CardScanner')),
  PriceChart: lazy(() => import('../components/PriceChart')),
  ImageUploader: lazy(() => import('../components/ImageUploader')),
  DataVisualization: lazy(() => import('../components/DataVisualization')),

  // 第三方庫分割
  RichTextEditor: lazy(() => import('../components/RichTextEditor')),
  DatePicker: lazy(() => import('../components/DatePicker')),
  FileManager: lazy(() => import('../components/FileManager'))
};

// 動態導入工具
export const dynamicImport = {
  // 按需載入組件
  loadComponent: async (componentName) => {
    try {
      const module = await LazyComponents[componentName]();
      return module.default || module;
    } catch (error) {
      console.error(`載入組件 ${componentName} 失敗:`, error);
      return null;
    }
  },

  // 預載入組件
  preloadComponent: (componentName) => {
    if (LazyComponents[componentName]) {
      LazyComponents[componentName]();
    }
  },

  // 批量預載入
  preloadComponents: (componentNames) => {
    componentNames.forEach(name => this.preloadComponent(name));
  }
};

// 路由分割配置
export const routeSplitting = {
  // 主路由
  main: () => import('../routes/MainRoutes'),
  
  // 認證路由
  auth: () => import('../routes/AuthRoutes'),
  
  // 管理路由
  admin: () => import('../routes/AdminRoutes'),
  
  // API 路由
  api: () => import('../routes/ApiRoutes')
};

// 組件分割配置
export const componentSplitting = {
  // 表單組件
  forms: () => import('../components/forms'),
  
  // 圖表組件
  charts: () => import('../components/charts'),
  
  // 媒體組件
  media: () => import('../components/media'),
  
  // 導航組件
  navigation: () => import('../components/navigation')
};

// 庫分割配置
export const librarySplitting = {
  // 工具庫
  utils: () => import('../utils'),
  
  // 服務庫
  services: () => import('../services'),
  
  // 常數庫
  constants: () => import('../constants'),
  
  // 類型庫
  types: () => import('../types')
};

// 載入邊界組件
export const LoadingBoundary = ({ children, fallback = null }) => {
  return (
    <Suspense fallback={fallback || <div className="loading-spinner">載入中...</div>}>
      {children}
    </Suspense>
  );
};

// 錯誤邊界組件
export const ErrorBoundary = ({ children, onError }) => {
  return (
    <ErrorBoundaryWrapper onError={onError}>
      {children}
    </ErrorBoundaryWrapper>
  );
};

// 錯誤邊界包裝器
class ErrorBoundaryWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('組件載入錯誤:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h3>載入失敗</h3>
          <p>組件載入時發生錯誤，請刷新頁面重試。</p>
          <button onClick={() => window.location.reload()}>
            刷新頁面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 性能監控
export const performanceMonitor = {
  // 記錄載入時間
  recordLoadTime: (componentName, loadTime) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${componentName}-loaded`);
      console.log(`組件 ${componentName} 載入時間: ${loadTime}ms`);
    }
  },

  // 記錄錯誤
  recordError: (componentName, error) => {
    console.error(`組件 ${componentName} 載入錯誤:`, error);
    
    // 發送到錯誤監控服務
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'component_error', {
        component_name: componentName,
        error_message: error.message
      });
    }
  },

  // 預測載入時間
  predictLoadTime: (componentSize) => {
    const connectionSpeed = navigator.connection?.effectiveType || '4g';
    const speedMultiplier = {
      'slow-2g': 10,
      '2g': 5,
      '3g': 2,
      '4g': 1
    };
    
    return componentSize * speedMultiplier[connectionSpeed] || componentSize;
  }
};

export default {
  LazyComponents,
  dynamicImport,
  routeSplitting,
  componentSplitting,
  librarySplitting,
  LoadingBoundary,
  ErrorBoundary,
  performanceMonitor
};
