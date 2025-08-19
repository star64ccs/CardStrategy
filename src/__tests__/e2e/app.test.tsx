import { render, fireEvent, waitFor } from '@/__tests__/setup/test-utils';
import { ScanHistoryScreen } from '@/screens/ScanHistoryScreen';
import { createMockScanHistory } from '@/__tests__/setup/test-utils';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn()
};

// Mock Redux actions
jest.mock('@/store/slices/scanHistorySlice', () => ({
  fetchScanHistory: jest.fn(),
  fetchScanStatistics: jest.fn(),
  searchScanHistory: jest.fn(),
  clearFilters: jest.fn(),
  setFilters: jest.fn(),
  toggleSelectionMode: jest.fn()
}));

describe('End-to-End Tests', () => {
  const mockHistory = [
    createMockScanHistory(),
    createMockScanHistory({ 
      id: '2', 
      cardName: 'Test Card 2',
      scanType: 'condition',
      isFavorite: true 
    }),
    createMockScanHistory({ 
      id: '3', 
      cardName: 'Test Card 3',
      scanType: 'authenticity',
      isFavorite: false 
    })
  ];

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
      batch: 5
    },
    scansByDate: {
      today: 10,
      thisWeek: 50,
      thisMonth: 200
    },
    mostScannedCards: [
      { cardId: '1', cardName: 'Test Card', scanCount: 15 },
      { cardId: '2', cardName: 'Test Card 2', scanCount: 10 }
    ]
  };

  const mockState = {
    scanHistory: {
      history: mockHistory,
      statistics: mockStatistics,
      isLoading: false,
      isRefreshing: false,
      error: null,
      filters: {
        scanType: undefined,
        dateRange: undefined,
        successOnly: undefined,
        favoriteOnly: undefined,
        searchQuery: undefined,
        sortBy: 'date',
        sortOrder: 'desc',
        page: 1,
        limit: 10
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 3,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      },
      selectedRecords: [],
      isSelectionMode: false,
      selectedRecord: null
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ScanHistoryScreen E2E', () => {
    it('應該完整渲染掃描歷史屏幕', () => {
      const { getByText, getByTestId } = render(
        <ScanHistoryScreen navigation={mockNavigation} />,
        { preloadedState: mockState }
      );

      // 檢查標題
      expect(getByText('掃描歷史')).toBeTruthy();

      // 檢查統計信息
      expect(getByText('總掃描次數')).toBeTruthy();
      expect(getByText('100')).toBeTruthy();
      expect(getByText('成功率')).toBeTruthy();
      expect(getByText('95%')).toBeTruthy();

      // 檢查搜索欄
      expect(getByTestId('search-input')).toBeTruthy();

      // 檢查過濾按鈕
      expect(getByText('過濾')).toBeTruthy();

      // 檢查歷史記錄
      expect(getByText('Test Card')).toBeTruthy();
      expect(getByText('Test Card 2')).toBeTruthy();
      expect(getByText('Test Card 3')).toBeTruthy();
    });

    it('應該處理搜索功能', async () => {
      const { getByTestId, getByText } = render(
        <ScanHistoryScreen navigation={mockNavigation} />,
        { preloadedState: mockState }
      );

      const searchInput = getByTestId('search-input');
      const searchButton = getByText('搜索');

      // 輸入搜索查詢
      fireEvent.changeText(searchInput, 'Test Card 2');

      // 點擊搜索按鈕
      fireEvent.press(searchButton);

      await waitFor(() => {
        expect(require('@/store/slices/scanHistorySlice').searchScanHistory).toHaveBeenCalledWith({
          query: 'Test Card 2',
          filters: expect.any(Object)
        });
      });
    });

    it('應該處理清除搜索', async () => {
      const { getByText } = render(
        <ScanHistoryScreen navigation={mockNavigation} />,
        { preloadedState: mockState }
      );

      const clearButton = getByText('清除');

      fireEvent.press(clearButton);

      await waitFor(() => {
        expect(require('@/store/slices/scanHistorySlice').fetchScanHistory).toHaveBeenCalled();
      });
    });

    it('應該處理過濾功能', async () => {
      const { getByText } = render(
        <ScanHistoryScreen navigation={mockNavigation} />,
        { preloadedState: mockState }
      );

      const filterButton = getByText('過濾');

      fireEvent.press(filterButton);

      // 檢查過濾選項是否顯示
      await waitFor(() => {
        expect(getByText('掃描類型')).toBeTruthy();
        expect(getByText('識別')).toBeTruthy();
        expect(getByText('條件分析')).toBeTruthy();
        expect(getByText('真偽驗證')).toBeTruthy();
      });

      // 選擇過濾條件
      const recognitionFilter = getByText('識別');
      fireEvent.press(recognitionFilter);

      await waitFor(() => {
        expect(require('@/store/slices/scanHistorySlice').setFilters).toHaveBeenCalledWith({
          scanType: 'recognition'
        });
      });
    });

    it('應該處理清除過濾', async () => {
      const { getByText } = render(
        <ScanHistoryScreen navigation={mockNavigation} />,
        { preloadedState: mockState }
      );

      const filterButton = getByText('過濾');
      fireEvent.press(filterButton);

      const clearFiltersButton = getByText('清除過濾');
      fireEvent.press(clearFiltersButton);

      await waitFor(() => {
        expect(require('@/store/slices/scanHistorySlice').clearFilters).toHaveBeenCalled();
      });
    });

    it('應該處理記錄點擊和詳情顯示', async () => {
      const { getByTestId, getByText } = render(
        <ScanHistoryScreen navigation={mockNavigation} />,
        { preloadedState: mockState }
      );

      const firstRecord = getByTestId('scan-history-item-1');
      fireEvent.press(firstRecord);

      // 檢查詳情模態框是否顯示
      await waitFor(() => {
        expect(getByText('掃描詳情')).toBeTruthy();
        expect(getByText('Test Card')).toBeTruthy();
        expect(getByText('識別')).toBeTruthy();
      });
    });

    it('應該處理詳情模態框關閉', async () => {
      const { getByTestId, getByText } = render(
        <ScanHistoryScreen navigation={mockNavigation} />,
        { preloadedState: mockState }
      );

      // 打開詳情
      const firstRecord = getByTestId('scan-history-item-1');
      fireEvent.press(firstRecord);

      // 關閉詳情
      const closeButton = getByTestId('close-button');
      fireEvent.press(closeButton);

      await waitFor(() => {
        expect(getByText('掃描歷史')).toBeTruthy();
      });
    });

    it('應該處理導出功能', async () => {
      const { getByText } = render(
        <ScanHistoryScreen navigation={mockNavigation} />,
        { preloadedState: mockState }
      );

      const exportButton = getByText('導出');

      fireEvent.press(exportButton);

      // 檢查導出選項
      await waitFor(() => {
        expect(getByText('導出為 CSV')).toBeTruthy();
        expect(getByText('導出為 JSON')).toBeTruthy();
        expect(getByText('導出為 PDF')).toBeTruthy();
      });

      // 選擇導出格式
      const csvExport = getByText('導出為 CSV');
      fireEvent.press(csvExport);

      // 這裡應該觸發導出邏輯
    });

    it('應該處理批量操作', async () => {
      const { getByTestId, getByText } = render(
        <ScanHistoryScreen navigation={mockNavigation} />,
        { preloadedState: mockState }
      );

      // 長按進入選擇模式
      const firstRecord = getByTestId('scan-history-item-1');
      fireEvent(firstRecord, 'longPress');

      await waitFor(() => {
        expect(require('@/store/slices/scanHistorySlice').toggleSelectionMode).toHaveBeenCalled();
      });

      // 檢查選擇模式UI
      expect(getByText('已選擇 0 項')).toBeTruthy();
    });

    it('應該處理下拉刷新', async () => {
      const { getByTestId } = render(
        <ScanHistoryScreen navigation={mockNavigation} />,
        { preloadedState: mockState }
      );

      const flatList = getByTestId('scan-history-flatlist');
      fireEvent.scroll(flatList, {
        nativeEvent: {
          contentOffset: { y: 0 },
          contentSize: { height: 500, width: 100 },
          layoutMeasurement: { height: 100, width: 100 }
        }
      });

      await waitFor(() => {
        expect(require('@/store/slices/scanHistorySlice').fetchScanHistory).toHaveBeenCalled();
        expect(require('@/store/slices/scanHistorySlice').fetchScanStatistics).toHaveBeenCalled();
      });
    });

    it('應該處理錯誤狀態', () => {
      const errorState = {
        ...mockState,
        scanHistory: {
          ...mockState.scanHistory,
          error: '獲取掃描歷史失敗'
        }
      };

      const { getByText } = render(
        <ScanHistoryScreen navigation={mockNavigation} />,
        { preloadedState: errorState }
      );

      expect(getByText('獲取掃描歷史失敗')).toBeTruthy();
      expect(getByText('重試')).toBeTruthy();
    });

    it('應該處理空狀態', () => {
      const emptyState = {
        ...mockState,
        scanHistory: {
          ...mockState.scanHistory,
          history: []
        }
      };

      const { getByText } = render(
        <ScanHistoryScreen navigation={mockNavigation} />,
        { preloadedState: emptyState }
      );

      expect(getByText('暫無掃描記錄')).toBeTruthy();
      expect(getByText('開始掃描')).toBeTruthy();
    });

    it('應該處理加載狀態', () => {
      const loadingState = {
        ...mockState,
        scanHistory: {
          ...mockState.scanHistory,
          isLoading: true
        }
      };

      const { getByTestId } = render(
        <ScanHistoryScreen navigation={mockNavigation} />,
        { preloadedState: loadingState }
      );

      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('應該處理統計數據顯示', () => {
      const { getByText } = render(
        <ScanHistoryScreen navigation={mockNavigation} />,
        { preloadedState: mockState }
      );

      // 檢查統計數據
      expect(getByText('總掃描次數')).toBeTruthy();
      expect(getByText('100')).toBeTruthy();
      expect(getByText('成功率')).toBeTruthy();
      expect(getByText('95%')).toBeTruthy();
      expect(getByText('平均處理時間')).toBeTruthy();
      expect(getByText('1.2s')).toBeTruthy();

      // 檢查掃描類型統計
      expect(getByText('識別')).toBeTruthy();
      expect(getByText('60')).toBeTruthy();
      expect(getByText('條件分析')).toBeTruthy();
      expect(getByText('25')).toBeTruthy();
      expect(getByText('真偽驗證')).toBeTruthy();
      expect(getByText('10')).toBeTruthy();
    });
  });

  describe('User Journey Tests', () => {
    it('應該完成完整的用戶掃描歷史查看流程', async () => {
      const { getByTestId, getByText } = render(
        <ScanHistoryScreen navigation={mockNavigation} />,
        { preloadedState: mockState }
      );

      // 1. 用戶進入掃描歷史頁面
      expect(getByText('掃描歷史')).toBeTruthy();

      // 2. 查看統計信息
      expect(getByText('總掃描次數')).toBeTruthy();
      expect(getByText('100')).toBeTruthy();

      // 3. 搜索特定記錄
      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'Test Card 2');

      const searchButton = getByText('搜索');
      fireEvent.press(searchButton);

      // 4. 查看記錄詳情
      const record = getByTestId('scan-history-item-2');
      fireEvent.press(record);

      await waitFor(() => {
        expect(getByText('掃描詳情')).toBeTruthy();
        expect(getByText('Test Card 2')).toBeTruthy();
      });

      // 5. 關閉詳情
      const closeButton = getByTestId('close-button');
      fireEvent.press(closeButton);

      // 6. 使用過濾功能
      const filterButton = getByText('過濾');
      fireEvent.press(filterButton);

      await waitFor(() => {
        expect(getByText('掃描類型')).toBeTruthy();
      });

      // 7. 清除過濾
      const clearFiltersButton = getByText('清除過濾');
      fireEvent.press(clearFiltersButton);

      // 8. 刷新數據
      const flatList = getByTestId('scan-history-flatlist');
      fireEvent.scroll(flatList, {
        nativeEvent: {
          contentOffset: { y: 0 },
          contentSize: { height: 500, width: 100 },
          layoutMeasurement: { height: 100, width: 100 }
        }
      });

      await waitFor(() => {
        expect(require('@/store/slices/scanHistorySlice').fetchScanHistory).toHaveBeenCalled();
      });
    });
  });
});
