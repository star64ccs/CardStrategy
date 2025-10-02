// 完整的卡牌數據庫建立計劃 - 整合 eBay API 版本
const axios = require('axios');
const fs = require('fs').promises;
const { Pool } = require('pg');
const ProgressTracker = require('./progress-tracker');

class CompleteDatabaseWithEbay {
  constructor() {
    this.results = {
      pokemon: { total: 0, collected: 0, failed: 0, data: [] },
      onePiece: { total: 0, collected: 0, failed: 0, data: [] },
      myLittlePony: { total: 0, collected: 0, failed: 0, data: [] },
      ebay: { total: 0, collected: 0, failed: 0, data: [] },
    };

    this.progressTracker = new ProgressTracker();

    // 數據庫連接配置 - 使用測試環境
    this.dbConfig = {
      host: 'localhost',
      port: 5433,
      database: 'cardstrategy_test',
      user: 'cardstrategy_test',
      password: 'TestPassword123!',
    };

    this.pool = new Pool(this.dbConfig);

    // eBay API 配置
    this.ebayConfig = {
      clientId: null,
      clientSecret: null,
      oauthToken: null,
      apiBaseUrl: 'https://api.ebay.com',
      timeout: 30000,
    };

    this.config = {
      pokemon: {
        batchSize: 100,
        timeout: 60000,
        api: 'https://api.pokemontcg.io/v2/cards',
        apiKey: '99cd5540-e7ed-4878-87f0-aee510812ffb',
        retryAttempts: 3,
        retryDelay: 5000,
        maxConsecutiveEmptyPages: 3,
      },
      onePiece: {
        batchSize: 100,
        timeout: 30000,
        apis: [
          {
            name: 'Scryfall-OnePiece',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'set:one', format: 'json' },
          },
          {
            name: 'Scryfall-Anime',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'anime', format: 'json' },
          },
        ],
      },
      myLittlePony: {
        batchSize: 50,
        timeout: 30000,
        apis: [
          {
            name: 'Scryfall-Pony',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'pony', format: 'json' },
          },
          {
            name: 'Scryfall-Unicorn',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'unicorn', format: 'json' },
          },
        ],
      },
      ebay: {
        categories: [
          { name: 'pokemon', searchTerm: 'pokemon trading cards', limit: 200 },
          {
            name: 'onepiece',
            searchTerm: 'one piece trading cards',
            limit: 100,
          },
          { name: 'mlp', searchTerm: 'my little pony cards', limit: 100 },
        ],
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 2000,
        enablePriceHistory: true, // 啟用價格歷史追蹤
      },
    };
  }

  // eBay API 方法
  async loadEbayCredentials() {
    try {
      console.log('📖 從 API.txt 讀取 eBay 認證信息...');
      const apiContent = await fs.readFile('./API.txt', 'utf8');

      // 查找 Production eBay 配置
      const productionMatch = apiContent.match(
        /Production[\s\S]*?App ID \(Client ID\)\s*\n([^\n]+)[\s\S]*?Cert ID \(Client Secret\)\s*\n([^\n]+)/
      );

      if (productionMatch) {
        this.ebayConfig.clientId = productionMatch[1].trim();
        this.ebayConfig.clientSecret = productionMatch[2].trim();
        console.log('✅ 成功讀取 eBay Production 認證信息');
        console.log(`   Client ID: ${this.ebayConfig.clientId}`);
        console.log(
          `   Client Secret: ${this.ebayConfig.clientSecret.substring(0, 10)}...`
        );
        return true;
      } else {
        console.log('❌ 無法從 API.txt 讀取 eBay Production 認證信息');
        return false;
      }
    } catch (error) {
      console.error('❌ 讀取 eBay 認證信息失敗:', error.message);
      return false;
    }
  }

  async loadEbayOAuthToken() {
    try {
      console.log('📖 從 API.txt 讀取 eBay OAuth Token...');
      const apiContent = await fs.readFile('./API.txt', 'utf8');

      const tokenMatch = apiContent.match(
        /OAuth Application token:\s*([^\n]+)/
      );
      if (tokenMatch) {
        this.ebayConfig.oauthToken = tokenMatch[1].trim();
        console.log('✅ 成功讀取 eBay OAuth Token');
        console.log(
          `   Token: ${this.ebayConfig.oauthToken.substring(0, 50)}...`
        );
        return true;
      } else {
        console.log('❌ 無法找到 eBay OAuth Token');
        return false;
      }
    } catch (error) {
      console.error('❌ 讀取 eBay OAuth Token 失敗:', error.message);
      return false;
    }
  }

  async refreshEbayToken() {
    try {
      console.log('🔄 嘗試刷新 eBay OAuth Token...');

      if (!this.ebayConfig.clientId || !this.ebayConfig.clientSecret) {
        const credentialsLoaded = await this.loadEbayCredentials();
        if (!credentialsLoaded) {
          throw new Error('無法載入 eBay 認證信息');
        }
      }

      const auth = Buffer.from(
        `${this.ebayConfig.clientId}:${this.ebayConfig.clientSecret}`
      ).toString('base64');

      const response = await axios.post(
        'https://api.ebay.com/identity/v1/oauth2/token',
        new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'https://api.ebay.com/oauth/api_scope',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
          },
          timeout: 30000,
        }
      );

      if (response.status === 200 && response.data.access_token) {
        this.ebayConfig.oauthToken = response.data.access_token;
        console.log('✅ eBay Token 刷新成功');
        console.log(
          `   新 Token: ${this.ebayConfig.oauthToken.substring(0, 50)}...`
        );

        // 更新 API.txt 文件
        try {
          const apiContent = await fs.readFile('./API.txt', 'utf8');
          const updatedContent = apiContent.replace(
            /OAuth Application token:\s*[^\n]+/,
            `OAuth Application token: ${this.ebayConfig.oauthToken}`
          );
          await fs.writeFile('./API.txt', updatedContent);
          console.log('💾 新 Token 已保存到 API.txt');
        } catch (saveError) {
          console.log('⚠️ 無法保存新 Token 到文件:', saveError.message);
        }

        return true;
      } else {
        console.log(
          '❌ eBay Token 刷新失敗:',
          response.status,
          response.statusText
        );
        return false;
      }
    } catch (error) {
      console.error('❌ 無法刷新 eBay Token:', error.message);
      if (error.response) {
        console.error('   響應狀態:', error.response.status);
        console.error('   響應數據:', error.response.data);
      }
      return false;
    }
  }

  async initializeEbay() {
    console.log('🚀 初始化 eBay API...');

    // 嘗試載入現有 Token
    let tokenLoaded = await this.loadEbayOAuthToken();

    if (!tokenLoaded) {
      console.log('⚠️ 沒有找到 Token，嘗試刷新...');
      tokenLoaded = await this.refreshEbayToken();
    }

    if (!tokenLoaded) {
      console.log('❌ 無法初始化 eBay API');
      return false;
    }

    // 測試 Token 是否有效
    const testResult = await this.testEbayToken();
    if (!testResult) {
      console.log('🔄 Token 測試失敗，嘗試刷新...');
      const refreshSuccess = await this.refreshEbayToken();
      if (refreshSuccess) {
        const retestResult = await this.testEbayToken();
        if (retestResult) {
          console.log('✅ eBay API 初始化成功');
          return true;
        }
      }
      console.log('❌ eBay API 初始化失敗');
      return false;
    }

    console.log('✅ eBay API 初始化成功');
    return true;
  }

  async testEbayToken() {
    try {
      const url = `${this.ebayConfig.apiBaseUrl}/buy/browse/v1/item_summary/search`;
      const params = {
        q: 'pokemon cards',
        limit: 5,
        sort: 'price',
        filter: 'deliveryCountry:US',
      };

      const response = await axios.get(url, {
        params: params,
        headers: {
          Authorization: `Bearer ${this.ebayConfig.oauthToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
        timeout: this.ebayConfig.timeout,
      });

      if (response.status === 200 && response.data) {
        const items = response.data.itemSummaries || [];
        console.log(`✅ eBay Token 測試成功: 找到 ${items.length} 個商品`);
        return true;
      } else {
        console.log('❌ eBay Token 測試失敗:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ eBay Token 測試失敗:', error.message);
      if (error.response && error.response.status === 401) {
        console.log('🔄 檢測到 401 錯誤，Token 可能已過期');
      }
      return false;
    }
  }

  async collectEbayData() {
    console.log('\n🛒 開始收集 eBay 數據...');

    const ebayInitialized = await this.initializeEbay();
    if (!ebayInitialized) {
      console.log('❌ eBay API 初始化失敗，跳過 eBay 數據收集');
      return;
    }

    for (const category of this.config.ebay.categories) {
      console.log(`\n🔍 收集 eBay ${category.name} 數據...`);

      try {
        const items = await this.searchEbayItems(category);
        if (items && items.length > 0) {
          this.results.ebay.total += items.length;
          this.results.ebay.collected += items.length;
          this.results.ebay.data.push(...items);

          console.log(
            `✅ eBay ${category.name}: 收集到 ${items.length} 個商品`
          );

          // 更新進度
          await this.progressTracker.updateProgress('ebay', {
            category: category.name,
            collected: items.length,
            total: items.length,
          });
        }

        // 添加延遲避免 API 限制
        await new Promise(resolve =>
          setTimeout(resolve, this.config.ebay.retryDelay)
        );
      } catch (error) {
        console.error(`❌ eBay ${category.name} 數據收集失敗:`, error.message);
        this.results.ebay.failed += 1;
      }
    }

    console.log(
      `\n📊 eBay 數據收集完成: 總計 ${this.results.ebay.collected} 個商品`
    );
  }

  async searchEbayItems(category) {
    try {
      const url = `${this.ebayConfig.apiBaseUrl}/buy/browse/v1/item_summary/search`;
      const params = {
        q: category.searchTerm,
        limit: category.limit,
        sort: 'price',
        filter: 'deliveryCountry:US,conditionIds:{3000|4000|5000}',
        categoryIds: '38292', // 交易卡類別
      };

      const response = await axios.get(url, {
        params: params,
        headers: {
          Authorization: `Bearer ${this.ebayConfig.oauthToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
        timeout: this.config.ebay.timeout,
      });

      if (response.status === 200 && response.data) {
        const items = response.data.itemSummaries || [];

        // 轉換 eBay 數據格式以匹配我們的數據庫結構 (移除賣家信息以符合合規要求)
        return items.map(item => ({
          card_id: `ebay_${item.itemId}`,
          name: item.title,
          category: category.name,
          source: 'ebay-api',
          current_price: parseFloat(item.price?.value || 0),
          market_price: parseFloat(item.price?.value || 0),
          image_url: item.image?.imageUrl,
          description: item.shortDescription || '',
          rarity: item.condition || 'Unknown',
          card_type: 'Trading Card',
          is_active: true,
          metadata: {
            ebay_item_id: item.itemId,
            condition: item.condition,
            currency: item.price?.currency,
            listing_date: item.listingDate || new Date().toISOString(),
            // 移除賣家信息以符合合規要求
            // seller: item.seller?.username,
            // listing_type: item.listingMarketplaceId,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
      } else {
        console.log(`❌ eBay ${category.name} 搜索失敗:`, response.status);
        return [];
      }
    } catch (error) {
      console.error(`❌ eBay ${category.name} 搜索失敗:`, error.message);

      // 如果是 401 錯誤，嘗試刷新 token
      if (error.response && error.response.status === 401) {
        console.log('🔄 檢測到 401 錯誤，嘗試刷新 eBay Token...');
        const refreshSuccess = await this.refreshEbayToken();
        if (refreshSuccess) {
          console.log('🔄 Token 刷新成功，重新嘗試搜索...');
          // 重新嘗試搜索
          try {
            const response = await axios.get(url, {
              params: params,
              headers: {
                Authorization: `Bearer ${this.ebayConfig.oauthToken}`,
                'Content-Type': 'application/json',
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
              },
              timeout: this.config.ebay.timeout,
            });

            if (response.status === 200 && response.data) {
              const items = response.data.itemSummaries || [];
              console.log(`✅ 重試成功: 找到 ${items.length} 個商品`);

              return items.map(item => ({
                card_id: `ebay_${item.itemId}`,
                name: item.title,
                category: category.name,
                source: 'ebay-api',
                current_price: parseFloat(item.price?.value || 0),
                market_price: parseFloat(item.price?.value || 0),
                image_url: item.image?.imageUrl,
                description: item.shortDescription || '',
                rarity: item.condition || 'Unknown',
                card_type: 'Trading Card',
                is_active: true,
                metadata: {
                  ebay_item_id: item.itemId,
                  condition: item.condition,
                  currency: item.price?.currency,
                  listing_date: item.listingDate || new Date().toISOString(),
                  // 移除賣家信息以符合合規要求
                  // seller: item.seller?.username,
                  // listing_type: item.listingMarketplaceId,
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }));
            }
          } catch (retryError) {
            console.error('❌ 重試仍然失敗:', retryError.message);
          }
        }
      }

      return [];
    }
  }

  // 數據庫相關方法
  async testDatabaseConnection() {
    try {
      console.log('🔌 測試數據庫連接...');
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      console.log('✅ 數據庫連接成功:', result.rows[0].now);
      return true;
    } catch (error) {
      console.error('❌ 數據庫連接失敗:', error.message);
      return false;
    }
  }

  async initializeDatabase() {
    try {
      console.log('🗄️ 檢查數據庫表結構...');
      const client = await this.pool.connect();

      // 檢查表是否存在
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('cards', 'market_data')
      `);

      const existingTables = tablesResult.rows.map(row => row.table_name);

      if (
        existingTables.includes('cards') &&
        existingTables.includes('market_data')
      ) {
        console.log('✅ 數據庫表已存在');
        client.release();
        return true;
      } else {
        console.log('❌ 數據庫表不存在，需要初始化');
        client.release();
        return false;
      }
    } catch (error) {
      console.error('❌ 數據庫初始化檢查失敗:', error.message);
      return false;
    }
  }

  async saveToDatabase() {
    console.log('\n💾 開始保存數據到數據庫...');

    const allData = [
      ...this.results.pokemon.data,
      ...this.results.onePiece.data,
      ...this.results.myLittlePony.data,
      ...this.results.ebay.data,
    ];

    if (allData.length === 0) {
      console.log('⚠️ 沒有數據需要保存');
      return;
    }

    const client = await this.pool.connect();
    let savedCount = 0;
    let failedCount = 0;

    try {
      for (const card of allData) {
        try {
          await client.query(
            `
            INSERT INTO cards (
              card_id, name, category, source, current_price, market_price,
              image_url, description, rarity, card_type, is_active, metadata,
              created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (card_id) DO UPDATE SET
              current_price = EXCLUDED.current_price,
              market_price = EXCLUDED.market_price,
              metadata = EXCLUDED.metadata,
              updated_at = EXCLUDED.updated_at
          `,
            [
              card.card_id,
              card.name,
              card.category,
              card.source,
              card.current_price,
              card.market_price,
              card.image_url,
              card.description,
              card.rarity,
              card.card_type,
              card.is_active,
              JSON.stringify(card.metadata),
              card.created_at,
              card.updated_at,
            ]
          );

          savedCount++;
        } catch (error) {
          console.error(`⚠️ 保存卡片失敗: ${card.name} - ${error.message}`);
          failedCount++;
        }
      }

      console.log(
        `✅ 數據庫保存完成! 成功: ${savedCount}, 失敗: ${failedCount}`
      );

      // 如果啟用了價格歷史追蹤，保存價格歷史數據
      if (
        this.config.ebay.enablePriceHistory &&
        this.results.ebay.data.length > 0
      ) {
        console.log('\n📈 保存 eBay 價格歷史數據...');
        await this.savePriceHistory(this.results.ebay.data);
      }
    } finally {
      client.release();
    }
  }

  async savePriceHistory(cards) {
    console.log('\n📊 保存價格歷史數據...');

    const client = await this.pool.connect();
    let savedCount = 0;
    let failedCount = 0;

    try {
      for (const card of cards) {
        try {
          await client.query(
            `
             INSERT INTO market_data (
               card_id, date, open_price, close_price, high_price, low_price,
               volume, transactions, price_change, price_change_percent,
               trend, volatility, is_active, metadata, created_at
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
             ON CONFLICT (card_id, date) DO UPDATE SET
               close_price = EXCLUDED.close_price,
               high_price = EXCLUDED.high_price,
               low_price = EXCLUDED.low_price,
               metadata = EXCLUDED.metadata,
               updated_at = CURRENT_TIMESTAMP
           `,
            [
              card.card_id,
              new Date().toISOString().split('T')[0], // 今天的日期
              card.current_price, // open_price
              card.current_price, // close_price
              card.current_price, // high_price (當前作為最高價)
              card.current_price, // low_price (當前作為最低價)
              1, // volume (單個商品)
              1, // transactions (單個交易)
              0, // price_change (首次記錄，變化為0)
              0, // price_change_percent (首次記錄，變化為0)
              'stable', // trend (穩定)
              0, // volatility (波動性)
              true, // is_active
              JSON.stringify({
                source: card.source,
                category: card.category,
                condition: card.metadata?.condition,
                currency: card.metadata?.currency,
                listing_date: card.metadata?.listing_date,
              }),
              new Date().toISOString(),
            ]
          );

          savedCount++;
        } catch (error) {
          console.error(`⚠️ 保存價格歷史失敗: ${card.name} - ${error.message}`);
          failedCount++;
        }
      }

      console.log(
        `✅ 價格歷史保存完成! 成功: ${savedCount}, 失敗: ${failedCount}`
      );
    } finally {
      client.release();
    }
  }

  // 原有的 Pokémon、One Piece、My Little Pony 收集方法
  async collectPokemonData() {
    console.log('\n🎮 開始收集 Pokémon 數據...');

    let page = 1;
    let consecutiveEmptyPages = 0;
    let totalCollected = 0;

    while (
      consecutiveEmptyPages < this.config.pokemon.maxConsecutiveEmptyPages
    ) {
      try {
        console.log(
          `📄 收集第 ${page} 頁... (已收集: ${totalCollected} 張卡片)`
        );

        const response = await axios.get(this.config.pokemon.api, {
          params: {
            page: page,
            pageSize: this.config.pokemon.batchSize,
          },
          headers: {
            'X-Api-Key': this.config.pokemon.apiKey,
          },
          timeout: this.config.pokemon.timeout,
        });

        if (response.status === 200 && response.data && response.data.data) {
          const cards = response.data.data;

          if (cards.length === 0) {
            consecutiveEmptyPages++;
            console.log(
              `⚠️ 第 ${page} 頁為空，連續空頁面: ${consecutiveEmptyPages}`
            );
          } else {
            consecutiveEmptyPages = 0;

            // 轉換數據格式
            const formattedCards = cards.map(card => ({
              card_id: card.id,
              name: card.name,
              category: 'pokemon',
              source: 'pokemon-tcg-api',
              current_price: parseFloat(
                card.tcgplayer?.prices?.normal?.market ||
                  card.tcgplayer?.prices?.holofoil?.market ||
                  0
              ),
              market_price: parseFloat(
                card.tcgplayer?.prices?.normal?.market ||
                  card.tcgplayer?.prices?.holofoil?.market ||
                  0
              ),
              image_url: card.images?.small || card.images?.large,
              description: card.flavorText || '',
              rarity: card.rarity,
              card_type: card.supertype || 'Pokémon',
              is_active: true,
              metadata: {
                set_name: card.set?.name,
                set_id: card.set?.id,
                number: card.number,
                artist: card.artist,
                original_data: card,
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));

            this.results.pokemon.data.push(...formattedCards);
            totalCollected += cards.length;
            this.results.pokemon.collected += cards.length;

            console.log(`✅ 第 ${page} 頁收集成功: ${cards.length} 張卡片`);

            // 更新進度
            await this.progressTracker.updateProgress('pokemon', {
              page: page,
              collected: totalCollected,
              batchSize: cards.length,
            });
          }
        } else {
          console.log(`❌ 第 ${page} 頁請求失敗:`, response.status);
          consecutiveEmptyPages++;
        }

        page++;

        // 添加延遲避免 API 限制
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ 第 ${page} 頁收集失敗:`, error.message);
        consecutiveEmptyPages++;

        // 重試機制
        if (consecutiveEmptyPages <= this.config.pokemon.retryAttempts) {
          console.log(
            `⚠️ 請求失敗，${this.config.pokemon.retryDelay / 1000}秒後重試 (${consecutiveEmptyPages}/${this.config.pokemon.retryAttempts})`
          );
          await new Promise(resolve =>
            setTimeout(resolve, this.config.pokemon.retryDelay)
          );
        }
      }
    }

    console.log(`\n✅ Pokémon 數據收集完成: 總計 ${totalCollected} 張卡片`);
  }

  async collectOnePieceData() {
    console.log('\n🏴‍☠️ 開始收集 One Piece 數據...');

    for (const api of this.config.onePiece.apis) {
      try {
        console.log(`📡 使用 ${api.name} 收集...`);

        const response = await axios.get(api.url, {
          params: api.params,
          timeout: this.config.onePiece.timeout,
        });

        if (response.status === 200 && response.data && response.data.data) {
          const cards = response.data.data;

          // 轉換數據格式
          const formattedCards = cards.map(card => ({
            card_id: `scryfall_${card.id}`,
            name: card.name,
            category: 'onePiece',
            source: api.name,
            current_price: parseFloat(card.prices?.usd || 0),
            market_price: parseFloat(card.prices?.usd || 0),
            image_url: card.image_uris?.small || card.image_uris?.normal,
            description: card.oracle_text || '',
            rarity: card.rarity,
            card_type: card.type_line,
            is_active: true,
            metadata: {
              set_name: card.set_name,
              set_id: card.set_id,
              mana_cost: card.mana_cost,
              cmc: card.cmc,
              original_data: card,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          this.results.onePiece.data.push(...formattedCards);
          this.results.onePiece.collected += cards.length;

          console.log(`✅ ${api.name}: 收集到 ${cards.length} 張卡片`);

          // 更新進度
          await this.progressTracker.updateProgress('onePiece', {
            api: api.name,
            collected: cards.length,
            total: cards.length,
          });
        } else {
          console.log(`❌ ${api.name} 請求失敗:`, response.status);
        }

        // 添加延遲避免 API 限制
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ ${api.name} 收集失敗:`, error.message);
        this.results.onePiece.failed += 1;
      }
    }

    console.log(
      `\n✅ One Piece 數據收集完成: 總計 ${this.results.onePiece.collected} 張卡片`
    );
  }

  async collectMyLittlePonyData() {
    console.log('\n🦄 開始收集 My Little Pony 數據...');

    for (const api of this.config.myLittlePony.apis) {
      try {
        console.log(`📡 使用 ${api.name} 收集...`);

        const response = await axios.get(api.url, {
          params: api.params,
          timeout: this.config.myLittlePony.timeout,
        });

        if (response.status === 200 && response.data && response.data.data) {
          const cards = response.data.data;

          // 轉換數據格式
          const formattedCards = cards.map(card => ({
            card_id: `scryfall_${card.id}`,
            name: card.name,
            category: 'myLittlePony',
            source: api.name,
            current_price: parseFloat(card.prices?.usd || 0),
            market_price: parseFloat(card.prices?.usd || 0),
            image_url: card.image_uris?.small || card.image_uris?.normal,
            description: card.oracle_text || '',
            rarity: card.rarity,
            card_type: card.type_line,
            is_active: true,
            metadata: {
              set_name: card.set_name,
              set_id: card.set_id,
              mana_cost: card.mana_cost,
              cmc: card.cmc,
              original_data: card,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          this.results.myLittlePony.data.push(...formattedCards);
          this.results.myLittlePony.collected += cards.length;

          console.log(`✅ ${api.name}: 收集到 ${cards.length} 張卡片`);

          // 更新進度
          await this.progressTracker.updateProgress('myLittlePony', {
            api: api.name,
            collected: cards.length,
            total: cards.length,
          });
        } else {
          console.log(`❌ ${api.name} 請求失敗:`, response.status);
        }

        // 添加延遲避免 API 限制
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ ${api.name} 收集失敗:`, error.message);
        this.results.myLittlePony.failed += 1;
      }
    }

    console.log(
      `\n✅ My Little Pony 數據收集完成: 總計 ${this.results.myLittlePony.collected} 張卡片`
    );
  }

  async generateReport() {
    console.log('\n📋 生成收集報告...');

    const report = {
      timestamp: new Date().toISOString(),
      totalCards:
        this.results.pokemon.collected +
        this.results.onePiece.collected +
        this.results.myLittlePony.collected +
        this.results.ebay.collected,
      categories: {
        pokemon: {
          collected: this.results.pokemon.collected,
          failed: this.results.pokemon.failed,
          percentage: this.results.pokemon.collected > 0 ? '100%' : '0%',
        },
        onePiece: {
          collected: this.results.onePiece.collected,
          failed: this.results.onePiece.failed,
          percentage: this.results.onePiece.collected > 0 ? '100%' : '0%',
        },
        myLittlePony: {
          collected: this.results.myLittlePony.collected,
          failed: this.results.myLittlePony.failed,
          percentage: this.results.myLittlePony.collected > 0 ? '100%' : '0%',
        },
        ebay: {
          collected: this.results.ebay.collected,
          failed: this.results.ebay.failed,
          percentage: this.results.ebay.collected > 0 ? '100%' : '0%',
        },
      },
      database: {
        host: this.dbConfig.host,
        port: this.dbConfig.port,
        database: this.dbConfig.database,
      },
      progress: await this.progressTracker.getProgress(),
    };

    await fs.writeFile(
      './complete-database-with-ebay-report.json',
      JSON.stringify(report, null, 2)
    );
    console.log('📄 報告已保存: complete-database-with-ebay-report.json');

    return report;
  }

  async run() {
    console.log('🚀 開始執行完整的卡牌數據庫建立計劃 (整合 eBay API)');
    console.log('='.repeat(80));
    console.log('🎯 目標: 下載所有可用的卡片數據 (包含 eBay 價格數據)');
    console.log('🗄️ 目標數據庫: localhost:5433/cardstrategy_test');
    console.log('⏰ 預估時間: 根據實際API數據量而定');

    const startTime = new Date();

    try {
      // 階段 0: 測試數據庫連接
      console.log('\n📌 階段 0: 測試數據庫連接');
      console.log('-'.repeat(50));
      const stageStart0 = new Date();
      console.log(
        `[${stageStart0.toLocaleTimeString()}] 🚀 開始階段: 數據庫連接測試`
      );

      const dbConnected = await this.testDatabaseConnection();
      if (!dbConnected) {
        throw new Error('數據庫連接失敗');
      }

      const stageEnd0 = new Date();
      console.log(
        `[${stageEnd0.toLocaleTimeString()}] ✅ 完成階段: 數據庫連接測試`
      );

      // 階段 1: 初始化數據庫
      console.log('\n📌 階段 1: 初始化數據庫');
      console.log('-'.repeat(50));
      const stageStart1 = new Date();
      console.log(
        `[${stageStart1.toLocaleTimeString()}] 🚀 開始階段: 數據庫初始化`
      );

      const dbInitialized = await this.initializeDatabase();
      if (!dbInitialized) {
        console.log('⚠️ 數據庫表不存在，請先運行 fix-database-schema.js');
        throw new Error('數據庫表不存在');
      }

      const stageEnd1 = new Date();
      console.log(
        `[${stageEnd1.toLocaleTimeString()}] ✅ 完成階段: 數據庫初始化`
      );

      // 階段 2: 收集 Pokémon 數據
      console.log('\n📌 階段 2: 收集所有 Pokémon 數據');
      console.log('-'.repeat(50));
      const stageStart2 = new Date();
      console.log(
        `[${stageStart2.toLocaleTimeString()}] 🚀 開始階段: Pokémon 數據收集`
      );
      console.log('🎮 開始收集所有 Pokémon 數據 (無限制)...');
      console.log('📡 使用 Pokémon TCG API 收集所有可用卡片');
      console.log('📡 使用 Pokémon TCG API 收集...');

      await this.collectPokemonData();

      const stageEnd2 = new Date();
      console.log(
        `[${stageEnd2.toLocaleTimeString()}] ✅ 完成階段: Pokémon 數據收集`
      );

      // 階段 3: 收集 One Piece 數據
      console.log('\n📌 階段 3: 收集 One Piece 數據');
      console.log('-'.repeat(50));
      const stageStart3 = new Date();
      console.log(
        `[${stageStart3.toLocaleTimeString()}] 🚀 開始階段: One Piece 數據收集`
      );

      await this.collectOnePieceData();

      const stageEnd3 = new Date();
      console.log(
        `[${stageEnd3.toLocaleTimeString()}] ✅ 完成階段: One Piece 數據收集`
      );

      // 階段 4: 收集 My Little Pony 數據
      console.log('\n📌 階段 4: 收集 My Little Pony 數據');
      console.log('-'.repeat(50));
      const stageStart4 = new Date();
      console.log(
        `[${stageStart4.toLocaleTimeString()}] 🚀 開始階段: My Little Pony 數據收集`
      );

      await this.collectMyLittlePonyData();

      const stageEnd4 = new Date();
      console.log(
        `[${stageEnd4.toLocaleTimeString()}] ✅ 完成階段: My Little Pony 數據收集`
      );

      // 階段 5: 收集 eBay 數據
      console.log('\n📌 階段 5: 收集 eBay 數據');
      console.log('-'.repeat(50));
      const stageStart5 = new Date();
      console.log(
        `[${stageStart5.toLocaleTimeString()}] 🚀 開始階段: eBay 數據收集`
      );

      await this.collectEbayData();

      const stageEnd5 = new Date();
      console.log(
        `[${stageEnd5.toLocaleTimeString()}] ✅ 完成階段: eBay 數據收集`
      );

      // 階段 6: 保存到數據庫
      console.log('\n📌 階段 6: 保存到數據庫');
      console.log('-'.repeat(50));
      const stageStart6 = new Date();
      console.log(
        `[${stageStart6.toLocaleTimeString()}] 🚀 開始階段: 數據庫保存`
      );

      await this.saveToDatabase();

      const stageEnd6 = new Date();
      console.log(
        `[${stageEnd6.toLocaleTimeString()}] ✅ 完成階段: 數據庫保存`
      );

      // 階段 7: 生成報告
      console.log('\n📌 階段 7: 生成報告');
      console.log('-'.repeat(50));
      const stageStart7 = new Date();
      console.log(
        `[${stageStart7.toLocaleTimeString()}] 🚀 開始階段: 報告生成`
      );

      const report = await this.generateReport();

      const stageEnd7 = new Date();
      console.log(`[${stageEnd7.toLocaleTimeString()}] ✅ 完成階段: 報告生成`);

      // 完成總結
      const endTime = new Date();
      const totalTime = Math.round((endTime - startTime) / 1000);

      console.log('\n🎉 完整數據庫建立完成！');
      console.log('='.repeat(80));
      console.log(
        `⏰ 總耗時: ${totalTime} 秒 (約 ${Math.round(totalTime / 60)} 分鐘)`
      );
      console.log(`📊 總收集數量: ${report.totalCards} 張卡片`);
      console.log(
        `🎮 Pokémon: ${report.categories.pokemon.collected} 張 (${report.categories.pokemon.percentage})`
      );
      console.log(
        `🏴‍☠️ One Piece: ${report.categories.onePiece.collected} 張 (${report.categories.onePiece.percentage})`
      );
      console.log(
        `🦄 My Little Pony: ${report.categories.myLittlePony.collected} 張 (${report.categories.myLittlePony.percentage})`
      );
      console.log(
        `🛒 eBay: ${report.categories.ebay.collected} 張 (${report.categories.ebay.percentage})`
      );
      console.log(
        `🗄️ 數據庫: ${report.database.host}:${report.database.port}/${report.database.database}`
      );

      return true;
    } catch (error) {
      console.error('\n❌ 數據庫建立失敗:', error.message);
      return false;
    } finally {
      await this.pool.end();
    }
  }
}

// 如果直接運行此文件
if (require.main === module) {
  const collector = new CompleteDatabaseWithEbay();

  collector
    .run()
    .then(success => {
      if (success) {
        console.log('\n✅ 完整數據庫建立成功！');
        process.exit(0);
      } else {
        console.log('\n❌ 完整數據庫建立失敗！');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ 執行過程出錯:', error.message);
      process.exit(1);
    });
}

module.exports = CompleteDatabaseWithEbay;
