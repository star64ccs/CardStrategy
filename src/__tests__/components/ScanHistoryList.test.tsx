import React from 'react';
import { render, fireEvent, waitFor } from '@/__tests__/setup/test-utils';
import { ScanHistoryList } from '@/components/scan/ScanHistoryList';
import { createMockScanHistory } from '@/__tests__/setup/test-utils';
import {
  fetchScanHistory,
  deleteScanRecord,
  toggleFavorite,
} from '@/store/slices/scanHistorySlice';

// Mock Redux actions
jest.mock('@/store/slices/scanHistorySlice', () => ({
  fetchScanHistory: jest.fn(),
  deleteScanRecord: jest.fn(),
  deleteMultipleRecords: jest.fn(),
  toggleFavorite: jest.fn(),
  toggleSelectionMode: jest.fn(),
  toggleRecordSelection: jest.fn(),
  selectAllRecords: jest.fn(),
  clearSelection: jest.fn(),
  setFilters: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('ScanHistoryList', () => {
  const mockHistory = [
    createMockScanHistory(),
    createMockScanHistory({
      id: '2',
      cardName: 'Test Card 2',
      scanType: 'condition',
      isFavorite: true,
    }),
  ];

  const mockState = {
    scanHistory: {
      history: mockHistory,
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
        limit: 10,
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      selectedRecords: [],
      isSelectionMode: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('應該正確渲染掃描歷史列表', () => {
    const { getByText, getAllByTestId } = render(<ScanHistoryList />, {
      preloadedState: mockState,
    });

    expect(getByText('Test Card')).toBeTruthy();
    expect(getByText('Test Card 2')).toBeTruthy();
    expect(getAllByTestId('scan-history-item')).toHaveLength(2);
  });

  it('應該顯示掃描類型圖標和標籤', () => {
    const { getByText } = render(<ScanHistoryList />, {
      preloadedState: mockState,
    });

    // 檢查掃描類型標籤
    expect(getByText('識別')).toBeTruthy();
    expect(getByText('條件分析')).toBeTruthy();
  });

  it('應該顯示收藏狀態', () => {
    const { getByTestId } = render(<ScanHistoryList />, {
      preloadedState: mockState,
    });

    // 檢查收藏圖標
    const favoriteIcon = getByTestId('favorite-icon-2');
    expect(favoriteIcon).toBeTruthy();
  });

  it('應該處理記錄點擊', () => {
    const onRecordPress = jest.fn();
    const { getByTestId } = render(
      <ScanHistoryList onRecordPress={onRecordPress} />,
      { preloadedState: mockState }
    );

    const firstItem = getByTestId('scan-history-item-1');
    fireEvent.press(firstItem);

    expect(onRecordPress).toHaveBeenCalledWith(mockHistory[0]);
  });

  it('應該處理長按進入選擇模式', () => {
    const { getByTestId } = render(<ScanHistoryList />, {
      preloadedState: mockState,
    });

    const firstItem = getByTestId('scan-history-item-1');
    fireEvent(firstItem, 'longPress');

    expect(
      require('@/store/slices/scanHistorySlice').toggleSelectionMode
    ).toHaveBeenCalled();
  });

  it('應該處理收藏切換', () => {
    const { getByTestId } = render(<ScanHistoryList />, {
      preloadedState: mockState,
    });

    const favoriteButton = getByTestId('favorite-button-1');
    fireEvent.press(favoriteButton);

    expect(
      require('@/store/slices/scanHistorySlice').toggleFavorite
    ).toHaveBeenCalledWith('1');
  });

  it('應該處理刪除記錄', async () => {
    const { getByTestId } = render(<ScanHistoryList />, {
      preloadedState: mockState,
    });

    const deleteButton = getByTestId('delete-button-1');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(
        require('@/store/slices/scanHistorySlice').deleteScanRecord
      ).toHaveBeenCalledWith('1');
    });
  });

  it('應該處理下拉刷新', () => {
    const onRefresh = jest.fn();
    const { getByTestId } = render(<ScanHistoryList onRefresh={onRefresh} />, {
      preloadedState: mockState,
    });

    const flatList = getByTestId('scan-history-flatlist');
    fireEvent.scroll(flatList, {
      nativeEvent: {
        contentOffset: { y: 0 },
        contentSize: { height: 500, width: 100 },
        layoutMeasurement: { height: 100, width: 100 },
      },
    });

    expect(
      require('@/store/slices/scanHistorySlice').fetchScanHistory
    ).toHaveBeenCalled();
    expect(onRefresh).toHaveBeenCalled();
  });

  it('應該顯示加載狀態', () => {
    const loadingState = {
      ...mockState,
      scanHistory: {
        ...mockState.scanHistory,
        isLoading: true,
      },
    };

    const { getByTestId } = render(<ScanHistoryList />, {
      preloadedState: loadingState,
    });

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('應該顯示錯誤狀態', () => {
    const errorState = {
      ...mockState,
      scanHistory: {
        ...mockState.scanHistory,
        error: '獲取掃描歷史失敗',
      },
    };

    const { getByText } = render(<ScanHistoryList />, {
      preloadedState: errorState,
    });

    expect(getByText('獲取掃描歷史失敗')).toBeTruthy();
  });

  it('應該顯示空狀態', () => {
    const emptyState = {
      ...mockState,
      scanHistory: {
        ...mockState.scanHistory,
        history: [],
      },
    };

    const { getByText } = render(<ScanHistoryList />, {
      preloadedState: emptyState,
    });

    expect(getByText('暫無掃描記錄')).toBeTruthy();
  });

  it('應該處理選擇模式', () => {
    const selectionState = {
      ...mockState,
      scanHistory: {
        ...mockState.scanHistory,
        isSelectionMode: true,
        selectedRecords: ['1'],
      },
    };

    const { getByTestId, getByText } = render(<ScanHistoryList />, {
      preloadedState: selectionState,
    });

    expect(getByText('已選擇 1 項')).toBeTruthy();
    expect(getByTestId('selection-header')).toBeTruthy();
  });

  it('應該處理批量刪除', async () => {
    const selectionState = {
      ...mockState,
      scanHistory: {
        ...mockState.scanHistory,
        isSelectionMode: true,
        selectedRecords: ['1', '2'],
      },
    };

    const { getByText } = render(<ScanHistoryList />, {
      preloadedState: selectionState,
    });

    const deleteButton = getByText('刪除所選');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(
        require('@/store/slices/scanHistorySlice').deleteMultipleRecords
      ).toHaveBeenCalledWith(['1', '2']);
    });
  });

  it('應該處理全選', () => {
    const selectionState = {
      ...mockState,
      scanHistory: {
        ...mockState.scanHistory,
        isSelectionMode: true,
      },
    };

    const { getByText } = render(<ScanHistoryList />, {
      preloadedState: selectionState,
    });

    const selectAllButton = getByText('全選');
    fireEvent.press(selectAllButton);

    expect(
      require('@/store/slices/scanHistorySlice').selectAllRecords
    ).toHaveBeenCalled();
  });

  it('應該處理清除選擇', () => {
    const selectionState = {
      ...mockState,
      scanHistory: {
        ...mockState.scanHistory,
        isSelectionMode: true,
        selectedRecords: ['1'],
      },
    };

    const { getByText } = render(<ScanHistoryList />, {
      preloadedState: selectionState,
    });

    const clearButton = getByText('清除');
    fireEvent.press(clearButton);

    expect(
      require('@/store/slices/scanHistorySlice').clearSelection
    ).toHaveBeenCalled();
  });

  it('應該顯示處理時間', () => {
    const { getByText } = render(<ScanHistoryList />, {
      preloadedState: mockState,
    });

    expect(getByText('1.5s')).toBeTruthy();
  });

  it('應該顯示掃描日期', () => {
    const { getByText } = render(<ScanHistoryList />, {
      preloadedState: mockState,
    });

    // 檢查日期格式
    const today = new Date().toLocaleDateString('zh-TW');
    expect(getByText(today)).toBeTruthy();
  });

  it('應該處理無限滾動', () => {
    const paginationState = {
      ...mockState,
      scanHistory: {
        ...mockState.scanHistory,
        pagination: {
          ...mockState.scanHistory.pagination,
          hasNext: true,
        },
      },
    };

    const { getByTestId } = render(<ScanHistoryList />, {
      preloadedState: paginationState,
    });

    const flatList = getByTestId('scan-history-flatlist');
    fireEvent.scroll(flatList, {
      nativeEvent: {
        contentOffset: { y: 1000 },
        contentSize: { height: 500, width: 100 },
        layoutMeasurement: { height: 100, width: 100 },
      },
    });

    expect(
      require('@/store/slices/scanHistorySlice').fetchScanHistory
    ).toHaveBeenCalled();
  });
});
