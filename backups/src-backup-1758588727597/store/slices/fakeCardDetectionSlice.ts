import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import FakeCardDetectionService from '../../features/counterfeit/services/detectionService';
import type {
  DetectionHistory,
  DetectionRequest,
  DetectionResult,
  DetectionStats,
  FeatureTemplate,
  ReportRequest,
} from '../../features/counterfeit/types/detection';
import { DetectionMethod } from '../../features/counterfeit/types/detection';

// 狀態接口
interface FakeCardDetectionState {
  currentDetection: DetectionResult | null;
  detectionHistory: DetectionHistory[];
  detectionStats: DetectionStats | null;
  featureTemplates: FeatureTemplate[];
  loading: boolean;
  error: string | null;
  lastDetectionId: string | null;
  selectedCardId: string | null;
  selectedMethods: DetectionMethod[];
  batchDetections: {
    results: DetectionResult[];
    progress: number;
    total: number;
    isProcessing: boolean;
  };
  reportForm: {
    detectionId: string;
    cardId: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    evidence: {
      additionalImages: string[];
      comparisonImages: string[];
      references: string[];
    };
  };
}

// 初始狀態
const initialState: FakeCardDetectionState = {
  currentDetection: null,
  detectionHistory: [],
  detectionStats: null,
  featureTemplates: [],
  loading: false,
  error: null,
  lastDetectionId: null,
  selectedCardId: null,
  selectedMethods: [
    DetectionMethod.IMAGE_ANALYSIS,
    DetectionMethod.AI_DETECTION,
    DetectionMethod.COLOR_ANALYSIS,
    DetectionMethod.TEXTURE_ANALYSIS,
  ],
  batchDetections: {
    results: [],
    progress: 0,
    total: 0,
    isProcessing: false,
  },
  reportForm: {
    detectionId: '',
    cardId: '',
    description: '',
    severity: 'medium',
    evidence: {
      additionalImages: [],
      comparisonImages: [],
      references: [],
    },
  },
};

// 異步 Action Creators
export const initializeDetectionService = createAsyncThunk(
  'fakeCardDetection/initialize',
  async (config?: unknown) => {
    const service = FakeCardDetectionService.getInstance();
    await service.initialize(config);
    return { success: true };
  }
);

export const detectFakeCard = createAsyncThunk(
  'fakeCardDetection/detect',
  async (request: DetectionRequest) => {
    const service = FakeCardDetectionService.getInstance();
    const response = await service.detectFakeCard(request);
    if (!response.success) {
      throw new Error(response.error || '檢測失敗');
    }
    return response;
  }
);

export const batchDetectFakeCards = createAsyncThunk(
  'fakeCardDetection/batchDetect',
  async (requests: DetectionRequest[], { dispatch }) => {
    const service = FakeCardDetectionService.getInstance();
    const results = await service.batchDetect(requests);

    // 更新進度
    dispatch(
      updateBatchProgress({ progress: requests.length, total: requests.length })
    );

    return results;
  }
);

export const fetchDetectionHistory = createAsyncThunk(
  'fakeCardDetection/fetchHistory',
  async ({ cardId, userId }: { cardId?: string; userId?: string }) => {
    const service = FakeCardDetectionService.getInstance();
    const history = await service.getDetectionHistory(cardId, userId);
    return history;
  }
);

export const fetchDetectionStats = createAsyncThunk(
  'fakeCardDetection/fetchStats',
  async () => {
    const service = FakeCardDetectionService.getInstance();
    const stats = await service.getDetectionStats();
    return stats;
  }
);

export const fetchFeatureTemplates = createAsyncThunk(
  'fakeCardDetection/fetchTemplates',
  async (cardType?: string) => {
    const service = FakeCardDetectionService.getInstance();
    const templates = await service.getFeatureTemplates(cardType);
    return templates;
  }
);

export const reportFakeCard = createAsyncThunk(
  'fakeCardDetection/report',
  async (report: ReportRequest) => {
    const service = FakeCardDetectionService.getInstance();
    const result = await service.reportFakeCard(report);
    return result;
  }
);

// Slice
const fakeCardDetectionSlice = createSlice({
  name: 'fakeCardDetection',
  initialState,
  reducers: {
    setSelectedCardId: (state, action: PayloadAction<string>) => {
      state.selectedCardId = action.payload;
    },
    setSelectedMethods: (state, action: PayloadAction<DetectionMethod[]>) => {
      state.selectedMethods = action.payload;
    },
    updateReportForm: (
      state,
      action: PayloadAction<Partial<FakeCardDetectionState['reportForm']>>
    ) => {
      state.reportForm = { ...state.reportForm, ...action.payload };
    },
    resetReportForm: state => {
      state.reportForm = initialState.reportForm;
    },
    clearError: state => {
      state.error = null;
    },
    clearCurrentDetection: state => {
      state.currentDetection = null;
    },
    clearDetectionHistory: state => {
      state.detectionHistory = [];
    },
    updateBatchProgress: (
      state,
      action: PayloadAction<{ progress: number; total: number }>
    ) => {
      state.batchDetections.progress = action.payload.progress;
      state.batchDetections.total = action.payload.total;
    },
    startBatchDetection: (state, action: PayloadAction<number>) => {
      state.batchDetections.isProcessing = true;
      state.batchDetections.progress = 0;
      state.batchDetections.total = action.payload;
      state.batchDetections.results = [];
    },
    completeBatchDetection: state => {
      state.batchDetections.isProcessing = false;
    },
    addEvidenceImage: (
      state,
      action: PayloadAction<{ type: 'additional' | 'comparison'; url: string }>
    ) => {
      const { type, url } = action.payload;
      if (type === 'additional') {
        state.reportForm.evidence.additionalImages.push(url);
      } else {
        state.reportForm.evidence.comparisonImages.push(url);
      }
    },
    removeEvidenceImage: (
      state,
      action: PayloadAction<{
        type: 'additional' | 'comparison';
        index: number;
      }>
    ) => {
      const { type, index } = action.payload;
      if (type === 'additional') {
        state.reportForm.evidence.additionalImages.splice(index, 1);
      } else {
        state.reportForm.evidence.comparisonImages.splice(index, 1);
      }
    },
    addReference: (state, action: PayloadAction<string>) => {
      state.reportForm.evidence.references.push(action.payload);
    },
    removeReference: (state, action: PayloadAction<number>) => {
      state.reportForm.evidence.references.splice(action.payload, 1);
    },
  },
  extraReducers: builder => {
    // initializeDetectionService
    builder
      .addCase(initializeDetectionService.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeDetectionService.fulfilled, state => {
        state.loading = false;
      })
      .addCase(initializeDetectionService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '初始化失敗';
      });

    // detectFakeCard
    builder
      .addCase(detectFakeCard.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(detectFakeCard.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDetection = action.payload.data;
        state.lastDetectionId = action.payload.data.id;
      })
      .addCase(detectFakeCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '檢測失敗';
      });

    // batchDetectFakeCards
    builder
      .addCase(batchDetectFakeCards.pending, state => {
        state.loading = true;
        state.error = null;
        state.batchDetections.isProcessing = true;
      })
      .addCase(batchDetectFakeCards.fulfilled, (state, action) => {
        state.loading = false;
        state.batchDetections.isProcessing = false;
        state.batchDetections.results = action.payload
          .filter(response => response.success)
          .map(response => response.data);
      })
      .addCase(batchDetectFakeCards.rejected, (state, action) => {
        state.loading = false;
        state.batchDetections.isProcessing = false;
        state.error = action.error.message || '批量檢測失敗';
      });

    // fetchDetectionHistory
    builder
      .addCase(fetchDetectionHistory.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDetectionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.detectionHistory = action.payload;
      })
      .addCase(fetchDetectionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '獲取檢測歷史失敗';
      });

    // fetchDetectionStats
    builder
      .addCase(fetchDetectionStats.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDetectionStats.fulfilled, (state, action) => {
        state.loading = false;
        state.detectionStats = action.payload;
      })
      .addCase(fetchDetectionStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '獲取檢測統計失敗';
      });

    // fetchFeatureTemplates
    builder
      .addCase(fetchFeatureTemplates.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeatureTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.featureTemplates = action.payload;
      })
      .addCase(fetchFeatureTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '獲取特徵模板失敗';
      });

    // reportFakeCard
    builder
      .addCase(reportFakeCard.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reportFakeCard.fulfilled, (state, action) => {
        state.loading = false;
        state.reportForm = initialState.reportForm;
      })
      .addCase(reportFakeCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '報告假卡失敗';
      });
  },
});

// Actions
export const {
  setSelectedCardId,
  setSelectedMethods,
  updateReportForm,
  resetReportForm,
  clearError,
  clearCurrentDetection,
  clearDetectionHistory,
  updateBatchProgress,
  startBatchDetection,
  completeBatchDetection,
  addEvidenceImage,
  removeEvidenceImage,
  addReference,
  removeReference,
} = fakeCardDetectionSlice.actions;

// Selectors
export const selectCurrentDetection = (state: {
  fakeCardDetection: FakeCardDetectionState;
}) => state.fakeCardDetection.currentDetection;
export const selectDetectionHistory = (state: {
  fakeCardDetection: FakeCardDetectionState;
}) => state.fakeCardDetection.detectionHistory;
export const selectDetectionStats = (state: {
  fakeCardDetection: FakeCardDetectionState;
}) => state.fakeCardDetection.detectionStats;
export const selectFeatureTemplates = (state: {
  fakeCardDetection: FakeCardDetectionState;
}) => state.fakeCardDetection.featureTemplates;
export const selectDetectionLoading = (state: {
  fakeCardDetection: FakeCardDetectionState;
}) => state.fakeCardDetection.loading;
export const selectDetectionError = (state: {
  fakeCardDetection: FakeCardDetectionState;
}) => state.fakeCardDetection.error;
export const selectLastDetectionId = (state: {
  fakeCardDetection: FakeCardDetectionState;
}) => state.fakeCardDetection.lastDetectionId;
export const selectSelectedCardId = (state: {
  fakeCardDetection: FakeCardDetectionState;
}) => state.fakeCardDetection.selectedCardId;
export const selectSelectedMethods = (state: {
  fakeCardDetection: FakeCardDetectionState;
}) => state.fakeCardDetection.selectedMethods;
export const selectBatchDetections = (state: {
  fakeCardDetection: FakeCardDetectionState;
}) => state.fakeCardDetection.batchDetections;
export const selectReportForm = (state: {
  fakeCardDetection: FakeCardDetectionState;
}) => state.fakeCardDetection.reportForm;

export default fakeCardDetectionSlice.reducer;
