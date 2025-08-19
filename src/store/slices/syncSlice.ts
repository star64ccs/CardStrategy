import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SyncState {
  status: 'idle' | 'syncing' | 'error' | 'offline';
  lastSyncTime: number;
  pendingChangesCount: number;
  error: string | null;
  isOnline: boolean;
}

const initialState: SyncState = {
  status: 'idle',
  lastSyncTime: 0,
  pendingChangesCount: 0,
  error: null,
  isOnline: navigator.onLine
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setSyncStatus: (state, action: PayloadAction<'idle' | 'syncing' | 'error' | 'offline'>) => {
      state.status = action.payload;
    },
    setLastSyncTime: (state, action: PayloadAction<number>) => {
      state.lastSyncTime = action.payload;
    },
    setPendingChangesCount: (state, action: PayloadAction<number>) => {
      state.pendingChangesCount = action.payload;
    },
    setSyncError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    clearSyncError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setSyncStatus,
  setLastSyncTime,
  setPendingChangesCount,
  setSyncError,
  setOnlineStatus,
  clearSyncError
} = syncSlice.actions;

export default syncSlice.reducer;
