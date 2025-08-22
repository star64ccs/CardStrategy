#!/bin/bash

echo "🚀 開始第二階段：API 路由優化"
echo "=================================="

# 1. 進入後端目錄
cd backend

# 2. 優化卡片路由
echo "🔧 優化卡片路由..."
cat > src/routes/cards-optimized.js << 'EOF'
const express = require('express');
const router = express.Router();
const advancedCache = require('../services/advancedCacheService');
const databaseOptimizer = require('../services/databaseOptimizer');
const { Card, User } = require('../models');

// 獲取卡片列表 - 優化版本
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;
    const cacheKey = `cards:list:${page}:${limit}:${status}:${userId}`;
    
    // 嘗試從緩存獲取
    const cachedData = await advancedCache.get(cacheKey, 'cards');
    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }
    
    // 優化查詢
    const optimizedQuery = databaseOptimizer.optimizeQuery({
      where: { 
        ...(status && { status }),
        ...(userId && { user_id: userId })
      },
      include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']]
    });
    
    const cards = await Card.findAll(optimizedQuery);
    
    // 緩存結果
    await advancedCache.set(cacheKey, cards, 'cards');
    
    res.json({
      success: true,
      data: cards,
      cached: false
    });
  } catch (error) {
    console.error('獲取卡片列表失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取卡片列表失敗'
    });
  }
});

// 獲取單個卡片 - 優化版本
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `cards:detail:${id}`;
    
    // 嘗試從緩存獲取
    const cachedData = await advancedCache.get(cacheKey, 'cards');
    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }
    
    const card = await Card.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username'] }]
    });
    
    if (!card) {
      return res.status(404).json({
        success: false,
        message: '卡片不存在'
      });
    }
    
    // 緩存結果
    await advancedCache.set(cacheKey, card, 'cards');
    
    res.json({
      success: true,
      data: card,
      cached: false
    });
  } catch (error) {
    console.error('獲取卡片詳情失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取卡片詳情失敗'
    });
  }
});

module.exports = router;
EOF

# 3. 優化市場數據路由
echo "🔧 優化市場數據路由..."
cat > src/routes/market-optimized.js << 'EOF'
const express = require('express');
const router = express.Router();
const advancedCache = require('../services/advancedCacheService');

// 獲取市場趨勢 - 優化版本
router.get('/trends', async (req, res) => {
  try {
    const cacheKey = 'market:trends';
    
    // 嘗試從緩存獲取
    const cachedData = await advancedCache.get(cacheKey, 'marketData');
    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }
    
    // 這裡應該調用實際的市場數據服務
    const trends = await getMarketTrends();
    
    // 緩存結果
    await advancedCache.set(cacheKey, trends, 'marketData');
    
    res.json({
      success: true,
      data: trends,
      cached: false
    });
  } catch (error) {
    console.error('獲取市場趨勢失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取市場趨勢失敗'
    });
  }
});

// 模擬市場數據服務
async function getMarketTrends() {
  return {
    timestamp: new Date().toISOString(),
    trends: [
      { cardType: 'Pokemon', trend: 'up', change: 5.2 },
      { cardType: 'YuGiOh', trend: 'down', change: -2.1 },
      { cardType: 'Magic', trend: 'stable', change: 0.8 }
    ]
  };
}

module.exports = router;
EOF

# 4. 測試優化後的 API
echo "🧪 測試優化後的 API..."
npm run test:api-performance

# 5. 生成 API 效能報告
echo "📊 生成 API 效能報告..."
npm run api:performance-report

echo "✅ 第二階段 API 優化完成！"
echo "📋 下一步：進入第三階段 - 架構優化"
