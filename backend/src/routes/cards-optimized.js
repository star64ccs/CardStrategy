const express = require('express');'
const router = express.Router();''
const advancedCacheService = require('../services/advancedCacheService');

// 模擬?��?Library優?�器
// eslint-disable-next-line no-unused-vars
const databaseOptimizer = {
  // ?�詢?��?
  optimizeQuery: (query, options = {}) => {
    const {
      limit = 20,'
      offset = 0,''
      orderBy = 'created_at',''
      order = 'DESC',
    } = options;'
    // 添�? LIMIT ??OFFSET''
    if (!query.includes('LIMIT')) {
      query += ` LIMIT ${limit} OFFSET ${offset}`;'
    }
    // 添�? ORDER BY''
    if (!query.includes('ORDER BY')) {
      query += ` ORDER BY ${orderBy} ${order}`;
    }
    return query;
  },

  // ?��??�詢?��?
  batchQueries: (queries) => {
    return Promise.all(queries);
  },

  // ??��池管??  getConnection: () => {
    // 模擬??���?    return Promise.resolve({ id: Date.now() });
  },
};'
// ?��??��??�Table（優?��??��?''
router.get('/list', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, rarity, search } = req.query;'
    const offset = (page - 1) * limit;''
    // ?��?緩�???    const cacheKey = `cards:list:${page}:${limit}:${type || 'all'}:${rarity || 'all'}:${search || 'all'}`;''
    // ?�試從Cache獲??    let cards = await advancedCacheService.get(cacheKey, 'apiResponse');'
    if (!cards) {''
      // logger.info('?? 從數?�Library?��??��??�Table...');'
      // Build?�詢Condition''
      let whereClause = 'WHERE 1=1';
      const params = [];'
      if (type) {''
        whereClause += ' AND card_type = $' + (params.length + 1);
        params.push(type);'
      }
      if (rarity) {''
        whereClause += ' AND rarity = $' + (params.length + 1);
        params.push(rarity);'
      }
      if (search) {''
        whereClause += ' AND name ILIKE $' + (params.length + 1);
        params.push(`%${search}%`);
      }
      // ?��??�詢
      const query = databaseOptimizer.optimizeQuery('
        `SELECT * FROM cards ${whereClause}`,''
        { limit, offset, orderBy: 'created_at', order: 'DESC' }
      );

      // 模擬?��?LibraryQuery�???      cards = {
        data: [
          {'
            id: 1,''
            name: '?��?測試?��?',''
            type: type || 'Monster',''
            rarity: rarity || 'Common',''
            description: '?�是一?�優?�測試卡??,
            created_at: new Date().toISOString(),
          },
        ],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 100,
          totalPages: Math.ceil(100 / limit),
        },'
      };''
      // 緩�?結�?�??��?�?      await advancedCacheService.set(cacheKey, cards, 'apiResponse');
    }
    res.json({
      success: true,
      data: cards,
      cached: !!cards,
      performance: {
        responseTime: Date.now() - req.startTime,
        cacheHit: !!cards,
      },
    });'
  } catch (error) {''
    // logger.info('???��??��??�Table失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?��??��??�表失�?',
    });
  }
});'
// ?��??��?詳�?（優?��??��?''
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;'
    const cacheKey = `card:detail:${id}`;''
    // ?�試從Cache獲??    let card = await advancedCacheService.get(cacheKey, 'apiResponse');

    if (!card) {
      // logger.info(`?? 從數?�Library?��??��?詳�?: ${id}`);

      // ?��??�詢 - 使用索�?
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

      // 模擬?��?LibraryQuery�???      card = {'
        id: parseInt(id),''
        name: '?��?測試?��?詳�?',''
        type: 'Monster',''
        rarity: 'Rare',''
        description: '?�是一?�優?�測試卡?��?詳細信息',
        current_price: 150.0,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),'
      };''
      // 緩�?結�?�?0?��?�?      await advancedCacheService.set(cacheKey, card, 'apiResponse');
    }
    res.json({
      success: true,
      data: card,
      cached: !!card,
      performance: {
        responseTime: Date.now() - req.startTime,
        cacheHit: !!card,
      },
    });'
  } catch (error) {''
    // logger.info('???��??��?詳�?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?��??��?詳�?失�?',
    });
  }
});'
// ?��??��??��?（優?��??��?''
router.post('/batch', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({'
        success: false,''
        error: '請�?供�??��??��?ID?�表',
      });
    }
    // ?�制?��??�詢?��?'
    const limitedIds = ids.slice(0, 50);''
    // ?��?緩�???    const cacheKey = `cards:batch:${limitedIds.sort().join(',')}`;''
    // ?�試從Cache獲??    let cards = await advancedCacheService.get(cacheKey, 'apiResponse');

    if (!cards) {
      // logger.info(`?? ?��?從數?�Library?��??��?: ${limitedIds.length} ?�`);

      // ?��??��??�詢
      const placeholders = limitedIds'
        .map((_, index) => `$${index + 1}`)''
        .join(',');
      const query = `
        SELECT * FROM cards 
        WHERE id IN (${placeholders});
        ORDER BY id
      `;

      // 模擬?��?LibraryQuery�???      cards = limitedIds.map((id) => ({
        id: parseInt(id),'
        name: `?��??��? ${id}`,''
        type: 'Monster',''
        rarity: 'Common',
        description: `?�是?��??�詢?�卡??${id}`,
        created_at: new Date().toISOString(),'
      }));''
      // 緩�?結�?�??��?�?      await advancedCacheService.set(cacheKey, cards, 'apiResponse');
    }
    res.json({
      success: true,
      data: cards,
      cached: !!cards,
      performance: {
        responseTime: Date.now() - req.startTime,
        cacheHit: !!cards,
        batchSize: limitedIds.length,
      },
    });'
  } catch (error) {''
    // logger.info('???��??��??��?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?��??��??��?失�?',
    });
  }
});'
// ?�索?��?（優?��??��?''
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 20 } = req.query;

    const cacheKey = `cards:search:${query}:${limit}`;'
    // ?�試從Cache獲??// eslint-disable-next-line no-unused-vars''
    let results = await advancedCacheService.get(cacheKey, 'apiResponse');

    if (!results) {
      // logger.info(`?? ?�索?��?: ${query}`);

      // ?��??�索?�詢 - 使用?��??�索索�?
      const searchQuery = `
        SELECT * FROM cards 
        WHERE name ILIKE $1 
           OR description ILIKE $1
        ORDER BY 
          CASE WHEN name ILIKE $1 THEN 1 ELSE 2 END,
          created_at DESC
        LIMIT $2
      `;

      // 模擬?�索結�?
      results = [
        {
          id: 1,'
          name: `?�含 "${query}" ?�卡?�`,''
          type: 'Monster',''
          rarity: 'Common',
          description: `?�是一?��???"${query}" ?�卡?��?述`,
          created_at: new Date().toISOString(),
        },'
      ];''
      // 緩�?結�?�??��?�?      await advancedCacheService.set(cacheKey, results, 'apiResponse');
    }
    res.json({
      success: true,
      data: results,
      cached: !!results,
      performance: {
        responseTime: Date.now() - req.startTime,
        cacheHit: !!results,
        query: query,
      },
    });'
  } catch (error) {''
    // logger.info('???�索?��?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?�索?��?失�?',
    });
  }
});

// ?�能??��中�?�?router.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});'
module.exports = router;''