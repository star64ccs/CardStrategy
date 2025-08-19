import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// 定義工作流程狀態
interface WorkflowState {
  currentStep: 'scan' | 'analyze' | 'predict' | 'invest' | 'complete';
  scanResult: any | null;
  marketAnalysis: any | null;
  prediction: any | null;
  investmentDecision: any | null;
  workflowHistory: any[];
}

// 創建工作流程 slice
const workflowSlice = createSlice({
  name: 'workflow',
  initialState: {
    currentStep: 'scan' as const,
    scanResult: null,
    marketAnalysis: null,
    prediction: null,
    investmentDecision: null,
    workflowHistory: [],
  } as WorkflowState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<WorkflowState['currentStep']>) => {
      state.currentStep = action.payload;
      state.workflowHistory.push({
        step: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    setScanResult: (state, action: PayloadAction<any>) => {
      state.scanResult = action.payload;
    },
    setMarketAnalysis: (state, action: PayloadAction<any>) => {
      state.marketAnalysis = action.payload;
    },
    setPrediction: (state, action: PayloadAction<any>) => {
      state.prediction = action.payload;
    },
    setInvestmentDecision: (state, action: PayloadAction<any>) => {
      state.investmentDecision = action.payload;
    },
    resetWorkflow: (state) => {
      state.currentStep = 'scan';
      state.scanResult = null;
      state.marketAnalysis = null;
      state.prediction = null;
      state.investmentDecision = null;
      state.workflowHistory = [];
    },
  },
});

// 模擬工作流程組件
const MockWorkflowController = ({ onStepChange }: { onStepChange: (step: string) => void }) => (
  <div data-testid="workflow-controller">
    <button 
      data-testid="next-step-btn"
      onClick={() => onStepChange('next')}
    >
      下一步
    </button>
    <button 
      data-testid="prev-step-btn"
      onClick={() => onStepChange('prev')}
    >
      上一步
    </button>
    <button 
      data-testid="reset-workflow-btn"
      onClick={() => onStepChange('reset')}
    >
      重置流程
    </button>
  </div>
);

const MockCardScanner = ({ onScanComplete }: { onScanComplete: (result: any) => void }) => (
  <div data-testid="card-scanner">
    <button 
      data-testid="scan-card-btn"
      onClick={() => onScanComplete({
        cardId: 1,
        cardName: '測試卡片',
        confidence: 0.95,
        imageUrl: 'test-image.jpg',
      })}
    >
      掃描卡片
    </button>
    <div data-testid="scan-status">掃描狀態</div>
  </div>
);

const MockMarketAnalyzer = ({ onAnalysisComplete }: { onAnalysisComplete: (analysis: any) => void }) => (
  <div data-testid="market-analyzer">
    <button 
      data-testid="analyze-market-btn"
      onClick={() => onAnalysisComplete({
        cardId: 1,
        currentPrice: 100,
        priceHistory: [90, 95, 100, 105, 110],
        trend: 'upward',
        volatility: 'medium',
      })}
    >
      分析市場
    </button>
    <div data-testid="analysis-status">分析狀態</div>
  </div>
);

const MockAIPredictor = ({ onPredictionComplete }: { onPredictionComplete: (prediction: any) => void }) => (
  <div data-testid="ai-predictor">
    <button 
      data-testid="predict-price-btn"
      onClick={() => onPredictionComplete({
        cardId: 1,
        predictedPrice: 120,
        confidence: 0.85,
        timeframe: '1m',
        factors: ['market_trend', 'demand_increase'],
      })}
    >
      AI 預測
    </button>
    <div data-testid="prediction-status">預測狀態</div>
  </div>
);

const MockInvestmentAdvisor = ({ onDecisionComplete }: { onDecisionComplete: (decision: any) => void }) => (
  <div data-testid="investment-advisor">
    <button 
      data-testid="buy-btn"
      onClick={() => onDecisionComplete({
        action: 'buy',
        amount: 1000,
        reasoning: '價格預期上漲',
        risk: 'medium',
      })}
    >
      建議購買
    </button>
    <button 
      data-testid="hold-btn"
      onClick={() => onDecisionComplete({
        action: 'hold',
        reasoning: '等待更好時機',
        risk: 'low',
      })}
    >
      建議持有
    </button>
    <button 
      data-testid="sell-btn"
      onClick={() => onDecisionComplete({
        action: 'sell',
        reasoning: '價格可能下跌',
        risk: 'high',
      })}
    >
      建議賣出
    </button>
  </div>
);

const MockWorkflowSummary = ({ workflowData }: { workflowData: WorkflowState }) => (
  <div data-testid="workflow-summary">
    <h3>工作流程摘要</h3>
    <div data-testid="current-step">當前步驟: {workflowData.currentStep}</div>
    {workflowData.scanResult && (
      <div data-testid="scan-summary">
        掃描結果: {workflowData.scanResult.cardName}
      </div>
    )}
    {workflowData.marketAnalysis && (
      <div data-testid="market-summary">
        市場分析: {workflowData.marketAnalysis.trend} 趨勢
      </div>
    )}
    {workflowData.prediction && (
      <div data-testid="prediction-summary">
        預測價格: ${workflowData.prediction.predictedPrice}
      </div>
    )}
    {workflowData.investmentDecision && (
      <div data-testid="decision-summary">
        投資建議: {workflowData.investmentDecision.action}
      </div>
    )}
  </div>
);

// 設置 MSW 服務器
const server = setupServer(
  rest.post('/api/cards/scan', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        result: {
          cardId: 1,
          cardName: 'API 掃描卡片',
          confidence: 0.95,
          imageUrl: 'api-image.jpg',
        },
      })
    );
  }),
  rest.get('/api/market/analysis/:cardId', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        analysis: {
          cardId: 1,
          currentPrice: 100,
          priceHistory: [90, 95, 100, 105, 110],
          trend: 'upward',
          volatility: 'medium',
        },
      })
    );
  }),
  rest.post('/api/ai/predict', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        prediction: {
          cardId: 1,
          predictedPrice: 120,
          confidence: 0.85,
          timeframe: '1m',
          factors: ['market_trend', 'demand_increase'],
        },
      })
    );
  }),
  rest.post('/api/investment/advise', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        advice: {
          action: 'buy',
          amount: 1000,
          reasoning: '價格預期上漲',
          risk: 'medium',
        },
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 創建測試 store
const createTestStore = () => {
  return configureStore({
    reducer: {
      workflow: workflowSlice.reducer,
    },
  });
};

describe('端到端工作流程集成測試', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('完整投資決策流程測試', () => {
    test('從掃描到投資決策的完整流程', async () => {
      const TestComponent = () => {
        const workflowState = store.getState().workflow;
        
        const handleStepChange = (direction: string) => {
          const steps = ['scan', 'analyze', 'predict', 'invest', 'complete'];
          const currentIndex = steps.indexOf(workflowState.currentStep);
          
          if (direction === 'next' && currentIndex < steps.length - 1) {
            store.dispatch(workflowSlice.actions.setCurrentStep(steps[currentIndex + 1] as any));
          } else if (direction === 'prev' && currentIndex > 0) {
            store.dispatch(workflowSlice.actions.setCurrentStep(steps[currentIndex - 1] as any));
          } else if (direction === 'reset') {
            store.dispatch(workflowSlice.actions.resetWorkflow());
          }
        };

        return (
          <Provider store={store}>
            <BrowserRouter>
              <div data-testid="e2e-workflow">
                <MockWorkflowController onStepChange={handleStepChange} />
                
                {workflowState.currentStep === 'scan' && (
                  <MockCardScanner 
                    onScanComplete={(result) => {
                      store.dispatch(workflowSlice.actions.setScanResult(result));
                      store.dispatch(workflowSlice.actions.setCurrentStep('analyze'));
                    }} 
                  />
                )}
                
                {workflowState.currentStep === 'analyze' && (
                  <MockMarketAnalyzer 
                    onAnalysisComplete={(analysis) => {
                      store.dispatch(workflowSlice.actions.setMarketAnalysis(analysis));
                      store.dispatch(workflowSlice.actions.setCurrentStep('predict'));
                    }} 
                  />
                )}
                
                {workflowState.currentStep === 'predict' && (
                  <MockAIPredictor 
                    onPredictionComplete={(prediction) => {
                      store.dispatch(workflowSlice.actions.setPrediction(prediction));
                      store.dispatch(workflowSlice.actions.setCurrentStep('invest');
                    }} 
                  />
                )}
                
                {workflowState.currentStep === 'invest' && (
                  <MockInvestmentAdvisor 
                    onDecisionComplete={(decision) => {
                      store.dispatch(workflowSlice.actions.setInvestmentDecision(decision));
                      store.dispatch(workflowSlice.actions.setCurrentStep('complete');
                    }} 
                  />
                )}
                
                {workflowState.currentStep === 'complete' && (
                  <MockWorkflowSummary workflowData={workflowState} />
                )}
              </div>
            </BrowserRouter>
          </Provider>
        );
      };

      render(<TestComponent />);

      // 步驟 1: 掃描卡片
      expect(screen.getByTestId('card-scanner')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('scan-card-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('market-analyzer')).toBeInTheDocument();
      });

      // 步驟 2: 分析市場
      fireEvent.click(screen.getByTestId('analyze-market-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('ai-predictor')).toBeInTheDocument();
      });

      // 步驟 3: AI 預測
      fireEvent.click(screen.getByTestId('predict-price-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('investment-advisor')).toBeInTheDocument();
      });

      // 步驟 4: 投資決策
      fireEvent.click(screen.getByTestId('buy-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('workflow-summary')).toBeInTheDocument();
      });

      // 驗證完整流程數據
      const finalState = store.getState().workflow;
      expect(finalState.currentStep).toBe('complete');
      expect(finalState.scanResult).toBeTruthy();
      expect(finalState.marketAnalysis).toBeTruthy();
      expect(finalState.prediction).toBeTruthy();
      expect(finalState.investmentDecision).toBeTruthy();
      expect(finalState.workflowHistory).toHaveLength(5);
    });
  });

  describe('工作流程導航測試', () => {
    test('能在步驟間前後導航', async () => {
      const TestComponent = () => {
        const workflowState = store.getState().workflow;
        
        const handleStepChange = (direction: string) => {
          const steps = ['scan', 'analyze', 'predict', 'invest', 'complete'];
          const currentIndex = steps.indexOf(workflowState.currentStep);
          
          if (direction === 'next' && currentIndex < steps.length - 1) {
            store.dispatch(workflowSlice.actions.setCurrentStep(steps[currentIndex + 1] as any));
          } else if (direction === 'prev' && currentIndex > 0) {
            store.dispatch(workflowSlice.actions.setCurrentStep(steps[currentIndex - 1] as any));
          }
        };

        return (
          <Provider store={store}>
            <BrowserRouter>
              <div data-testid="workflow-navigation">
                <MockWorkflowController onStepChange={handleStepChange} />
                <div data-testid="current-step-display">
                  當前步驟: {workflowState.currentStep}
                </div>
              </div>
            </BrowserRouter>
          </Provider>
        );
      };

      render(<TestComponent />);

      // 初始狀態
      expect(screen.getByText('當前步驟: scan')).toBeInTheDocument();

      // 前進到下一步
      fireEvent.click(screen.getByTestId('next-step-btn'));
      await waitFor(() => {
        expect(screen.getByText('當前步驟: analyze')).toBeInTheDocument();
      });

      // 再前進一步
      fireEvent.click(screen.getByTestId('next-step-btn'));
      await waitFor(() => {
        expect(screen.getByText('當前步驟: predict')).toBeInTheDocument();
      });

      // 後退一步
      fireEvent.click(screen.getByTestId('prev-step-btn'));
      await waitFor(() => {
        expect(screen.getByText('當前步驟: analyze')).toBeInTheDocument();
      });

      // 再後退一步
      fireEvent.click(screen.getByTestId('prev-step-btn'));
      await waitFor(() => {
        expect(screen.getByText('當前步驟: scan')).toBeInTheDocument();
      });
    });

    test('能重置工作流程', async () => {
      const TestComponent = () => {
        const workflowState = store.getState().workflow;
        
        const handleStepChange = (direction: string) => {
          if (direction === 'reset') {
            store.dispatch(workflowSlice.actions.resetWorkflow());
          }
        };

        return (
          <Provider store={store}>
            <BrowserRouter>
              <div data-testid="workflow-reset">
                <MockWorkflowController onStepChange={handleStepChange} />
                <div data-testid="current-step-display">
                  當前步驟: {workflowState.currentStep}
                </div>
              </div>
            </BrowserRouter>
          </Provider>
        );
      };

      render(<TestComponent />);

      // 設置一些數據
      store.dispatch(workflowSlice.actions.setScanResult({ cardId: 1, cardName: '測試卡片' }));
      store.dispatch(workflowSlice.actions.setCurrentStep('analyze'));

      await waitFor(() => {
        expect(screen.getByText('當前步驟: analyze')).toBeInTheDocument();
      });

      // 重置流程
      fireEvent.click(screen.getByTestId('reset-workflow-btn'));

      await waitFor(() => {
        expect(screen.getByText('當前步驟: scan')).toBeInTheDocument();
      });

      // 驗證數據已重置
      const state = store.getState().workflow;
      expect(state.scanResult).toBeNull();
      expect(state.workflowHistory).toHaveLength(0);
    });
  });

  describe('API 集成工作流程測試', () => {
    test('能通過 API 完成完整流程', async () => {
      const TestComponent = () => {
        const workflowState = store.getState().workflow;
        
        const handleAPIScan = async () => {
          try {
            const response = await fetch('/api/cards/scan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageData: 'base64data' }),
            });
            const result = await response.json();
            if (result.success) {
              store.dispatch(workflowSlice.actions.setScanResult(result.result));
              store.dispatch(workflowSlice.actions.setCurrentStep('analyze'));
            }
          } catch (error) {
            console.error('API 掃描失敗:', error);
          }
        };

        const handleAPIAnalysis = async () => {
          try {
            const response = await fetch('/api/market/analysis/1');
            const result = await response.json();
            if (result.success) {
              store.dispatch(workflowSlice.actions.setMarketAnalysis(result.analysis));
              store.dispatch(workflowSlice.actions.setCurrentStep('predict'));
            }
          } catch (error) {
            console.error('API 分析失敗:', error);
          }
        };

        const handleAPIPrediction = async () => {
          try {
            const response = await fetch('/api/ai/predict', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cardId: 1 }),
            });
            const result = await response.json();
            if (result.success) {
              store.dispatch(workflowSlice.actions.setPrediction(result.prediction));
              store.dispatch(workflowSlice.actions.setCurrentStep('invest'));
            }
          } catch (error) {
            console.error('API 預測失敗:', error);
          }
        };

        const handleAPIAdvice = async () => {
          try {
            const response = await fetch('/api/investment/advise', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                cardId: 1,
                currentPrice: 100,
                predictedPrice: 120,
              }),
            });
            const result = await response.json();
            if (result.success) {
              store.dispatch(workflowSlice.actions.setInvestmentDecision(result.advice));
              store.dispatch(workflowSlice.actions.setCurrentStep('complete'));
            }
          } catch (error) {
            console.error('API 建議失敗:', error);
          }
        };

        return (
          <Provider store={store}>
            <BrowserRouter>
              <div data-testid="api-workflow">
                {workflowState.currentStep === 'scan' && (
                  <button data-testid="api-scan-btn" onClick={handleAPIScan}>
                    API 掃描
                  </button>
                )}
                
                {workflowState.currentStep === 'analyze' && (
                  <button data-testid="api-analysis-btn" onClick={handleAPIAnalysis}>
                    API 分析
                  </button>
                )}
                
                {workflowState.currentStep === 'predict' && (
                  <button data-testid="api-prediction-btn" onClick={handleAPIPrediction}>
                    API 預測
                  </button>
                )}
                
                {workflowState.currentStep === 'invest' && (
                  <button data-testid="api-advice-btn" onClick={handleAPIAdvice}>
                    API 建議
                  </button>
                )}
                
                {workflowState.currentStep === 'complete' && (
                  <MockWorkflowSummary workflowData={workflowState} />
                )}
              </div>
            </BrowserRouter>
          </Provider>
        );
      };

      render(<TestComponent />);

      // API 掃描
      fireEvent.click(screen.getByTestId('api-scan-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('api-analysis-btn')).toBeInTheDocument();
      });

      // API 分析
      fireEvent.click(screen.getByTestId('api-analysis-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('api-prediction-btn')).toBeInTheDocument();
      });

      // API 預測
      fireEvent.click(screen.getByTestId('api-prediction-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('api-advice-btn')).toBeInTheDocument();
      });

      // API 建議
      fireEvent.click(screen.getByTestId('api-advice-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('workflow-summary')).toBeInTheDocument();
      });

      // 驗證 API 數據
      const finalState = store.getState().workflow;
      expect(finalState.scanResult.cardName).toBe('API 掃描卡片');
      expect(finalState.marketAnalysis.trend).toBe('upward');
      expect(finalState.prediction.predictedPrice).toBe(120);
      expect(finalState.investmentDecision.action).toBe('buy');
    });
  });

  describe('工作流程錯誤處理測試', () => {
    test('能處理 API 錯誤並繼續流程', async () => {
      // 模擬 API 錯誤
      server.use(
        rest.post('/api/cards/scan', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: '掃描服務暫時不可用' }));
        })
      );

      const TestComponent = () => {
        const workflowState = store.getState().workflow;
        
        const handleAPIScan = async () => {
          try {
            const response = await fetch('/api/cards/scan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageData: 'base64data' }),
            });
            if (!response.ok) {
              throw new Error('API 錯誤');
            }
            const result = await response.json();
            store.dispatch(workflowSlice.actions.setScanResult(result.result));
            store.dispatch(workflowSlice.actions.setCurrentStep('analyze'));
          } catch (error) {
            // 使用模擬數據繼續流程
            store.dispatch(workflowSlice.actions.setScanResult({
              cardId: 1,
              cardName: '模擬卡片',
              confidence: 0.8,
            }));
            store.dispatch(workflowSlice.actions.setCurrentStep('analyze'));
          }
        };

        return (
          <Provider store={store}>
            <BrowserRouter>
              <div data-testid="error-workflow">
                {workflowState.currentStep === 'scan' && (
                  <button data-testid="error-scan-btn" onClick={handleAPIScan}>
                    錯誤掃描測試
                  </button>
                )}
                
                {workflowState.currentStep === 'analyze' && (
                  <div data-testid="error-recovery">錯誤恢復成功</div>
                )}
              </div>
            </BrowserRouter>
          </Provider>
        );
      };

      render(<TestComponent />);

      // 觸發錯誤掃描
      fireEvent.click(screen.getByTestId('error-scan-btn'));

      // 驗證錯誤恢復
      await waitFor(() => {
        expect(screen.getByTestId('error-recovery')).toBeInTheDocument();
      });

      // 驗證使用了模擬數據
      const state = store.getState().workflow;
      expect(state.scanResult.cardName).toBe('模擬卡片');
    });
  });

  describe('工作流程性能測試', () => {
    test('完整流程執行時間在可接受範圍內', async () => {
      const TestComponent = () => {
        const workflowState = store.getState().workflow;
        
        const handleCompleteWorkflow = async () => {
          const startTime = performance.now();
          
          // 快速執行完整流程
          store.dispatch(workflowSlice.actions.setScanResult({ cardId: 1, cardName: '性能測試卡片' }));
          store.dispatch(workflowSlice.actions.setCurrentStep('analyze'));
          
          store.dispatch(workflowSlice.actions.setMarketAnalysis({ cardId: 1, trend: 'upward' }));
          store.dispatch(workflowSlice.actions.setCurrentStep('predict'));
          
          store.dispatch(workflowSlice.actions.setPrediction({ cardId: 1, predictedPrice: 120 }));
          store.dispatch(workflowSlice.actions.setCurrentStep('invest'));
          
          store.dispatch(workflowSlice.actions.setInvestmentDecision({ action: 'buy' }));
          store.dispatch(workflowSlice.actions.setCurrentStep('complete'));
          
          const endTime = performance.now();
          const executionTime = endTime - startTime;
          
          // 驗證執行時間
          expect(executionTime).toBeLessThan(100); // 100ms 內完成
        };

        return (
          <Provider store={store}>
            <BrowserRouter>
              <div data-testid="performance-workflow">
                <button data-testid="performance-test-btn" onClick={handleCompleteWorkflow}>
                  性能測試
                </button>
                {workflowState.currentStep === 'complete' && (
                  <div data-testid="performance-complete">性能測試完成</div>
                )}
              </div>
            </BrowserRouter>
          </Provider>
        );
      };

      render(<TestComponent />);

      // 執行性能測試
      fireEvent.click(screen.getByTestId('performance-test-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('performance-complete')).toBeInTheDocument();
      });
    });
  });
});
