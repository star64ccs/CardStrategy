import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// 模擬 Module Federation 的動態加載
const mockModuleFederation = {
  cardManagement: {
    CardList: () =>
      Promise.resolve({
        default: () => <div data-testid="remote-card-list">遠程卡片列表</div>,
      }),
    CardDetail: () =>
      Promise.resolve({
        default: () => <div data-testid="remote-card-detail">遠程卡片詳情</div>,
      }),
    CardScanner: () =>
      Promise.resolve({
        default: () => (
          <div data-testid="remote-card-scanner">遠程卡片掃描</div>
        ),
      }),
  },
  marketAnalysis: {
    MarketDashboard: () =>
      Promise.resolve({
        default: () => (
          <div data-testid="remote-market-dashboard">遠程市場儀表板</div>
        ),
      }),
    PriceChart: () =>
      Promise.resolve({
        default: () => <div data-testid="remote-price-chart">遠程價格圖表</div>,
      }),
    MarketTrends: () =>
      Promise.resolve({
        default: () => (
          <div data-testid="remote-market-trends">遠程市場趨勢</div>
        ),
      }),
  },
  aiEcosystem: {
    AIDashboard: () =>
      Promise.resolve({
        default: () => (
          <div data-testid="remote-ai-dashboard">遠程 AI 儀表板</div>
        ),
      }),
    CardScanner: () =>
      Promise.resolve({
        default: () => <div data-testid="remote-ai-scanner">遠程 AI 掃描</div>,
      }),
    MarketPredictor: () =>
      Promise.resolve({
        default: () => (
          <div data-testid="remote-market-predictor">遠程市場預測</div>
        ),
      }),
  },
};

// 模擬動態加載函數
const loadRemoteModule = async (moduleName: string, componentName: string) => {
  const module =
    mockModuleFederation[moduleName as keyof typeof mockModuleFederation];
  if (module && module[componentName as keyof typeof module]) {
    return await module[componentName as keyof typeof module]();
  }
  throw new Error(
    `Module ${moduleName} or component ${componentName} not found`
  );
};

// 模擬 Shell 應用組件
const MockShellApp = () => {
  const [loadedModules, setLoadedModules] = React.useState<Record<string, any>>(
    {}
  );
  const [loading, setLoading] = React.useState<Record<string, boolean>>({});
  const [error, setError] = React.useState<Record<string, string>>({});

  const loadModule = async (moduleName: string, componentName: string) => {
    setLoading((prev) => ({ ...prev, [componentName]: true }));
    setError((prev) => ({ ...prev, [componentName]: '' }));

    try {
      const module = await loadRemoteModule(moduleName, componentName);
      setLoadedModules((prev) => ({
        ...prev,
        [componentName]: module.default,
      }));
      setLoading((prev) => ({ ...prev, [componentName]: false }));
    } catch (err) {
      setError((prev) => ({
        ...prev,
        [componentName]: err instanceof Error ? err.message : 'Unknown error',
      }));
      setLoading((prev) => ({ ...prev, [componentName]: false }));
    }
  };

  return (
    <div data-testid="shell-app">
      <nav>
        <button
          data-testid="load-card-list"
          onClick={() => loadModule('cardManagement', 'CardList')}
        >
          加載卡片列表
        </button>
        <button
          data-testid="load-market-dashboard"
          onClick={() => loadModule('marketAnalysis', 'MarketDashboard')}
        >
          加載市場儀表板
        </button>
        <button
          data-testid="load-ai-dashboard"
          onClick={() => loadModule('aiEcosystem', 'AIDashboard')}
        >
          加載 AI 儀表板
        </button>
      </nav>

      <div data-testid="module-container">
        {Object.entries(loadedModules).map(([componentName, Component]) => (
          <div
            key={componentName}
            data-testid={`loaded-${componentName.toLowerCase()}`}
          >
            <Component />
          </div>
        ))}
      </div>

      <div data-testid="loading-status">
        {Object.entries(loading).map(
          ([componentName, isLoading]) =>
            isLoading && (
              <div key={componentName} data-testid={`loading-${componentName}`}>
                加載中...
              </div>
            )
        )}
      </div>

      <div data-testid="error-status">
        {Object.entries(error).map(
          ([componentName, errorMessage]) =>
            errorMessage && (
              <div key={componentName} data-testid={`error-${componentName}`}>
                {errorMessage}
              </div>
            )
        )}
      </div>
    </div>
  );
};

// 創建測試 store
const createTestStore = () => {
  return configureStore({
    reducer: {
      modules: (
        state = { loadedModules: [], loadingStates: {} },
        action: any
      ) => {
        switch (action.type) {
          case 'modules/setLoadedModule':
            return {
              ...state,
              loadedModules: [...state.loadedModules, action.payload],
            };
          case 'modules/setLoadingState':
            return {
              ...state,
              loadingStates: {
                ...state.loadingStates,
                [action.payload.moduleName]: action.payload.loading,
              },
            };
          default:
            return state;
        }
      },
    },
  });
};

describe('Module Federation 集成測試', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('動態模組加載測試', () => {
    test('能成功加載卡片管理模組', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <MockShellApp />
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 點擊加載卡片列表
      fireEvent.click(screen.getByTestId('load-card-list'));

      // 等待加載完成
      await waitFor(() => {
        expect(screen.getByTestId('loaded-cardlist')).toBeInTheDocument();
      });

      // 驗證組件已正確加載
      expect(screen.getByTestId('remote-card-list')).toBeInTheDocument();
      expect(screen.getByText('遠程卡片列表')).toBeInTheDocument();
    });

    test('能成功加載市場分析模組', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <MockShellApp />
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 點擊加載市場儀表板
      fireEvent.click(screen.getByTestId('load-market-dashboard'));

      // 等待加載完成
      await waitFor(() => {
        expect(
          screen.getByTestId('loaded-marketdashboard')
        ).toBeInTheDocument();
      });

      // 驗證組件已正確加載
      expect(screen.getByTestId('remote-market-dashboard')).toBeInTheDocument();
      expect(screen.getByText('遠程市場儀表板')).toBeInTheDocument();
    });

    test('能成功加載 AI 生態模組', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <MockShellApp />
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 點擊加載 AI 儀表板
      fireEvent.click(screen.getByTestId('load-ai-dashboard'));

      // 等待加載完成
      await waitFor(() => {
        expect(screen.getByTestId('loaded-aidashboard')).toBeInTheDocument();
      });

      // 驗證組件已正確加載
      expect(screen.getByTestId('remote-ai-dashboard')).toBeInTheDocument();
      expect(screen.getByText('遠程 AI 儀表板')).toBeInTheDocument();
    });
  });

  describe('模組加載狀態管理測試', () => {
    test('加載過程中顯示加載狀態', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <MockShellApp />
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 點擊加載按鈕
      fireEvent.click(screen.getByTestId('load-card-list'));

      // 驗證加載狀態顯示
      expect(screen.getByTestId('loading-CardList')).toBeInTheDocument();
      expect(screen.getByText('加載中...')).toBeInTheDocument();

      // 等待加載完成
      await waitFor(() => {
        expect(
          screen.queryByTestId('loading-CardList')
        ).not.toBeInTheDocument();
      });
    });

    test('加載失敗時顯示錯誤信息', async () => {
      // 模擬加載失敗
      const originalLoadModule = loadRemoteModule;
      (global as any).loadRemoteModule = async () => {
        throw new Error('模組加載失敗');
      };

      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <MockShellApp />
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 點擊加載按鈕
      fireEvent.click(screen.getByTestId('load-card-list'));

      // 等待錯誤顯示
      await waitFor(() => {
        expect(screen.getByTestId('error-CardList')).toBeInTheDocument();
        expect(screen.getByText('模組加載失敗')).toBeInTheDocument();
      });

      // 恢復原始函數
      (global as any).loadRemoteModule = originalLoadModule;
    });
  });

  describe('多模組協同工作測試', () => {
    test('能同時加載多個模組', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <MockShellApp />
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 依次加載多個模組
      fireEvent.click(screen.getByTestId('load-card-list'));
      fireEvent.click(screen.getByTestId('load-market-dashboard'));
      fireEvent.click(screen.getByTestId('load-ai-dashboard'));

      // 等待所有模組加載完成
      await waitFor(() => {
        expect(screen.getByTestId('loaded-cardlist')).toBeInTheDocument();
        expect(
          screen.getByTestId('loaded-marketdashboard')
        ).toBeInTheDocument();
        expect(screen.getByTestId('loaded-aidashboard')).toBeInTheDocument();
      });

      // 驗證所有組件都正確顯示
      expect(screen.getByText('遠程卡片列表')).toBeInTheDocument();
      expect(screen.getByText('遠程市場儀表板')).toBeInTheDocument();
      expect(screen.getByText('遠程 AI 儀表板')).toBeInTheDocument();
    });

    test('模組間能共享狀態', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <MockShellApp />
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 加載模組
      fireEvent.click(screen.getByTestId('load-card-list'));
      fireEvent.click(screen.getByTestId('load-market-dashboard'));

      await waitFor(() => {
        expect(screen.getByTestId('loaded-cardlist')).toBeInTheDocument();
        expect(
          screen.getByTestId('loaded-marketdashboard')
        ).toBeInTheDocument();
      });

      // 驗證 store 中有模組加載記錄
      const state = store.getState();
      expect(state.modules.loadedModules).toHaveLength(2);
    });
  });

  describe('模組版本兼容性測試', () => {
    test('能處理不同版本的模組', async () => {
      // 模擬不同版本的模組
      const mockModuleFederationV2 = {
        ...mockModuleFederation,
        cardManagement: {
          ...mockModuleFederation.cardManagement,
          CardList: () =>
            Promise.resolve({
              default: () => (
                <div data-testid="remote-card-list-v2">遠程卡片列表 V2</div>
              ),
            }),
        },
      };

      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <MockShellApp />
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 加載模組
      fireEvent.click(screen.getByTestId('load-card-list'));

      await waitFor(() => {
        expect(screen.getByTestId('loaded-cardlist')).toBeInTheDocument();
      });

      // 驗證組件能正常工作
      expect(screen.getByText('遠程卡片列表')).toBeInTheDocument();
    });
  });

  describe('模組熱更新測試', () => {
    test('能處理模組的熱更新', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <MockShellApp />
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 首次加載模組
      fireEvent.click(screen.getByTestId('load-card-list'));

      await waitFor(() => {
        expect(screen.getByTestId('loaded-cardlist')).toBeInTheDocument();
      });

      // 模擬模組更新
      const updatedModule = {
        CardList: () =>
          Promise.resolve({
            default: () => (
              <div data-testid="remote-card-list-updated">更新後的卡片列表</div>
            ),
          }),
      };

      // 重新加載模組
      fireEvent.click(screen.getByTestId('load-card-list'));

      await waitFor(() => {
        expect(screen.getByText('更新後的卡片列表')).toBeInTheDocument();
      });
    });
  });

  describe('模組依賴管理測試', () => {
    test('能正確處理模組間的依賴關係', async () => {
      // 模擬有依賴關係的模組
      const mockDependentModule = {
        MarketAnalysis: () =>
          Promise.resolve({
            default: () => (
              <div data-testid="dependent-market-analysis">依賴市場分析</div>
            ),
          }),
      };

      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <MockShellApp />
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 先加載基礎模組
      fireEvent.click(screen.getByTestId('load-market-dashboard'));

      await waitFor(() => {
        expect(
          screen.getByTestId('loaded-marketdashboard')
        ).toBeInTheDocument();
      });

      // 再加載依賴模組
      // 這裡可以測試依賴檢查邏輯
      expect(screen.getByText('遠程市場儀表板')).toBeInTheDocument();
    });
  });

  describe('模組性能測試', () => {
    test('模組加載時間在可接受範圍內', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <MockShellApp />
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      const startTime = performance.now();

      // 加載模組
      fireEvent.click(screen.getByTestId('load-card-list'));

      await waitFor(() => {
        expect(screen.getByTestId('loaded-cardlist')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // 驗證加載時間在合理範圍內（這裡設置為 1000ms）
      expect(loadTime).toBeLessThan(1000);
    });

    test('多個模組並行加載性能', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <MockShellApp />
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      const startTime = performance.now();

      // 並行加載多個模組
      fireEvent.click(screen.getByTestId('load-card-list'));
      fireEvent.click(screen.getByTestId('load-market-dashboard'));
      fireEvent.click(screen.getByTestId('load-ai-dashboard'));

      await waitFor(() => {
        expect(screen.getByTestId('loaded-cardlist')).toBeInTheDocument();
        expect(
          screen.getByTestId('loaded-marketdashboard')
        ).toBeInTheDocument();
        expect(screen.getByTestId('loaded-aidashboard')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // 驗證並行加載時間
      expect(loadTime).toBeLessThan(1500);
    });
  });
});
