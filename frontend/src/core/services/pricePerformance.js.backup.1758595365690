// 價格查詢性能優化服務
import { Pool } from 'pg';
import Redis from 'ioredis';

class PricePerformance {
  constructor() {
    this.db = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'cardstrategy',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432
    });

    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: 0
    });

    this.cacheConfig = {
      ttl: 300, // 5分鐘
      maxSize: 1000,
      keyPrefix: 'price:'
    };
  }

  // 獲取緩存的價格
  async getCachedPrice(cardId) {
    try {
      const key = `${this.cacheConfig.keyPrefix}${cardId}`;
      const cached = await this.redis.get(key);
      
      if (cached) {
        return JSON.parse(cached);
      }
      
      return null;
    } catch (error) {
      console.warn('緩存讀取失敗:', error);
      return null;
    }
  }

  // 設置價格緩存
  async setCachedPrice(cardId, priceData) {
    try {
      const key = `${this.cacheConfig.keyPrefix}${cardId}`;
      await this.redis.setex(key, this.cacheConfig.ttl, JSON.stringify(priceData));
    } catch (error) {
      console.warn('緩存設置失敗:', error);
    }
  }

  // 分頁查詢價格
  async getPaginatedPrices(cardId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        md.id,
        md.price,
        md.currency,
        md.source,
        md.date,
        md.created_at
      FROM market_data md
      WHERE md.card_id = $1
      ORDER BY md.date DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await this.db.query(query, [cardId, limit, offset]);
    return result.rows;
  }

  // 懶加載價格數據
  async lazyLoadPrices(cardIds, batchSize = 10) {
    const results = [];
    
    for (let i = 0; i < cardIds.length; i += batchSize) {
      const batch = cardIds.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(cardId => this.getCardPrice(cardId))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  // 獲取卡牌價格
  async getCardPrice(cardId) {
    try {
      // 1. 檢查緩存
      const cached = await this.getCachedPrice(cardId);
      if (cached) {
        return { ...cached, fromCache: true };
      }

      // 2. 從數據庫獲取
      const query = `
        SELECT 
          c.id,
          c.name,
          c.series,
          c.rarity,
          AVG(md.price) as avg_price,
          MIN(md.price) as min_price,
          MAX(md.price) as max_price,
          COUNT(md.id) as price_count,
          md.currency
        FROM cards c
        LEFT JOIN market_data md ON c.id = md.card_id
        WHERE c.id = $1 AND md.date >= NOW() - INTERVAL '30 days'
        GROUP BY c.id, c.name, c.series, c.rarity, md.currency
      `;

      const result = await this.db.query(query, [cardId]);
      const priceData = result.rows[0];

      if (priceData) {
        const formattedData = {
          cardId: priceData.id,
          name: priceData.name,
          series: priceData.series,
          rarity: priceData.rarity,
          currentPrice: {
            average: parseFloat(priceData.avg_price) || 0,
            minimum: parseFloat(priceData.min_price) || 0,
            maximum: parseFloat(priceData.max_price) || 0,
            currency: priceData.currency || 'USD',
            sampleSize: parseInt(priceData.price_count) || 0
          },
          timestamp: new Date(),
          fromCache: false
        };

        // 3. 緩存結果
        await this.setCachedPrice(cardId, formattedData);
        
        return formattedData;
      }

      return null;
    } catch (error) {
      console.error('獲取卡牌價格失敗:', error);
      return null;
    }
  }

  // 批量獲取價格
  async getBatchPrices(cardIds) {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.series,
        c.rarity,
        AVG(md.price) as avg_price,
        MIN(md.price) as min_price,
        MAX(md.price) as max_price,
        COUNT(md.id) as price_count,
        md.currency
      FROM cards c
      LEFT JOIN market_data md ON c.id = md.card_id
      WHERE c.id = ANY($1) AND md.date >= NOW() - INTERVAL '30 days'
      GROUP BY c.id, c.name, c.series, c.rarity, md.currency
      ORDER BY c.name
    `;

    const result = await this.db.query(query, [cardIds]);
    
    return result.rows.map(row => ({
      cardId: row.id,
      name: row.name,
      series: row.series,
      rarity: row.rarity,
      currentPrice: {
        average: parseFloat(row.avg_price) || 0,
        minimum: parseFloat(row.min_price) || 0,
        maximum: parseFloat(row.max_price) || 0,
        currency: row.currency || 'USD',
        sampleSize: parseInt(row.price_count) || 0
      }
    }));
  }

  // 優化數據庫查詢
  async optimizeDatabaseQueries() {
    // 創建索引
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_market_data_card_id ON market_data(card_id)',
      'CREATE INDEX IF NOT EXISTS idx_market_data_date ON market_data(date)',
      'CREATE INDEX IF NOT EXISTS idx_market_data_source ON market_data(source)',
      'CREATE INDEX IF NOT EXISTS idx_cards_series ON cards(series)',
      'CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity)'
    ];

    for (const indexQuery of indexes) {
      try {
        await this.db.query(indexQuery);
        console.log('索引創建成功');
      } catch (error) {
        console.warn('索引創建失敗:', error.message);
      }
    }
  }

  // 清理過期數據
  async cleanupExpiredData() {
    const query = `
      DELETE FROM market_data 
      WHERE date < NOW() - INTERVAL '1 year'
    `;

    const result = await this.db.query(query);
    console.log(`清理了 ${result.rowCount} 條過期價格數據`);
  }

  // 預加載熱門卡牌價格
  async preloadPopularCardPrices() {
    const query = `
      SELECT c.id
      FROM cards c
      LEFT JOIN market_data md ON c.id = md.card_id
      WHERE md.date >= NOW() - INTERVAL '7 days'
      GROUP BY c.id
      ORDER BY COUNT(md.id) DESC
      LIMIT 100
    `;

    const result = await this.db.query(query);
    const cardIds = result.rows.map(row => row.id);

    // 預加載到緩存
    const prices = await this.getBatchPrices(cardIds);
    
    for (const price of prices) {
      await this.setCachedPrice(price.cardId, price);
    }

    console.log(`預加載了 ${prices.length} 張熱門卡牌的價格`);
  }
}

export default new PricePerformance();
