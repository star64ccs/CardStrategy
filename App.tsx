import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './src/store';
import * as Updates from 'expo-updates';
import LogRocket from '@logrocket/react-native';
import {
  checkAuthStatus,
  selectIsAuthenticated,
  selectIsLoading,
} from './src/store/slices/authSlice';
import { cardService, Card } from './src/services/cardService';
import {
  portfolioService,
  PortfolioItem,
} from './src/services/portfolioService';
import { notificationService } from './src/services/notificationService';
import { logger } from './src/utils/logger';

// 導入手機 App 組件
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
// import HomeScreen from './src/screens/HomeScreen';
// import CardsScreen from './src/screens/CardsScreen';
// import CollectionsScreen from './src/screens/CollectionsScreen';
// import InvestmentsScreen from './src/screens/InvestmentsScreen';
// import ProfileScreen from './src/screens/ProfileScreen';
// import CardDetailScreen from './src/screens/CardDetailScreen';
// import CardScannerScreen from './src/screens/CardScannerScreen';
// import AIChatScreen from './src/screens/AIChatScreen';
// import MarketAnalysisScreen from './src/screens/MarketAnalysisScreen';

// 主應用組件
const AppContent = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const [currentScreen, setCurrentScreen] = useState<
    'Login' | 'Register' | 'Dashboard'
  >('Login');
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [portfolio] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    // 初始化 LogRocket
    LogRocket.init('lzzz2v/card-strategy', {
      updateId: Updates.isEmbeddedLaunch ? null : Updates.updateId,
      expoChannel: Updates.channel,
    });

    // 初始化通知服務
    const initializeServices = async () => {
      try {
        await notificationService.initialize();
        logger.info('通知服務初始化完成');
      } catch (error) {
        logger.error('通知服務初始化失敗:', { error });
      }
    };

    // 檢查認證狀態
    dispatch(checkAuthStatus());

    // 初始化通知服務
    initializeServices();
  }, [dispatch]);

  useEffect(() => {
    // 如果已認證，載入卡片數據和投資組合
    if (isAuthenticated) {
      loadCards();
      loadPortfolio();
    }
  }, [isAuthenticated]);

  const loadCards = async () => {
    try {
      // 使用真實 API 獲取卡片數據
      const cardsResponse = await cardService.getCards({
        page: 1,
        limit: 10,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      if (cardsResponse.success) {
        setCards(cardsResponse.data.cards);
      } else {
        // 如果 API 失敗，使用模擬數據作為備用
        logger.warn('API 獲取卡片失敗，使用模擬數據', {
          error: cardsResponse.message,
        });
        const mockCards = cardService.getMockCards();
        setCards(mockCards);
      }
    } catch (error) {
      logger.error('載入卡片失敗:', { error });
      // 錯誤時使用模擬數據
      const mockCards = cardService.getMockCards();
      setCards(mockCards);
    }
  };

  const loadPortfolio = () => {
    try {
      portfolioService.getPortfolio();
    } catch (error) {
      logger.error('載入投資組合失敗:', { error });
    }
  };

  const handleNavigate = (screen: 'Login' | 'Register' | 'Dashboard') => {
    setCurrentScreen(screen);
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
  };

  const handleCloseCardDetail = () => {
    setSelectedCard(null);
  };

  const handleAddToPortfolio = (card: Card) => {
    // 簡單的添加邏輯，實際應用中可以彈出輸入框讓用戶輸入數量和價格
    const quantity = 1;
    const purchasePrice = card.price.current;

    portfolioService.addToPortfolio(
      card,
      quantity,
      purchasePrice,
      '從卡片詳情頁面添加'
    );
    loadPortfolio(); // 重新載入投資組合

    logger.info(`已將 ${card.name} 加入投資組合！`, {
      quantity,
      purchasePrice,
    });
  };

  const handleRemoveFromPortfolio = (itemId: string) => {
    // 直接移除，假設確認已在其他地方處理
    portfolioService.removeFromPortfolio(itemId);
    loadPortfolio();
  };

  const handleLogout = () => {
    // 清除認證狀態
    // 在 React Native 中使用 AsyncStorage
    // AsyncStorage.removeItem('auth_token');
    // AsyncStorage.removeItem('user_data');
    // 這裡簡化處理，實際應該使用 AsyncStorage
    window.location.reload();
  };

  if (isLoading) {
    // 顯示加載畫面
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f8f9fa',
          fontSize: '18px',
          color: '#2c3e50',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
          <div>載入中...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && currentScreen === 'Dashboard') {
    // 已認證用戶 - 顯示主應用
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
        }}
      >
        {/* 導航欄 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1
              style={{
                fontSize: '24px',
                color: '#2c3e50',
                margin: '0',
                fontWeight: 'bold',
              }}
            >
              🎴 卡策
            </h1>
            <span
              style={{
                fontSize: '14px',
                color: '#7f8c8d',
                backgroundColor: '#ecf0f1',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              智選卡牌，策略致勝
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              style={{
                backgroundColor: '#27ae60',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
              onClick={() => setCurrentScreen('Dashboard')}
            >
              💎 投資組合 ({portfolio.length})
            </button>
            <button
              style={{
                backgroundColor: '#e74c3c',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
              onClick={handleLogout}
            >
              登出
            </button>
          </div>
        </div>

        {/* 主要內容 */}
        <div style={{ padding: '24px' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h2
              style={{
                fontSize: '28px',
                color: '#2c3e50',
                margin: '0 0 16px 0',
                fontWeight: 'bold',
              }}
            >
              🎉 歡迎來到卡策！
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: '#7f8c8d',
                margin: '0 0 24px 0',
              }}
            >
              您已成功登錄，開始探索卡牌投資的世界
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#e8f5e8',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #c8e6c9',
                }}
              >
                <h3
                  style={{
                    color: '#27ae60',
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                  }}
                >
                  🚀 功能開發中
                </h3>
                <p
                  style={{
                    color: '#7f8c8d',
                    margin: '0',
                    fontSize: '14px',
                  }}
                >
                  主應用功能即將推出...
                </p>
              </div>
              <div
                style={{
                  backgroundColor: '#fff3e0',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #ffcc02',
                }}
              >
                <h3
                  style={{
                    color: '#f39c12',
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                  }}
                >
                  📈 市場趨勢
                </h3>
                <p
                  style={{
                    color: '#7f8c8d',
                    margin: '0',
                    fontSize: '14px',
                  }}
                >
                  AI驅動的市場分析
                </p>
              </div>
              <div
                style={{
                  backgroundColor: '#e3f2fd',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #bbdefb',
                }}
              >
                <h3
                  style={{
                    color: '#3498db',
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                  }}
                >
                  🤖 AI助手
                </h3>
                <p
                  style={{
                    color: '#7f8c8d',
                    margin: '0',
                    fontSize: '14px',
                  }}
                >
                  智能投資建議
                </p>
              </div>
            </div>
          </div>

          {/* 卡片展示 */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3
              style={{
                fontSize: '24px',
                color: '#2c3e50',
                margin: '0 0 16px 0',
                fontWeight: 'bold',
              }}
            >
              🎴 熱門卡片
            </h3>
            <p
              style={{
                fontSize: '16px',
                color: '#7f8c8d',
                margin: '0 0 24px 0',
              }}
            >
              探索最受歡迎的卡牌，查看實時價格和市場趨勢
            </p>

            {/* 這裡應該使用 React Native 的 FlatList 或 ScrollView */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              {cards.slice(0, 6).map((card) => (
                <div
                  key={card.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #ecf0f1',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onClick={() => handleCardClick(card)}
                >
                  <h4
                    style={{
                      fontSize: '16px',
                      color: '#2c3e50',
                      margin: '0 0 8px 0',
                      fontWeight: 'bold',
                    }}
                  >
                    {card.name}
                  </h4>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#7f8c8d',
                      margin: '0 0 8px 0',
                    }}
                  >
                    {card.series}
                  </p>
                  <div
                    style={{
                      fontSize: '18px',
                      color: '#27ae60',
                      fontWeight: 'bold',
                    }}
                  >
                    {card.price.current} TWD
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 卡片詳情模態框 */}
        {selectedCard && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <button
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  zIndex: 10,
                }}
                onClick={handleCloseCardDetail}
              >
                ✕
              </button>
              <div
                style={{
                  padding: '24px',
                  overflowY: 'auto',
                  maxHeight: 'calc(90vh - 48px)',
                }}
              >
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    margin: '0 0 16px 0',
                  }}
                >
                  {selectedCard.name}
                </h2>
                <p
                  style={{
                    fontSize: '16px',
                    color: '#7f8c8d',
                    margin: '0 0 16px 0',
                  }}
                >
                  {selectedCard.series} • {selectedCard.rarity}
                </p>
                <div
                  style={{
                    fontSize: '24px',
                    color: '#27ae60',
                    fontWeight: 'bold',
                    marginBottom: '16px',
                  }}
                >
                  {selectedCard.price.current} TWD
                </div>
                <button
                  style={{
                    backgroundColor: '#3498db',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                  onClick={() => handleAddToPortfolio(selectedCard)}
                >
                  💎 加入投資組合
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 未認證用戶 - 顯示認證屏幕
  return (
    <>
      {currentScreen === 'Login' ? (
        <LoginScreen onNavigate={handleNavigate} />
      ) : (
        <RegisterScreen onNavigate={handleNavigate} />
      )}
    </>
  );
};

// 主App組件
export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
