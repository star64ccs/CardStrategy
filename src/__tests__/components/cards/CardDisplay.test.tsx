import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CardDisplay from '../../../components/cards/CardDisplay';
import cardSlice from '../../../store/slices/cardSlice';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn()
};

// Mock image picker
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn()
}));

// Mock permissions
jest.mock('react-native-permissions', () => ({
  request: jest.fn(),
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY'
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE'
    }
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked'
  }
}));

// Mock image to base64 utility
jest.mock('../../../utils/imageToBase64', () => ({
  imageToBase64: jest.fn()
}));

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      cards: cardSlice
    },
    preloadedState: {
      cards: {
        cards: [],
        loading: false,
        error: null,
        selectedCard: null,
        ...initialState
      }
    }
  });
};

describe('CardDisplay', () => {
  const mockCard = {
    id: 'card1',
    name: '測試卡片',
    image: 'https://example.com/card1.jpg',
    rarity: 'Rare',
    price: 1000,
    condition: 'Near Mint',
    description: '這是一張測試卡片',
    set: '測試系列',
    number: '001/100',
    artist: '測試畫家',
    releaseDate: '2024-01-01'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('應該正確渲染卡片信息', () => {
      const store = createTestStore({
        selectedCard: mockCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      expect(screen.getByText('測試卡片')).toBeTruthy();
      expect(screen.getByText('Rare')).toBeTruthy();
      expect(screen.getByText('$1,000')).toBeTruthy();
      expect(screen.getByText('Near Mint')).toBeTruthy();
      expect(screen.getByText('這是一張測試卡片')).toBeTruthy();
      expect(screen.getByText('測試系列')).toBeTruthy();
      expect(screen.getByText('001/100')).toBeTruthy();
      expect(screen.getByText('測試畫家')).toBeTruthy();
    });

    it('應該顯示載入狀態', () => {
      const store = createTestStore({
        loading: true
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    });

    it('應該顯示錯誤狀態', () => {
      const store = createTestStore({
        error: '載入卡片失敗'
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      expect(screen.getByText('載入卡片失敗')).toBeTruthy();
      expect(screen.getByText('重試')).toBeTruthy();
    });

    it('應該顯示沒有卡片時的狀態', () => {
      const store = createTestStore({
        selectedCard: null
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      expect(screen.getByText('沒有選擇卡片')).toBeTruthy();
    });
  });

  describe('圖片顯示', () => {
    it('應該正確顯示卡片圖片', () => {
      const store = createTestStore({
        selectedCard: mockCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      const image = screen.getByTestId('card-image');
      expect(image.props.source.uri).toBe('https://example.com/card1.jpg');
    });

    it('應該處理圖片載入失敗', async () => {
      const store = createTestStore({
        selectedCard: mockCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      const image = screen.getByTestId('card-image');

      // 模擬圖片載入失敗
      fireEvent(image, 'onError');

      await waitFor(() => {
        expect(screen.getByText('圖片載入失敗')).toBeTruthy();
      });
    });

    it('應該支持圖片縮放', () => {
      const store = createTestStore({
        selectedCard: mockCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      const image = screen.getByTestId('card-image');

      // 模擬雙擊縮放
      fireEvent(image, 'onDoublePress');

      // 驗證縮放狀態
      expect(screen.getByTestId('zoomed-image')).toBeTruthy();
    });
  });

  describe('價格顯示', () => {
    it('應該正確格式化價格', () => {
      const expensiveCard = {
        ...mockCard,
        price: 1500000
      };

      const store = createTestStore({
        selectedCard: expensiveCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      expect(screen.getByText('$1,500,000')).toBeTruthy();
    });

    it('應該顯示價格變化趨勢', () => {
      const cardWithPriceHistory = {
        ...mockCard,
        priceHistory: [
          { date: '2024-01-01', price: 800 },
          { date: '2024-01-15', price: 1000 }
        ]
      };

      const store = createTestStore({
        selectedCard: cardWithPriceHistory
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      expect(screen.getByText('+25%')).toBeTruthy();
      expect(screen.getByText('$200')).toBeTruthy();
    });
  });

  describe('條件評估', () => {
    it('應該顯示條件評估按鈕', () => {
      const store = createTestStore({
        selectedCard: mockCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      expect(screen.getByText('評估條件')).toBeTruthy();
    });

    it('應該處理條件評估功能', async () => {
      const store = createTestStore({
        selectedCard: mockCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      const assessButton = screen.getByText('評估條件');
      fireEvent.press(assessButton);

      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('CardConditionAnalysis', {
          cardId: 'card1'
        });
      });
    });
  });

  describe('收藏功能', () => {
    it('應該顯示收藏按鈕', () => {
      const store = createTestStore({
        selectedCard: mockCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      expect(screen.getByTestId('favorite-button')).toBeTruthy();
    });

    it('應該處理添加到收藏', async () => {
      const store = createTestStore({
        selectedCard: mockCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      const favoriteButton = screen.getByTestId('favorite-button');
      fireEvent.press(favoriteButton);

      await waitFor(() => {
        expect(screen.getByText('已添加到收藏')).toBeTruthy();
      });
    });

    it('應該處理從收藏移除', async () => {
      const favoritedCard = {
        ...mockCard,
        isFavorited: true
      };

      const store = createTestStore({
        selectedCard: favoritedCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      const favoriteButton = screen.getByTestId('favorite-button');
      fireEvent.press(favoriteButton);

      await waitFor(() => {
        expect(screen.getByText('已從收藏移除')).toBeTruthy();
      });
    });
  });

  describe('分享功能', () => {
    it('應該顯示分享按鈕', () => {
      const store = createTestStore({
        selectedCard: mockCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      expect(screen.getByTestId('share-button')).toBeTruthy();
    });

    it('應該處理分享功能', async () => {
      const store = createTestStore({
        selectedCard: mockCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      const shareButton = screen.getByTestId('share-button');
      fireEvent.press(shareButton);

      await waitFor(() => {
        expect(screen.getByText('分享選項')).toBeTruthy();
      });
    });
  });

  describe('價格監控', () => {
    it('應該顯示價格監控按鈕', () => {
      const store = createTestStore({
        selectedCard: mockCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      expect(screen.getByText('監控價格')).toBeTruthy();
    });

    it('應該處理設置價格警報', async () => {
      const store = createTestStore({
        selectedCard: mockCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      const monitorButton = screen.getByText('監控價格');
      fireEvent.press(monitorButton);

      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('PriceAlertSetup', {
          cardId: 'card1',
          currentPrice: 1000
        });
      });
    });
  });

  describe('導航功能', () => {
    it('應該處理返回按鈕', () => {
      const store = createTestStore({
        selectedCard: mockCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      const backButton = screen.getByTestId('back-button');
      fireEvent.press(backButton);

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('應該處理編輯按鈕', async () => {
      const store = createTestStore({
        selectedCard: mockCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      const editButton = screen.getByText('編輯');
      fireEvent.press(editButton);

      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('EditCard', {
          cardId: 'card1'
        });
      });
    });
  });

  describe('錯誤處理', () => {
    it('應該處理重試功能', async () => {
      const store = createTestStore({
        error: '載入失敗'
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      const retryButton = screen.getByText('重試');
      fireEvent.press(retryButton);

      // 驗證重試邏輯被調用
      await waitFor(() => {
        expect(screen.queryByText('載入失敗')).toBeFalsy();
      });
    });

    it('應該處理網絡錯誤', () => {
      const store = createTestStore({
        error: '網絡連接失敗'
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      expect(screen.getByText('網絡連接失敗')).toBeTruthy();
      expect(screen.getByText('檢查網絡連接')).toBeTruthy();
    });
  });

  describe('無障礙功能', () => {
    it('應該支持無障礙標籤', () => {
      const store = createTestStore({
        selectedCard: mockCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      const image = screen.getByTestId('card-image');
      expect(image.props.accessibilityLabel).toBe('測試卡片圖片');

      const favoriteButton = screen.getByTestId('favorite-button');
      expect(favoriteButton.props.accessibilityLabel).toBe('添加到收藏');
    });

    it('應該支持語音導航', () => {
      const store = createTestStore({
        selectedCard: mockCard
      });

      render(
        <Provider store={store}>
          <CardDisplay navigation={mockNavigation} />
        </Provider>
      );

      const cardName = screen.getByText('測試卡片');
      expect(cardName.props.accessibilityRole).toBe('header');
    });
  });
});
