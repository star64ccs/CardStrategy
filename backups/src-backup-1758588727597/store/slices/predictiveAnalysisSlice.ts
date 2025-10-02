import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// 定義預測分析相關類型
export interface PredictiveModel {
  id: string;
  name: string;
  type:
    | 'price_prediction'
    | 'market_trend'
    | 'demand_forecast'
    | 'risk_assessment';
  algorithm: string;
  accuracy: number;
  confidence: number;
  parameters: Record<string, any>;
  trainingData: {
    size: number;
    period: string;
    lastUpdated: string;
  };
  status: 'active' | 'training' | 'inactive' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface PredictionResult {
  id: string;
  modelId: string;
  cardId: string;
  prediction: {
    value: number;
    confidence: number;
    timeframe: 'short' | 'medium' | 'long';
    factors: string[];
  };
  historicalAccuracy?: number;
  createdAt: string;
  expiresAt: string;
}

export interface MarketTrend {
  id: string;
  category: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  timeframe: string;
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
  predictions: {
    shortTerm: number;
    mediumTerm: number;
    longTerm: number;
  };
  createdAt: string;
}

export interface RiskAssessment {
  id: string;
  cardId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: {
    factor: string;
    impact: number;
    probability: number;
    mitigation: string;
  }[];
  overallScore: number;
  recommendations: string[];
  createdAt: string;
}

export interface AnalysisFilters {
  modelType?: string;
  cardId?: string;
  category?: string;
  riskLevel?: string;
  dateFrom?: string;
  dateTo?: string;
  accuracyMin?: number;
  confidenceMin?: number;
}

// 預測分析狀態接口
export interface PredictiveAnalysisState {
  models: PredictiveModel[];
  predictions: PredictionResult[];
  marketTrends: MarketTrend[];
  riskAssessments: RiskAssessment[];
  filters: AnalysisFilters;
  isLoading: boolean;
  isTraining: boolean;
  isPredicting: boolean;
  error: string | null;
  selectedModel: PredictiveModel | null;
  activeAnalysis: {
    type: string;
    data: any;
    progress: number;
  } | null;
}

// 異步 Action Creators
export const initializePredictiveAnalysis = createAsyncThunk(
  'predictiveAnalysis/initializePredictiveAnalysis',
  async (_, { rejectWithValue }) => {
    try {
      // 模擬初始化預測分析
      const mockModels: PredictiveModel[] = [
        {
          id: 'model-1',
          name: 'Price Prediction Model v2.1',
          type: 'price_prediction',
          algorithm: 'LSTM Neural Network',
          accuracy: 0.87,
          confidence: 0.82,
          parameters: {
            layers: 3,
            neurons: 128,
            dropout: 0.2,
          },
          trainingData: {
            size: 10000,
            period: '2023-01-01 to 2024-01-01',
            lastUpdated: new Date().toISOString(),
          },
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return mockModels;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '初始化預測分析失敗');
    }
  }
);

export const trainModel = createAsyncThunk(
  'predictiveAnalysis/trainModel',
  async (
    config: {
      modelId: string;
      trainingData: any[];
      parameters: Record<string, any>;
    },
    { rejectWithValue }
  ) => {
    try {
      // 模擬訓練模型
      const updatedModel: PredictiveModel = {
        id: config.modelId,
        name: 'Updated Model',
        type: 'price_prediction',
        algorithm: 'LSTM Neural Network',
        accuracy: 0.89,
        confidence: 0.85,
        parameters: config.parameters,
        trainingData: {
          size: config.trainingData.length,
          period: '2023-01-01 to 2024-01-01',
          lastUpdated: new Date().toISOString(),
        },
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return updatedModel;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '訓練模型失敗');
    }
  }
);

export const generatePrediction = createAsyncThunk(
  'predictiveAnalysis/generatePrediction',
  async (
    request: {
      modelId: string;
      cardId: string;
      timeframe: 'short' | 'medium' | 'long';
      inputData: any;
    },
    { rejectWithValue }
  ) => {
    try {
      // 模擬生成預測
      const prediction: PredictionResult = {
        id: Date.now().toString(),
        modelId: request.modelId,
        cardId: request.cardId,
        prediction: {
          value: 125.5,
          confidence: 0.85,
          timeframe: request.timeframe,
          factors: [
            'Historical price trends',
            'Market demand',
            'Card condition',
            'Grading score',
          ],
        },
        historicalAccuracy: 0.87,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      return prediction;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '生成預測失敗');
    }
  }
);

export const analyzeMarketTrend = createAsyncThunk(
  'predictiveAnalysis/analyzeMarketTrend',
  async (
    config: {
      category: string;
      timeframe: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // 模擬分析市場趨勢
      const trend: MarketTrend = {
        id: Date.now().toString(),
        category: config.category,
        trend: 'bullish',
        strength: 0.75,
        timeframe: config.timeframe,
        factors: [
          {
            name: 'Increased demand',
            impact: 0.8,
            description: 'Growing interest in trading cards',
          },
          {
            name: 'Limited supply',
            impact: 0.7,
            description: 'Reduced production quantities',
          },
        ],
        predictions: {
          shortTerm: 0.15,
          mediumTerm: 0.25,
          longTerm: 0.35,
        },
        createdAt: new Date().toISOString(),
      };

      return trend;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '分析市場趨勢失敗');
    }
  }
);

export const assessRisk = createAsyncThunk(
  'predictiveAnalysis/assessRisk',
  async (
    config: {
      cardId: string;
      investmentAmount: number;
      timeframe: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // 模擬風險評估
      const assessment: RiskAssessment = {
        id: Date.now().toString(),
        cardId: config.cardId,
        riskLevel: 'medium',
        riskFactors: [
          {
            factor: 'Market volatility',
            impact: 0.7,
            probability: 0.6,
            mitigation: 'Diversify portfolio',
          },
          {
            factor: 'Condition degradation',
            impact: 0.5,
            probability: 0.3,
            mitigation: 'Proper storage',
          },
        ],
        overallScore: 65,
        recommendations: [
          'Monitor market conditions regularly',
          'Set stop-loss limits',
          'Consider insurance options',
        ],
        createdAt: new Date().toISOString(),
      };

      return assessment;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '風險評估失敗');
    }
  }
);

export const fetchPredictions = createAsyncThunk(
  'predictiveAnalysis/fetchPredictions',
  async (filters: AnalysisFilters = {}, { rejectWithValue }) => {
    try {
      // 模擬獲取預測結果
      const mockPredictions: PredictionResult[] = [
        {
          id: 'pred-1',
          modelId: 'model-1',
          cardId: 'card-1',
          prediction: {
            value: 125.5,
            confidence: 0.85,
            timeframe: 'medium',
            factors: ['Historical trends', 'Market demand'],
          },
          historicalAccuracy: 0.87,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ];

      return mockPredictions;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '獲取預測結果失敗');
    }
  }
);

export const updateModelStatus = createAsyncThunk(
  'predictiveAnalysis/updateModelStatus',
  async (
    { modelId, status }: { modelId: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      // 模擬更新模型狀態
      return { modelId, status };
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '更新模型狀態失敗');
    }
  }
);

// 初始狀態
const initialState: PredictiveAnalysisState = {
  models: [],
  predictions: [],
  marketTrends: [],
  riskAssessments: [],
  filters: {},
  isLoading: false,
  isTraining: false,
  isPredicting: false,
  error: null,
  selectedModel: null,
  activeAnalysis: null,
};

// 創建 slice
const predictiveAnalysisSlice = createSlice({
  name: 'predictiveAnalysis',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<AnalysisFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: state => {
      state.filters = {};
    },
    setSelectedModel: (
      state,
      action: PayloadAction<PredictiveModel | null>
    ) => {
      state.selectedModel = action.payload;
    },
    clearSelectedModel: state => {
      state.selectedModel = null;
    },
    setActiveAnalysis: (
      state,
      action: PayloadAction<{
        type: string;
        data: any;
        progress: number;
      } | null>
    ) => {
      state.activeAnalysis = action.payload;
    },
    clearActiveAnalysis: state => {
      state.activeAnalysis = null;
    },
    clearError: state => {
      state.error = null;
    },
    updatePrediction: (state, action: PayloadAction<PredictionResult>) => {
      const index = state.predictions.findIndex(
        p => p.id === action.payload.id
      );
      if (index !== -1) {
        state.predictions[index] = action.payload;
      } else {
        state.predictions.push(action.payload);
      }
    },
    removePrediction: (state, action: PayloadAction<string>) => {
      state.predictions = state.predictions.filter(
        p => p.id !== action.payload
      );
    },
  },
  extraReducers: builder => {
    // Initialize Predictive Analysis
    builder
      .addCase(initializePredictiveAnalysis.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializePredictiveAnalysis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.models = action.payload;
        state.error = null;
      })
      .addCase(initializePredictiveAnalysis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Train Model
    builder
      .addCase(trainModel.pending, state => {
        state.isTraining = true;
        state.error = null;
      })
      .addCase(trainModel.fulfilled, (state, action) => {
        state.isTraining = false;
        const index = state.models.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.models[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(trainModel.rejected, (state, action) => {
        state.isTraining = false;
        state.error = action.payload as string;
      });

    // Generate Prediction
    builder
      .addCase(generatePrediction.pending, state => {
        state.isPredicting = true;
        state.error = null;
      })
      .addCase(generatePrediction.fulfilled, (state, action) => {
        state.isPredicting = false;
        state.predictions.push(action.payload);
        state.error = null;
      })
      .addCase(generatePrediction.rejected, (state, action) => {
        state.isPredicting = false;
        state.error = action.payload as string;
      });

    // Analyze Market Trend
    builder
      .addCase(analyzeMarketTrend.fulfilled, (state, action) => {
        state.marketTrends.push(action.payload);
      })
      .addCase(analyzeMarketTrend.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Assess Risk
    builder
      .addCase(assessRisk.fulfilled, (state, action) => {
        state.riskAssessments.push(action.payload);
      })
      .addCase(assessRisk.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch Predictions
    builder
      .addCase(fetchPredictions.fulfilled, (state, action) => {
        state.predictions = action.payload;
      })
      .addCase(fetchPredictions.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update Model Status
    builder
      .addCase(updateModelStatus.fulfilled, (state, action) => {
        const model = state.models.find(m => m.id === action.payload.modelId);
        if (model) {
          model.status = action.payload.status as any;
          model.updatedAt = new Date().toISOString();
        }
      })
      .addCase(updateModelStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// 導出 actions
export const {
  setFilters,
  clearFilters,
  setSelectedModel,
  clearSelectedModel,
  setActiveAnalysis,
  clearActiveAnalysis,
  clearError,
  updatePrediction,
  removePrediction,
} = predictiveAnalysisSlice.actions;

// 導出 selectors
export const selectPredictiveModels = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.models;

export const selectPredictions = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.predictions;

export const selectMarketTrends = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.marketTrends;

export const selectRiskAssessments = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.riskAssessments;

export const selectAnalysisFilters = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.filters;

export const selectSelectedModel = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.selectedModel;

export const selectActiveAnalysis = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.activeAnalysis;

export const selectIsPredictiveAnalysisLoading = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.isLoading;

export const selectIsTraining = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.isTraining;

export const selectIsPredicting = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.isPredicting;

export const selectPredictiveAnalysisError = (state: {
  predictiveAnalysis: PredictiveAnalysisState;
}) => state.predictiveAnalysis.error;

// 導出 reducer
export default predictiveAnalysisSlice.reducer;
