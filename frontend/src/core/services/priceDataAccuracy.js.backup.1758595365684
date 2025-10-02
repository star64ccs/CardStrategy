// 價格數據準確性服務
import { Pool } from 'pg';
import axios from 'axios';

class PriceDataAccuracy {
  constructor() {
    this.db = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'cardstrategy',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432
    });

    this.dataSources = [
      {
        name: 'eBay',
        api: process.env.EBAY_API_URL,
        weight: 0.4,
        reliability: 0.9
      },
      {
        name: 'TCGPlayer',
        api: process.env.TCGPLAYER_API_URL,
        weight: 0.3,
        reliability: 0.95
      },
      {
        name: 'CardMarket',
        api: process.env.CARDMARKET_API_URL,
        weight: 0.2,
        reliability: 0.85
      },
      {
        name: 'LocalMarket',
        api: process.env.LOCAL_MARKET_API_URL,
        weight: 0.1,
        reliability: 0.8
      }
    ];
  }

  // 獲取多源價格數據
  async getMultiSourcePrices(cardId) {
    const results = [];

    for (const source of this.dataSources) {
      try {
        const price = await this.fetchPriceFromSource(source, cardId);
        if (price) {
          results.push({
            source: source.name,
            price: price.value,
            currency: price.currency,
            timestamp: price.timestamp,
            weight: source.weight,
            reliability: source.reliability
          });
        }
      } catch (error) {
        console.warn(`從 ${source.name} 獲取價格失敗:`, error.message);
      }
    }

    return results;
  }

  // 從單個數據源獲取價格
  async fetchPriceFromSource(source, cardId) {
    const card = await this.getCardInfo(cardId);
    if (!card) return null;

    const params = {
      cardName: card.name,
      series: card.series,
      rarity: card.rarity
    };

    const response = await axios.get(source.api, {
      params,
      timeout: 10000
    });

    return this.parsePriceResponse(response.data, source.name);
  }

  // 解析價格響應
  parsePriceResponse(data, sourceName) {
    switch (sourceName) {
      case 'eBay':
        return this.parseEbayResponse(data);
      case 'TCGPlayer':
        return this.parseTCGPlayerResponse(data);
      case 'CardMarket':
        return this.parseCardMarketResponse(data);
      default:
        return this.parseGenericResponse(data);
    }
  }

  // 解析 eBay 響應
  parseEbayResponse(data) {
    if (!data.items || data.items.length === 0) return null;

    const prices = data.items
      .filter(item => item.sellingStatus && item.sellingStatus.currentPrice)
      .map(item => ({
        value: parseFloat(item.sellingStatus.currentPrice.value),
        currency: item.sellingStatus.currentPrice.currencyId,
        condition: item.condition?.conditionDisplayName,
        timestamp: new Date(item.listingInfo?.endTime)
      }));

    if (prices.length === 0) return null;

    // 計算中位數價格
    const sortedPrices = prices.map(p => p.value).sort((a, b) => a - b);
    const median = sortedPrices[Math.floor(sortedPrices.length / 2)];

    return {
      value: median,
      currency: prices[0].currency,
      timestamp: new Date(),
      sampleSize: prices.length
    };
  }

  // 解析 TCGPlayer 響應
  parseTCGPlayerResponse(data) {
    if (!data.results || data.results.length === 0) return null;

    const prices = data.results.map(item => ({
      value: item.marketPrice || item.lowPrice || item.midPrice,
      currency: 'USD',
      condition: item.condition,
      timestamp: new Date()
    }));

    const avgPrice = prices.reduce((sum, p) => sum + p.value, 0) / prices.length;

    return {
      value: avgPrice,
      currency: 'USD',
      timestamp: new Date(),
      sampleSize: prices.length
    };
  }

  // 解析 CardMarket 響應
  parseCardMarketResponse(data) {
    if (!data.products || data.products.length === 0) return null;

    const prices = data.products
      .flatMap(product => product.articles || [])
      .filter(article => article.price)
      .map(article => ({
        value: parseFloat(article.price),
        currency: 'EUR',
        condition: article.condition,
        timestamp: new Date()
      }));

    if (prices.length === 0) return null;

    const avgPrice = prices.reduce((sum, p) => sum + p.value, 0) / prices.length;

    return {
      value: avgPrice,
      currency: 'EUR',
      timestamp: new Date(),
      sampleSize: prices.length
    };
  }

  // 解析通用響應
  parseGenericResponse(data) {
    if (!data.price) return null;

    return {
      value: parseFloat(data.price),
      currency: data.currency || 'USD',
      timestamp: new Date(data.timestamp || Date.now()),
      sampleSize: 1
    };
  }

  // 驗證價格數據
  validatePriceData(price) {
    const errors = [];

    if (!price.value || price.value <= 0) {
      errors.push('價格必須大於 0');
    }

    if (!price.currency || !['USD', 'EUR', 'GBP', 'JPY', 'CNY'].includes(price.currency)) {
      errors.push('無效的貨幣類型');
    }

    if (!price.timestamp || new Date(price.timestamp) > new Date()) {
      errors.push('無效的時間戳');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 計算加權平均價格
  calculateWeightedAverage(prices) {
    if (prices.length === 0) return null;

    let totalWeight = 0;
    let weightedSum = 0;

    prices.forEach(price => {
      const weight = price.weight * price.reliability;
      weightedSum += price.price * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : null;
  }

  // 檢測價格異常
  detectPriceAnomalies(prices) {
    if (prices.length < 3) return [];

    const values = prices.map(p => p.price).sort((a, b) => a - b);
    const q1 = values[Math.floor(values.length * 0.25)];
    const q3 = values[Math.floor(values.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return prices.filter(price => 
      price.price < lowerBound || price.price > upperBound
    );
  }

  // 獲取卡牌信息
  async getCardInfo(cardId) {
    const result = await this.db.query(
      'SELECT id, name, series, rarity FROM cards WHERE id = $1',
      [cardId]
    );
    return result.rows[0] || null;
  }

  // 保存價格數據
  async savePriceData(cardId, prices) {
    const validatedPrices = prices.filter(price => 
      this.validatePriceData(price).valid
    );

    for (const price of validatedPrices) {
      await this.db.query(
        `INSERT INTO market_data (card_id, price, currency, source, date, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (card_id, source, date) 
         DO UPDATE SET price = $2, updated_at = NOW()`,
        [cardId, price.price, price.currency, price.source, new Date(price.timestamp)]
      );
    }
  }

  // 實時更新價格
  async updateRealTimePrices(cardIds) {
    const results = [];

    for (const cardId of cardIds) {
      try {
        const prices = await this.getMultiSourcePrices(cardId);
        if (prices.length > 0) {
          await this.savePriceData(cardId, prices);
          results.push({
            cardId,
            success: true,
            priceCount: prices.length
          });
        }
      } catch (error) {
        results.push({
          cardId,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }
}

export default new PriceDataAccuracy();
