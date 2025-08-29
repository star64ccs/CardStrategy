const express = require('express');
const router = express.Router();
const advancedCacheService = require('../services/advancedCacheService');

// æ¨¡æ“¬?¸æ?åº«å„ª?–å™¨
// eslint-disable-next-line no-unused-vars
const databaseOptimizer = {
  // ?¥è©¢?ªå?
  optimizeQuery: (query, options = {}) => {
    const {
      limit = 20,
      offset = 0,
      orderBy = 'created_at',
      order = 'DESC',
    } = options;

    // æ·»å? LIMIT ??OFFSET
    if (!query.includes('LIMIT')) {
      query += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    // æ·»å? ORDER BY
    if (!query.includes('ORDER BY')) {
      query += ` ORDER BY ${orderBy} ${order}`;
    }

    return query;
  },

  // ?¹é??¥è©¢?ªå?
  batchQueries: (queries) => {
    return Promise.all(queries);
  },

  // ??Ž¥æ± ç®¡??  getConnection: () => {
    // æ¨¡æ“¬??Ž¥æ±?    return Promise.resolve({ id: Date.now() });
  },
};

// ?²å??¡ç??—è¡¨ï¼ˆå„ª?–ç??¬ï?
router.get('/list', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, rarity, search } = req.query;
    const offset = (page - 1) * limit;

    // ?Ÿæ?ç·©å???    const cacheKey = `cards:list:${page}:${limit}:${type || 'all'}:${rarity || 'all'}:${search || 'all'}`;

    // ?—è©¦å¾žç·©å­˜ç²??    let cards = await advancedCacheService.get(cacheKey, 'apiResponse');

    if (!cards) {
      // logger.info('?? å¾žæ•¸?šåº«?²å??¡ç??—è¡¨...');

      // æ§‹å»º?¥è©¢æ¢ä»¶
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

      // ?ªå??¥è©¢
      const query = databaseOptimizer.optimizeQuery(
        `SELECT * FROM cards ${whereClause}`,
        { limit, offset, orderBy: 'created_at', order: 'DESC' }
      );

      // æ¨¡æ“¬?¸æ?åº«æŸ¥è©¢ç???      cards = {
        data: [
          {
            id: 1,
            name: '?ªå?æ¸¬è©¦?¡ç?',
            type: type || 'Monster',
            rarity: rarity || 'Common',
            description: '?™æ˜¯ä¸€?‹å„ª?–æ¸¬è©¦å¡??,
            created_at: new Date().toISOString(),
          },
        ],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 100,
          totalPages: Math.ceil(100 / limit),
        },
      };

      // ç·©å?çµæ?ï¼??†é?ï¼?      await advancedCacheService.set(cacheKey, cards, 'apiResponse');
    }

    res.json({
      success: true,
      data: cards,
      cached: !!cards,
      performance: {
        responseTime: Date.now() - req.startTime,
        cacheHit: !!cards,
      },
    });
  } catch (error) {
    // logger.info('???²å??¡ç??—è¡¨å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?²å??¡ç??—è¡¨å¤±æ?',
    });
  }
});

// ?²å??¡ç?è©³æ?ï¼ˆå„ª?–ç??¬ï?
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `card:detail:${id}`;

    // ?—è©¦å¾žç·©å­˜ç²??    let card = await advancedCacheService.get(cacheKey, 'apiResponse');

    if (!card) {
      // logger.info(`?? å¾žæ•¸?šåº«?²å??¡ç?è©³æ?: ${id}`);

      // ?ªå??¥è©¢ - ä½¿ç”¨ç´¢å?
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

      // æ¨¡æ“¬?¸æ?åº«æŸ¥è©¢ç???      card = {
        id: parseInt(id),
        name: '?ªå?æ¸¬è©¦?¡ç?è©³æ?',
        type: 'Monster',
        rarity: 'Rare',
        description: '?™æ˜¯ä¸€?‹å„ª?–æ¸¬è©¦å¡?‡ç?è©³ç´°ä¿¡æ¯',
        current_price: 150.0,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      // ç·©å?çµæ?ï¼?0?†é?ï¼?      await advancedCacheService.set(cacheKey, card, 'apiResponse');
    }

    res.json({
      success: true,
      data: card,
      cached: !!card,
      performance: {
        responseTime: Date.now() - req.startTime,
        cacheHit: !!card,
      },
    });
  } catch (error) {
    // logger.info('???²å??¡ç?è©³æ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?²å??¡ç?è©³æ?å¤±æ?',
    });
  }
});

// ?¹é??²å??¡ç?ï¼ˆå„ª?–ç??¬ï?
router.post('/batch', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'è«‹æ?ä¾›æ??ˆç??¡ç?ID?—è¡¨',
      });
    }

    // ?åˆ¶?¹é??¥è©¢?¸é?
    const limitedIds = ids.slice(0, 50);

    // ?Ÿæ?ç·©å???    const cacheKey = `cards:batch:${limitedIds.sort().join(',')}`;

    // ?—è©¦å¾žç·©å­˜ç²??    let cards = await advancedCacheService.get(cacheKey, 'apiResponse');

    if (!cards) {
      // logger.info(`?? ?¹é?å¾žæ•¸?šåº«?²å??¡ç?: ${limitedIds.length} ?‹`);

      // ?ªå??¹é??¥è©¢
      const placeholders = limitedIds
        .map((_, index) => `$${index + 1}`)
        .join(',');
      const query = `
        SELECT * FROM cards 
        WHERE id IN (${placeholders})
        ORDER BY id
      `;

      // æ¨¡æ“¬?¸æ?åº«æŸ¥è©¢ç???      cards = limitedIds.map((id) => ({
        id: parseInt(id),
        name: `?¹é??¡ç? ${id}`,
        type: 'Monster',
        rarity: 'Common',
        description: `?™æ˜¯?¹é??¥è©¢?„å¡??${id}`,
        created_at: new Date().toISOString(),
      }));

      // ç·©å?çµæ?ï¼??†é?ï¼?      await advancedCacheService.set(cacheKey, cards, 'apiResponse');
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
    });
  } catch (error) {
    // logger.info('???¹é??²å??¡ç?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?¹é??²å??¡ç?å¤±æ?',
    });
  }
});

// ?œç´¢?¡ç?ï¼ˆå„ª?–ç??¬ï?
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 20 } = req.query;

    const cacheKey = `cards:search:${query}:${limit}`;

    // ?—è©¦å¾žç·©å­˜ç²??// eslint-disable-next-line no-unused-vars
    let results = await advancedCacheService.get(cacheKey, 'apiResponse');

    if (!results) {
      // logger.info(`?? ?œç´¢?¡ç?: ${query}`);

      // ?ªå??œç´¢?¥è©¢ - ä½¿ç”¨?¨æ??œç´¢ç´¢å?
      const searchQuery = `
        SELECT * FROM cards 
        WHERE name ILIKE $1 
           OR description ILIKE $1
        ORDER BY 
          CASE WHEN name ILIKE $1 THEN 1 ELSE 2 END,
          created_at DESC
        LIMIT $2
      `;

      // æ¨¡æ“¬?œç´¢çµæ?
      results = [
        {
          id: 1,
          name: `?…å« "${query}" ?„å¡?‡`,
          type: 'Monster',
          rarity: 'Common',
          description: `?™æ˜¯ä¸€?‹å???"${query}" ?„å¡?‡æ?è¿°`,
          created_at: new Date().toISOString(),
        },
      ];

      // ç·©å?çµæ?ï¼??†é?ï¼?      await advancedCacheService.set(cacheKey, results, 'apiResponse');
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
    });
  } catch (error) {
    // logger.info('???œç´¢?¡ç?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?œç´¢?¡ç?å¤±æ?',
    });
  }
});

// ?§èƒ½??Ž§ä¸­é?ä»?router.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

module.exports = router;
