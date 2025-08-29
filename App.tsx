import LogRocket from '@logrocket/react-native';
import * as Updates from 'expo-updates';
import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';

import type { Card } from './src/core/types/cards';
import { logger } from './src/core/utils/logger';

// 導入手機 App 組件
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { cardService } from './src/shared/services/cardService';
import { notificationService } from './src/shared/services/notificationService';
import { portfolioService } from './src/shared/services/portfolioService';
import type { PortfolioItem } from './src/shared/services/portfolioService';
import { store } from './src/store';
import {
  checkAuthStatus,
  selectIsAuthenticated,
  selectIsLoading,
} from './src/store/slices/authSlice';
// import HomeScreen from './src/screens/HomeScreen';
// import CardsScreen from './src/screens/CardsScreen';
// import CollectionsScreen from './src/screens/CollectionsScreen';
// import InvestmentsScreen from './src/screens/InvestmentsScreen';
// import ProfileScreen from './src/screens/ProfileScreen';
// import CardDetailScreen from './src/screens/CardDetailScreen';
// import CardScannerScreen from './src/screens/CardScannerScreen';
// import AIChatScreen from './src/screens/AIChatScreen';
// import MarketAnalysisScreen from './src/screens/MarketAnalysisScreen';

// 擴展 Card 類型以包含 series 屬性
interface ExtendedCard extends Card {
  series?: string;
}

// 主應用組件
const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const [currentScreen, setCurrentScreen] = useState<
    'Login' | 'Register' | 'Dashboard'
  >('Login');
  const [cards, setCards] = useState<ExtendedCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<ExtendedCard | null>(null);
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
    dispatch(checkAuthStatus() as any);

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
      const cardsResponse = await cardService.getCards();

      if (cardsResponse && Array.isArray(cardsResponse)) {
        setCards(cardsResponse as ExtendedCard[]);
      } else {
        // 如果 API 失敗，使用模擬數據作為備用
        logger.warn('API 獲取卡片失敗，使用模擬數據');
        const mockCards: ExtendedCard[] = [
          {
            id: '1',
            name: '示例卡片',
            setName: '示例系列',
            cardNumber: '001',
            rarity: 'rare',
            type: 'creature',
            attributes: {},
            marketData: {
              currentPrice: 100,
              priceHistory: [],
              marketTrend: 'stable',
              volatility: 0.1,
              demand: 'medium',
              supply: 'medium',
              lastUpdated: new Date(),
            },
            images: {
              front: '',
              thumbnail: '',
            },
            metadata: {
              game: 'TCG',
              set: '示例系列',
              language: 'zh-TW',
              condition: 'near-mint',
              isFoil: false,
              isSigned: false,
              isGraded: false,
            },
            price: 100,
            currentPrice: 100,
            priceChange: 0,
            condition: 'near-mint',
            set: '示例系列',
            isFavorite: false,
            imageUrl: '',
            description: '這是一個示例卡片',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        setCards(mockCards);
      }
    } catch (error) {
      logger.error('載入卡片失敗:', { error });
      // 錯誤時使用模擬數據
      const mockCards: ExtendedCard[] = [
        {
          id: '1',
          name: '示例卡片',
          setName: '示例系列',
          cardNumber: '001',
          rarity: 'rare',
          type: 'creature',
          attributes: {},
          marketData: {
            currentPrice: 100,
            priceHistory: [],
            marketTrend: 'stable',
            volatility: 0.1,
            demand: 'medium',
            supply: 'medium',
            lastUpdated: new Date(),
          },
          images: {
            front: '',
            thumbnail: '',
          },
          metadata: {
            game: 'TCG',
            set: '示例系列',
            language: 'zh-TW',
            condition: 'near-mint',
            isFoil: false,
            isSigned: false,
            isGraded: false,
          },
          price: 100,
          currentPrice: 100,
          priceChange: 0,
          condition: 'near-mint',
          set: '示例系列',
          isFavorite: false,
          imageUrl: '',
          description: '這是一個示例卡片',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      setCards(mockCards);
    }
  };

  const loadPortfolio = async () => {
    try {
      await portfolioService.getPortfolio();
    } catch (error) {
      logger.error('載入投資組合失敗:', { error });
    }
  };

  const handleNavigate = (screen: 'Login' | 'Register' | 'Dashboard') => {
    setCurrentScreen(screen);
  };

  const handleCardClick = (card: ExtendedCard) => {
    setSelectedCard(card);
  };

  const handleCloseCardDetail = () => {
    setSelectedCard(null);
  };

  const handleAddToPortfolio = async (card: ExtendedCard) => {
    // 簡單的添加邏輯，實際應用中可以彈出輸入框讓用戶輸入數量和價格
    const quantity = 1;
    const purchasePrice = card.price || card.currentPrice || 0;

    try {
      await portfolioService.addPortfolioItem({
        cardId: card.id,
        cardName: card.name,
        quantity,
        averagePrice: purchasePrice,
        currentPrice: card.currentPrice || card.price || 0,
        totalValue: (card.currentPrice || card.price || 0) * quantity,
        profitLoss: 0,
        profitLossPercentage: 0,
        notes: '從卡片詳情頁面添加',
      });
      await loadPortfolio(); // 重新載入投資組合

      logger.info(`已將 ${card.name} 加入投資組合！`, {
        quantity,
        purchasePrice,
      });
    } catch (error) {
      logger.error('添加投資組合項目失敗:', { error });
    }
  };

  const handleRemoveFromPortfolio = async (itemId: string) => {
    // 直接移除，假設確認已在其他地方處理
    try {
      await portfolioService.removePortfolioItem(itemId);
      await loadPortfolio();
    } catch (error) {
      logger.error('移除投資組合項目失敗:', { error });
    }
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
            <h1 style={{ margin: 0, fontSize: '24px', color: '#2c3e50' }}>
              🃏 卡策
            </h1>
          </div>
          <button
            style={{
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={handleLogout}
          >
            登出
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h3
                style={{
                  margin: '0 0 16px 0',
                  color: '#2c3e50',
                  fontSize: '18px',
                }}
              >
                📊 投資組合概覽
              </h3>
              <p
                style={{
                  margin: '0 0 8px 0',
                  color: '#7f8c8d',
                  fontSize: '14px',
                }}
              >
                總卡片數：{portfolio.length}
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h3
                style={{
                  margin: '0 0 16px 0',
                  color: '#2c3e50',
                  fontSize: '18px',
                }}
              >
                💰 總價值
              </h3>
              <p
                style={{
                  margin: '0 0 8px 0',
                  color: '#7f8c8d',
                  fontSize: '14px',
                }}
              >
                計算中...
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h3
                style={{
                  margin: '0 0 16px 0',
                  color: '#2c3e50',
                  fontSize: '18px',
                }}
              >
                📈 今日變化
              </h3>
              <p
                style={{
                  margin: '0 0 8px 0',
                  color: '#7f8c8d',
                  fontSize: '14px',
                }}
              >
                更新中...
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3
              style={{
                margin: '0 0 24px 0',
                color: '#2c3e50',
                fontSize: '20px',
              }}
            >
              🃏 最新卡片
            </h3>
            <p
              style={{
                margin: '0 0 16px 0',
                color: '#7f8c8d',
                fontSize: '16px',
              }}
            >
              發現的最新卡片
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '16px',
              }}
            >
              {cards.map(card => (
                <div
                  key={card.id}
                  style={{
                    border: '1px solid #e1e8ed',
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => handleCardClick(card)}
                >
                  <h4
                    style={{
                      margin: '0 0 8px 0',
                      color: '#2c3e50',
                      fontSize: '16px',
                    }}
                  >
                    {card.name}
                  </h4>
                  <p
                    style={{
                      margin: '0 0 8px 0',
                      color: '#7f8c8d',
                      fontSize: '14px',
                    }}
                  >
                    {card.series || '未知系列'}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        color: '#27ae60',
                        fontWeight: 'bold',
                        fontSize: '16px',
                      }}
                    >
                      ${card.currentPrice || card.price || 0}
                    </span>
                    <span
                      style={{
                        color:
                          (card.priceChange || 0) >= 0 ? '#27ae60' : '#e74c3c',
                        fontSize: '14px',
                      }}
                    >
                      {(card.priceChange || 0) >= 0 ? '+' : ''}
                      {(card.priceChange || 0).toFixed(2)}%
                    </span>
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
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '32px',
                borderRadius: '12px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '24px',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: '#2c3e50',
                    fontSize: '24px',
                  }}
                >
                  {selectedCard.name}
                </h2>
                <button
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#7f8c8d',
                  }}
                  onClick={handleCloseCardDetail}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  marginBottom: '16px',
                }}
              >
                <p
                  style={{
                    margin: '0 0 8px 0',
                    color: '#7f8c8d',
                    fontSize: '16px',
                  }}
                >
                  {selectedCard.series || '未知系列'} • {selectedCard.rarity}
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                  }}
                >
                  <span
                    style={{
                      color: '#27ae60',
                      fontWeight: 'bold',
                      fontSize: '24px',
                    }}
                  >
                    ${selectedCard.currentPrice || selectedCard.price || 0}
                  </span>
                  <button
                    style={{
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '16px',
                    }}
                    onClick={() => handleAddToPortfolio(selectedCard)}
                  >
                    加入投資組合
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 未認證用戶 - 顯示登錄/註冊頁面
  return (
    <>
      {currentScreen === 'Login' && <LoginScreen onNavigate={handleNavigate} />}
      {currentScreen === 'Register' && (
        <RegisterScreen onNavigate={handleNavigate} />
      )}
    </>
  );
};

// 主應用組件
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
