#!/usr/bin/env node

/**
 * eBay One Piece Data Collector
 * 使用eBay API收集One Piece卡片數據
 */

const axios = require('axios');
const { Pool } = require('pg');
const ebayTokenManager = require('./scripts/ebay-token-auto-refresh');

class EbayOnePieceCollector {
  constructor() {
    this.pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'cardstrategy_test',
      password: 'PostgresAdmin123!',
      port: 5433,
    });

    // eBay API 配置
    this.ebayConfig = {
      // 使用eBay Browse API
      baseUrl: 'https://api.ebay.com/buy/browse/v1',
      headers: {
        'Content-Type': 'application/json',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        Accept: 'application/json',
      },
    };

    // 目標系列配置
    this.targetSeries = [
      {
        code: 'OP-13',
        name: 'Thousand-Year Blood War',
        expectedCards: 121,
        searchTerms: [
          'One Piece OP-13',
          'One Piece Thousand Year Blood War',
          'OP13',
        ],
      },
      {
        code: 'PRB-01',
        name: 'Premium Booster 1',
        expectedCards: 50,
        searchTerms: [
          'One Piece PRB-01',
          'One Piece Premium Booster 1',
          'PRB01',
        ],
      },
      {
        code: 'PRB-02',
        name: 'Premium Booster 2',
        expectedCards: 50,
        searchTerms: [
          'One Piece PRB-02',
          'One Piece Premium Booster 2',
          'PRB02',
        ],
      },
      {
        code: 'PRB-03',
        name: 'Premium Booster 3',
        expectedCards: 50,
        searchTerms: [
          'One Piece PRB-03',
          'One Piece Premium Booster 3',
          'PRB03',
        ],
      },
      {
        code: 'EB-03',
        name: 'Extra Booster: Film Red',
        expectedCards: 61,
        searchTerms: ['One Piece EB-03', 'One Piece Film Red', 'EB03'],
      },
      {
        code: 'EB-04',
        name: 'Extra Booster: Film Gold',
        expectedCards: 61,
        searchTerms: ['One Piece EB-04', 'One Piece Film Gold', 'EB04'],
      },
      {
        code: 'EB-05',
        name: 'Extra Booster: Film Stampede',
        expectedCards: 61,
        searchTerms: ['One Piece EB-05', 'One Piece Film Stampede', 'EB05'],
      },
      {
        code: 'OP-08',
        name: 'Legacy of the Master',
        expectedCards: 119,
        searchTerms: ['One Piece OP-08', 'One Piece Legacy Master', 'OP08'],
      },
    ];

    this.stats = {
      totalSeries: 0,
      processedSeries: 0,
      totalCards: 0,
      successCount: 0,
      failCount: 0,
    };
  }

  async initialize() {
    console.log('🚀 eBay One Piece數據收集器初始化...');
    try {
      await this.testDatabaseConnection();
      console.log('✅ 數據庫連接成功');

      // 初始化eBay Token管理器
      console.log('🔑 初始化eBay Token管理器...');
      await ebayTokenManager.initialize();

      await this.testEbayConnection();
      return true;
    } catch (error) {
      console.error('❌ 初始化失敗:', error.message);
      return false;
    }
  }

  async testDatabaseConnection() {
    const client = await this.pool.connect();
    try {
      await client.query('SELECT 1');
    } finally {
      client.release();
    }
  }

  async testEbayConnection() {
    try {
      // 獲取有效的Access Token
      const accessToken = await ebayTokenManager.getValidAccessToken();

      const headers = {
        ...this.ebayConfig.headers,
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await axios.get(
        `${this.ebayConfig.baseUrl}/item_summary/search?q=One Piece`,
        {
          headers: headers,
          timeout: 10000,
        }
      );

      if (response.status === 200) {
        console.log('✅ eBay API連接成功');
        return true;
      }
    } catch (error) {
      console.error(
        '❌ eBay API連接失敗:',
        error.response?.status || error.message
      );
      if (error.response?.status === 401) {
        console.log('🔑 Token無效，嘗試刷新...');
        try {
          await ebayTokenManager.refreshToken();
          console.log('✅ Token刷新成功，重新測試連接');
          return await this.testEbayConnection();
        } catch (refreshError) {
          console.error('❌ Token刷新失敗:', refreshError.message);
        }
      }
      return false;
    }
  }

  async searchEbayCards(series, searchTerm) {
    console.log(`\n🔍 搜索eBay: ${searchTerm} (${series.code})`);

    try {
      // 獲取有效的Access Token
      const accessToken = await ebayTokenManager.getValidAccessToken();

      const headers = {
        ...this.ebayConfig.headers,
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await axios.get(
        `${this.ebayConfig.baseUrl}/item_summary/search`,
        {
          headers: headers,
          params: {
            q: searchTerm,
            limit: 200, // 每次最多200個結果
            filter: 'conditionIds:{3000|4000|5000}', // 新品、極佳、良好
            sort: 'price',
            category_ids: '38292', // 交易卡片類別
          },
          timeout: 30000,
        }
      );

      if (response.data && response.data.itemSummaries) {
        console.log(`   📦 找到 ${response.data.itemSummaries.length} 個商品`);
        return response.data.itemSummaries;
      }
    } catch (error) {
      console.error(
        `   ❌ 搜索失敗: ${error.response?.status || error.message}`
      );
      if (error.response?.status === 429) {
        console.log('   ⏳ API限制，等待5秒...');
        await this.delay(5000);
      }
    }

    return [];
  }

  async extractCardInfoFromEbay(item, series) {
    try {
      // 從商品標題提取卡片信息
      const title = item.title || '';
      const description = item.shortDescription || '';

      // 提取卡片ID (格式如 OP-13-001)
      const cardIdMatch = title.match(/([A-Z]{2,3}-\d{2}-\d{3})/i);
      const cardId = cardIdMatch ? cardIdMatch[1] : null;

      // 提取卡片名稱
      let cardName = title;
      if (cardId) {
        cardName = title.replace(cardId, '').replace(/\s+/g, ' ').trim();
      }

      // 提取稀有度信息
      const rarityKeywords = {
        'Secret Rare': ['Secret Rare', 'SR'],
        'Super Rare': ['Super Rare', 'SuperRare', 'SP'],
        Rare: ['Rare', 'R'],
        Uncommon: ['Uncommon', 'UC'],
        Common: ['Common', 'C'],
      };

      let rarity = 'Common';
      for (const [rarityType, keywords] of Object.entries(rarityKeywords)) {
        if (
          keywords.some(
            keyword =>
              title.toLowerCase().includes(keyword.toLowerCase()) ||
              description.toLowerCase().includes(keyword.toLowerCase())
          )
        ) {
          rarity = rarityType;
          break;
        }
      }

      // 提取卡片類型
      const typeKeywords = {
        Leader: ['Leader', 'L'],
        Character: ['Character', 'Char'],
        Event: ['Event', 'E'],
        Stage: ['Stage', 'S'],
        Don: ['Don', 'D'],
      };

      let cardType = 'Character';
      for (const [type, keywords] of Object.entries(typeKeywords)) {
        if (
          keywords.some(
            keyword =>
              title.toLowerCase().includes(keyword.toLowerCase()) ||
              description.toLowerCase().includes(keyword.toLowerCase())
          )
        ) {
          cardType = type;
          break;
        }
      }

      // 提取價格信息
      const price = item.price ? parseFloat(item.price.value) : 0;
      const currency = item.price ? item.price.currency : 'USD';

      return {
        name: cardName,
        card_id: cardId,
        card_type: cardType,
        rarity: rarity,
        image_url: item.image ? item.image.imageUrl : '',
        price: price,
        currency: currency,
        ebay_item_id: item.itemId,
        ebay_url: item.itemWebUrl,
        series_code: series.code,
        series_name: series.name,
        source: 'eBay API',
      };
    } catch (error) {
      console.error(`   ❌ 提取卡片信息失敗: ${error.message}`);
      return null;
    }
  }

  async saveCardToDatabase(cardData) {
    try {
      const client = await this.pool.connect();
      try {
        // 檢查卡片是否已存在
        const existing = await client.query(
          'SELECT id FROM cards WHERE name = $1 AND set_name = $2',
          [cardData.name, cardData.series_name]
        );

        if (existing.rows.length === 0) {
          // 插入新卡片
          await client.query(
            `
            INSERT INTO cards (
              name, set_name, card_type, image_url, description, 
              current_price, market_price, is_active, metadata, 
              created_at, updated_at, category
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `,
            [
              cardData.name,
              cardData.series_name,
              cardData.card_type,
              cardData.image_url,
              `One Piece trading card from ${cardData.series_name} collection`,
              cardData.price,
              cardData.price, // 使用eBay價格作為市場價格
              true,
              JSON.stringify({
                source: cardData.source,
                card_id: cardData.card_id,
                rarity: cardData.rarity,
                series_code: cardData.series_code,
                ebay_item_id: cardData.ebay_item_id,
                ebay_url: cardData.ebay_url,
                currency: cardData.currency,
                collected_at: new Date().toISOString(),
              }),
              new Date(),
              new Date(),
              'onePiece',
            ]
          );

          this.stats.successCount++;
          this.stats.totalCards++;
          console.log(
            `     ✅ 新增: ${cardData.name} (${cardData.card_id || 'N/A'}) - $${cardData.price}`
          );
        } else {
          console.log(`     ⏭️ 已存在: ${cardData.name}`);
        }
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(`     ❌ 保存失敗: ${cardData.name} - ${error.message}`);
      this.stats.failCount++;
    }
  }

  async collectSeriesFromEbay(series) {
    console.log(`\n📦 開始從eBay收集 ${series.code} 系列...`);
    console.log(`   預期卡片數: ${series.expectedCards} 張`);

    this.stats.totalSeries++;
    let totalFound = 0;

    // 使用多個搜索詞來獲取更多結果
    for (const searchTerm of series.searchTerms) {
      const items = await this.searchEbayCards(series, searchTerm);

      for (const item of items) {
        const cardData = await this.extractCardInfoFromEbay(item, series);

        if (cardData && cardData.name) {
          await this.saveCardToDatabase(cardData);
          totalFound++;
        }
      }

      // 避免API限制
      await this.delay(1000);
    }

    console.log(`\n📊 ${series.code} 系列收集完成: ${totalFound} 張卡片`);
    this.stats.processedSeries++;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async displayProgress() {
    console.log('\n📊 收集進度:');
    console.log(`   總系列數: ${this.stats.totalSeries}`);
    console.log(`   已處理: ${this.stats.processedSeries}`);
    console.log(`   成功收集: ${this.stats.successCount}`);
    console.log(`   失敗: ${this.stats.failCount}`);
    console.log(`   總收集卡片: ${this.stats.totalCards}`);
  }

  async start() {
    console.log('🚀 開始從eBay收集One Piece卡片數據...');
    console.log(`📋 總共需要收集 ${this.targetSeries.length} 個系列`);

    if (!(await this.initialize())) {
      return;
    }

    try {
      // 按優先級收集系列
      for (const series of this.targetSeries) {
        await this.collectSeriesFromEbay(series);
        await this.displayProgress();

        // 避免API限制
        await this.delay(2000);
      }

      console.log('\n✅ 所有系列收集完成！');
      await this.displayProgress();
    } catch (error) {
      console.error('❌ 收集過程中發生錯誤:', error.message);
    } finally {
      await this.pool.end();
    }
  }

  async collectSpecificSeries(seriesCode) {
    const series = this.targetSeries.find(s => s.code === seriesCode);
    if (!series) {
      console.log(`❌ 未找到系列: ${seriesCode}`);
      return;
    }

    if (!(await this.initialize())) {
      return;
    }

    try {
      await this.collectSeriesFromEbay(series);
      await this.displayProgress();
    } catch (error) {
      console.error('❌ 收集過程中發生錯誤:', error.message);
    } finally {
      await this.pool.end();
    }
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  const collector = new EbayOnePieceCollector();

  // 檢查命令行參數
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const seriesCode = args[0].toUpperCase();
    collector.collectSpecificSeries(seriesCode).catch(console.error);
  } else {
    collector.start().catch(console.error);
  }
}

module.exports = EbayOnePieceCollector;
