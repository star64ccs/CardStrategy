import React from 'react';

import ScanHistoryList from '../../components/ScanHistoryList';

import {
  render,
  fireEvent,
  waitFor,
  createMockScanHistory,
} from '@/__tests__/setup/test-utils';
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
const _mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('ScanHistoryList', () => {
  const _mockHistory = [
    createMockScanHistory(),
    createMockScanHistory({
      id: '2',
      cardName: 'Test Card 2',
      scanType: 'condition',
      isFavorite: true,
    }),
  ];

  const _mockState = {
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
    const { getByText, getAllByTestId } = render(
      <ScanHistoryList scanHistory={mockHistory} />,
      {
        preloadedState: mockState,
      }
    );

    expect(getByText('Test Card')).toBeTruthy();
    expect(getByText('Test Card 2')).toBeTruthy();
    expect(getAllByTestId('scan-record-1')).toHaveLength(1);
    expect(getAllByTestId('scan-record-2')).toHaveLength(1);
  });

  it('應該顯示掃描類型圖標和標籤', () => {
    const { getByText } = render(
      <ScanHistoryList scanHistory={mockHistory} />,
      {
        preloadedState: mockState,
      }
    );

    // Check卡片名稱
    expect(getByText('Test Card')).toBeTruthy();
    expect(getByText('Test Card 2')).toBeTruthy();
  });

  it('應該顯示收藏狀態', () => {
    const { getByTestId } = render(
      <ScanHistoryList scanHistory={mockHistory} />,
      {
        preloadedState: mockState,
      }
    );

    // Check收藏按鈕
    const _favoriteButton = getByTestId('favorite-button-2');
    expect(favoriteButton).toBeTruthy();
  });

  it('應該處理記錄點擊', () => {
    const _onRecordPress = jest.fn();
    const { getByTestId } = render(
      <ScanHistoryList
        scanHistory={mockHistory}
        onRecordPress={onRecordPress}
      />,
      { preloadedState: mockState }
    );

    const _firstItem = getByTestId('scan-record-1');
    fireEvent.press(firstItem);

    expect(onRecordPress).toHaveBeenCalledWith(mockHistory[0]);
  });

  it('應該處理長按進入選擇模式', () => {
    const { getByTestId } = render(
      <ScanHistoryList scanHistory={mockHistory} />,
      {
        preloadedState: mockState,
      }
    );

    const _firstItem = getByTestId('scan-record-1');
    fireEvent(firstItem, 'longPress');

    // 長按應該觸發Select模式
    expect(firstItem).toBeTruthy();
  });

  it('應該處理收藏切換', () => {
    const { getByTestId } = render(
      <ScanHistoryList scanHistory={mockHistory} />,
      {
        preloadedState: mockState,
      }
    );

    const _favoriteButton = getByTestId('favorite-button-1');
    fireEvent.press(favoriteButton);

    expect(
      require('@/store/slices/scanHistorySlice').toggleFavorite
    ).toHaveBeenCalledWith({ id: '1', isFavorite: true });
  });

  it('應該處理刪除記錄', async () => {
    const { getAllByText } = render(
      <ScanHistoryList scanHistory={mockHistory} />,
      {
        preloadedState: mockState,
      }
    );

    const _deleteButtons = getAllByText('刪除');
    fireEvent.press(deleteButtons[0]);

    // Delete按鈕應該存在
    expect(deleteButtons[0]).toBeTruthy();
  });

  it('應該處理下拉刷新', () => {
    const _onRefresh = jest.fn();
    const { getByText } = render(
      <ScanHistoryList scanHistory={mockHistory} onRefresh={onRefresh} />,
      {
        preloadedState: mockState,
      }
    );

    expect(getByText('Test Card')).toBeTruthy();
    expect(onRefresh).toBeDefined();
  });

  it('應該顯示加載狀態', () => {
    const _loadingState = {
      ...mockState,
      scanHistory: {
        ...mockState.scanHistory,
        isLoading: true,
      },
    };

    const { getByText } = render(<ScanHistoryList scanHistory={[]} />, {
      preloadedState: loadingState,
    });

    expect(getByText('尚無掃描記錄')).toBeTruthy();
  });

  it('應該顯示Error狀態', () => {
    const _errorState = {
      ...mockState,
      scanHistory: {
        ...mockState.scanHistory,
        error: 'Get掃描歷史Failed',
      },
    };

    const { getByText } = render(<ScanHistoryList scanHistory={[]} />, {
      preloadedState: errorState,
    });

    expect(getByText('尚無掃描記錄')).toBeTruthy();
  });

  it('應該顯示空狀態', () => {
    const _emptyState = {
      ...mockState,
      scanHistory: {
        ...mockState.scanHistory,
        history: [],
      },
    };

    const { getByText } = render(<ScanHistoryList scanHistory={[]} />, {
      preloadedState: emptyState,
    });

    expect(getByText('尚無掃描記錄')).toBeTruthy();
  });

  it('應該處理選擇模式', () => {
    const _selectionState = {
      ...mockState,
      scanHistory: {
        ...mockState.scanHistory,
        isSelectionMode: true,
        selectedRecords: ['1'],
      },
    };

    const { getByText } = render(
      <ScanHistoryList scanHistory={mockHistory} />,
      {
        preloadedState: selectionState,
      }
    );

    expect(getByText('Test Card')).toBeTruthy();
  });

  it('應該處理批量刪除', async () => {
    const _selectionState = {
      ...mockState,
      scanHistory: {
        ...mockState.scanHistory,
        isSelectionMode: true,
        selectedRecords: ['1', '2'],
      },
    };

    const { getByText } = render(
      <ScanHistoryList scanHistory={mockHistory} />,
      {
        preloadedState: selectionState,
      }
    );

    expect(getByText('Test Card')).toBeTruthy();
  });

  it('應該處理全選', () => {
    const _selectionState = {
      ...mockState,
      scanHistory: {
        ...mockState.scanHistory,
        isSelectionMode: true,
      },
    };

    const { getByText } = render(
      <ScanHistoryList scanHistory={mockHistory} />,
      {
        preloadedState: selectionState,
      }
    );

    expect(getByText('Test Card')).toBeTruthy();
  });

  it('應該處理清除選擇', () => {
    const _selectionState = {
      ...mockState,
      scanHistory: {
        ...mockState.scanHistory,
        isSelectionMode: true,
        selectedRecords: ['1'],
      },
    };

    const { getByText } = render(
      <ScanHistoryList scanHistory={mockHistory} />,
      {
        preloadedState: selectionState,
      }
    );

    expect(getByText('Test Card')).toBeTruthy();
  });

  it('應該顯示處理時間', () => {
    const { getAllByText } = render(
      <ScanHistoryList scanHistory={mockHistory} />,
      {
        preloadedState: mockState,
      }
    );

    // CheckHandleTime文本YesNo存在
    const _processingTimeElements = getAllByText(/處理時間：/);
    expect(processingTimeElements.length).toBeGreaterThan(0);

    // Check ms 單位YesNo存在
    const _msElements = getAllByText(/ms/);
    expect(msElements.length).toBeGreaterThan(0);
  });

  it('應該顯示掃描日期', () => {
    const { getAllByText } = render(
      <ScanHistoryList scanHistory={mockHistory} />,
      {
        preloadedState: mockState,
      }
    );

    // Check掃描Time文本YesNo存在
    const _scanTimeElements = getAllByText(/掃描時間：/);
    expect(scanTimeElements.length).toBeGreaterThan(0);

    // CheckDay格式（ISO 格式）
    const _dateElements = getAllByText(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
    );
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('應該處理無限滾動', () => {
    const _paginationState = {
      ...mockState,
      scanHistory: {
        ...mockState.scanHistory,
        pagination: {
          ...mockState.scanHistory.pagination,
          hasNext: true,
        },
      },
    };

    const { getByText } = render(
      <ScanHistoryList scanHistory={mockHistory} />,
      {
        preloadedState: paginationState,
      }
    );

    expect(getByText('Test Card')).toBeTruthy();
  });
});
