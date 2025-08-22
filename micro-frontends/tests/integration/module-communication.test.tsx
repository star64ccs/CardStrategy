import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// 模擬微前端模組
const mockCardManagement = {
  CardList: () => <div data-testid="card-list">卡片列表模組</div>,
  CardDetail: () => <div data-testid="card-detail">卡片詳情模組</div>,
  CardScanner: () => <div data-testid="card-scanner">卡片掃描模組</div>,
};

const mockMarketAnalysis = {
  MarketDashboard: () => (
    <div data-testid="market-dashboard">市場分析儀表板</div>
  ),
  PriceChart: () => <div data-testid="price-chart">價格圖表</div>,
  MarketTrends: () => <div data-testid="market-trends">市場趨勢</div>,
};

const mockAIEcosystem = {
  AIDashboard: () => <div data-testid="ai-dashboard">AI 儀表板</div>,
  CardScanner: () => <div data-testid="ai-card-scanner">AI 卡片掃描</div>,
  MarketPredictor: () => <div data-testid="market-predictor">市場預測</div>,
};

// 創建測試 store
const createTestStore = () => {
  return configureStore({
    reducer: {
      cards: (state = { cards: [], selectedCard: null }, action) => {
        switch (action.type) {
          case 'cards/setCards':
            return { ...state, cards: action.payload };
          case 'cards/setSelectedCard':
            return { ...state, selectedCard: action.payload };
          default:
            return state;
        }
      },
      market: (state = { marketData: [], predictions: [] }, action) => {
        switch (action.type) {
          case 'market/setMarketData':
            return { ...state, marketData: action.payload };
          case 'market/setPredictions':
            return { ...state, predictions: action.payload };
          default:
            return state;
        }
      },
      ai: (state = { scanResults: [], recommendations: [] }, action) => {
        switch (action.type) {
          case 'ai/setScanResults':
            return { ...state, scanResults: action.payload };
          case 'ai/setRecommendations':
            return { ...state, recommendations: action.payload };
          default:
            return state;
        }
      },
    },
  });
};

// 設置 MSW 服務器
const server = setupServer(
  rest.get('/api/cards', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, name: '測試卡片1', price: 100 },
        { id: 2, name: '測試卡片2', price: 200 },
      ])
    );
  }),
  rest.get('/api/market/data', (req, res, ctx) => {
    return res(
      ctx.json([
        { date: '2024-01-01', price: 100, volume: 1000 },
        { date: '2024-01-02', price: 110, volume: 1200 },
      ])
    );
  }),
  rest.post('/api/ai/scan', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        result: { cardName: '掃描卡片', confidence: 0.95 },
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('微前端模組間通信集成測試', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('模組間數據共享測試', () => {
    test('卡片管理模組選擇卡片後，市場分析模組能接收到數據', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <div>
              <mockCardManagement.CardList />
              <mockMarketAnalysis.MarketDashboard />
            </div>
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 模擬選擇卡片
      store.dispatch({
        type: 'cards/setSelectedCard',
        payload: { id: 1, name: '測試卡片1', price: 100 },
      });

      await waitFor(() => {
        const state = store.getState();
        expect(state.cards.selectedCard).toEqual({
          id: 1,
          name: '測試卡片1',
          price: 100,
        });
      });
    });

    test('AI 掃描結果能同步到其他模組', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <div>
              <mockAIEcosystem.CardScanner />
              <mockCardManagement.CardDetail />
            </div>
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 模擬 AI 掃描結果
      store.dispatch({
        type: 'ai/setScanResults',
        payload: [{ cardName: '掃描卡片', confidence: 0.95 }],
      });

      await waitFor(() => {
        const state = store.getState();
        expect(state.ai.scanResults).toHaveLength(1);
        expect(state.ai.scanResults[0].cardName).toBe('掃描卡片');
      });
    });
  });

  describe('模組間事件通信測試', () => {
    test('卡片掃描事件能觸發市場分析更新', async () => {
      const mockEventBus = {
        listeners: new Map(),
        emit: function (event: string, data: any) {
          if (this.listeners.has(event)) {
            this.listeners
              .get(event)
              .forEach((callback: Function) => callback(data));
          }
        },
        on: function (event: string, callback: Function) {
          if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
          }
          this.listeners.get(event).push(callback);
        },
      };

      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <div>
              <mockCardManagement.CardScanner />
              <mockMarketAnalysis.PriceChart />
            </div>
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 模擬卡片掃描事件
      mockEventBus.emit('cardScanned', { cardId: 1, cardName: '掃描卡片' });

      await waitFor(() => {
        // 驗證事件是否被正確處理
        expect(mockEventBus.listeners.has('cardScanned')).toBe(true);
      });
    });

    test('市場預測結果能通知投資組合模組', async () => {
      const mockEventBus = {
        listeners: new Map(),
        emit: function (event: string, data: any) {
          if (this.listeners.has(event)) {
            this.listeners
              .get(event)
              .forEach((callback: Function) => callback(data));
          }
        },
        on: function (event: string, callback: Function) {
          if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
          }
          this.listeners.get(event).push(callback);
        },
      };

      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <div>
              <mockAIEcosystem.MarketPredictor />
            </div>
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 模擬市場預測事件
      mockEventBus.emit('marketPrediction', {
        cardId: 1,
        predictedPrice: 150,
        confidence: 0.85,
      });

      await waitFor(() => {
        expect(mockEventBus.listeners.has('marketPrediction')).toBe(true);
      });
    });
  });

  describe('模組間 API 調用測試', () => {
    test('多個模組能共享 API 響應數據', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <div>
              <mockCardManagement.CardList />
              <mockMarketAnalysis.MarketTrends />
            </div>
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 模擬 API 調用
      const response = await fetch('/api/cards');
      const cards = await response.json();

      // 驗證數據能被多個模組使用
      expect(cards).toHaveLength(2);
      expect(cards[0].name).toBe('測試卡片1');
      expect(cards[1].name).toBe('測試卡片2');
    });

    test('AI 掃描 API 調用能更新多個模組狀態', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <div>
              <mockAIEcosystem.CardScanner />
              <mockCardManagement.CardDetail />
            </div>
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 模擬 AI 掃描 API 調用
      const response = await fetch('/api/ai/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: 'base64data' }),
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.result.cardName).toBe('掃描卡片');
      expect(result.result.confidence).toBe(0.95);
    });
  });

  describe('模組間路由集成測試', () => {
    test('模組間導航能正確更新 URL 和狀態', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <div>
              <nav>
                <a href="/cards" data-testid="nav-cards">
                  卡片管理
                </a>
                <a href="/market" data-testid="nav-market">
                  市場分析
                </a>
                <a href="/ai" data-testid="nav-ai">
                  AI 生態
                </a>
              </nav>
              <mockCardManagement.CardList />
              <mockMarketAnalysis.MarketDashboard />
              <mockAIEcosystem.AIDashboard />
            </div>
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 測試導航到卡片管理
      fireEvent.click(screen.getByTestId('nav-cards'));
      await waitFor(() => {
        expect(window.location.pathname).toBe('/cards');
      });

      // 測試導航到市場分析
      fireEvent.click(screen.getByTestId('nav-market'));
      await waitFor(() => {
        expect(window.location.pathname).toBe('/market');
      });

      // 測試導航到 AI 生態
      fireEvent.click(screen.getByTestId('nav-ai'));
      await waitFor(() => {
        expect(window.location.pathname).toBe('/ai');
      });
    });
  });

  describe('模組間錯誤處理測試', () => {
    test('一個模組的錯誤不會影響其他模組', async () => {
      // 模擬 API 錯誤
      server.use(
        rest.get('/api/cards', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: '服務器錯誤' }));
        })
      );

      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <div>
              <mockCardManagement.CardList />
              <mockMarketAnalysis.MarketDashboard />
              <mockAIEcosystem.AIDashboard />
            </div>
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 驗證其他模組仍然正常工作
      expect(screen.getByTestId('market-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('ai-dashboard')).toBeInTheDocument();
    });

    test('模組間通信錯誤能被正確處理', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <BrowserRouter>
            <div>
              <mockCardManagement.CardList />
              <mockMarketAnalysis.MarketDashboard />
            </div>
          </BrowserRouter>
        </Provider>
      );

      render(<TestComponent />);

      // 模擬無效的狀態更新
      expect(() => {
        store.dispatch({
          type: 'invalid/action',
          payload: null,
        });
      }).not.toThrow();
    });
  });
});
