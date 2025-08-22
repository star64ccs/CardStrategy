import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  scanHistoryService,
  ScanHistoryItem,
  ScanHistoryFilters,
  ScanStatistics,
} from '@/services/scanHistoryService';

// 掃描歷史記錄狀態類型
export interface ScanHistoryState {
  history: ScanHistoryItem[];
  selectedRecord: ScanHistoryItem | null;
  statistics: ScanStatistics | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  filters: ScanHistoryFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  selectedRecords: string[];
  isSelectionMode: boolean;
}

// 異步 thunk
export const fetchScanHistory = createAsyncThunk(
  'scanHistory/fetchScanHistory',
  async (filters: ScanHistoryFilters = {}, { rejectWithValue }) => {
    try {
      const response = await scanHistoryService.getScanHistory(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '獲取掃描歷史失敗');
    }
  }
);

export const fetchScanRecord = createAsyncThunk(
  'scanHistory/fetchScanRecord',
  async (recordId: string, { rejectWithValue }) => {
    try {
      const response = await scanHistoryService.getScanRecord(recordId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '獲取掃描記錄失敗');
    }
  }
);

export const createScanRecord = createAsyncThunk(
  'scanHistory/createScanRecord',
  async (
    scanData: Omit<
      ScanHistoryItem,
      'id' | 'userId' | 'createdAt' | 'updatedAt'
    >,
    { rejectWithValue }
  ) => {
    try {
      const response = await scanHistoryService.createScanRecord(scanData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '創建掃描記錄失敗');
    }
  }
);

export const updateScanRecord = createAsyncThunk(
  'scanHistory/updateScanRecord',
  async (
    {
      recordId,
      updates,
    }: { recordId: string; updates: Partial<ScanHistoryItem> },
    { rejectWithValue }
  ) => {
    try {
      const response = await scanHistoryService.updateScanRecord(
        recordId,
        updates
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '更新掃描記錄失敗');
    }
  }
);

export const deleteScanRecord = createAsyncThunk(
  'scanHistory/deleteScanRecord',
  async (recordId: string, { rejectWithValue }) => {
    try {
      await scanHistoryService.deleteScanRecord(recordId);
      return recordId;
    } catch (error: any) {
      return rejectWithValue(error.message || '刪除掃描記錄失敗');
    }
  }
);

export const deleteMultipleRecords = createAsyncThunk(
  'scanHistory/deleteMultipleRecords',
  async (recordIds: string[], { rejectWithValue }) => {
    try {
      await scanHistoryService.deleteMultipleRecords(recordIds);
      return recordIds;
    } catch (error: any) {
      return rejectWithValue(error.message || '批量刪除掃描記錄失敗');
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'scanHistory/toggleFavorite',
  async (recordId: string, { rejectWithValue }) => {
    try {
      const response = await scanHistoryService.toggleFavorite(recordId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '切換收藏狀態失敗');
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
      const response = await scanHistoryService.addNote(recordId, note);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '添加筆記失敗');
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
      const response = await scanHistoryService.addTags(recordId, tags);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '添加標籤失敗');
    }
  }
);

export const fetchScanStatistics = createAsyncThunk(
  'scanHistory/fetchScanStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await scanHistoryService.getScanStatistics();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '獲取掃描統計失敗');
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
      const response = await scanHistoryService.searchScanHistory(
        query,
        filters
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '搜索掃描歷史失敗');
    }
  }
);

// 初始狀態
const initialState: ScanHistoryState = {
  history: [],
  selectedRecord: null,
  statistics: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  filters: {
    page: 1,
    limit: 20,
    sortBy: 'date',
    sortOrder: 'desc',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  selectedRecords: [],
  isSelectionMode: false,
};

// Scan History slice
const scanHistorySlice = createSlice({
  name: 'scanHistory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedRecord: (state) => {
      state.selectedRecord = null;
    },
    setFilters: (state, action: PayloadAction<Partial<ScanHistoryFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 20,
        sortBy: 'date',
        sortOrder: 'desc',
      };
    },
    toggleSelectionMode: (state) => {
      state.isSelectionMode = !state.isSelectionMode;
      if (!state.isSelectionMode) {
        state.selectedRecords = [];
      }
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
    selectAllRecords: (state) => {
      state.selectedRecords = state.history.map((record) => record.id);
    },
    clearSelection: (state) => {
      state.selectedRecords = [];
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Scan History
    builder
      .addCase(fetchScanHistory.pending, (state) => {
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
      .addCase(fetchScanRecord.pending, (state) => {
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
        (record) => record.id === action.payload.id
      );
      if (index !== -1) {
        state.history[index] = action.payload;
      }
      if (state.selectedRecord?.id === action.payload.id) {
        state.selectedRecord = action.payload;
      }
    });

    // Delete Scan Record
    builder.addCase(deleteScanRecord.fulfilled, (state, action) => {
      state.history = state.history.filter(
        (record) => record.id !== action.payload
      );
      state.pagination.total -= 1;
      if (state.selectedRecord?.id === action.payload) {
        state.selectedRecord = null;
      }
    });

    // Delete Multiple Records
    builder.addCase(deleteMultipleRecords.fulfilled, (state, action) => {
      state.history = state.history.filter(
        (record) => !action.payload.includes(record.id)
      );
      state.pagination.total -= action.payload.length;
      state.selectedRecords = [];
      state.isSelectionMode = false;
    });

    // Toggle Favorite
    builder.addCase(toggleFavorite.fulfilled, (state, action) => {
      const index = state.history.findIndex(
        (record) => record.id === action.payload.id
      );
      if (index !== -1) {
        state.history[index] = action.payload;
      }
      if (state.selectedRecord?.id === action.payload.id) {
        state.selectedRecord = action.payload;
      }
    });

    // Add Note
    builder.addCase(addNote.fulfilled, (state, action) => {
      const index = state.history.findIndex(
        (record) => record.id === action.payload.id
      );
      if (index !== -1) {
        state.history[index] = action.payload;
      }
      if (state.selectedRecord?.id === action.payload.id) {
        state.selectedRecord = action.payload;
      }
    });

    // Add Tags
    builder.addCase(addTags.fulfilled, (state, action) => {
      const index = state.history.findIndex(
        (record) => record.id === action.payload.id
      );
      if (index !== -1) {
        state.history[index] = action.payload;
      }
      if (state.selectedRecord?.id === action.payload.id) {
        state.selectedRecord = action.payload;
      }
    });

    // Fetch Scan Statistics
    builder
      .addCase(fetchScanStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScanStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload;
        state.error = null;
      })
      .addCase(fetchScanStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search Scan History
    builder
      .addCase(searchScanHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchScanHistory.fulfilled, (state, action) => {
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
      .addCase(searchScanHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// 導出 actions
export const {
  clearError,
  clearSelectedRecord,
  setFilters,
  clearFilters,
  toggleSelectionMode,
  toggleRecordSelection,
  selectAllRecords,
  clearSelection,
  setPage,
} = scanHistorySlice.actions;

// 導出 reducer
export default scanHistorySlice.reducer;
