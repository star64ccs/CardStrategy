import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import type { AIState, AIChatMessage } from '../../core/types';
import { aiService } from '../../shared/services/aiService';

// 異步 thunk
export const _analyzeCard = createAsyncThunk(
  'ai/analyzeCard',
  async (cardId: string) => {
    const _response = await aiService.analyzeCard(cardId);
    return response;
  }
);

export const _predictPrice = createAsyncThunk(
  'ai/predictPrice',
  async ({ cardId, timeframe }: { cardId: string; timeframe: string }) => {
    const _response = await aiService.predictPrice(cardId, timeframe);
    return response;
  }
);

export const _sendChatMessage = createAsyncThunk(
  'ai/sendChatMessage',
  async (message: string) => {
    const _response = await aiService.sendMessage(message);
    return response;
  }
);

export const _getMarketInsights = createAsyncThunk(
  'ai/getMarketInsights',
  async (_, { rejectWithValue }) => {
    try {
      const _response = await aiService.getMarketInsights();
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error.message || '獲取市場洞察失敗');
    }
  }
);

export const _generateInvestmentReport = createAsyncThunk(
  'ai/generateInvestmentReport',
  async (cardIds: string[]) => {
    const _response = await aiService.generateInvestmentReport(cardIds);
    return response;
  }
);

// 初始狀態
const initialState: AIState = {
  analyses: [],
  chatMessages: [],
  isLoading: false,
  error: null,
  isAnalyzing: false,
  isChatting: false,
  isGeneratingReport: false,
  currentAnalysis: null,
  pricePrediction: null,
  investmentReport: null,
  confidence: 0,
  processingTime: 0,
  isPredicting: false,
  marketInsights: null,
};

// AI slice
const _aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearAnalysis: state => {
      state.currentAnalysis = null;
      state.pricePrediction = null;
      state.investmentReport = null;
    },
    clearChat: state => {
      state.chatMessages = [];
    },
    addChatMessage: (state, action: PayloadAction<AIChatMessage>) => {
      state.chatMessages.push(action.payload);
    },
    updateConfidence: (state, action: PayloadAction<number>) => {
      state.confidence = action.payload;
    },
    setProcessingTime: (state, action: PayloadAction<number>) => {
      state.processingTime = action.payload;
    },
  },
  extraReducers: builder => {
    // Analyze Card With AI
    builder
      .addCase(analyzeCard.pending, state => {
        state.isAnalyzing = true;
        state.error = null;
      })
      .addCase(analyzeCard.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.currentAnalysis = action.payload;
        state.confidence = action.payload.confidence;
        state.processingTime = action.payload.processingTime;
        state.error = null;
      })
      .addCase(analyzeCard.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.error = action.payload as string;
      });

    // Predict Card Price
    builder
      .addCase(predictPrice.pending, state => {
        state.isPredicting = true;
        state.error = null;
      })
      .addCase(predictPrice.fulfilled, (state, action) => {
        state.isPredicting = false;
        state.pricePrediction = action.payload;
        state.confidence = action.payload.confidence;
        state.error = null;
      })
      .addCase(predictPrice.rejected, (state, action) => {
        state.isPredicting = false;
        state.error = action.payload as string;
      });

    // Send AI Chat Message
    builder
      .addCase(sendChatMessage.pending, state => {
        state.isChatting = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isChatting = false;
        state.chatMessages.push(action.payload);
        state.error = null;
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isChatting = false;
        state.error = action.payload as string;
      });

    // Get Market Insights
    builder
      .addCase(getMarketInsights.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMarketInsights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.marketInsights = action.payload;
        state.error = null;
      })
      .addCase(getMarketInsights.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Generate Investment Report
    builder
      .addCase(generateInvestmentReport.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateInvestmentReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.investmentReport = action.payload;
        state.error = null;
      })
      .addCase(generateInvestmentReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearAnalysis,
  clearChat,
  addChatMessage,
  updateConfidence,
  setProcessingTime,
} = aiSlice.actions;

export default aiSlice.reducer;
