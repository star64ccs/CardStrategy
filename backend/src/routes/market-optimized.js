const express = require('express');
const router = express.Router();
const advancedCacheService = require('../services/advancedCacheService');

// ?²å?å¸‚å ´è¶¨å‹¢ï¼ˆå„ª?–ç??¬ï?
router.get('/trends', async (req, res) => {
  try {
    const { days = 7, card_id } = req.query;
    const cacheKey = `market:trends:${days}:${card_id || 'all'}`;

    // ?—è©¦å¾žç·©å­˜ç²??    let trends = await advancedCacheService.get(cacheKey, 'marketData');

    if (!trends) {
      // logger.info(`?? å¾žæ•¸?šåº«?²å?å¸‚å ´è¶¨å‹¢: ${days} å¤©`);

      // ?ªå??¥è©¢ - ä½¿ç”¨ç´¢å??Œæ??“ç???      const query = `
        SELECT 
          md.card_id,
          c.name as card_name,
          md.price,
          md.date,
          AVG(md.price) OVER (
            PARTITION BY md.card_id 
            ORDER BY md.date 
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
          ) as moving_average_7d
        FROM market_data md
        JOIN cards c ON md.card_id = c.id
        WHERE md.date >= NOW() - INTERVAL '${days} days'
        ${card_id ? 'AND md.card_id = $1' : ''}
        ORDER BY md.date DESC, md.card_id
      `;

      // æ¨¡æ“¬å¸‚å ´è¶¨å‹¢?¸æ?
      trends = {
        period: `${days} å¤©`,
        data: [
          {
            card_id: card_id || 1,
            card_name: 'æ¸¬è©¦?¡ç?',
            current_price: 150.0,
            price_change: 5.5,
            price_change_percent: 3.8,
            moving_average_7d: 145.2,
            trend: 'up',
            last_updated: new Date().toISOString(),
          },
        ],
        summary: {
          total_cards: 1,
          average_price_change: 5.5,
          top_gainers: [],
          top_losers: [],
        },
      };

      // ç·©å?çµæ?ï¼??†é?ï¼Œå??ºå??´æ•¸?šè??–è?å¿«ï?
      await advancedCacheService.set(cacheKey, trends, 'marketData');
    }

    res.json({
      success: true,
      data: trends,
      cached: !!trends,
      performance: {
        responseTime: Date.now() - req.startTime,
        cacheHit: !!trends,
      },
    });
  } catch (error) {
    // logger.info('???²å?å¸‚å ´è¶¨å‹¢å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?²å?å¸‚å ´è¶¨å‹¢å¤±æ?',
    });
  }
});

// ?²å??¡ç??¹æ ¼æ­·å²ï¼ˆå„ª?–ç??¬ï?
router.get('/price-history/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    const { period = '30d' } = req.query;
    const cacheKey = `market:price-history:${cardId}:${period}`;

    // ?—è©¦å¾žç·©å­˜ç²??// eslint-disable-next-line no-unused-vars
    let history = await advancedCacheService.get(cacheKey, 'marketData');

    if (!history) {
      // logger.info(`?? å¾žæ•¸?šåº«?²å??¹æ ¼æ­·å²: ?¡ç? ${cardId}, ?Ÿé? ${period}`);

      // ?ªå??¥è©¢ - ä½¿ç”¨ç´¢å??Œæ??“ç???      const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
      const days = daysMap[period] || 30;

      const query = `
        SELECT 
          md.price,
          md.date,
          md.volume,
          md.source
        FROM market_data md
        WHERE md.card_id = $1
        AND md.date >= NOW() - INTERVAL '${days} days'
        ORDER BY md.date ASC
      `;

      // æ¨¡æ“¬?¹æ ¼æ­·å²?¸æ?
      const basePrice = 100;
// eslint-disable-next-line no-unused-vars
      const dataPoints = [];
// eslint-disable-next-line no-unused-vars
      const now = new Date();

      for (let i = days; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const price = basePrice + Math.sin(i * 0.1) * 20 + Math.random() * 10;

        dataPoints.push({
          date: date.toISOString().split('T')[0],
          price: parseFloat(price.toFixed(2)),
          volume: Math.floor(Math.random() * 100) + 10,
        });
      }

      history = {
        card_id: parseInt(cardId),
        period: period,
        data: dataPoints,
        statistics: {
          min_price: Math.min(...dataPoints.map((p) => p.price)),
          max_price: Math.max(...dataPoints.map((p) => p.price)),
          avg_price: parseFloat(
            (
              dataPoints.reduce((sum, p) => sum + p.price, 0) /
              dataPoints.length
            ).toFixed(2)
          ),
          price_change: parseFloat(
            (
              dataPoints[dataPoints.length - 1].price - dataPoints[0].price
            ).toFixed(2)
          ),
          price_change_percent: parseFloat(
            (
              ((dataPoints[dataPoints.length - 1].price - dataPoints[0].price) /
                dataPoints[0].price) *
              100
            ).toFixed(2)
          ),
        },
      };

      // ç·©å?çµæ?ï¼??†é?ï¼?      await advancedCacheService.set(cacheKey, history, 'marketData');
    }

    res.json({
      success: true,
      data: history,
      cached: !!history,
      performance: {
        responseTime: Date.now() - req.startTime,
        cacheHit: !!history,
      },
    });
  } catch (error) {
    // logger.info('???²å??¹æ ¼æ­·å²å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?²å??¹æ ¼æ­·å²å¤±æ?',
    });
  }
});

// ?¹é??²å?å¸‚å ´?¸æ?ï¼ˆå„ª?–ç??¬ï?
router.post('/batch-prices', async (req, res) => {
  try {
    const { card_ids } = req.body;

    if (!card_ids || !Array.isArray(card_ids) || card_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'è«‹æ?ä¾›æ??ˆç??¡ç?ID?—è¡¨',
      });
    }

    // ?åˆ¶?¹é??¥è©¢?¸é?
    const limitedIds = card_ids.slice(0, 100);
    const cacheKey = `market:batch-prices:${limitedIds.sort().join(',')}`;

    // ?—è©¦å¾žç·©å­˜ç²??// eslint-disable-next-line no-unused-vars
    let prices = await advancedCacheService.get(cacheKey, 'marketData');

    if (!prices) {
      // logger.info(`?? ?¹é??²å?å¸‚å ´?¹æ ¼: ${limitedIds.length} ?‹å¡?‡`);

      // ?ªå??¹é??¥è©¢
      const placeholders = limitedIds
        .map((_, index) => `$${index + 1}`)
        .join(',');
      const query = `
        SELECT 
          md.card_id,
          md.price,
          md.date,
          c.name as card_name
        FROM market_data md
        JOIN cards c ON md.card_id = c.id
        WHERE md.card_id IN (${placeholders})
        AND md.date = (
          SELECT MAX(date) 
          FROM market_data 
          WHERE card_id = md.card_id
        )
        ORDER BY md.card_id
      `;

      // æ¨¡æ“¬?¹é??¹æ ¼?¸æ?
      prices = limitedIds.map((id) => ({
        card_id: parseInt(id),
        card_name: `?¡ç? ${id}`,
        price: parseFloat((100 + Math.random() * 200).toFixed(2)),
        date: new Date().toISOString(),
        change_24h: parseFloat((Math.random() * 20 - 10).toFixed(2)),
        change_percent_24h: parseFloat((Math.random() * 10 - 5).toFixed(2)),
      }));

      // ç·©å?çµæ?ï¼??†é?ï¼?      await advancedCacheService.set(cacheKey, prices, 'marketData');
    }

    res.json({
      success: true,
      data: prices,
      cached: !!prices,
      performance: {
        responseTime: Date.now() - req.startTime,
        cacheHit: !!prices,
        batchSize: limitedIds.length,
      },
    });
  } catch (error) {
    // logger.info('???¹é??²å?å¸‚å ´?¹æ ¼å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?¹é??²å?å¸‚å ´?¹æ ¼å¤±æ?',
    });
  }
});

// ?²å?å¸‚å ´çµ±è?ï¼ˆå„ª?–ç??¬ï?
router.get('/statistics', async (req, res) => {
  try {
    const cacheKey = 'market:statistics';

    // ?—è©¦å¾žç·©å­˜ç²??    let statistics = await advancedCacheService.get(cacheKey, 'marketData');

    if (!statistics) {
      // logger.info('?? å¾žæ•¸?šåº«?²å?å¸‚å ´çµ±è?');

      // ?ªå?çµ±è??¥è©¢
      const query = `
        SELECT 
          COUNT(DISTINCT md.card_id) as total_cards,
          AVG(md.price) as average_price,
          MIN(md.price) as min_price,
          MAX(md.price) as max_price,
          COUNT(*) as total_transactions,
          SUM(md.volume) as total_volume
        FROM market_data md
        WHERE md.date >= NOW() - INTERVAL '24 hours'
      `;

      // æ¨¡æ“¬å¸‚å ´çµ±è??¸æ?
      statistics = {
        total_cards: 1250,
        average_price: 85.5,
        min_price: 5.0,
        max_price: 1500.0,
        total_transactions: 15420,
        total_volume: 1250000,
        top_movers: [
          { card_id: 1, name: '?±é??¡ç?1', change: 25.5, change_percent: 15.2 },
          {
            card_id: 2,
            name: '?±é??¡ç?2',
            change: -12.3,
            change_percent: -8.1,
          },
        ],
        market_sentiment: 'bullish',
        last_updated: new Date().toISOString(),
      };

      // ç·©å?çµæ?ï¼??†é?ï¼?      await advancedCacheService.set(cacheKey, statistics, 'marketData');
    }

    res.json({
      success: true,
      data: statistics,
      cached: !!statistics,
      performance: {
        responseTime: Date.now() - req.startTime,
        cacheHit: !!statistics,
      },
    });
  } catch (error) {
    // logger.info('???²å?å¸‚å ´çµ±è?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?²å?å¸‚å ´çµ±è?å¤±æ?',
    });
  }
});

// ?§èƒ½??Ž§ä¸­é?ä»?router.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

module.exports = router;
