const express = require('express');
const { query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { protect, optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');
const getMarketDataModel = require('../models/MarketData');
const getCardModel = require('../models/Card');
const databaseOptimizer = require('../services/databaseOptimizer');

const router = express.Router();

// @route   GET /api/market/data
// @desc    獲取市場數據
// @access  Public
router.get('/data', [
  query('cardId').optional().isInt({ min: 1 }),
  query('period').optional().isIn(['1d', '7d', '30d', '90d', '1y']),
  query('sortBy').optional().isIn(['price', 'volume', 'change', 'marketCap']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '查詢參數驗證失敗',
        code: 'VALIDATION_ERROR',
        errors: errors.array()
      });
    }

    const {
      cardId,
      period = '30d',
      sortBy = 'volume',
      sortOrder = 'desc',
      limit = 20,
      page = 1
    } = req.query;

    const MarketData = getMarketDataModel();
    const Card = getCardModel();

    if (!MarketData || !Card) {
      return res.status(500).json({
        success: false,
        message: '數據庫模型初始化失敗',
        code: 'MODEL_INIT_FAILED'
      });
    }

    // 設置關聯
    MarketData.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    // 計算日期範圍
    const endDate = new Date();
    const startDate = new Date();
    const days = parseInt(period);
    startDate.setDate(startDate.getDate() - days);

    // 構建查詢條件
    const whereClause = {
      isActive: true,
      date: {
        [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      }
    };

    if (cardId) {
      whereClause.cardId = cardId;
    }

    const offset = (page - 1) * limit;

    // 使用 databaseOptimizer 優化查詢
    const optimizedQuery = databaseOptimizer.optimizeQuery({
      where: whereClause,
      include: [{
        model: Card,
        as: 'card',
        attributes: ['id', 'name', 'setName', 'rarity', 'cardType', 'imageUrl']
      }],
      order: [
        ['cardId', 'ASC'],
        ['date', 'DESC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // 執行優化後的查詢並監控性能
    const startTime = Date.now();
    const latestMarketData = await databaseOptimizer.monitorQuery(
      MarketData,
      'findAll',
      optimizedQuery
    );

    // 按卡牌分組，只取每個卡牌的最新數據
    const cardLatestData = new Map();
    latestMarketData.forEach(data => {
      if (!cardLatestData.has(data.cardId)) {
        cardLatestData.set(data.cardId, data);
      }
    });

    const marketDataArray = Array.from(cardLatestData.values());

    // 排序和分頁
    marketDataArray.sort((a, b) => {
      const aValue = a[sortBy] || 0;
      const bValue = b[sortBy] || 0;
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    // 計算統計信息
    const totalRecords = marketDataArray.length;
    const totalPages = Math.ceil(totalRecords / parseInt(limit));
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedData = marketDataArray.slice(startIndex, endIndex);

    // 計算市場統計
    const marketStats = {
      totalCards: cardLatestData.size,
      averagePrice: marketDataArray.reduce((sum, data) => sum + (data.price || 0), 0) / marketDataArray.length,
      totalVolume: marketDataArray.reduce((sum, data) => sum + (data.volume || 0), 0),
      averageChange: marketDataArray.reduce((sum, data) => sum + (data.change || 0), 0) / marketDataArray.length
    };

    logger.info(`市場數據查詢: ${totalRecords} 條記錄，第 ${page} 頁，查詢時間: ${Date.now() - startTime}ms`);

    res.json({
      success: true,
      data: {
        marketData: paginatedData,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        },
        statistics: marketStats,
        performance: {
          queryTime: Date.now() - startTime,
          optimized: true
        }
      }
    });
  } catch (error) {
    logger.error('獲取市場數據錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取市場數據失敗',
      code: 'GET_MARKET_DATA_FAILED'
    });
  }
});

// @route   GET /api/market/price-history/:cardId
// @desc    獲取卡牌價格歷史
// @access  Public
router.get('/price-history/:cardId', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '查詢參數驗證失敗',
        code: 'VALIDATION_ERROR',
        errors: errors.array()
      });
    }

    const { cardId } = req.params;
    const { period = '30d' } = req.query;

    const MarketData = getMarketDataModel();
    const Card = getCardModel();

    if (!MarketData || !Card) {
      return res.status(500).json({
        success: false,
        message: '數據庫模型初始化失敗',
        code: 'MODEL_INIT_FAILED'
      });
    }

    // 設置關聯
    MarketData.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    // 檢查卡牌是否存在
    const card = await Card.findByPk(cardId);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: '卡牌不存在',
        code: 'CARD_NOT_FOUND'
      });
    }

    // 構建查詢條件
    const whereClause = {
      cardId,
      isActive: true
    };

    if (period !== 'all') {
      const days = parseInt(period);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      whereClause.date = {
        [Op.gte]: cutoffDate.toISOString().split('T')[0]
      };
    }

    // 獲取價格歷史數據
    const priceHistory = await MarketData.findAll({
      where: whereClause,
      include: [{
        model: Card,
        as: 'card',
        attributes: ['id', 'name', 'setName', 'rarity', 'cardType', 'imageUrl']
      }],
      order: [['date', 'ASC']]
    });

    if (priceHistory.length === 0) {
      return res.status(404).json({
        success: false,
        message: '價格歷史數據不存在',
        code: 'PRICE_HISTORY_NOT_FOUND'
      });
    }

    // 計算統計信息
    const prices = priceHistory.map(item => parseFloat(item.closePrice));
    const volumes = priceHistory.map(item => item.volume);

    const priceStats = {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: parseFloat((prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2)),
      change: prices.length > 1 ? prices[prices.length - 1] - prices[0] : 0,
      changePercent: prices.length > 1
        ? parseFloat(((prices[prices.length - 1] - prices[0]) / prices[0] * 100).toFixed(2))
        : 0
    };

    const volumeStats = {
      total: volumes.reduce((sum, volume) => sum + volume, 0),
      average: parseFloat((volumes.reduce((sum, volume) => sum + volume, 0) / volumes.length).toFixed(2))
    };

    logger.info(`獲取價格歷史: 卡牌 ${cardId}, 期間 ${period}`);

    res.json({
      success: true,
      data: {
        cardId,
        card,
        period,
        priceHistory: priceHistory.map(item => ({
          date: item.date,
          openPrice: parseFloat(item.openPrice),
          closePrice: parseFloat(item.closePrice),
          highPrice: parseFloat(item.highPrice),
          lowPrice: parseFloat(item.lowPrice),
          volume: item.volume,
          transactions: item.transactions,
          priceChange: parseFloat(item.priceChange),
          priceChangePercent: parseFloat(item.priceChangePercent),
          marketCap: parseFloat(item.marketCap),
          trend: item.trend,
          volatility: parseFloat(item.volatility)
        })),
        statistics: {
          price: priceStats,
          volume: volumeStats
        }
      }
    });
  } catch (error) {
    logger.error('獲取價格歷史錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取價格歷史失敗',
      code: 'GET_PRICE_HISTORY_FAILED'
    });
  }
});

// @route   GET /api/market/trends
// @desc    獲取市場趨勢
// @access  Public
router.get('/trends', [
  query('timeframe').optional().isIn(['1d', '7d', '30d', '90d'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '查詢參數驗證失敗',
        code: 'VALIDATION_ERROR',
        errors: errors.array()
      });
    }

    const { timeframe = '30d' } = req.query;

    const MarketData = getMarketDataModel();
    const Card = getCardModel();

    if (!MarketData || !Card) {
      return res.status(500).json({
        success: false,
        message: '數據庫模型初始化失敗',
        code: 'MODEL_INIT_FAILED'
      });
    }

    // 設置關聯
    MarketData.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    // 計算日期範圍
    const endDate = new Date();
    const startDate = new Date();
    const days = parseInt(timeframe);
    startDate.setDate(startDate.getDate() - days);

    // 獲取指定時間範圍內的所有市場數據
    const marketData = await MarketData.findAll({
      where: {
        isActive: true,
        date: {
          [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
        }
      },
      include: [{
        model: Card,
        as: 'card',
        attributes: ['id', 'name', 'setName', 'rarity', 'cardType', 'imageUrl']
      }],
      order: [['date', 'DESC']]
    });

    // 按卡牌分組，計算趨勢
    const cardTrends = new Map();
    marketData.forEach(data => {
      if (!cardTrends.has(data.cardId)) {
        cardTrends.set(data.cardId, {
          card: data.card,
          latestData: data,
          totalChange: 0,
          totalVolume: 0,
          dataPoints: 0
        });
      }

      const trend = cardTrends.get(data.cardId);
      trend.totalChange += parseFloat(data.priceChangePercent);
      trend.totalVolume += data.volume;
      trend.dataPoints++;
    });

    // 計算整體趨勢
    const allChanges = Array.from(cardTrends.values()).map(trend => trend.totalChange / trend.dataPoints);
    const overallChange = allChanges.length > 0 ? allChanges.reduce((sum, change) => sum + change, 0) / allChanges.length : 0;

    // 排序獲取表現最好和最差的卡牌
    const sortedTrends = Array.from(cardTrends.values()).sort((a, b) => {
      const aAvgChange = a.totalChange / a.dataPoints;
      const bAvgChange = b.totalChange / b.dataPoints;
      return bAvgChange - aAvgChange;
    });

    const topGainers = sortedTrends.slice(0, 5).map(trend => ({
      cardId: trend.card.id,
      cardName: trend.card.name,
      change: parseFloat((trend.totalChange / trend.dataPoints).toFixed(2)),
      currentPrice: parseFloat(trend.latestData.closePrice),
      volume: trend.totalVolume
    }));

    const topLosers = sortedTrends.slice(-5).reverse().map(trend => ({
      cardId: trend.card.id,
      cardName: trend.card.name,
      change: parseFloat((trend.totalChange / trend.dataPoints).toFixed(2)),
      currentPrice: parseFloat(trend.latestData.closePrice),
      volume: trend.totalVolume
    }));

    // 按交易量排序
    const volumeLeaders = Array.from(cardTrends.values())
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 5)
      .map(trend => ({
        cardId: trend.card.id,
        cardName: trend.card.name,
        volume: trend.totalVolume,
        currentPrice: parseFloat(trend.latestData.closePrice)
      }));

    const trends = {
      overall: {
        trend: overallChange > 0 ? 'up' : overallChange < 0 ? 'down' : 'stable',
        change: parseFloat(overallChange.toFixed(2)),
        message: overallChange > 0
          ? '市場整體呈上升趨勢，投資者信心增強'
          : overallChange < 0
            ? '市場整體呈下降趨勢，建議謹慎投資'
            : '市場整體保持穩定'
      },
      topGainers,
      topLosers,
      volumeLeaders
    };

    logger.info(`獲取市場趨勢: 時間框架 ${timeframe}`);

    res.json({
      success: true,
      data: {
        timeframe,
        trends,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('獲取市場趨勢錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取市場趨勢失敗',
      code: 'GET_TRENDS_FAILED'
    });
  }
});

// @route   GET /api/market/insights
// @desc    獲取市場洞察
// @access  Private
router.get('/insights', protect, async (req, res) => {
  try {
    const MarketData = getMarketDataModel();
    const Card = getCardModel();

    if (!MarketData || !Card) {
      return res.status(500).json({
        success: false,
        message: '數據庫模型初始化失敗',
        code: 'MODEL_INIT_FAILED'
      });
    }

    // 設置關聯
    MarketData.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    // 獲取最近30天的市場數據
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const marketData = await MarketData.findAll({
      where: {
        isActive: true,
        date: {
          [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
        }
      },
      include: [{
        model: Card,
        as: 'card',
        attributes: ['id', 'name', 'rarity', 'cardType']
      }],
      order: [['date', 'DESC']]
    });

    // 分析市場數據
    const totalCards = new Set(marketData.map(data => data.cardId)).size;
    const totalVolume = marketData.reduce((sum, data) => sum + data.volume, 0);
    const avgPrice = marketData.length > 0
      ? marketData.reduce((sum, data) => sum + parseFloat(data.closePrice), 0) / marketData.length
      : 0;

    const upTrendCards = marketData.filter(data => data.trend === 'up').length;
    const downTrendCards = marketData.filter(data => data.trend === 'down').length;
    const stableCards = marketData.filter(data => data.trend === 'stable').length;

    // 按稀有度分析
    const rarityAnalysis = {};
    marketData.forEach(data => {
      const {rarity} = data.card;
      if (!rarityAnalysis[rarity]) {
        rarityAnalysis[rarity] = { count: 0, totalChange: 0 };
      }
      rarityAnalysis[rarity].count++;
      rarityAnalysis[rarity].totalChange += parseFloat(data.priceChangePercent);
    });

    // 生成洞察
    const sentiment = upTrendCards > downTrendCards ? 'positive' : upTrendCards < downTrendCards ? 'negative' : 'neutral';
    const riskLevel = upTrendCards > downTrendCards * 2 ? 'low' : upTrendCards < downTrendCards ? 'high' : 'medium';

    const insights = {
      sentiment,
      recommendation: sentiment === 'positive'
        ? '建議關注稀有度較高的卡牌，市場需求穩定'
        : sentiment === 'negative'
          ? '市場波動較大，建議謹慎投資，關注防禦性資產'
          : '市場保持平衡，建議多元化投資組合',
      riskLevel,
      keyFactors: [
        `活躍卡牌數量: ${totalCards} 張`,
        `總交易量: ${totalVolume} 筆`,
        `平均價格: $${avgPrice.toFixed(2)}`,
        `上升趨勢卡牌: ${upTrendCards} 張`,
        `下降趨勢卡牌: ${downTrendCards} 張`
      ],
      investmentStrategy: {
        shortTerm: sentiment === 'positive'
          ? '關注即將發布的新系列預熱'
          : '保持觀望，等待市場穩定',
        mediumTerm: '投資經典系列中的稀有卡牌',
        longTerm: '建立多元化收藏組合'
      },
      marketOutlook: {
        nextWeek: sentiment === 'positive'
          ? '價格可能小幅波動，建議觀望'
          : '預期價格調整，可適度加倉',
        nextMonth: sentiment === 'positive'
          ? '預期穩步上升，可適度加倉'
          : '市場可能繼續調整，建議謹慎',
        nextQuarter: '長期看好，建議長期持有'
      },
      rarityAnalysis: Object.keys(rarityAnalysis).map(rarity => ({
        rarity,
        count: rarityAnalysis[rarity].count,
        avgChange: parseFloat((rarityAnalysis[rarity].totalChange / rarityAnalysis[rarity].count).toFixed(2))
      }))
    };

    logger.info(`獲取市場洞察: ${req.user.username}`);

    res.json({
      success: true,
      data: {
        insights,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('獲取市場洞察錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取市場洞察失敗',
      code: 'GET_INSIGHTS_FAILED'
    });
  }
});

// @route   GET /api/market/analytics
// @desc    獲取市場分析數據
// @access  Public
router.get('/analytics', async (req, res) => {
  try {
    const MarketData = getMarketDataModel();
    const Card = getCardModel();

    if (!MarketData || !Card) {
      return res.status(500).json({
        success: false,
        message: '數據庫模型初始化失敗',
        code: 'MODEL_INIT_FAILED'
      });
    }

    // 設置關聯
    MarketData.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    // 獲取最新的市場數據
    const latestData = await MarketData.findAll({
      where: { isActive: true },
      include: [{
        model: Card,
        as: 'card',
        attributes: ['id', 'name', 'rarity', 'cardType']
      }],
      order: [
        ['cardId', 'ASC'],
        ['date', 'DESC']
      ]
    });

    // 按卡牌分組，只取最新數據
    const cardLatestData = new Map();
    latestData.forEach(data => {
      if (!cardLatestData.has(data.cardId)) {
        cardLatestData.set(data.cardId, data);
      }
    });

    const marketDataArray = Array.from(cardLatestData.values());

    // 計算市場概覽
    const totalCards = marketDataArray.length;
    const activeCards = marketDataArray.filter(data => data.volume > 0).length;
    const totalVolume = marketDataArray.reduce((sum, data) => sum + data.volume, 0);
    const averagePrice = marketDataArray.length > 0
      ? marketDataArray.reduce((sum, data) => sum + parseFloat(data.closePrice), 0) / marketDataArray.length
      : 0;
    const totalMarketCap = marketDataArray.reduce((sum, data) => sum + parseFloat(data.marketCap), 0);

    // 價格分佈
    const priceDistribution = {
      under100: marketDataArray.filter(data => parseFloat(data.closePrice) < 100).length,
      '100-500': marketDataArray.filter(data => parseFloat(data.closePrice) >= 100 && parseFloat(data.closePrice) < 500).length,
      '500-1000': marketDataArray.filter(data => parseFloat(data.closePrice) >= 500 && parseFloat(data.closePrice) < 1000).length,
      '1000-5000': marketDataArray.filter(data => parseFloat(data.closePrice) >= 1000 && parseFloat(data.closePrice) < 5000).length,
      over5000: marketDataArray.filter(data => parseFloat(data.closePrice) >= 5000).length
    };

    // 交易量分析
    const dailyAverage = totalVolume / 30; // 假設30天
    const weeklyTrend = 5.2; // 模擬數據
    const monthlyGrowth = 12.5; // 模擬數據

    // 按類型分析表現
    const categoryPerformance = {};
    marketDataArray.forEach(data => {
      const type = data.card.cardType;
      if (!categoryPerformance[type]) {
        categoryPerformance[type] = { change: 0, volume: 0, count: 0 };
      }
      categoryPerformance[type].change += parseFloat(data.priceChangePercent);
      categoryPerformance[type].volume += data.volume;
      categoryPerformance[type].count++;
    });

    // 計算平均值
    Object.keys(categoryPerformance).forEach(type => {
      const perf = categoryPerformance[type];
      perf.change = parseFloat((perf.change / perf.count).toFixed(2));
    });

    const analytics = {
      marketOverview: {
        totalCards,
        activeCards,
        totalVolume,
        averagePrice: parseFloat(averagePrice.toFixed(2)),
        totalMarketCap: parseFloat(totalMarketCap.toFixed(2))
      },
      priceDistribution,
      volumeAnalysis: {
        dailyAverage: parseFloat(dailyAverage.toFixed(2)),
        weeklyTrend,
        monthlyGrowth
      },
      categoryPerformance
    };

    logger.info('獲取市場分析數據');

    res.json({
      success: true,
      data: {
        analytics,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('獲取市場分析錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取市場分析失敗',
      code: 'GET_ANALYTICS_FAILED'
    });
  }
});

module.exports = router;
