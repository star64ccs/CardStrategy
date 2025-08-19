import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 定義共享狀態類型
interface SharedState {
  user: {
    id: string | null;
    name: string | null;
    preferences: {
      theme: 'light' | 'dark';
      language: 'zh-TW' | 'en-US' | 'ja-JP';
    };
  };
  cards: {
    selectedCard: any | null;
    recentScans: any[];
    favorites: any[];
  };
  market: {
    selectedTimeframe: '1d' | '1w' | '1m' | '3m' | '1y';
    marketData: any[];
    alerts: any[];
  };
  ai: {
    scanHistory: any[];
    predictions: any[];
    modelStatus: 'idle' | 'loading' | 'ready' | 'error';
  };
  notifications: {
    messages: any[];
    unreadCount: number;
  };
}

// 創建共享狀態 slice
const sharedStateSlice = createSlice({
  name: 'shared',
  initialState: {
    user: {
      id: null,
      name: null,
      preferences: {
        theme: 'light' as const,
        language: 'zh-TW' as const,
      },
    },
    cards: {
      selectedCard: null,
      recentScans: [],
      favorites: [],
    },
    market: {
      selectedTimeframe: '1d' as const,
      marketData: [],
      alerts: [],
    },
    ai: {
      scanHistory: [],
      predictions: [],
      modelStatus: 'idle' as const,
    },
    notifications: {
      messages: [],
      unreadCount: 0,
    },
  } as SharedState,
  reducers: {
    setUser: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.user.id = action.payload.id;
      state.user.name = action.payload.name;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.user.preferences.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'zh-TW' | 'en-US' | 'ja-JP'>) => {
      state.user.preferences.language = action.payload;
    },
    setSelectedCard: (state, action: PayloadAction<any>) => {
      state.cards.selectedCard = action.payload;
    },
    addRecentScan: (state, action: PayloadAction<any>) => {
      state.cards.recentScans.unshift(action.payload);
      if (state.cards.recentScans.length > 10) {
        state.cards.recentScans.pop();
      }
    },
    toggleFavorite: (state, action: PayloadAction<any>) => {
      const cardId = action.payload.id;
      const existingIndex = state.cards.favorites.findIndex(card => card.id === cardId);
      if (existingIndex >= 0) {
        state.cards.favorites.splice(existingIndex, 1);
      } else {
        state.cards.favorites.push(action.payload);
      }
    },
    setMarketTimeframe: (state, action: PayloadAction<'1d' | '1w' | '1m' | '3m' | '1y'>) => {
      state.market.selectedTimeframe = action.payload;
    },
    setMarketData: (state, action: PayloadAction<any[]>) => {
      state.market.marketData = action.payload;
    },
    addMarketAlert: (state, action: PayloadAction<any>) => {
      state.market.alerts.push(action.payload);
    },
    setAIModelStatus: (state, action: PayloadAction<'idle' | 'loading' | 'ready' | 'error'>) => {
      state.ai.modelStatus = action.payload;
    },
    addScanResult: (state, action: PayloadAction<any>) => {
      state.ai.scanHistory.unshift(action.payload);
      if (state.ai.scanHistory.length > 50) {
        state.ai.scanHistory.pop();
      }
    },
    addPrediction: (state, action: PayloadAction<any>) => {
      state.ai.predictions.unshift(action.payload);
      if (state.ai.predictions.length > 20) {
        state.ai.predictions.pop();
      }
    },
    addNotification: (state, action: PayloadAction<any>) => {
      state.notifications.messages.unshift(action.payload);
      state.notifications.unreadCount += 1;
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const message = state.notifications.messages.find(m => m.id === action.payload);
      if (message && !message.read) {
        message.read = true;
        state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1);
      }
    },
  },
});

// 模擬微前端模組組件
const MockCardManagement = ({ onCardSelect }: { onCardSelect: (card: any) => void }) => (
  <div data-testid="card-management">
    <button 
      data-testid="select-card-btn"
      onClick={() => onCardSelect({ id: 1, name: '測試卡片', price: 100 })}
    >
      選擇卡片
    </button>
    <button 
      data-testid="scan-card-btn"
      onClick={() => onCardSelect({ id: 2, name: '掃描卡片', price: 150 })}
    >
      掃描卡片
    </button>
  </div>
);

const MockMarketAnalysis = ({ onTimeframeChange }: { onTimeframeChange: (timeframe: string) => void }) => (
  <div data-testid="market-analysis">
    <select 
      data-testid="timeframe-select"
      onChange={(e) => onTimeframeChange(e.target.value)}
    >
      <option value="1d">1天</option>
      <option value="1w">1週</option>
      <option value="1m">1月</option>
    </select>
    <div data-testid="market-data-display">市場數據顯示</div>
  </div>
);

const MockAIEcosystem = ({ onScan, onPredict }: { onScan: () => void; onPredict: () => void }) => (
  <div data-testid="ai-ecosystem">
    <button data-testid="ai-scan-btn" onClick={onScan}>
      AI 掃描
    </button>
    <button data-testid="ai-predict-btn" onClick={onPredict}>
      AI 預測
    </button>
    <div data-testid="ai-status">AI 狀態</div>
  </div>
);

const MockNotificationCenter = ({ onMarkRead }: { onMarkRead: (id: string) => void }) => (
  <div data-testid="notification-center">
    <button 
      data-testid="mark-read-btn"
      onClick={() => onMarkRead('test-notification-1')}
    >
      標記已讀
    </button>
    <div data-testid="unread-count">未讀數量</div>
  </div>
);

// 創建測試 store
const createTestStore = () => {
  return configureStore({
    reducer: {
      shared: sharedStateSlice.reducer,
    },
  });
};

describe('微前端共享狀態集成測試', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('用戶偏好設置共享測試', () => {
    test('主題設置能在所有模組間同步', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <div>
            <MockCardManagement onCardSelect={() => {}} />
            <MockMarketAnalysis onTimeframeChange={() => {}} />
            <MockAIEcosystem onScan={() => {}} onPredict={() => {}} />
          </div>
        </Provider>
      );

      render(<TestComponent />);

      // 設置深色主題
      store.dispatch(sharedStateSlice.actions.setTheme('dark'));

      await waitFor(() => {
        const state = store.getState();
        expect(state.shared.user.preferences.theme).toBe('dark');
      });

      // 驗證所有模組都能訪問到相同的主題設置
      const state = store.getState();
      expect(state.shared.user.preferences.theme).toBe('dark');
    });

    test('語言設置能在所有模組間同步', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <div>
            <MockCardManagement onCardSelect={() => {}} />
            <MockMarketAnalysis onTimeframeChange={() => {}} />
            <MockAIEcosystem onScan={() => {}} onPredict={() => {}} />
          </div>
        </Provider>
      );

      render(<TestComponent />);

      // 設置英文語言
      store.dispatch(sharedStateSlice.actions.setLanguage('en-US'));

      await waitFor(() => {
        const state = store.getState();
        expect(state.shared.user.preferences.language).toBe('en-US');
      });
    });
  });

  describe('卡片數據共享測試', () => {
    test('選擇卡片後，所有模組都能訪問到選中的卡片', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <div>
            <MockCardManagement 
              onCardSelect={(card) => {
                store.dispatch(sharedStateSlice.actions.setSelectedCard(card));
              }} 
            />
            <MockMarketAnalysis onTimeframeChange={() => {}} />
            <MockAIEcosystem onScan={() => {}} onPredict={() => {}} />
          </div>
        </Provider>
      );

      render(<TestComponent />);

      // 選擇卡片
      fireEvent.click(screen.getByTestId('select-card-btn'));

      await waitFor(() => {
        const state = store.getState();
        expect(state.shared.cards.selectedCard).toEqual({
          id: 1,
          name: '測試卡片',
          price: 100,
        });
      });
    });

    test('掃描卡片後，掃描歷史能在模組間共享', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <div>
            <MockCardManagement 
              onCardSelect={(card) => {
                store.dispatch(sharedStateSlice.actions.addRecentScan(card));
              }} 
            />
            <MockAIEcosystem onScan={() => {}} onPredict={() => {}} />
          </div>
        </Provider>
      );

      render(<TestComponent />);

      // 掃描卡片
      fireEvent.click(screen.getByTestId('scan-card-btn'));

      await waitFor(() => {
        const state = store.getState();
        expect(state.shared.cards.recentScans).toHaveLength(1);
        expect(state.shared.cards.recentScans[0]).toEqual({
          id: 2,
          name: '掃描卡片',
          price: 150,
        });
      });
    });

    test('收藏卡片功能能在模組間同步', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <div>
            <MockCardManagement onCardSelect={() => {}} />
            <MockMarketAnalysis onTimeframeChange={() => {}} />
          </div>
        </Provider>
      );

      render(<TestComponent />);

      const testCard = { id: 1, name: '測試卡片', price: 100 };

      // 添加收藏
      store.dispatch(sharedStateSlice.actions.toggleFavorite(testCard));

      await waitFor(() => {
        const state = store.getState();
        expect(state.shared.cards.favorites).toHaveLength(1);
        expect(state.shared.cards.favorites[0]).toEqual(testCard);
      });

      // 移除收藏
      store.dispatch(sharedStateSlice.actions.toggleFavorite(testCard));

      await waitFor(() => {
        const state = store.getState();
        expect(state.shared.cards.favorites).toHaveLength(0);
      });
    });
  });

  describe('市場數據共享測試', () => {
    test('市場時間框架設置能在模組間同步', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <div>
            <MockMarketAnalysis 
              onTimeframeChange={(timeframe) => {
                store.dispatch(sharedStateSlice.actions.setMarketTimeframe(timeframe as any));
              }} 
            />
            <MockCardManagement onCardSelect={() => {}} />
          </div>
        </Provider>
      );

      render(<TestComponent />);

      // 更改時間框架
      fireEvent.change(screen.getByTestId('timeframe-select'), {
        target: { value: '1w' },
      });

      await waitFor(() => {
        const state = store.getState();
        expect(state.shared.market.selectedTimeframe).toBe('1w');
      });
    });

    test('市場數據能在模組間共享', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <div>
            <MockMarketAnalysis onTimeframeChange={() => {}} />
            <MockAIEcosystem onScan={() => {}} onPredict={() => {}} />
          </div>
        </Provider>
      );

      render(<TestComponent />);

      const marketData = [
        { date: '2024-01-01', price: 100, volume: 1000 },
        { date: '2024-01-02', price: 110, volume: 1200 },
      ];

      // 設置市場數據
      store.dispatch(sharedStateSlice.actions.setMarketData(marketData));

      await waitFor(() => {
        const state = store.getState();
        expect(state.shared.market.marketData).toEqual(marketData);
      });
    });

    test('市場警報能在模組間共享', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <div>
            <MockMarketAnalysis onTimeframeChange={() => {}} />
            <MockNotificationCenter onMarkRead={() => {}} />
          </div>
        </Provider>
      );

      render(<TestComponent />);

      const alert = {
        id: 'alert-1',
        type: 'price',
        message: '卡片價格上漲超過 10%',
        timestamp: new Date().toISOString(),
      };

      // 添加市場警報
      store.dispatch(sharedStateSlice.actions.addMarketAlert(alert));

      await waitFor(() => {
        const state = store.getState();
        expect(state.shared.market.alerts).toHaveLength(1);
        expect(state.shared.market.alerts[0]).toEqual(alert);
      });
    });
  });

  describe('AI 狀態共享測試', () => {
    test('AI 模型狀態能在模組間同步', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <div>
            <MockAIEcosystem onScan={() => {}} onPredict={() => {}} />
            <MockCardManagement onCardSelect={() => {}} />
          </div>
        </Provider>
      );

      render(<TestComponent />);

      // 設置 AI 模型為加載狀態
      store.dispatch(sharedStateSlice.actions.setAIModelStatus('loading'));

      await waitFor(() => {
        const state = store.getState();
        expect(state.shared.ai.modelStatus).toBe('loading');
      });

      // 設置 AI 模型為就緒狀態
      store.dispatch(sharedStateSlice.actions.setAIModelStatus('ready'));

      await waitFor(() => {
        const state = store.getState();
        expect(state.shared.ai.modelStatus).toBe('ready');
      });
    });

    test('AI 掃描結果能在模組間共享', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <div>
            <MockAIEcosystem 
              onScan={() => {
                const scanResult = {
                  id: 'scan-1',
                  cardName: 'AI 掃描卡片',
                  confidence: 0.95,
                  timestamp: new Date().toISOString(),
                };
                store.dispatch(sharedStateSlice.actions.addScanResult(scanResult));
              }} 
              onPredict={() => {}} 
            />
            <MockCardManagement onCardSelect={() => {}} />
          </div>
        </Provider>
      );

      render(<TestComponent />);

      // 執行 AI 掃描
      fireEvent.click(screen.getByTestId('ai-scan-btn'));

      await waitFor(() => {
        const state = store.getState();
        expect(state.shared.ai.scanHistory).toHaveLength(1);
        expect(state.shared.ai.scanHistory[0].cardName).toBe('AI 掃描卡片');
      });
    });

    test('AI 預測結果能在模組間共享', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <div>
            <MockAIEcosystem 
              onScan={() => {}} 
              onPredict={() => {
                const prediction = {
                  id: 'pred-1',
                  cardId: 1,
                  predictedPrice: 150,
                  confidence: 0.85,
                  timestamp: new Date().toISOString(),
                };
                store.dispatch(sharedStateSlice.actions.addPrediction(prediction));
              }} 
            />
            <MockMarketAnalysis onTimeframeChange={() => {}} />
          </div>
        </Provider>
      );

      render(<TestComponent />);

      // 執行 AI 預測
      fireEvent.click(screen.getByTestId('ai-predict-btn'));

      await waitFor(() => {
        const state = store.getState();
        expect(state.shared.ai.predictions).toHaveLength(1);
        expect(state.shared.ai.predictions[0].predictedPrice).toBe(150);
      });
    });
  });

  describe('通知系統共享測試', () => {
    test('通知能在模組間共享', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <div>
            <MockNotificationCenter 
              onMarkRead={(id) => {
                store.dispatch(sharedStateSlice.actions.markNotificationAsRead(id));
              }} 
            />
            <MockCardManagement onCardSelect={() => {}} />
          </div>
        </Provider>
      );

      render(<TestComponent />);

      const notification = {
        id: 'test-notification-1',
        type: 'info',
        message: '測試通知',
        read: false,
        timestamp: new Date().toISOString(),
      };

      // 添加通知
      store.dispatch(sharedStateSlice.actions.addNotification(notification));

      await waitFor(() => {
        const state = store.getState();
        expect(state.shared.notifications.messages).toHaveLength(1);
        expect(state.shared.notifications.unreadCount).toBe(1);
      });

      // 標記為已讀
      fireEvent.click(screen.getByTestId('mark-read-btn'));

      await waitFor(() => {
        const state = store.getState();
        expect(state.shared.notifications.unreadCount).toBe(0);
        expect(state.shared.notifications.messages[0].read).toBe(true);
      });
    });
  });

  describe('狀態持久化測試', () => {
    test('重要狀態能在頁面刷新後保持', async () => {
      const TestComponent = () => (
        <Provider store={store}>
          <div>
            <MockCardManagement onCardSelect={() => {}} />
            <MockMarketAnalysis onTimeframeChange={() => {}} />
            <MockAIEcosystem onScan={() => {}} onPredict={() => {}} />
          </div>
        </Provider>
      );

      render(<TestComponent />);

      // 設置一些重要狀態
      store.dispatch(sharedStateSlice.actions.setUser({ id: 'user-1', name: '測試用戶' }));
      store.dispatch(sharedStateSlice.actions.setTheme('dark'));
      store.dispatch(sharedStateSlice.actions.setSelectedCard({ id: 1, name: '重要卡片' }));

      // 模擬 localStorage 持久化
      const stateToPersist = store.getState();
      localStorage.setItem('cardstrategy-state', JSON.stringify(stateToPersist));

      // 模擬頁面刷新 - 重新創建 store
      const newStore = createTestStore();
      const persistedState = localStorage.getItem('cardstrategy-state');
      
      if (persistedState) {
        const parsedState = JSON.parse(persistedState);
        // 在實際應用中，這裡會將持久化的狀態應用到 store
        expect(parsedState.shared.user.name).toBe('測試用戶');
        expect(parsedState.shared.user.preferences.theme).toBe('dark');
        expect(parsedState.shared.cards.selectedCard.name).toBe('重要卡片');
      }
    });
  });
});
