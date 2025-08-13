const express = require('express');
const { query, validationResult } = require('express-validator');
const { protect, optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// 模擬市場數據
const mockMarketData = [
  {
    id: '1',
    cardId: '1',
    cardName: '青眼白龍',
    currentPrice: 1600,
    previousPrice: 1500,
    priceChange: 100,
    priceChangePercent: 6.67,
    volume: 50,
    trend: 'up',
    marketCap: 80000,
    lastUpdated: '2024-02-01T00:00:00Z'
  },
  {
    id: '2',
    cardId: '2',
    cardName: '黑魔導',
    currentPrice: 850,
    previousPrice: 800,
    priceChange: 50,
    priceChangePercent: 6.25,
    volume: 30,
    trend: 'up',
    marketCap: 25500,
    lastUpdated: '2024-02-01T00:00:00Z'
  }
];

// 模擬價格歷史數據
const mockPriceHistory = {
  '1': [
    { date: '2024-01-01', price: 1400, volume: 20 },
    { date: '2024-01-15', price: 1500, volume: 35 },
    { date: '2024-02-01', price: 1600, volume: 50 }
  ],
  '2': [
    { date: '2024-01-01', price: 750, volume: 15 },
    { date: '2024-01-15', price: 800, volume: 25 },
    { date: '2024-02-01', price: 850, volume: 30 }
  ]
};

// @route   GET /api/market/data
// @desc    獲取市場數據
// @access  Public
router.get('/data', [
  query('cardId').optional().isString(),
  query('period').optional().isIn(['1d', '7d', '30d', '90d', '1y']),
  query('sortBy').optional().isIn(['price', 'volume', 'change', 'marketCap']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
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

    const { cardId, period = '30d', sortBy = 'volume', sortOrder = 'desc' } = req.query;

    let filteredData = [...mockMarketData];

    // 如果指定了卡牌ID，只返回該卡牌的數據
    if (cardId) {
      filteredData = filteredData.filter(item => item.cardId === cardId);
    }

    // 排序
    filteredData.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.currentPrice;
          bValue = b.currentPrice;
          break;
        case 'volume':
          aValue = a.volume;
          bValue = b.volume;
          break;
        case 'change':
          aValue = a.priceChangePercent;
          bValue = b.priceChangePercent;
          break;
        case 'marketCap':
          aValue = a.marketCap;
          bValue = b.marketCap;
          break;
        default:
          aValue = a.volume;
          bValue = b.volume;
      }

      if (sortOrder === 'desc') {
        return bValue - aValue;
      }
      return aValue - bValue;
    });

    // 計算市場統計
    const totalVolume = filteredData.reduce((sum, item) => sum + item.volume, 0);
    const totalMarketCap = filteredData.reduce((sum, item) => sum + item.marketCap, 0);
    const averagePrice = filteredData.length > 0 
      ? filteredData.reduce((sum, item) => sum + item.currentPrice, 0) / filteredData.length 
      : 0;

    const risingCards = filteredData.filter(item => item.trend === 'up').length;
    const fallingCards = filteredData.filter(item => item.trend === 'down').length;
    const stableCards = filteredData.filter(item => item.trend === 'stable').length;

    logger.info(`市場數據查詢: ${filteredData.length} 張卡牌`);

    res.json({
      success: true,
      data: {
        marketData: filteredData,
        statistics: {
          totalVolume,
          totalMarketCap,
          averagePrice: Math.round(averagePrice * 100) / 100,
          trendDistribution: {
            rising: risingCards,
            falling: fallingCards,
            stable: stableCards
          }
        },
        period,
        lastUpdated: new Date().toISOString()
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

    const priceHistory = mockPriceHistory[cardId];
    
    if (!priceHistory) {
      return res.status(404).json({
        success: false,
        message: '價格歷史數據不存在',
        code: 'PRICE_HISTORY_NOT_FOUND'
      });
    }

    // 根據期間過濾數據
    let filteredHistory = [...priceHistory];
    if (period !== 'all') {
      const days = parseInt(period);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filteredHistory = priceHistory.filter(item => 
        new Date(item.date) >= cutoffDate
      );
    }

    // 計算統計信息
    const prices = filteredHistory.map(item => item.price);
    const volumes = filteredHistory.map(item => item.volume);
    
    const priceStats = {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length * 100) / 100,
      change: prices.length > 1 ? prices[prices.length - 1] - prices[0] : 0,
      changePercent: prices.length > 1 ? ((prices[prices.length - 1] - prices[0]) / prices[0] * 100) : 0
    };

    const volumeStats = {
      total: volumes.reduce((sum, volume) => sum + volume, 0),
      average: Math.round(volumes.reduce((sum, volume) => sum + volume, 0) / volumes.length * 100) / 100
    };

    logger.info(`獲取價格歷史: 卡牌 ${cardId}, 期間 ${period}`);

    res.json({
      success: true,
      data: {
        cardId,
        period,
        priceHistory: filteredHistory,
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

    // 模擬趨勢數據
    const trends = {
      overall: {
        trend: 'up',
        change: 5.2,
        message: '市場整體呈上升趨勢，投資者信心增強'
      },
      topGainers: [
        { cardId: '1', cardName: '青眼白龍', change: 6.67, currentPrice: 1600 },
        { cardId: '2', cardName: '黑魔導', change: 6.25, currentPrice: 850 }
      ],
      topLosers: [
        { cardId: '3', cardName: '紅眼黑龍', change: -2.5, currentPrice: 1200 },
        { cardId: '4', cardName: '真紅眼黑龍', change: -1.8, currentPrice: 1800 }
      ],
      volumeLeaders: [
        { cardId: '1', cardName: '青眼白龍', volume: 50, currentPrice: 1600 },
        { cardId: '2', cardName: '黑魔導', volume: 30, currentPrice: 850 }
      ]
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
    // 模擬AI生成的市場洞察
    const insights = {
      sentiment: 'positive',
      recommendation: '建議關注稀有度較高的卡牌，市場需求穩定',
      riskLevel: 'medium',
      keyFactors: [
        '新系列發布帶動市場活躍度',
        '收藏者需求持續增長',
        '競技環境變化影響特定卡牌價格'
      ],
      investmentStrategy: {
        shortTerm: '關注即將發布的新系列預熱',
        mediumTerm: '投資經典系列中的稀有卡牌',
        longTerm: '建立多元化收藏組合'
      },
      marketOutlook: {
        nextWeek: '價格可能小幅波動，建議觀望',
        nextMonth: '預期穩步上升，可適度加倉',
        nextQuarter: '長期看好，建議長期持有'
      }
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
    // 模擬分析數據
    const analytics = {
      marketOverview: {
        totalCards: 1500,
        activeCards: 1200,
        totalVolume: 50000,
        averagePrice: 850,
        marketCap: 12750000
      },
      priceDistribution: {
        under100: 200,
        '100-500': 400,
        '500-1000': 300,
        '1000-5000': 400,
        over5000: 200
      },
      volumeAnalysis: {
        dailyAverage: 1500,
        weeklyTrend: 5.2,
        monthlyGrowth: 12.5
      },
      categoryPerformance: {
        monsters: { change: 6.2, volume: 25000 },
        spells: { change: 4.8, volume: 15000 },
        traps: { change: 3.5, volume: 10000 }
      }
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
