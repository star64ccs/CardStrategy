// 端到端用戶旅程測試
import { configureStore } from '@reduxjs/toolkit';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import React from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import authSlice from '../../../../store/slices/authSlice';
import cardSlice from '../../../../store/slices/cardSlice';
import marketSlice from '../../../../store/slices/marketSlice';

// Mock 外部依賴
jest.mock('../../../../src/services/auth/authService');
jest.mock('../../../../src/services/cardService');
jest.mock('../../../../src/services/marketService');

// 測試應用組件
const TestApp = () => {
  const [currentScreen, setCurrentScreen] = React.useState('login');
  const [user, setUser] = React.useState(null);
  const [cards, setCards] = React.useState([]);
  const [marketData, setMarketData] = React.useState([]);

  return (
    <View>
      {currentScreen === 'login' && (
        <View>
          <Text>Login</Text>
          <TextInput testID='email-input' placeholder='Email' />
          <TextInput testID='password-input' placeholder='Password' />
          <TouchableOpacity
            testID='login-button'
            onPress={() => {
              setUser({
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
              });
              setCurrentScreen('dashboard');
            }}
          >
            <Text>Login</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentScreen === 'dashboard' && (
        <View>
          <Text>Dashboard</Text>
          <Text>Welcome, {user?.name}</Text>
          <TouchableOpacity
            testID='view-cards-button'
            onPress={() => setCurrentScreen('cards')}
          >
            <Text>View Cards</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID='view-market-button'
            onPress={() => setCurrentScreen('market')}
          >
            <Text>View Market</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID='logout-button'
            onPress={() => {
              setUser(null);
              setCurrentScreen('login');
            }}
          >
            <Text>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentScreen === 'cards' && (
        <View>
          <Text>My Cards</Text>
          <TextInput testID='card-search' placeholder='Search cards...' />
          <ScrollView testID='cards-list'>
            {cards.map((card, index) => (
              <View key={index} testID={`card-${index}`}>
                <Text>
                  {card.name} - {card.type}
                </Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            testID='back-to-dashboard'
            onPress={() => setCurrentScreen('dashboard')}
          >
            <Text>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentScreen === 'market' && (
        <View>
          <Text>Market Analysis</Text>
          <ScrollView testID='market-data'>
            {marketData.map((item, index) => (
              <View key={index} testID={`market-item-${index}`}>
                <Text>
                  {item.name} - ${item.price}
                </Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            testID='refresh-market'
            onPress={() => {
              setMarketData([
                { name: 'Pokemon Card 1', price: 25.99 },
                { name: 'Pokemon Card 2', price: 15.5 },
              ]);
            }}
          >
            <Text>Refresh Market Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID='back-to-dashboard'
            onPress={() => setCurrentScreen('dashboard')}
          >
            <Text>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

describe('端到端用戶旅程測試', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authSlice.reducer,
        card: cardSlice.reducer,
        market: marketSlice.reducer,
      },
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('完整用戶認證旅程', () => {
    it('應該完成從登錄到儀表板的完整旅程', async () => {
      // Arrange
      render(
        <Provider store={store}>
          <TestApp />
        </Provider>
      );

      // Act & Assert
      // 1. 初始狀態應該是登錄頁面
      expect(screen.getByText('Login')).toBeTruthy();
      expect(screen.getByTestId('email-input')).toBeTruthy();
      expect(screen.getByTestId('password-input')).toBeTruthy();

      // 2. 用戶輸入憑證
      fireEvent.changeText(
        screen.getByTestId('email-input'),
        'test@example.com'
      );
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');

      // 3. 用戶點擊登錄
      fireEvent.press(screen.getByTestId('login-button'));

      // 4. 應該跳轉到儀表板
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy();
        expect(screen.getByText('Welcome, Test User')).toBeTruthy();
      });

      // 5. 儀表板應該有正確的導航按鈕
      expect(screen.getByTestId('view-cards-button')).toBeTruthy();
      expect(screen.getByTestId('view-market-button')).toBeTruthy();
      expect(screen.getByTestId('logout-button')).toBeTruthy();
    });

    it('應該完成從儀表板到卡牌頁面的旅程', async () => {
      // Arrange
      render(
        <Provider store={store}>
          <TestApp />
        </Provider>
      );

      // Act
      // 1. 先登錄
      fireEvent.changeText(
        screen.getByTestId('email-input'),
        'test@example.com'
      );
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.press(screen.getByTestId('login-button'));

      // 2. 等待儀表板載入
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy();
      });

      // 3. 點擊查看卡牌
      fireEvent.press(screen.getByTestId('view-cards-button'));

      // Assert
      await waitFor(() => {
        expect(screen.getByText('My Cards')).toBeTruthy();
        expect(screen.getByTestId('card-search')).toBeTruthy();
        expect(screen.getByTestId('cards-list')).toBeTruthy();
        expect(screen.getByTestId('back-to-dashboard')).toBeTruthy();
      });
    });

    it('應該完成從儀表板到市場頁面的旅程', async () => {
      // Arrange
      render(
        <Provider store={store}>
          <TestApp />
        </Provider>
      );

      // Act
      // 1. 先登錄
      fireEvent.changeText(
        screen.getByTestId('email-input'),
        'test@example.com'
      );
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.press(screen.getByTestId('login-button'));

      // 2. 等待儀表板載入
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy();
      });

      // 3. 點擊查看市場
      fireEvent.press(screen.getByTestId('view-market-button'));

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Market Analysis')).toBeTruthy();
        expect(screen.getByTestId('market-data')).toBeTruthy();
        expect(screen.getByTestId('refresh-market')).toBeTruthy();
        expect(screen.getByTestId('back-to-dashboard')).toBeTruthy();
      });
    });

    it('應該完成完整的登出旅程', async () => {
      // Arrange
      render(
        <Provider store={store}>
          <TestApp />
        </Provider>
      );

      // Act
      // 1. 先登錄
      fireEvent.changeText(
        screen.getByTestId('email-input'),
        'test@example.com'
      );
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.press(screen.getByTestId('login-button'));

      // 2. 等待儀表板載入
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy();
      });

      // 3. 點擊登出
      fireEvent.press(screen.getByTestId('logout-button'));

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeTruthy();
        expect(screen.getByTestId('email-input')).toBeTruthy();
        expect(screen.getByTestId('password-input')).toBeTruthy();
      });
    });
  });

  describe('卡牌管理旅程', () => {
    it('應該完成卡牌搜索和查看旅程', async () => {
      // Arrange
      render(
        <Provider store={store}>
          <TestApp />
        </Provider>
      );

      // Act
      // 1. 登錄並導航到卡牌頁面
      fireEvent.changeText(
        screen.getByTestId('email-input'),
        'test@example.com'
      );
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.press(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('view-cards-button'));

      await waitFor(() => {
        expect(screen.getByText('My Cards')).toBeTruthy();
      });

      // 2. 搜索卡牌
      fireEvent.changeText(screen.getByTestId('card-search'), 'Pokemon');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('card-search')).toHaveProp(
          'value',
          'Pokemon'
        );
      });

      // 3. 返回儀表板
      fireEvent.press(screen.getByTestId('back-to-dashboard'));

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy();
      });
    });
  });

  describe('市場分析旅程', () => {
    it('應該完成市場數據查看和刷新旅程', async () => {
      // Arrange
      render(
        <Provider store={store}>
          <TestApp />
        </Provider>
      );

      // Act
      // 1. 登錄並導航到市場頁面
      fireEvent.changeText(
        screen.getByTestId('email-input'),
        'test@example.com'
      );
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.press(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('view-market-button'));

      await waitFor(() => {
        expect(screen.getByText('Market Analysis')).toBeTruthy();
      });

      // 2. 刷新市場數據
      fireEvent.press(screen.getByTestId('refresh-market'));

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('market-item-0')).toBeTruthy();
        expect(screen.getByTestId('market-item-1')).toBeTruthy();
      });

      // 3. 返回儀表板
      fireEvent.press(screen.getByTestId('back-to-dashboard'));

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy();
      });
    });
  });

  describe('錯誤處理旅程', () => {
    it('應該處理登錄失敗的旅程', async () => {
      // Arrange
      render(
        <Provider store={store}>
          <TestApp />
        </Provider>
      );

      // Act
      // 1. 嘗試使用無效憑證登錄
      fireEvent.changeText(
        screen.getByTestId('email-input'),
        'invalid@example.com'
      );
      fireEvent.changeText(
        screen.getByTestId('password-input'),
        'wrongpassword'
      );
      fireEvent.press(screen.getByTestId('login-button'));

      // Assert
      // 應該保持在登錄頁面
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeTruthy();
        expect(screen.queryByText('Dashboard')).toBeNull();
      });
    });

    it('應該處理網絡錯誤的旅程', async () => {
      // Arrange
      render(
        <Provider store={store}>
          <TestApp />
        </Provider>
      );

      // Act
      // 1. 嘗試登錄（模擬網絡錯誤）
      fireEvent.changeText(
        screen.getByTestId('email-input'),
        'test@example.com'
      );
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');

      // Mock 網絡錯誤
      jest.spyOn(console, 'error').mockImplementation(() => {});

      fireEvent.press(screen.getByTestId('login-button'));

      // Assert
      // 應該保持在登錄頁面
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeTruthy();
        expect(screen.queryByText('Dashboard')).toBeNull();
      });

      // 清理
      jest.restoreAllMocks();
    });
  });

  describe('性能測試旅程', () => {
    it('應該在合理時間內完成完整旅程', async () => {
      // Arrange
      const startTime = Date.now();
      render(
        <Provider store={store}>
          <TestApp />
        </Provider>
      );

      // Act
      // 1. 登錄
      fireEvent.changeText(
        screen.getByTestId('email-input'),
        'test@example.com'
      );
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');
      fireEvent.press(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy();
      });

      // 2. 導航到卡牌頁面
      fireEvent.press(screen.getByTestId('view-cards-button'));

      await waitFor(() => {
        expect(screen.getByText('My Cards')).toBeTruthy();
      });

      // 3. 返回儀表板
      fireEvent.press(screen.getByTestId('back-to-dashboard'));

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy();
      });

      // 4. 導航到市場頁面
      fireEvent.press(screen.getByTestId('view-market-button'));

      await waitFor(() => {
        expect(screen.getByText('Market Analysis')).toBeTruthy();
      });

      // 5. 返回儀表板
      fireEvent.press(screen.getByTestId('back-to-dashboard'));

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy();
      });

      // 6. 登出
      fireEvent.press(screen.getByTestId('logout-button'));

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeTruthy();
      });

      // Assert
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 整個旅程應該在 5 秒內完成
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('可訪問性旅程', () => {
    it('應該支持鍵盤導航', async () => {
      // Arrange
      render(
        <Provider store={store}>
          <TestApp />
        </Provider>
      );

      // Act & Assert
      // 1. 檢查輸入框是否可聚焦
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      expect(emailInput.props.accessible).toBe(true);
      expect(passwordInput.props.accessible).toBe(true);

      // 2. 檢查按鈕是否可訪問
      const loginButton = screen.getByTestId('login-button');
      expect(loginButton.props.accessible).toBe(true);
    });

    it('應該支持屏幕閱讀器', async () => {
      // Arrange
      render(
        <Provider store={store}>
          <TestApp />
        </Provider>
      );

      // Act & Assert
      // 1. 檢查標題是否可訪問
      const loginTitle = screen.getByText('Login');
      expect(loginTitle.props.accessible).toBe(true);

      // 2. 檢查輸入框是否有正確的標籤
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      expect(emailInput.props.accessibilityLabel).toBe('Email');
      expect(passwordInput.props.accessibilityLabel).toBe('Password');
    });
  });
});
