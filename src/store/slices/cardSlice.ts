import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Card, CardState, CardFilters, CardSortOptions } from '@/types';
import { cardService } from '@/services/cardService';

// 異步 thunk
export const recognizeCard = createAsyncThunk(
  'card/recognizeCard',
  async (imageUri: string) => {
    const response = await cardService.recognizeCard(imageUri);
    return response;
  }
);

export const fetchCard = createAsyncThunk(
  'card/fetchCard',
  async (cardId: string) => {
    const response = await cardService.getCard(cardId);
    return response;
  }
);

export const searchCards = createAsyncThunk(
  'card/searchCards',
  async ({ query, filters }: { query: string; filters?: CardFilters }) => {
    const response = await cardService.searchCards(query, filters);
    return response;
  }
);

export const filterCards = createAsyncThunk(
  'card/filterCards',
  async (filters: CardFilters) => {
    const response = await cardService.filterCards(filters);
    return response;
  }
);

export const analyzeCondition = createAsyncThunk(
  'card/analyzeCondition',
  async ({ cardId, imageUri }: { cardId: string; imageUri?: string }) => {
    const response = await cardService.analyzeCondition(cardId, imageUri);
    return response;
  }
);

export const verifyAuthenticity = createAsyncThunk(
  'card/verifyAuthenticity',
  async ({ cardId, imageUri }: { cardId: string; imageUri?: string }) => {
    const response = await cardService.verifyAuthenticity(cardId, imageUri);
    return response;
  }
);

// 初始狀態
const initialState: CardState = {
  cards: [],
  selectedCard: null,
  isLoading: false,
  error: null,
  filters: {
    rarity: [],
    type: [],
    condition: [],
    priceRange: { min: 0, max: 10000 },
    setName: [],
    artist: [],
    isFoil: false,
    isGraded: false,
    inStock: false,
    set: [],
  },
  sortOptions: {
    field: 'name',
    order: 'asc',
    direction: 'asc',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  isRecognizing: false,
  recognizedCard: null,
  recognitionResult: null,
  recognitionAlternatives: [],
  recognitionFeatures: null,
  isAnalyzing: false,
  conditionAnalysis: null,
  authenticityCheck: null,
  isVerifying: false,
  searchResults: [],
  recognitionHistory: [],
  recognitionStats: null,
};

// Card slice
const cardSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCard: (state, action: PayloadAction<Card | null>) => {
      state.selectedCard = action.payload;
    },
    clearRecognizedCard: (state) => {
      state.recognizedCard = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setFilters: (state, action: PayloadAction<Partial<CardFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    setSortOptions: (state, action: PayloadAction<CardSortOptions>) => {
      state.sortOptions = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<typeof state.pagination>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addCard: (state, action: PayloadAction<Card>) => {
      state.cards.unshift(action.payload);
    },
    updateCard: (state, action: PayloadAction<Card>) => {
      const index = state.cards.findIndex(
        (card: any) => card.id === action.payload.id
      );
      if (index !== -1) {
        state.cards[index] = action.payload;
      }
    },
    removeCard: (state, action: PayloadAction<string>) => {
      state.cards = state.cards.filter(
        (card: any) => card.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    // Recognize Card
    builder
      .addCase(recognizeCard.pending, (state) => {
        state.isRecognizing = true;
        state.error = null;
      })
      .addCase(recognizeCard.fulfilled, (state, action) => {
        state.isRecognizing = false;
        state.recognizedCard = action.payload.data.recognizedCard;
        state.recognitionResult = action.payload.data;
        state.recognitionAlternatives = action.payload.data.alternatives || [];
        state.recognitionFeatures = action.payload.data.imageFeatures;

        // 添加到識別歷史
        if (action.payload.data.recognizedCard) {
          state.recognitionHistory.unshift({
            card: action.payload.data.recognizedCard,
            confidence: action.payload.data.confidence,
            timestamp: new Date().toISOString(),
            processingTime: action.payload.data.processingTime,
          });

          // 限制歷史記錄數量
          if (state.recognitionHistory.length > 50) {
            state.recognitionHistory = state.recognitionHistory.slice(0, 50);
          }
        }

        state.error = null;
      })
      .addCase(recognizeCard.rejected, (state, action) => {
        state.isRecognizing = false;
        state.error = action.payload as string;
      });

    // Fetch Card
    builder
      .addCase(fetchCard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCard = action.payload;
        state.error = null;
      })
      .addCase(fetchCard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search Cards
    builder
      .addCase(searchCards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchCards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.cards;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(searchCards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Filter Cards
    builder
      .addCase(filterCards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(filterCards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cards = action.payload.cards;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(filterCards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 分析卡牌條件
    builder
      .addCase(analyzeCondition.pending, (state) => {
        state.isAnalyzing = true;
        state.error = null;
      })
      .addCase(analyzeCondition.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        if (state.selectedCard) {
          // 將單個分析結果轉換為數組格式
          state.selectedCard.conditionAnalysis = [
            {
              category: 'condition',
              score: action.payload.overall,
              confidence: action.payload.confidence,
              details:
                `條件: ${action.payload.condition}, 置中: ${action.payload.centering}, ` +
                `邊角: ${action.payload.corners}, 邊緣: ${action.payload.edges}, ` +
                `表面: ${action.payload.surface}`,
              evidence: [`整體評分: ${action.payload.overall}/10`],
            },
          ];
        }
        state.error = null;
      })
      .addCase(analyzeCondition.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.error = action.payload as string;
      });

    // 驗證真偽
    builder
      .addCase(verifyAuthenticity.pending, (state) => {
        state.isVerifying = true;
        state.error = null;
      })
      .addCase(verifyAuthenticity.fulfilled, (state, action) => {
        state.isVerifying = false;
        if (state.selectedCard) {
          // 將單個驗證結果轉換為數組格式
          state.selectedCard.authenticityCheck = [
            {
              category: 'authenticity',
              score: action.payload.isAuthentic ? 10 : 0,
              confidence: action.payload.confidence,
              details:
                `真偽判斷: ${action.payload.isAuthentic ? '真品' : '仿品'}, ` +
                `信心度: ${action.payload.confidence}%`,
              evidence: action.payload.evidence,
            },
          ];
        }
        state.error = null;
      })
      .addCase(verifyAuthenticity.rejected, (state, action) => {
        state.isVerifying = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setSelectedCard,
  clearRecognizedCard,
  clearSearchResults,
  setFilters,
  setSortOptions,
  setPagination,
  addCard,
  updateCard,
  removeCard,
} = cardSlice.actions;

// 選擇器
export const selectIsRecognizing = (state: { cards: CardState }) =>
  state.cards.isRecognizing;
export const selectRecognizedCard = (state: { cards: CardState }) =>
  state.cards.recognizedCard;
export const selectRecognitionResult = (state: { cards: CardState }) =>
  state.cards.recognitionResult;
export const selectRecognitionAlternatives = (state: { cards: CardState }) =>
  state.cards.recognitionAlternatives;
export const selectRecognitionFeatures = (state: { cards: CardState }) =>
  state.cards.recognitionFeatures;

export default cardSlice.reducer;
