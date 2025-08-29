import React from 'react';

import { render } from '@/__tests__/setup/test-utils';
import ScanHistoryScreen from '@/screens/ScanHistoryScreen';

// Mock navigation
const _mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

// Mock Redux actions
jest.mock('@/store/slices/scanHistorySlice', () => ({
  fetchScanHistory: jest.fn().mockResolvedValue({}),
  fetchScanStatistics: jest.fn(),
  searchScanHistory: jest.fn(),
  clearFilters: jest.fn(),
  setFilters: jest.fn(),
  toggleSelectionMode: jest.fn(),
}));

describe('ScanHistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render scan history screen with basic structure', () => {
    const { getByText } = render(
      <ScanHistoryScreen navigation={mockNavigation} />
    );

    // Check title
    expect(getByText('掃描歷史')).toBeTruthy();
  });

  it('should render empty state when no records', () => {
    const { getByText } = render(
      <ScanHistoryScreen navigation={mockNavigation} />
    );

    // Should show empty state by default
    expect(getByText('尚無掃描記錄')).toBeTruthy();
    expect(getByText('開始掃描卡片來建立您的收藏記錄')).toBeTruthy();
  });

  it('should handle navigation prop correctly', () => {
    const { getByText } = render(
      <ScanHistoryScreen navigation={mockNavigation} />
    );

    // Component should render without crashing
    expect(getByText('掃描歷史')).toBeTruthy();
  });

  it('should have proper component structure', () => {
    const { getByText } = render(
      <ScanHistoryScreen navigation={mockNavigation} />
    );

    // Check that component renders without errors
    expect(getByText('掃描歷史')).toBeTruthy();

    // Check that empty state is shown
    expect(getByText('尚無掃描記錄')).toBeTruthy();
  });
});
