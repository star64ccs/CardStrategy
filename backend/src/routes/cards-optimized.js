const express = require('express');
const router = express.Router();
const advancedCacheService = require('../services/advancedCacheService');

// 模擬數據庫優化器
const databaseOptimizer = {
  // 查詢優化
  optimizeQuery: (query, options = {}) => {
    const { limit = 20, offset = 0, orderBy = 'created_at', order = 'DESC' } = options;
    
    // 添加 LIMIT 和 OFFSET
    if (!query.includes('LIMIT')) {
      query += ` LIMIT ${limit} OFFSET ${offset}`;
    }
    
    // 添加 ORDER BY
    if (!query.includes('ORDER BY')) {
      query += ` ORDER BY ${orderBy} ${order}`;
    }
    
    return query;
  },

  // 批量查詢優化
  batchQueries: (queries) => {
    return Promise.all(queries);
  },

  // 連接池管理
  getConnection: () => {
    // 模擬連接池
    return Promise.resolve({ id: Date.now() });
  }
};

// 獲取卡片列表（優化版本）
router.get('/list', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, rarity, search } = req.query;
    const offset = (page - 1) * limit;
    
    // 生成緩存鍵
    const cacheKey = `cards:list:${page}:${limit}:${type || 'all'}:${rarity || 'all'}:${search || 'all'}`;
    
    // 嘗試從緩存獲取
    let cards = await advancedCacheService.get(cacheKey, 'apiResponse');
    
    if (!cards) {
      // logger.info('📊 從數據庫獲取卡片列表...');
      
      // 構建查詢條件
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (type) {
        whereClause += ' AND card_type = $' + (params.length + 1);
        params.push(type);
      }
      
      if (rarity) {
        whereClause += ' AND rarity = $' + (params.length + 1);
        params.push(rarity);
      }
      
      if (search) {
        whereClause += ' AND name ILIKE $' + (params.length + 1);
        params.push(`%${search}%`);
      }
      
      // 優化查詢
      const query = databaseOptimizer.optimizeQuery(
        `SELECT * FROM cards ${whereClause}`,
        { limit, offset, orderBy: 'created_at', order: 'DESC' }
      );
      
      // 模擬數據庫查詢結果
      cards = {
        data: [
          {
            id: 1,
            name: '優化測試卡片',
            type: type || 'Monster',
            rarity: rarity || 'Common',
            description: '這是一個優化測試卡片',
            created_at: new Date().toISOString()
          }
        ],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 100,
          totalPages: Math.ceil(100 / limit)
        }
      };
      
      // 緩存結果（5分鐘）
      await advancedCacheService.set(cacheKey, cards, 'apiResponse');
    }
    
    res.json({
      success: true,
      data: cards,
      cached: !!cards,
      performance: {
        responseTime: Date.now() - req.startTime,
        cacheHit: !!cards
      }
    });
    
  } catch (error) {
    // logger.info('❌ 獲取卡片列表失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取卡片列表失敗'
    });
  }
});

// 獲取卡片詳情（優化版本）
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `card:detail:${id}`;
    
    // 嘗試從緩存獲取
    let card = await advancedCacheService.get(cacheKey, 'apiResponse');
    
    if (!card) {
      // logger.info(`📊 從數據庫獲取卡片詳情: ${id}`);
      
      // 優化查詢 - 使用索引
      const query = `
        SELECT c.*, 
               md.price as current_price,
               md.date as last_updated
        FROM cards c
        LEFT JOIN market_data md ON c.id = md.card_id
        WHERE c.id = $1
        ORDER BY md.date DESC
        LIMIT 1
      `;
      
      // 模擬數據庫查詢結果
      card = {
        id: parseInt(id),
        name: '優化測試卡片詳情',
        type: 'Monster',
        rarity: 'Rare',
        description: '這是一個優化測試卡片的詳細信息',
        current_price: 150.00,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      // 緩存結果（10分鐘）
      await advancedCacheService.set(cacheKey, card, 'apiResponse');
    }
    
    res.json({
      success: true,
      data: card,
      cached: !!card,
      performance: {
        responseTime: Date.now() - req.startTime,
        cacheHit: !!card
      }
    });
    
  } catch (error) {
    // logger.info('❌ 獲取卡片詳情失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取卡片詳情失敗'
    });
  }
});

// 批量獲取卡片（優化版本）
router.post('/batch', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: '請提供有效的卡片ID列表'
      });
    }
    
    // 限制批量查詢數量
    const limitedIds = ids.slice(0, 50);
    
    // 生成緩存鍵
    const cacheKey = `cards:batch:${limitedIds.sort().join(',')}`;
    
    // 嘗試從緩存獲取
    let cards = await advancedCacheService.get(cacheKey, 'apiResponse');
    
    if (!cards) {
      // logger.info(`📊 批量從數據庫獲取卡片: ${limitedIds.length} 個`);
      
      // 優化批量查詢
      const placeholders = limitedIds.map((_, index) => `$${index + 1}`).join(',');
      const query = `
        SELECT * FROM cards 
        WHERE id IN (${placeholders})
        ORDER BY id
      `;
      
      // 模擬數據庫查詢結果
      cards = limitedIds.map(id => ({
        id: parseInt(id),
        name: `批量卡片 ${id}`,
        type: 'Monster',
        rarity: 'Common',
        description: `這是批量查詢的卡片 ${id}`,
        created_at: new Date().toISOString()
      }));
      
      // 緩存結果（5分鐘）
      await advancedCacheService.set(cacheKey, cards, 'apiResponse');
    }
    
    res.json({
      success: true,
      data: cards,
      cached: !!cards,
      performance: {
        responseTime: Date.now() - req.startTime,
        cacheHit: !!cards,
        batchSize: limitedIds.length
      }
    });
    
  } catch (error) {
    // logger.info('❌ 批量獲取卡片失敗:', error);
    res.status(500).json({
      success: false,
      error: '批量獲取卡片失敗'
    });
  }
});

// 搜索卡片（優化版本）
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 20 } = req.query;
    
    const cacheKey = `cards:search:${query}:${limit}`;
    
    // 嘗試從緩存獲取
    let results = await advancedCacheService.get(cacheKey, 'apiResponse');
    
    if (!results) {
      // logger.info(`🔍 搜索卡片: ${query}`);
      
      // 優化搜索查詢 - 使用全文搜索索引
      const searchQuery = `
        SELECT * FROM cards 
        WHERE name ILIKE $1 
           OR description ILIKE $1
        ORDER BY 
          CASE WHEN name ILIKE $1 THEN 1 ELSE 2 END,
          created_at DESC
        LIMIT $2
      `;
      
      // 模擬搜索結果
      results = [
        {
          id: 1,
          name: `包含 "${query}" 的卡片`,
          type: 'Monster',
          rarity: 'Common',
          description: `這是一個包含 "${query}" 的卡片描述`,
          created_at: new Date().toISOString()
        }
      ];
      
      // 緩存結果（3分鐘）
      await advancedCacheService.set(cacheKey, results, 'apiResponse');
    }
    
    res.json({
      success: true,
      data: results,
      cached: !!results,
      performance: {
        responseTime: Date.now() - req.startTime,
        cacheHit: !!results,
        query: query
      }
    });
    
  } catch (error) {
    // logger.info('❌ 搜索卡片失敗:', error);
    res.status(500).json({
      success: false,
      error: '搜索卡片失敗'
    });
  }
});

// 性能監控中間件
router.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

module.exports = router;
