require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });

const { connectDB, getSequelize } = require('../config/database');
const logger = require('../utils/logger');

// 導入所有模型
const getUserModel = require('../models/User');
const getCardModel = require('../models/Card');
const getCollectionModel = require('../models/Collection');
const getInvestmentModel = require('../models/Investment');
const getCollectionCardModel = require('../models/CollectionCard');
const getPriceAlertModel = require('../models/PriceAlert');
const getMarketDataModel = require('../models/MarketData');
const getAIAnalysisModel = require('../models/AIAnalysis');

// 建立模型關聯
const setupAssociations = (sequelize) => {
  const User = getUserModel();
  const Card = getCardModel();
  const Collection = getCollectionModel();
  const Investment = getInvestmentModel();
  const CollectionCard = getCollectionCardModel();
  const PriceAlert = getPriceAlertModel();
  const MarketData = getMarketDataModel();
  const AIAnalysis = getAIAnalysisModel();

  if (!User || !Card || !Collection || !Investment || !CollectionCard || !PriceAlert || !MarketData || !AIAnalysis) {
    throw new Error('無法創建模型實例');
  }

  try {
    // User 關聯
    User.hasMany(Collection, { foreignKey: 'userId', as: 'collections' });
    User.hasMany(Investment, { foreignKey: 'userId', as: 'investments' });
    User.hasMany(PriceAlert, { foreignKey: 'userId', as: 'priceAlerts' });
    User.hasMany(AIAnalysis, { foreignKey: 'userId', as: 'aiAnalyses' });

    Collection.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Investment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    PriceAlert.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    AIAnalysis.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // Card 關聯
    Card.hasMany(Investment, { foreignKey: 'cardId', as: 'investments' });
    Card.hasMany(PriceAlert, { foreignKey: 'cardId', as: 'priceAlerts' });
    Card.hasMany(MarketData, { foreignKey: 'cardId', as: 'marketDataRecords' });
    Card.hasMany(AIAnalysis, { foreignKey: 'cardId', as: 'aiAnalyses' });
    Card.belongsToMany(Collection, {
      through: CollectionCard,
      foreignKey: 'cardId',
      otherKey: 'collectionId',
      as: 'collections'
    });

    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });
    PriceAlert.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });
    MarketData.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });
    AIAnalysis.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    // Collection 關聯
    Collection.belongsToMany(Card, {
      through: CollectionCard,
      foreignKey: 'collectionId',
      otherKey: 'cardId',
      as: 'cards'
    });

    // CollectionCard 關聯
    CollectionCard.belongsTo(Collection, { foreignKey: 'collectionId', as: 'collection' });
    CollectionCard.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    logger.info('模型關聯設置完成');
  } catch (error) {
    logger.error('設置模型關聯時出錯：', error.message);
    throw error;
  }
};

// 創建測試數據
const createSeedData = async () => {
  try {
    logger.info('開始創建測試數據...');

    // 連接數據庫
    await connectDB();
    const sequelize = getSequelize();

    if (!sequelize) {
      throw new Error('無法獲取 Sequelize 實例');
    }

    // 初始化所有模型
    getUserModel();
    getCardModel();
    getCollectionModel();
    getInvestmentModel();
    getCollectionCardModel();
    getPriceAlertModel();
    getMarketDataModel();
    getAIAnalysisModel();

    // 設置關聯
    setupAssociations(sequelize);

    // 檢查是否已有數據
    const userCount = await getUserModel().count();
    if (userCount > 0) {
      logger.info('數據庫中已有數據，跳過種子數據創建');
      return;
    }

    // 創建測試用戶
    logger.info('創建測試用戶...');
    const testUser = await getUserModel().create({
      username: 'testuser',
      email: 'test@cardstrategy.com',
      password: 'password123',
      displayName: '測試用戶',
      role: 'user',
      isVerified: true,
      isActive: true,
      preferences: {
        language: 'zh-TW',
        theme: 'auto',
        notifications: {
          email: true,
          push: true,
          market: true,
          investment: true
        }
      },
      membership: {
        type: 'free',
        startDate: new Date(),
        endDate: null,
        features: []
      },
      statistics: {
        totalCards: 0,
        totalCollections: 0,
        totalInvestments: 0,
        portfolioValue: 0,
        totalProfitLoss: 0
      }
    });

    // 創建測試卡片
    logger.info('創建測試卡片...');
    const testCards = await getCardModel().bulkCreate([
      {
        name: '青眼白龍',
        setName: '遊戲王 初代',
        cardNumber: 'LOB-001',
        rarity: 'rare',
        cardType: 'Monster',
        imageUrl: 'https://example.com/blue-eyes.jpg',
        description: '傳說中的最強龍族怪獸',
        currentPrice: 150.00,
        marketPrice: 145.00,
        priceHistory: [
          { date: '2025-08-01', price: 140.00 },
          { date: '2025-08-07', price: 145.00 },
          { date: '2025-08-14', price: 150.00 }
        ],
        marketData: {
          lastUpdated: new Date(),
          priceChange24h: 3.45,
          priceChange7d: 7.14,
          volume24h: 25,
          marketCap: 15000
        },
        isActive: true,
        metadata: {
          attack: 3000,
          defense: 2500,
          level: 8,
          attribute: 'LIGHT',
          type: 'Dragon'
        }
      },
      {
        name: '黑魔導',
        setName: '遊戲王 初代',
        cardNumber: 'LOB-005',
        rarity: 'rare',
        cardType: 'Monster',
        imageUrl: 'https://example.com/dark-magician.jpg',
        description: '傳說中的魔法師',
        currentPrice: 120.00,
        marketPrice: 118.00,
        priceHistory: [
          { date: '2025-08-01', price: 115.00 },
          { date: '2025-08-07', price: 118.00 },
          { date: '2025-08-14', price: 120.00 }
        ],
        marketData: {
          lastUpdated: new Date(),
          priceChange24h: 1.69,
          priceChange7d: 4.35,
          volume24h: 18,
          marketCap: 12000
        },
        isActive: true,
        metadata: {
          attack: 2500,
          defense: 2100,
          level: 7,
          attribute: 'DARK',
          type: 'Spellcaster'
        }
      },
      {
        name: '真紅眼黑龍',
        setName: '遊戲王 初代',
        cardNumber: 'LOB-007',
        rarity: 'rare',
        cardType: 'Monster',
        imageUrl: 'https://example.com/red-eyes.jpg',
        description: '真紅之眼的黑龍',
        currentPrice: 95.00,
        marketPrice: 92.00,
        priceHistory: [
          { date: '2025-08-01', price: 90.00 },
          { date: '2025-08-07', price: 92.00 },
          { date: '2025-08-14', price: 95.00 }
        ],
        marketData: {
          lastUpdated: new Date(),
          priceChange24h: 3.26,
          priceChange7d: 5.56,
          volume24h: 12,
          marketCap: 9500
        },
        isActive: true,
        metadata: {
          attack: 2400,
          defense: 2000,
          level: 7,
          attribute: 'DARK',
          type: 'Dragon'
        }
      }
    ]);

    // 創建測試收藏
    logger.info('創建測試收藏...');
    const testCollection = await getCollectionModel().create({
      name: '我的最愛收藏',
      description: '包含我最喜歡的卡片',
      isPublic: true,
      coverImage: 'https://example.com/collection-cover.jpg',
      tags: ['最愛', '經典', '收藏'],
      statistics: {
        totalCards: 0,
        totalValue: 0,
        averagePrice: 0,
        mostExpensiveCard: null,
        rarestCard: null
      },
      isActive: true,
      userId: testUser.id
    });

    // 創建收藏卡片關聯
    logger.info('創建收藏卡片關聯...');
    await getCollectionCardModel().bulkCreate([
      {
        collectionId: testCollection.id,
        cardId: testCards[0].id,
        quantity: 1,
        condition: 'near-mint',
        notes: '完美品相',
        isFoil: false,
        isSigned: false,
        isGraded: false,
        estimatedValue: 150.00,
        addedDate: new Date()
      },
      {
        collectionId: testCollection.id,
        cardId: testCards[1].id,
        quantity: 2,
        condition: 'excellent',
        notes: '輕微磨損',
        isFoil: true,
        isSigned: false,
        isGraded: false,
        estimatedValue: 240.00,
        addedDate: new Date()
      }
    ]);

    // 創建測試投資
    logger.info('創建測試投資...');
    await getInvestmentModel().bulkCreate([
      {
        userId: testUser.id,
        cardId: testCards[0].id,
        purchasePrice: 130.00,
        purchaseDate: new Date('2025-07-01'),
        quantity: 1,
        condition: 'near-mint',
        notes: '投資購買',
        currentValue: 150.00,
        profitLoss: 20.00,
        profitLossPercentage: 15.38,
        isActive: true,
        metadata: {
          purchaseSource: 'online',
          shippingCost: 5.00
        }
      },
      {
        userId: testUser.id,
        cardId: testCards[2].id,
        purchasePrice: 85.00,
        purchaseDate: new Date('2025-07-15'),
        quantity: 1,
        condition: 'excellent',
        notes: '拍賣購得',
        currentValue: 95.00,
        profitLoss: 10.00,
        profitLossPercentage: 11.76,
        isActive: true,
        metadata: {
          purchaseSource: 'auction',
          auctionFee: 3.00
        }
      }
    ]);

    // 創建測試價格提醒
    logger.info('創建測試價格提醒...');
    await getPriceAlertModel().bulkCreate([
      {
        userId: testUser.id,
        cardId: testCards[0].id,
        alertType: 'above',
        targetPrice: 160.00,
        percentageChange: null,
        isActive: true,
        lastTriggered: null,
        triggerCount: 0,
        notificationChannels: {
          email: true,
          push: true,
          sms: false
        },
        notes: '當青眼白龍價格超過160時提醒'
      },
      {
        userId: testUser.id,
        cardId: testCards[1].id,
        alertType: 'below',
        targetPrice: 110.00,
        percentageChange: null,
        isActive: true,
        lastTriggered: null,
        triggerCount: 0,
        notificationChannels: {
          email: true,
          push: true,
          sms: false
        },
        notes: '當黑魔導價格低於110時提醒'
      }
    ]);

    // 創建測試市場數據
    logger.info('創建測試市場數據...');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    await getMarketDataModel().bulkCreate([
      // 青眼白龍的市場數據
      {
        cardId: testCards[0].id,
        date: weekAgo.toISOString().split('T')[0],
        openPrice: 140.00,
        closePrice: 142.00,
        highPrice: 145.00,
        lowPrice: 138.00,
        volume: 15,
        transactions: 8,
        priceChange: 2.00,
        priceChangePercent: 1.43,
        marketCap: 14200.00,
        trend: 'up',
        volatility: 2.50,
        isActive: true
      },
      {
        cardId: testCards[0].id,
        date: yesterday.toISOString().split('T')[0],
        openPrice: 142.00,
        closePrice: 147.00,
        highPrice: 148.00,
        lowPrice: 141.00,
        volume: 22,
        transactions: 12,
        priceChange: 5.00,
        priceChangePercent: 3.52,
        marketCap: 14700.00,
        trend: 'up',
        volatility: 2.47,
        isActive: true
      },
      {
        cardId: testCards[0].id,
        date: today.toISOString().split('T')[0],
        openPrice: 147.00,
        closePrice: 150.00,
        highPrice: 152.00,
        lowPrice: 146.00,
        volume: 25,
        transactions: 15,
        priceChange: 3.00,
        priceChangePercent: 2.04,
        marketCap: 15000.00,
        trend: 'up',
        volatility: 2.04,
        isActive: true
      },
      // 黑魔導的市場數據
      {
        cardId: testCards[1].id,
        date: weekAgo.toISOString().split('T')[0],
        openPrice: 115.00,
        closePrice: 116.00,
        highPrice: 117.00,
        lowPrice: 114.00,
        volume: 12,
        transactions: 6,
        priceChange: 1.00,
        priceChangePercent: 0.87,
        marketCap: 11600.00,
        trend: 'up',
        volatility: 1.30,
        isActive: true
      },
      {
        cardId: testCards[1].id,
        date: yesterday.toISOString().split('T')[0],
        openPrice: 116.00,
        closePrice: 119.00,
        highPrice: 120.00,
        lowPrice: 115.00,
        volume: 18,
        transactions: 10,
        priceChange: 3.00,
        priceChangePercent: 2.59,
        marketCap: 11900.00,
        trend: 'up',
        volatility: 2.15,
        isActive: true
      },
      {
        cardId: testCards[1].id,
        date: today.toISOString().split('T')[0],
        openPrice: 119.00,
        closePrice: 120.00,
        highPrice: 121.00,
        lowPrice: 118.00,
        volume: 18,
        transactions: 11,
        priceChange: 1.00,
        priceChangePercent: 0.84,
        marketCap: 12000.00,
        trend: 'up',
        volatility: 1.26,
        isActive: true
      },
      // 真紅眼黑龍的市場數據
      {
        cardId: testCards[2].id,
        date: weekAgo.toISOString().split('T')[0],
        openPrice: 90.00,
        closePrice: 92.00,
        highPrice: 93.00,
        lowPrice: 89.00,
        volume: 8,
        transactions: 4,
        priceChange: 2.00,
        priceChangePercent: 2.22,
        marketCap: 9200.00,
        trend: 'up',
        volatility: 2.22,
        isActive: true
      },
      {
        cardId: testCards[2].id,
        date: yesterday.toISOString().split('T')[0],
        openPrice: 92.00,
        closePrice: 93.00,
        highPrice: 94.00,
        lowPrice: 91.00,
        volume: 10,
        transactions: 6,
        priceChange: 1.00,
        priceChangePercent: 1.09,
        marketCap: 9300.00,
        trend: 'up',
        volatility: 1.63,
        isActive: true
      },
      {
        cardId: testCards[2].id,
        date: today.toISOString().split('T')[0],
        openPrice: 93.00,
        closePrice: 95.00,
        highPrice: 96.00,
        lowPrice: 92.00,
        volume: 12,
        transactions: 7,
        priceChange: 2.00,
        priceChangePercent: 2.15,
        marketCap: 9500.00,
        trend: 'up',
        volatility: 2.15,
        isActive: true
      }
    ]);

    // 更新用戶統計
    logger.info('更新用戶統計...');
    const totalCards = await getCollectionCardModel().count({
      include: [{
        model: getCollectionModel(),
        as: 'collection',
        where: { userId: testUser.id }
      }]
    });

    const totalCollections = await getCollectionModel().count({
      where: { userId: testUser.id }
    });

    const totalInvestments = await getInvestmentModel().count({
      where: { userId: testUser.id }
    });

    const portfolioValue = await getInvestmentModel().sum('currentValue', {
      where: { userId: testUser.id }
    });

    const totalProfitLoss = await getInvestmentModel().sum('profitLoss', {
      where: { userId: testUser.id }
    });

    await testUser.update({
      statistics: {
        totalCards,
        totalCollections,
        totalInvestments,
        portfolioValue: portfolioValue || 0,
        totalProfitLoss: totalProfitLoss || 0
      }
    });

    logger.info('✅ 測試數據創建完成！');
    logger.info(`創建了 ${testUser.username} 用戶`);
    logger.info(`創建了 ${testCards.length} 張卡片`);
    logger.info(`創建了 ${testCollection.name} 收藏`);
    logger.info('創建了 2 個投資記錄');
    logger.info('創建了 2 個價格提醒');
    logger.info('創建了 9 條市場數據記錄');

    process.exit(0);
  } catch (error) {
    logger.error('❌ 創建測試數據失敗：', error.message);
    logger.error('錯誤詳情：', error);
    process.exit(1);
  }
};

// 如果直接運行此腳本
if (require.main === module) {
  createSeedData();
}

module.exports = createSeedData;
