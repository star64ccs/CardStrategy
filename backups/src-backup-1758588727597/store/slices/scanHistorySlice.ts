import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type {
  ScanRecord as ScanHistoryItem,
  ScanStats as ScanStatistics,
} from '../../shared/services/scanHistoryService';
import { ScanHistoryService } from '../../shared/services/scanHistoryService';

// 掃描歷史過濾器類型
export interface ScanHistoryFilters {
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'type' | 'status';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  status?: string;
  tags?: string[];
  isFavorite?: boolean;
}

// 掃描歷史狀態接口
export interface ScanHistoryState {
  history: ScanHistoryItem[];
  selectedRecord: ScanHistoryItem | null;
  selectedRecords: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: ScanHistoryFilters;
  statistics: ScanStatistics | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

// 異步 Action Creators
export const fetchScanHistory = createAsyncThunk(
  'scanHistory/fetchScanHistory',
  async (filters: ScanHistoryFilters = {}, { rejectWithValue }) => {
    try {
      const response = await new ScanHistoryService().getScanHistory(filters);
      return response;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '獲取掃描歷史失敗');
    }
  }
);

export const fetchScanRecord = createAsyncThunk(
  'scanHistory/fetchScanRecord',
  async (recordId: string, { rejectWithValue }) => {
    try {
      const response = await new ScanHistoryService().getScanRecord(recordId);
      return response;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '獲取掃描記錄失敗');
    }
  }
);

export const createScanRecord = createAsyncThunk(
  'scanHistory/createScanRecord',
  async (
    {
      userId,
      scanData,
    }: {
      userId: string;
      scanData: any;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await new ScanHistoryService().createScanRecord(
        userId,
        scanData
      );
      return response;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '創建掃描記錄失敗');
    }
  }
);

export const updateScanRecord = createAsyncThunk(
  'scanHistory/updateScanRecord',
  async (
    {
      recordId,
      updates,
    }: {
      recordId: string;
      updates: Partial<ScanHistoryItem>;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await new ScanHistoryService().updateScanRecord(
        recordId,
        updates
      );
      return response;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '更新掃描記錄失敗');
    }
  }
);

export const deleteScanRecord = createAsyncThunk(
  'scanHistory/deleteScanRecord',
  async (recordId: string, { rejectWithValue }) => {
    try {
      await new ScanHistoryService().deleteScanRecord(recordId);
      return recordId;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '刪除掃描記錄失敗');
    }
  }
);

export const deleteMultipleRecords = createAsyncThunk(
  'scanHistory/deleteMultipleRecords',
  async (recordIds: string[], { rejectWithValue }) => {
    try {
      await new ScanHistoryService().deleteMultipleRecords(recordIds);
      return recordIds;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '批量刪除掃描記錄失敗');
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'scanHistory/toggleFavorite',
  async (recordId: string, { rejectWithValue }) => {
    try {
      const response = await new ScanHistoryService().toggleFavorite(recordId);
      return response;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '切換收藏狀態失敗');
    }
  }
);

export const addNote = createAsyncThunk(
  'scanHistory/addNote',
  async (
    { recordId, note }: { recordId: string; note: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await new ScanHistoryService().addNote(recordId, note);
      return response;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '添加筆記失敗');
    }
  }
);

export const addTags = createAsyncThunk(
  'scanHistory/addTags',
  async (
    { recordId, tags }: { recordId: string; tags: string[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await new ScanHistoryService().addTags(recordId, tags);
      return response;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '添加標籤失敗');
    }
  }
);

export const fetchScanStatistics = createAsyncThunk(
  'scanHistory/fetchScanStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await new ScanHistoryService().getScanStatistics();
      return response;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '獲取掃描統計失敗');
    }
  }
);

export const searchScanHistory = createAsyncThunk(
  'scanHistory/searchScanHistory',
  async (
    { query, filters }: { query: string; filters?: ScanHistoryFilters },
    { rejectWithValue }
  ) => {
    try {
      const response = await new ScanHistoryService().searchScanHistory(
        query,
        filters
      );
      return response;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '搜索掃描歷史失敗');
    }
  }
);

// 初始狀態
const initialState: ScanHistoryState = {
  history: [],
  selectedRecord: null,
  selectedRecords: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {},
  statistics: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// 創建 slice
const scanHistorySlice = createSlice({
  name: 'scanHistory',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ScanHistoryFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: state => {
      state.filters = {};
    },
    setSelectedRecord: (
      state,
      action: PayloadAction<ScanHistoryItem | null>
    ) => {
      state.selectedRecord = action.payload;
    },
    clearSelectedRecord: state => {
      state.selectedRecord = null;
    },
    toggleRecordSelection: (state, action: PayloadAction<string>) => {
      const recordId = action.payload;
      const index = state.selectedRecords.indexOf(recordId);
      if (index > -1) {
        state.selectedRecords.splice(index, 1);
      } else {
        state.selectedRecords.push(recordId);
      }
    },
    selectAllRecords: state => {
      state.selectedRecords = state.history.map((record: any) => record.id);
    },
    clearSelection: state => {
      state.selectedRecords = [];
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Fetch Scan History
    builder
      .addCase(fetchScanHistory.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScanHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.history = action.payload.data.history;
        state.pagination = {
          page: action.payload.data.page,
          limit: action.payload.data.limit,
          total: action.payload.data.total,
          totalPages: action.payload.data.totalPages,
          hasNext: action.payload.data.page < action.payload.data.totalPages,
          hasPrev: action.payload.data.page > 1,
        };
        state.error = null;
      })
      .addCase(fetchScanHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Scan Record
    builder
      .addCase(fetchScanRecord.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScanRecord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRecord = action.payload;
        state.error = null;
      })
      .addCase(fetchScanRecord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Scan Record
    builder.addCase(createScanRecord.fulfilled, (state, action) => {
      state.history.unshift(action.payload);
      state.pagination.total += 1;
    });

    // Update Scan Record
    builder.addCase(updateScanRecord.fulfilled, (state, action) => {
      const index = state.history.findIndex(
        record => record.id === action.payload.id
      );
      if (index !== -1) {
        state.history[index] = action.payload;
      }
    });

    // Delete Scan Record
    builder.addCase(deleteScanRecord.fulfilled, (state, action) => {
      state.history = state.history.filter(
        record => record.id !== action.payload
      );
      state.pagination.total -= 1;
    });

    // Delete Multiple Records
    builder.addCase(deleteMultipleRecords.fulfilled, (state, action) => {
      state.history = state.history.filter(
        record => !action.payload.includes(record.id)
      );
      state.pagination.total -= action.payload.length;
      state.selectedRecords = [];
    });

    // Toggle Favorite
    builder.addCase(toggleFavorite.fulfilled, (state, action) => {
      const index = state.history.findIndex(
        record => record.id === action.payload.id
      );
      if (index !== -1) {
        state.history[index] = action.payload;
      }
    });

    // Add Note
    builder.addCase(addNote.fulfilled, (state, action) => {
      const index = state.history.findIndex(
        record => record.id === action.payload.id
      );
      if (index !== -1) {
        state.history[index] = action.payload;
      }
    });

    // Add Tags
    builder.addCase(addTags.fulfilled, (state, action) => {
      const index = state.history.findIndex(
        record => record.id === action.payload.id
      );
      if (index !== -1) {
        state.history[index] = action.payload;
      }
    });

    // Fetch Scan Statistics
    builder.addCase(fetchScanStatistics.fulfilled, (state, action) => {
      state.statistics = action.payload;
    });

    // Search Scan History
    builder.addCase(searchScanHistory.fulfilled, (state, action) => {
      state.history = action.payload.data.history;
      state.pagination = {
        page: action.payload.data.page,
        limit: action.payload.data.limit,
        total: action.payload.data.total,
        totalPages: action.payload.data.totalPages,
        hasNext: action.payload.data.page < action.payload.data.totalPages,
        hasPrev: action.payload.data.page > 1,
      };
    });
  },
});

// 導出 actions
export const {
  setFilters,
  clearFilters,
  setSelectedRecord,
  clearSelectedRecord,
  toggleRecordSelection,
  selectAllRecords,
  clearSelection,
  clearError,
} = scanHistorySlice.actions;

// 導出 selectors
export const selectScanHistory = (state: { scanHistory: ScanHistoryState }) =>
  state.scanHistory;

export const selectScanHistoryList = (state: {
  scanHistory: ScanHistoryState;
}) => state.scanHistory.history;

export const selectSelectedRecord = (state: {
  scanHistory: ScanHistoryState;
}) => state.scanHistory.selectedRecord;

export const selectSelectedRecords = (state: {
  scanHistory: ScanHistoryState;
}) => state.scanHistory.selectedRecords;

export const selectPagination = (state: { scanHistory: ScanHistoryState }) =>
  state.scanHistory.pagination;

export const selectFilters = (state: { scanHistory: ScanHistoryState }) =>
  state.scanHistory.filters;

export const selectStatistics = (state: { scanHistory: ScanHistoryState }) =>
  state.scanHistory.statistics;

export const selectIsLoading = (state: { scanHistory: ScanHistoryState }) =>
  state.scanHistory.isLoading;

export const selectError = (state: { scanHistory: ScanHistoryState }) =>
  state.scanHistory.error;

// 導出 reducer
export default scanHistorySlice.reducer;
