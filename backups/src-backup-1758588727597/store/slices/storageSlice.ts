import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// 定義存儲相關類型
export interface StorageItem {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  size: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  encrypted: boolean;
  tags?: string[];
}

export interface StorageUsage {
  total: number;
  used: number;
  available: number;
  percentage: number;
  items: number;
  largestItems: {
    key: string;
    size: number;
  }[];
}

export interface StorageBackup {
  id: string;
  name: string;
  size: number;
  createdAt: string;
  items: number;
  status: 'creating' | 'completed' | 'failed';
  url?: string;
}

export interface StorageSync {
  id: string;
  source: string;
  target: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  progress: number;
  itemsSynced: number;
  totalItems: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface StorageFilters {
  key?: string;
  type?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  sizeMin?: number;
  sizeMax?: number;
  encrypted?: boolean;
}

// 存儲狀態接口
export interface StorageState {
  items: StorageItem[];
  usage: StorageUsage | null;
  backups: StorageBackup[];
  syncs: StorageSync[];
  filters: StorageFilters;
  isLoading: boolean;
  isBackingUp: boolean;
  isSyncing: boolean;
  isCleaning: boolean;
  error: string | null;
  selectedItems: string[];
  searchQuery: string;
}

// 異步 Action Creators
export const initializeStorage = createAsyncThunk(
  'storage/initializeStorage',
  async (_, { rejectWithValue }) => {
    try {
      // 模擬初始化存儲
      const mockUsage: StorageUsage = {
        total: 1024 * 1024 * 1024, // 1GB
        used: 256 * 1024 * 1024, // 256MB
        available: 768 * 1024 * 1024, // 768MB
        percentage: 25,
        items: 150,
        largestItems: [
          { key: 'user-preferences', size: 1024 * 1024 },
          { key: 'scan-history', size: 512 * 1024 },
        ],
      };

      return mockUsage;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '初始化存儲失敗');
    }
  }
);

export const fetchStorageItems = createAsyncThunk(
  'storage/fetchStorageItems',
  async (filters: StorageFilters = {}, { rejectWithValue }) => {
    try {
      // 模擬獲取存儲項目
      const mockItems: StorageItem[] = [
        {
          id: '1',
          key: 'user-preferences',
          value: { theme: 'dark', language: 'zh-TW' },
          type: 'object',
          size: 1024,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          encrypted: false,
          tags: ['user', 'preferences'],
        },
        {
          id: '2',
          key: 'scan-history',
          value: [],
          type: 'array',
          size: 2048,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          encrypted: true,
          tags: ['history', 'scan'],
        },
      ];

      return mockItems;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '獲取存儲項目失敗');
    }
  }
);

export const setStorageItem = createAsyncThunk(
  'storage/setStorageItem',
  async (
    item: {
      key: string;
      value: any;
      encrypted?: boolean;
      expiresAt?: string;
      tags?: string[];
    },
    { rejectWithValue }
  ) => {
    try {
      // 模擬設置存儲項目
      const newItem: StorageItem = {
        id: Date.now().toString(),
        key: item.key,
        value: item.value,
        type: Array.isArray(item.value)
          ? 'array'
          : (typeof item.value as 'string' | 'number' | 'boolean' | 'object'),
        size: JSON.stringify(item.value).length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: item.expiresAt,
        encrypted: item.encrypted || false,
        tags: item.tags || [],
      };

      return newItem;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '設置存儲項目失敗');
    }
  }
);

export const getStorageItem = createAsyncThunk(
  'storage/getStorageItem',
  async (key: string, { rejectWithValue }) => {
    try {
      // 模擬獲取存儲項目
      const mockItem: StorageItem = {
        id: '1',
        key,
        value: { example: 'data' },
        type: 'object',
        size: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        encrypted: false,
        tags: ['example'],
      };

      return mockItem;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '獲取存儲項目失敗');
    }
  }
);

export const removeStorageItem = createAsyncThunk(
  'storage/removeStorageItem',
  async (key: string, { rejectWithValue }) => {
    try {
      // 模擬移除存儲項目
      return key;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '移除存儲項目失敗');
    }
  }
);

export const removeMultipleItems = createAsyncThunk(
  'storage/removeMultipleItems',
  async (keys: string[], { rejectWithValue }) => {
    try {
      // 模擬批量移除存儲項目
      return keys;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '批量移除存儲項目失敗');
    }
  }
);

export const createBackup = createAsyncThunk(
  'storage/createBackup',
  async (name: string, { rejectWithValue }) => {
    try {
      // 模擬創建備份
      const backup: StorageBackup = {
        id: Date.now().toString(),
        name,
        size: 1024 * 1024, // 1MB
        createdAt: new Date().toISOString(),
        items: 150,
        status: 'completed',
        url: `https://backup.example.com/${name}.backup`,
      };

      return backup;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '創建備份失敗');
    }
  }
);

export const restoreBackup = createAsyncThunk(
  'storage/restoreBackup',
  async (backupId: string, { rejectWithValue }) => {
    try {
      // 模擬恢復備份
      return backupId;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '恢復備份失敗');
    }
  }
);

export const deleteBackup = createAsyncThunk(
  'storage/deleteBackup',
  async (backupId: string, { rejectWithValue }) => {
    try {
      // 模擬刪除備份
      return backupId;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '刪除備份失敗');
    }
  }
);

export const syncStorage = createAsyncThunk(
  'storage/syncStorage',
  async (
    syncConfig: {
      source: string;
      target: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // 模擬同步存儲
      const sync: StorageSync = {
        id: Date.now().toString(),
        source: syncConfig.source,
        target: syncConfig.target,
        status: 'completed',
        progress: 100,
        itemsSynced: 150,
        totalItems: 150,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      return sync;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '同步存儲失敗');
    }
  }
);

export const cleanupStorage = createAsyncThunk(
  'storage/cleanupStorage',
  async (
    options: {
      removeExpired?: boolean;
      compressData?: boolean;
      removeUnused?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      // 模擬清理存儲
      const result = {
        removedItems: 10,
        freedSpace: 1024 * 1024, // 1MB
        compressedItems: 5,
      };

      return result;
    } catch (error: unknown) {
      return rejectWithValue((error as any).message || '清理存儲失敗');
    }
  }
);

// 初始狀態
const initialState: StorageState = {
  items: [],
  usage: null,
  backups: [],
  syncs: [],
  filters: {},
  isLoading: false,
  isBackingUp: false,
  isSyncing: false,
  isCleaning: false,
  error: null,
  selectedItems: [],
  searchQuery: '',
};

// 創建 slice
const storageSlice = createSlice({
  name: 'storage',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<StorageFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: state => {
      state.filters = {};
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearSearchQuery: state => {
      state.searchQuery = '';
    },
    selectItem: (state, action: PayloadAction<string>) => {
      if (!state.selectedItems.includes(action.payload)) {
        state.selectedItems.push(action.payload);
      }
    },
    deselectItem: (state, action: PayloadAction<string>) => {
      state.selectedItems = state.selectedItems.filter(
        id => id !== action.payload
      );
    },
    selectAllItems: state => {
      state.selectedItems = state.items.map(item => item.id);
    },
    clearSelection: state => {
      state.selectedItems = [];
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Initialize Storage
    builder
      .addCase(initializeStorage.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeStorage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.usage = action.payload;
        state.error = null;
      })
      .addCase(initializeStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Storage Items
    builder
      .addCase(fetchStorageItems.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(fetchStorageItems.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Set Storage Item
    builder
      .addCase(setStorageItem.fulfilled, (state, action) => {
        const existingIndex = state.items.findIndex(
          item => item.key === action.payload.key
        );
        if (existingIndex !== -1) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(setStorageItem.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Get Storage Item
    builder
      .addCase(getStorageItem.fulfilled, (state, action) => {
        const existingIndex = state.items.findIndex(
          item => item.id === action.payload.id
        );
        if (existingIndex !== -1) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(getStorageItem.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Remove Storage Item
    builder
      .addCase(removeStorageItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.key !== action.payload);
      })
      .addCase(removeStorageItem.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Remove Multiple Items
    builder
      .addCase(removeMultipleItems.fulfilled, (state, action) => {
        state.items = state.items.filter(
          item => !action.payload.includes(item.key)
        );
        state.selectedItems = [];
      })
      .addCase(removeMultipleItems.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Create Backup
    builder
      .addCase(createBackup.pending, state => {
        state.isBackingUp = true;
        state.error = null;
      })
      .addCase(createBackup.fulfilled, (state, action) => {
        state.isBackingUp = false;
        state.backups.unshift(action.payload);
        state.error = null;
      })
      .addCase(createBackup.rejected, (state, action) => {
        state.isBackingUp = false;
        state.error = action.payload as string;
      });

    // Restore Backup
    builder
      .addCase(restoreBackup.fulfilled, state => {
        // 恢復備份後重新載入項目
      })
      .addCase(restoreBackup.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Backup
    builder
      .addCase(deleteBackup.fulfilled, (state, action) => {
        state.backups = state.backups.filter(
          backup => backup.id !== action.payload
        );
      })
      .addCase(deleteBackup.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Sync Storage
    builder
      .addCase(syncStorage.pending, state => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(syncStorage.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.syncs.unshift(action.payload);
        state.error = null;
      })
      .addCase(syncStorage.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload as string;
      });

    // Cleanup Storage
    builder
      .addCase(cleanupStorage.pending, state => {
        state.isCleaning = true;
        state.error = null;
      })
      .addCase(cleanupStorage.fulfilled, state => {
        state.isCleaning = false;
        state.error = null;
      })
      .addCase(cleanupStorage.rejected, (state, action) => {
        state.isCleaning = false;
        state.error = action.payload as string;
      });
  },
});

// 導出 actions
export const {
  setFilters,
  clearFilters,
  setSearchQuery,
  clearSearchQuery,
  selectItem,
  deselectItem,
  selectAllItems,
  clearSelection,
  clearError,
} = storageSlice.actions;

// 導出 selectors
export const selectStorageItems = (state: { storage: StorageState }) =>
  state.storage.items;

export const selectStorageUsage = (state: { storage: StorageState }) =>
  state.storage.usage;

export const selectStorageBackups = (state: { storage: StorageState }) =>
  state.storage.backups;

export const selectStorageSyncs = (state: { storage: StorageState }) =>
  state.storage.syncs;

export const selectStorageFilters = (state: { storage: StorageState }) =>
  state.storage.filters;

export const selectSearchQuery = (state: { storage: StorageState }) =>
  state.storage.searchQuery;

export const selectSelectedItems = (state: { storage: StorageState }) =>
  state.storage.selectedItems;

export const selectIsStorageLoading = (state: { storage: StorageState }) =>
  state.storage.isLoading;

export const selectIsBackingUp = (state: { storage: StorageState }) =>
  state.storage.isBackingUp;

export const selectIsSyncing = (state: { storage: StorageState }) =>
  state.storage.isSyncing;

export const selectIsCleaning = (state: { storage: StorageState }) =>
  state.storage.isCleaning;

export const selectStorageError = (state: { storage: StorageState }) =>
  state.storage.error;

// 導出 reducer
export default storageSlice.reducer;
