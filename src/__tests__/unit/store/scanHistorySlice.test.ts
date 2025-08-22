/* global jest, describe, it, expect, beforeEach, afterEach */
import { configureStore } from '@reduxjs/toolkit';
import scanHistoryReducer, {
  fetchScanHistory,
  fetchScanRecord,
  createScanRecord,
  updateScanRecord,
  deleteScanRecord,
  toggleFavorite,
  addNote,
  addTags,
  fetchScanStatistics,
  searchScanHistory,
  clearError,
  setFilters,
  clearFilters,
  toggleSelectionMode,
  toggleRecordSelection,
  selectAllRecords,
  clearSelection,
} from '@/store/slices/scanHistorySlice';
import { createMockScanHistory } from '@/__tests__/setup/test-utils';

// Mock scan history service
jest.mock('@/services/scanHistoryService', () => ({
  scanHistoryService: {
    getScanHistory: jest.fn(),
    getScanRecord: jest.fn(),
    createScanRecord: jest.fn(),
    updateScanRecord: jest.fn(),
    deleteScanRecord: jest.fn(),
    toggleFavorite: jest.fn(),
    addNote: jest.fn(),
    addTags: jest.fn(),
    getScanStatistics: jest.fn(),
    searchScanHistory: jest.fn(),
  },
}));

describe('ScanHistory Slice', () => {
  let store: any;
  let mockScanHistoryService: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        scanHistory: scanHistoryReducer,
      },
    });
    mockScanHistoryService =
      require('@/services/scanHistoryService').scanHistoryService;
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('應該有正確的初始狀態', () => {
      const state = store.getState().scanHistory;

      expect(state.history).toEqual([]);
      expect(state.selectedRecord).toBeNull();
      expect(state.statistics).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isRefreshing).toBe(false);
      expect(state.error).toBeNull();
      expect(state.filters).toEqual({
        scanType: undefined,
        dateRange: undefined,
        successOnly: undefined,
        favoriteOnly: undefined,
        searchQuery: undefined,
        sortBy: 'date',
        sortOrder: 'desc',
        page: 1,
        limit: 10,
      });
      expect(state.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
      expect(state.selectedRecords).toEqual([]);
      expect(state.isSelectionMode).toBe(false);
    });
  });

  describe('fetchScanHistory', () => {
    it('應該成功獲取掃描歷史', async () => {
      const mockHistory = [
        createMockScanHistory(),
        createMockScanHistory({ id: '2' }),
      ];
      const mockResponse = {
        history: mockHistory,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockScanHistoryService.getScanHistory.mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      await store.dispatch(fetchScanHistory());

      const state = store.getState().scanHistory;
      expect(state.history).toEqual(mockHistory);
      expect(state.pagination.total).toBe(2);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('應該處理獲取掃描歷史失敗', async () => {
      const errorMessage = '獲取掃描歷史失敗';
      mockScanHistoryService.getScanHistory.mockRejectedValue(
        new Error(errorMessage)
      );

      await store.dispatch(fetchScanHistory());

      const state = store.getState().scanHistory;
      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('fetchScanRecord', () => {
    it('應該成功獲取單個掃描記錄', async () => {
      const mockRecord = createMockScanHistory();
      mockScanHistoryService.getScanRecord.mockResolvedValue(mockRecord);

      await store.dispatch(fetchScanRecord('1'));

      const state = store.getState().scanHistory;
      expect(state.selectedRecord).toEqual(mockRecord);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('createScanRecord', () => {
    it('應該成功創建掃描記錄', async () => {
      const mockRecord = createMockScanHistory();
      const newRecordData = {
        cardId: '1',
        scanType: 'recognition' as const,
        imageUri: 'file://test.jpg',
        scanResult: { success: true },
      };

      mockScanHistoryService.createScanRecord.mockResolvedValue(mockRecord);

      await store.dispatch(createScanRecord(newRecordData));

      const state = store.getState().scanHistory;
      expect(state.history).toContainEqual(mockRecord);
    });
  });

  describe('updateScanRecord', () => {
    it('應該成功更新掃描記錄', async () => {
      const mockRecord = createMockScanHistory();
      const updatedRecord = { ...mockRecord, notes: 'Updated note' };

      mockScanHistoryService.updateScanRecord.mockResolvedValue(updatedRecord);

      await store.dispatch(
        updateScanRecord({ recordId: '1', updates: { notes: 'Updated note' } })
      );

      const state = store.getState().scanHistory;
      expect(state.history).toContainEqual(updatedRecord);
    });
  });

  describe('deleteScanRecord', () => {
    it('應該成功刪除掃描記錄', async () => {
      const mockRecord = createMockScanHistory();

      // 先添加記錄到狀態
      store.dispatch({
        type: 'scanHistory/fetchScanHistory/fulfilled',
        payload: {
          history: [mockRecord],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      mockScanHistoryService.deleteScanRecord.mockResolvedValue(undefined);

      await store.dispatch(deleteScanRecord('1'));

      const state = store.getState().scanHistory;
      expect(state.history).not.toContainEqual(mockRecord);
    });
  });

  describe('toggleFavorite', () => {
    it('應該成功切換收藏狀態', async () => {
      const mockRecord = createMockScanHistory({ isFavorite: false });
      const updatedRecord = { ...mockRecord, isFavorite: true };

      mockScanHistoryService.toggleFavorite.mockResolvedValue(updatedRecord);

      await store.dispatch(toggleFavorite('1'));

      const state = store.getState().scanHistory;
      expect(state.history).toContainEqual(updatedRecord);
    });
  });

  describe('addNote', () => {
    it('應該成功添加筆記', async () => {
      const mockRecord = createMockScanHistory();
      const updatedRecord = { ...mockRecord, notes: 'New note' };

      mockScanHistoryService.addNote.mockResolvedValue(updatedRecord);

      await store.dispatch(addNote({ recordId: '1', note: 'New note' }));

      const state = store.getState().scanHistory;
      expect(state.history).toContainEqual(updatedRecord);
    });
  });

  describe('addTags', () => {
    it('應該成功添加標籤', async () => {
      const mockRecord = createMockScanHistory();
      const updatedRecord = { ...mockRecord, tags: ['new', 'tag'] };

      mockScanHistoryService.addTags.mockResolvedValue(updatedRecord);

      await store.dispatch(addTags({ recordId: '1', tags: ['new', 'tag'] }));

      const state = store.getState().scanHistory;
      expect(state.history).toContainEqual(updatedRecord);
    });
  });

  describe('fetchScanStatistics', () => {
    it('應該成功獲取統計數據', async () => {
      const mockStatistics = {
        totalScans: 100,
        successfulScans: 95,
        failedScans: 5,
        successRate: 0.95,
        averageProcessingTime: 1200,
        scansByType: {
          recognition: 60,
          condition: 25,
          authenticity: 10,
          batch: 5,
        },
        scansByDate: {
          today: 10,
          thisWeek: 50,
          thisMonth: 200,
        },
        mostScannedCards: [],
      };

      mockScanHistoryService.getScanStatistics.mockResolvedValue(
        mockStatistics
      );

      await store.dispatch(fetchScanStatistics());

      const state = store.getState().scanHistory;
      expect(state.statistics).toEqual(mockStatistics);
    });
  });

  describe('searchScanHistory', () => {
    it('應該成功搜索掃描歷史', async () => {
      const mockHistory = [createMockScanHistory()];
      const mockResponse = {
        history: mockHistory,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockScanHistoryService.searchScanHistory.mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      await store.dispatch(searchScanHistory({ query: 'test', filters: {} }));

      const state = store.getState().scanHistory;
      expect(state.history).toEqual(mockHistory);
    });
  });

  describe('Reducers', () => {
    describe('clearError', () => {
      it('應該清除錯誤', () => {
        // 先設置錯誤
        store.dispatch({
          type: 'scanHistory/fetchScanHistory/rejected',
          error: { message: 'Test error' },
        });

        store.dispatch(clearError());

        const state = store.getState().scanHistory;
        expect(state.error).toBeNull();
      });
    });

    describe('setFilters', () => {
      it('應該設置過濾器', () => {
        const newFilters = { scanType: 'recognition', successOnly: true };
        store.dispatch(setFilters(newFilters));

        const state = store.getState().scanHistory;
        expect(state.filters.scanType).toBe('recognition');
        expect(state.filters.successOnly).toBe(true);
      });
    });

    describe('clearFilters', () => {
      it('應該清除過濾器', () => {
        // 先設置過濾器
        store.dispatch(setFilters({ scanType: 'recognition' }));

        store.dispatch(clearFilters());

        const state = store.getState().scanHistory;
        expect(state.filters.scanType).toBeUndefined();
      });
    });

    describe('toggleSelectionMode', () => {
      it('應該切換選擇模式', () => {
        store.dispatch(toggleSelectionMode());

        const state = store.getState().scanHistory;
        expect(state.isSelectionMode).toBe(true);

        store.dispatch(toggleSelectionMode());
        expect(state.isSelectionMode).toBe(false);
      });
    });

    describe('toggleRecordSelection', () => {
      it('應該切換記錄選擇狀態', () => {
        store.dispatch(toggleRecordSelection('1'));

        const state = store.getState().scanHistory;
        expect(state.selectedRecords).toContain('1');

        store.dispatch(toggleRecordSelection('1'));
        expect(state.selectedRecords).not.toContain('1');
      });
    });

    describe('selectAllRecords', () => {
      it('應該選擇所有記錄', () => {
        const mockHistory = [
          createMockScanHistory(),
          createMockScanHistory({ id: '2' }),
        ];

        // 先添加記錄到狀態
        store.dispatch({
          type: 'scanHistory/fetchScanHistory/fulfilled',
          payload: {
            history: mockHistory,
            total: 2,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        });

        store.dispatch(selectAllRecords());

        const state = store.getState().scanHistory;
        expect(state.selectedRecords).toEqual(['1', '2']);
      });
    });

    describe('clearSelection', () => {
      it('應該清除選擇', () => {
        // 先選擇一些記錄
        store.dispatch(toggleRecordSelection('1'));
        store.dispatch(toggleRecordSelection('2'));

        store.dispatch(clearSelection());

        const state = store.getState().scanHistory;
        expect(state.selectedRecords).toEqual([]);
      });
    });
  });

  describe('Loading States', () => {
    it('應該正確處理加載狀態', () => {
      // 開始加載
      store.dispatch({ type: 'scanHistory/fetchScanHistory/pending' });

      let state = store.getState().scanHistory;
      expect(state.isLoading).toBe(true);

      // 完成加載
      store.dispatch({
        type: 'scanHistory/fetchScanHistory/fulfilled',
        payload: { history: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      state = store.getState().scanHistory;
      expect(state.isLoading).toBe(false);
    });

    it('應該正確處理刷新狀態', () => {
      // 開始刷新
      store.dispatch({ type: 'scanHistory/fetchScanHistory/pending' });

      let state = store.getState().scanHistory;
      expect(state.isRefreshing).toBe(true);

      // 完成刷新
      store.dispatch({
        type: 'scanHistory/fetchScanHistory/fulfilled',
        payload: { history: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      state = store.getState().scanHistory;
      expect(state.isRefreshing).toBe(false);
    });
  });
});
