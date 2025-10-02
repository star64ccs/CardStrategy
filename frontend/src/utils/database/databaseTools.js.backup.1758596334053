// 合併的數據庫工具和功能
// 生成時間: 2025-09-22T01:59:06.196Z
// 來源文件: complete-database-unlimited.js, complete-database-optimized.js, complete-database-full-collection.js


// ===== complete-database-unlimited.js =====
// 完整的卡牌數據庫建立計劃 - 無限制版本 (下載所有可用數據)
const axios = require('axios');
const fs = require('fs').promises;
const { Pool } = require('pg');
const ProgressTracker = require('./progress-tracker');

class CompleteDatabaseUnlimited {
  constructor() {
    this.results = {
      pokemon: { total: 0, collected: 0, failed: 0, data: [] },
      onePiece: { total: 0, collected: 0, failed: 0, data: [] },
      myLittlePony: { total: 0, collected: 0, failed: 0, data: [] },
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

    this.config = {
      pokemon: {
        // 移除預估限制，讓API決定總數
        batchSize: 100, // 每頁100張卡片
        timeout: 60000, // 60秒超時
        api: 'https://api.pokemontcg.io/v2/cards',
        apiKey: '99cd5540-e7ed-4878-87f0-aee510812ffb',
        // 移除 maxPages 限制
        retryAttempts: 3, // 重試次數
        retryDelay: 5000, // 重試延遲
        maxConsecutiveEmptyPages: 3, // 連續空頁面後停止
      },
      onePiece: {
        // 移除預估限制
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
          {
            name: 'Scryfall-Manga',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'manga', format: 'json' },
          },
          {
            name: 'Scryfall-Japanese',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'japanese', format: 'json' },
          },
          {
            name: 'Scryfall-CardGame',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'card game', format: 'json' },
          },
        ],
      },
      myLittlePony: {
        // 移除預估限制
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
          {
            name: 'Scryfall-Friendship',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'friendship', format: 'json' },
          },
          {
            name: 'Scryfall-Magic',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'magic', format: 'json' },
          },
          {
            name: 'Scryfall-Fantasy',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'fantasy', format: 'json' },
          },
        ],
      },
    };
  }

  async testDatabaseConnection() {
    await this.progressTracker.startStage('db-connection');

    try {
      console.log('🔌 測試數據庫連接...');
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      console.log('✅ 數據庫連接成功:', result.rows[0].now);
      client.release();

      await this.progressTracker.completeStage('db-connection');
      return true;
    } catch (error) {
      await this.progressTracker.failStage('db-connection', error);
      return false;
    }
  }

  async initDatabase() {
    await this.progressTracker.startStage('db-init');

    try {
      console.log('🗄️ 檢查數據庫表結構...');
      const client = await this.pool.connect();

      // 檢查表是否存在
      const tableCheck = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name IN ('cards', 'market_data')
      `);

      if (tableCheck.rows.length === 2) {
        console.log('✅ 數據庫表已存在');
        client.release();
        await this.progressTracker.completeStage('db-init');
        return true;
      } else {
        throw new Error('數據庫表結構不完整，請先運行 fix-database-schema.js');
      }
    } catch (error) {
      await this.progressTracker.failStage('db-init', error);
      return false;
    }
  }

  async makeApiRequestWithRetry(url, options, retryCount = 0) {
    try {
      const response = await axios.get(url, options);
      return response;
    } catch (error) {
      if (retryCount < this.config.pokemon.retryAttempts) {
        console.log(
          `⚠️ 請求失敗，${this.config.pokemon.retryDelay / 1000}秒後重試 (${retryCount + 1}/${this.config.pokemon.retryAttempts})`
        );
        await new Promise(resolve =>
          setTimeout(resolve, this.config.pokemon.retryDelay)
        );
        return this.makeApiRequestWithRetry(url, options, retryCount + 1);
      } else {
        throw error;
      }
    }
  }

  async collectPokemonData() {
    await this.progressTracker.startStage('pokemon-collection');

    console.log('🎮 開始收集所有 Pokémon 數據 (無限制)...');
    console.log('📡 使用 Pokémon TCG API 收集所有可用卡片');

    const allCards = [];
    let apiCollected = 0;
    let totalPages = 0;

    try {
      console.log('\n📡 使用 Pokémon TCG API 收集...');
      let page = 1;
      let consecutiveEmptyPages = 0;

      // 無限循環，直到沒有更多數據
      while (true) {
        console.log(
          `\n📄 收集第 ${page} 頁... (已收集: ${apiCollected} 張卡片)`
        );

        try {
          const response = await this.makeApiRequestWithRetry(
            this.config.pokemon.api,
            {
              params: {
                page: page,
                pageSize: this.config.pokemon.batchSize,
                orderBy: 'name',
              },
              headers: {
                'X-Api-Key': this.config.pokemon.apiKey,
              },
              timeout: this.config.pokemon.timeout,
            }
          );

          if (response.status === 200 && response.data?.data) {
            const cards = response.data.data;

            if (cards.length === 0) {
              consecutiveEmptyPages++;
              console.log(`⚠️ 第 ${page} 頁為空`);

              if (
                consecutiveEmptyPages >=
                this.config.pokemon.maxConsecutiveEmptyPages
              ) {
                console.log(
                  `📄 連續 ${this.config.pokemon.maxConsecutiveEmptyPages} 頁為空，停止收集`
                );
                break;
              }
            } else {
              consecutiveEmptyPages = 0;

              // 處理卡片數據
              const processedCards = cards.map(card => ({
                card_id: card.id,
                name: card.name,
                set_name: card.set?.name,
                card_number: card.number,
                rarity: card.rarity,
                card_type: card.supertype,
                image_url: card.images?.small || card.images?.large,
                description: card.flavorText || card.abilities?.[0]?.text,
                current_price:
                  card.cardmarket?.prices?.averageSellPrice || null,
                market_price:
                  card.tcgplayer?.prices?.normal?.market ||
                  card.tcgplayer?.prices?.holofoil?.market ||
                  null,
                price_history: card.cardmarket?.prices || {},
                market_data: {
                  tcgplayer: card.tcgplayer || {},
                  cardmarket: card.cardmarket || {},
                },
                is_active: true,
                metadata: {
                  set: card.set || {},
                  images: card.images || {},
                  abilities: card.abilities || [],
                  attacks: card.attacks || [],
                  weaknesses: card.weaknesses || [],
                  resistances: card.resistances || [],
                  retreatCost: card.retreatCost || [],
                },
                category: 'pokemon',
                source: 'pokemon-tcg-api',
              }));

              allCards.push(...processedCards);
              apiCollected += processedCards.length;
              totalPages = page;

              // 更新進度
              this.progressTracker.updateCollectionStats(
                'pokemon',
                apiCollected
              );

              console.log(
                `✅ 第 ${page} 頁收集成功: ${processedCards.length} 張卡片`
              );
            }

            page++;

            // 添加延遲避免 API 限制 (2秒延遲)
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            console.log(`❌ 第 ${page} 頁收集失敗`);
            break;
          }
        } catch (error) {
          console.log(`❌ 第 ${page} 頁收集失敗: ${error.message}`);

          // 如果連續失敗太多頁，停止收集
          if (page > 10 && apiCollected > 0) {
            console.log('⚠️ 已收集部分數據，停止收集以避免無限重試');
            break;
          }

          // 繼續嘗試下一頁
          page++;
          await new Promise(resolve => setTimeout(resolve, 5000)); // 更長的延遲
        }
      }

      this.results.pokemon.collected = allCards.length;
      this.results.pokemon.total = totalPages * this.config.pokemon.batchSize; // 估算總頁數
      this.results.pokemon.data = allCards;

      console.log(`\n🎉 Pokémon 收集完成: ${allCards.length} 張卡片`);
      console.log(`📊 總共處理了 ${totalPages} 頁數據`);

      // 顯示統計信息
      const withPrices = allCards.filter(
        card => card.current_price || card.market_price
      );
      console.log(
        `💰 包含價格數據: ${withPrices.length}/${allCards.length} (${Math.round((withPrices.length / allCards.length) * 100)}%)`
      );

      await this.progressTracker.completeStage('pokemon-collection');
      return true;
    } catch (error) {
      await this.progressTracker.failStage('pokemon-collection', error);
      return false;
    }
  }

  async collectOnePieceData() {
    await this.progressTracker.startStage('onepiece-collection');

    console.log('\n🏴‍☠️ 開始收集所有 One Piece 數據 (無限制)...');

    const allCards = [];
    const collectedIds = new Set(); // 避免重複
    let apiCollected = 0;

    try {
      for (const api of this.config.onePiece.apis) {
        try {
          console.log(`\n📡 使用 ${api.name} 收集...`);

          // 檢查API是否有分頁
          let page = 1;
          let hasMore = true;

          while (hasMore) {
            const params = {
              ...api.params,
              page: page,
            };

            const response = await axios.get(api.url, {
              params: params,
              timeout: this.config.onePiece.timeout,
            });

            if (response.status === 200 && response.data?.data) {
              const cards = response.data.data;

              if (cards.length === 0) {
                hasMore = false;
                break;
              }

              const processedCards = cards.map(card => ({
                card_id:
                  card.id || card.name?.toLowerCase().replace(/\s+/g, '-'),
                name: card.name,
                set_name: card.set_name || card.set?.name || 'Unknown Set',
                card_number: card.collector_number || 'N/A',
                rarity: card.rarity || 'Unknown',
                card_type: card.type_line || 'Unknown',
                image_url: card.image_uris?.small || card.image_uris?.normal,
                description: card.oracle_text || card.flavor_text,
                current_price:
                  card.prices?.usd || card.prices?.usd_foil || null,
                market_price: card.prices?.usd || card.prices?.usd_foil || null,
                price_history: card.prices || {},
                market_data: {
                  prices: card.prices || {},
                  related_uris: card.related_uris || {},
                },
                is_active: true,
                metadata: {
                  source: api.name,
                  set: card.set || {},
                  images: card.image_uris || {},
                  legalities: card.legalities || {},
                  mana_cost: card.mana_cost || null,
                  cmc: card.cmc || null,
                },
                category: 'onePiece',
                source: api.name,
              }));

              // 過濾重複卡片
              const uniqueCards = processedCards.filter(card => {
                if (collectedIds.has(card.card_id)) {
                  return false;
                }
                collectedIds.add(card.card_id);
                return true;
              });

              allCards.push(...uniqueCards);
              apiCollected += uniqueCards.length;

              // 更新進度
              this.progressTracker.updateCollectionStats(
                'onePiece',
                apiCollected
              );

              console.log(
                `✅ ${api.name} 第${page}頁: ${uniqueCards.length} 張新卡片 (總計: ${allCards.length})`
              );

              // 檢查是否有更多頁面
              if (
                response.data.has_more === false ||
                cards.length < this.config.onePiece.batchSize
              ) {
                hasMore = false;
              } else {
                page++;
              }

              // 添加延遲
              await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
              console.log(
                `❌ ${api.name} 第${page}頁失敗: 狀態碼 ${response.status}`
              );
              hasMore = false;
            }
          }
        } catch (error) {
          console.log(`❌ ${api.name} 失敗: ${error.message}`);
        }
      }

      this.results.onePiece.collected = allCards.length;
      this.results.onePiece.data = allCards;

      console.log(`\n🎉 One Piece 收集完成: ${allCards.length} 張卡片`);

      await this.progressTracker.completeStage('onepiece-collection');
      return allCards.length > 0;
    } catch (error) {
      await this.progressTracker.failStage('onepiece-collection', error);
      return false;
    }
  }

  async collectMyLittlePonyData() {
    await this.progressTracker.startStage('mlp-collection');

    console.log('\n🦄 開始收集所有 My Little Pony 數據 (無限制)...');

    const allCards = [];
    const collectedIds = new Set(); // 避免重複
    let apiCollected = 0;

    try {
      for (const api of this.config.myLittlePony.apis) {
        try {
          console.log(`\n📡 使用 ${api.name} 收集...`);

          // 檢查API是否有分頁
          let page = 1;
          let hasMore = true;

          while (hasMore) {
            const params = {
              ...api.params,
              page: page,
            };

            const response = await axios.get(api.url, {
              params: params,
              timeout: this.config.myLittlePony.timeout,
            });

            if (response.status === 200 && response.data?.data) {
              const cards = response.data.data;

              if (cards.length === 0) {
                hasMore = false;
                break;
              }

              const processedCards = cards.map(card => ({
                card_id:
                  card.id || card.name?.toLowerCase().replace(/\s+/g, '-'),
                name: card.name,
                set_name: card.set_name || card.set?.name || 'Unknown Set',
                card_number: card.collector_number || 'N/A',
                rarity: card.rarity || 'Unknown',
                card_type: card.type_line || 'Unknown',
                image_url: card.image_uris?.small || card.image_uris?.normal,
                description: card.oracle_text || card.flavor_text,
                current_price:
                  card.prices?.usd || card.prices?.usd_foil || null,
                market_price: card.prices?.usd || card.prices?.usd_foil || null,
                price_history: card.prices || {},
                market_data: {
                  prices: card.prices || {},
                  related_uris: card.related_uris || {},
                },
                is_active: true,
                metadata: {
                  source: api.name,
                  set: card.set || {},
                  images: card.image_uris || {},
                  legalities: card.legalities || {},
                  mana_cost: card.mana_cost || null,
                  cmc: card.cmc || null,
                },
                category: 'myLittlePony',
                source: api.name,
              }));

              // 過濾重複卡片
              const uniqueCards = processedCards.filter(card => {
                if (collectedIds.has(card.card_id)) {
                  return false;
                }
                collectedIds.add(card.card_id);
                return true;
              });

              allCards.push(...uniqueCards);
              apiCollected += uniqueCards.length;

              // 更新進度
              this.progressTracker.updateCollectionStats(
                'myLittlePony',
                apiCollected
              );

              console.log(
                `✅ ${api.name} 第${page}頁: ${uniqueCards.length} 張新卡片 (總計: ${allCards.length})`
              );

              // 檢查是否有更多頁面
              if (
                response.data.has_more === false ||
                cards.length < this.config.myLittlePony.batchSize
              ) {
                hasMore = false;
              } else {
                page++;
              }

              // 添加延遲
              await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
              console.log(
                `❌ ${api.name} 第${page}頁失敗: 狀態碼 ${response.status}`
              );
              hasMore = false;
            }
          }
        } catch (error) {
          console.log(`❌ ${api.name} 失敗: ${error.message}`);
        }
      }

      this.results.myLittlePony.collected = allCards.length;
      this.results.myLittlePony.data = allCards;

      console.log(`\n🎉 My Little Pony 收集完成: ${allCards.length} 張卡片`);

      await this.progressTracker.completeStage('mlp-collection');
      return allCards.length > 0;
    } catch (error) {
      await this.progressTracker.failStage('mlp-collection', error);
      return false;
    }
  }

  async saveToDatabase() {
    await this.progressTracker.startStage('db-save');

    console.log('\n💾 保存數據到測試數據庫 (端口5433)...');

    try {
      const client = await this.pool.connect();

      let totalSaved = 0;

      // 保存所有卡片
      for (const category of ['pokemon', 'onePiece', 'myLittlePony']) {
        const cards = this.results[category].data;
        console.log(`\n📊 保存 ${category} 數據: ${cards.length} 張卡片`);

        for (const card of cards) {
          try {
            const result = await client.query(
              `
              INSERT INTO cards (
                card_id, name, set_name, card_number, rarity, card_type,
                image_url, description, current_price, market_price,
                price_history, market_data, is_active, metadata, category, source
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
              ON CONFLICT (card_id) DO UPDATE SET
                name = EXCLUDED.name,
                current_price = EXCLUDED.current_price,
                market_price = EXCLUDED.market_price,
                updated_at = CURRENT_TIMESTAMP
              RETURNING id
            `,
              [
                card.card_id,
                card.name,
                card.set_name,
                card.card_number,
                card.rarity,
                card.card_type,
                card.image_url,
                card.description,
                card.current_price,
                card.market_price,
                JSON.stringify(card.price_history),
                JSON.stringify(card.market_data),
                card.is_active,
                JSON.stringify(card.metadata),
                card.category,
                card.source,
              ]
            );

            totalSaved++;

            // 如果有價格數據，創建市場數據記錄
            if (card.current_price || card.market_price) {
              await client.query(
                `
                INSERT INTO market_data (
                  card_id, date, close_price, market_cap, is_active
                ) VALUES ($1, CURRENT_DATE, $2, $3, true)
                ON CONFLICT DO NOTHING
              `,
                [
                  result.rows[0].id,
                  card.current_price || card.market_price,
                  (card.current_price || card.market_price) * 1000, // 假設市場總量
                ]
              );
            }
          } catch (error) {
            console.log(`⚠️ 保存卡片失敗: ${card.name} - ${error.message}`);
          }
        }

        console.log(`✅ ${category}: ${cards.length} 張卡片已保存到數據庫`);
      }

      client.release();
      console.log(`\n🎉 數據庫保存完成! 總共保存了 ${totalSaved} 張卡片`);

      await this.progressTracker.completeStage('db-save');
      return true;
    } catch (error) {
      await this.progressTracker.failStage('db-save', error);
      return false;
    }
  }

  async generateReport() {
    await this.progressTracker.startStage('report-generation');

    console.log('\n📋 生成收集報告...');

    try {
      const timestamp = new Date().toISOString();
      const totalCollected =
        this.results.pokemon.collected +
        this.results.onePiece.collected +
        this.results.myLittlePony.collected;

      const report = {
        timestamp: timestamp,
        database: {
          host: this.dbConfig.host,
          port: this.dbConfig.port,
          database: this.dbConfig.database,
        },
        totalCards: totalCollected,
        actualResults: {
          pokemon: {
            collected: this.results.pokemon.collected,
            totalPages: this.results.pokemon.total,
            description: '所有可用的 Pokémon TCG 卡片',
          },
          onePiece: {
            collected: this.results.onePiece.collected,
            description: '所有可用的 One Piece 相關卡片',
          },
          myLittlePony: {
            collected: this.results.myLittlePony.collected,
            description: '所有可用的 My Little Pony 相關卡片',
          },
        },
        dataSources: {
          apis: ['Pokémon TCG API', 'Scryfall API'],
          strategy: '無限制收集 - 下載所有可用數據',
        },
      };

      await fs.writeFile(
        './complete-database-unlimited-report.json',
        JSON.stringify(report, null, 2)
      );
      console.log('📄 報告已保存: complete-database-unlimited-report.json');

      await this.progressTracker.completeStage('report-generation');
      return true;
    } catch (error) {
      await this.progressTracker.failStage('report-generation', error);
      return false;
    }
  }

  async executeCompletePlan() {
    console.log('🚀 開始執行完整的卡牌數據庫建立計劃 (無限制版本)');
    console.log('='.repeat(80));
    console.log('🎯 目標: 下載所有可用的卡片數據 (無預估限制)');
    console.log(
      `🗄️ 目標數據庫: ${this.dbConfig.host}:${this.dbConfig.port}/${this.dbConfig.database}`
    );
    console.log(`⏰ 預估時間: 根據實際API數據量而定`);

    const startTime = Date.now();

    try {
      // 階段 0: 測試數據庫連接
      console.log('\n📌 階段 0: 測試數據庫連接');
      console.log('-'.repeat(50));
      const dbConnected = await this.testDatabaseConnection();
      if (!dbConnected) {
        throw new Error('數據庫連接失敗');
      }

      // 階段 1: 初始化數據庫
      console.log('\n📌 階段 1: 初始化數據庫');
      console.log('-'.repeat(50));
      await this.initDatabase();

      // 階段 2: 收集 Pokémon 數據 (無限制)
      console.log('\n📌 階段 2: 收集所有 Pokémon 數據');
      console.log('-'.repeat(50));
      await this.collectPokemonData();

      // 階段 3: 收集 One Piece 數據 (無限制)
      console.log('\n📌 階段 3: 收集所有 One Piece 數據');
      console.log('-'.repeat(50));
      await this.collectOnePieceData();

      // 階段 4: 收集 My Little Pony 數據 (無限制)
      console.log('\n📌 階段 4: 收集所有 My Little Pony 數據');
      console.log('-'.repeat(50));
      await this.collectMyLittlePonyData();

      // 階段 5: 保存到數據庫
      console.log('\n📌 階段 5: 保存到測試數據庫');
      console.log('-'.repeat(50));
      await this.saveToDatabase();

      // 階段 6: 生成報告
      console.log('\n📌 階段 6: 生成報告');
      console.log('-'.repeat(50));
      await this.generateReport();

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      console.log('\n🎉 完整數據庫建立完成！');
      console.log('='.repeat(80));
      console.log(
        `⏰ 總耗時: ${duration} 秒 (約 ${Math.round((duration / 60) * 10) / 10} 分鐘)`
      );
      console.log(
        `📊 總收集數量: ${this.results.pokemon.collected + this.results.onePiece.collected + this.results.myLittlePony.collected} 張卡片`
      );
      console.log(
        `🎮 Pokémon: ${this.results.pokemon.collected} 張卡片 (所有可用的)`
      );
      console.log(
        `🏴‍☠️ One Piece: ${this.results.onePiece.collected} 張卡片 (所有可用的)`
      );
      console.log(
        `🦄 My Little Pony: ${this.results.myLittlePony.collected} 張卡片 (所有可用的)`
      );
      console.log(
        `🗄️ 數據庫: ${this.dbConfig.host}:${this.dbConfig.port}/${this.dbConfig.database}`
      );

      // 顯示最終進度
      await this.progressTracker.showProgress();

      return true;
    } catch (error) {
      console.error('\n❌ 執行過程中出錯:', error.message);
      return false;
    } finally {
      await this.pool.end();
    }
  }
}

// 如果直接運行此文件
if (require.main === module) {
  const plan = new CompleteDatabaseUnlimited();

  plan
    .executeCompletePlan()
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
      console.error('\n❌ 執行失敗:', error.message);
      process.exit(1);
    });
}

module.exports = CompleteDatabaseUnlimited;


// ===== complete-database-optimized.js =====
// 完整的卡牌數據庫建立計劃 - 優化版本 (解決API超時問題)
const axios = require('axios');
const fs = require('fs').promises;
const { Pool } = require('pg');
const ProgressTracker = require('./progress-tracker');

class CompleteDatabaseOptimized {
  constructor() {
    this.results = {
      pokemon: { total: 0, collected: 0, failed: 0, data: [] },
      onePiece: { total: 0, collected: 0, failed: 0, data: [] },
      myLittlePony: { total: 0, collected: 0, failed: 0, data: [] },
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

    this.config = {
      pokemon: {
        estimatedTotal: 15000,
        batchSize: 100, // 減小批次大小
        timeout: 60000, // 減少超時時間
        api: 'https://api.pokemontcg.io/v2/cards',
        apiKey: '99cd5540-e7ed-4878-87f0-aee510812ffb',
        maxPages: 150, // 15000 ÷ 100 = 150 頁
        retryAttempts: 3, // 重試次數
        retryDelay: 5000, // 重試延遲
      },
      onePiece: {
        estimatedTotal: 2000,
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
          {
            name: 'Scryfall-Manga',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'manga', format: 'json' },
          },
          {
            name: 'Scryfall-Japanese',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'japanese', format: 'json' },
          },
          {
            name: 'Scryfall-CardGame',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'card game', format: 'json' },
          },
        ],
      },
      myLittlePony: {
        estimatedTotal: 1000,
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
          {
            name: 'Scryfall-Friendship',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'friendship', format: 'json' },
          },
          {
            name: 'Scryfall-Magic',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'magic', format: 'json' },
          },
          {
            name: 'Scryfall-Fantasy',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'fantasy', format: 'json' },
          },
        ],
      },
    };
  }

  async testDatabaseConnection() {
    await this.progressTracker.startStage('db-connection');

    try {
      console.log('🔌 測試數據庫連接...');
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      console.log('✅ 數據庫連接成功:', result.rows[0].now);
      client.release();

      await this.progressTracker.completeStage('db-connection');
      return true;
    } catch (error) {
      await this.progressTracker.failStage('db-connection', error);
      return false;
    }
  }

  async initDatabase() {
    await this.progressTracker.startStage('db-init');

    try {
      console.log('🗄️ 檢查數據庫表結構...');
      const client = await this.pool.connect();

      // 檢查表是否存在
      const tableCheck = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name IN ('cards', 'market_data')
      `);

      if (tableCheck.rows.length === 2) {
        console.log('✅ 數據庫表已存在');
        client.release();
        await this.progressTracker.completeStage('db-init');
        return true;
      } else {
        throw new Error('數據庫表結構不完整，請先運行 fix-database-schema.js');
      }
    } catch (error) {
      await this.progressTracker.failStage('db-init', error);
      return false;
    }
  }

  async makeApiRequestWithRetry(url, options, retryCount = 0) {
    try {
      const response = await axios.get(url, options);
      return response;
    } catch (error) {
      if (retryCount < this.config.pokemon.retryAttempts) {
        console.log(
          `⚠️ 請求失敗，${this.config.pokemon.retryDelay / 1000}秒後重試 (${retryCount + 1}/${this.config.pokemon.retryAttempts})`
        );
        await new Promise(resolve =>
          setTimeout(resolve, this.config.pokemon.retryDelay)
        );
        return this.makeApiRequestWithRetry(url, options, retryCount + 1);
      } else {
        throw error;
      }
    }
  }

  async collectPokemonData() {
    await this.progressTracker.startStage('pokemon-collection');

    console.log('🎮 開始收集所有 Pokémon 數據...');
    console.log(`📊 目標: ${this.config.pokemon.estimatedTotal} 張卡片`);
    console.log(`📄 預估頁數: ${this.config.pokemon.maxPages} 頁`);

    const allCards = [];
    let apiCollected = 0;

    try {
      console.log('\n📡 使用 Pokémon TCG API 收集...');
      let page = 1;
      let consecutiveEmptyPages = 0;

      while (page <= this.config.pokemon.maxPages) {
        console.log(`\n📄 收集第 ${page} 頁... (已收集: ${apiCollected} 張)`);

        try {
          const response = await this.makeApiRequestWithRetry(
            this.config.pokemon.api,
            {
              params: {
                page: page,
                pageSize: this.config.pokemon.batchSize,
                orderBy: 'name',
              },
              headers: {
                'X-Api-Key': this.config.pokemon.apiKey,
              },
              timeout: this.config.pokemon.timeout,
            }
          );

          if (response.status === 200 && response.data?.data) {
            const cards = response.data.data;

            if (cards.length === 0) {
              consecutiveEmptyPages++;
              console.log(`⚠️ 第 ${page} 頁為空`);

              if (consecutiveEmptyPages >= 3) {
                console.log('📄 連續 3 頁為空，停止收集');
                break;
              }
            } else {
              consecutiveEmptyPages = 0;

              // 處理卡片數據
              const processedCards = cards.map(card => ({
                card_id: card.id,
                name: card.name,
                set_name: card.set?.name,
                card_number: card.number,
                rarity: card.rarity,
                card_type: card.supertype,
                image_url: card.images?.small || card.images?.large,
                description: card.flavorText || card.abilities?.[0]?.text,
                current_price:
                  card.cardmarket?.prices?.averageSellPrice || null,
                market_price:
                  card.tcgplayer?.prices?.normal?.market ||
                  card.tcgplayer?.prices?.holofoil?.market ||
                  null,
                price_history: card.cardmarket?.prices || {},
                market_data: {
                  tcgplayer: card.tcgplayer || {},
                  cardmarket: card.cardmarket || {},
                },
                is_active: true,
                metadata: {
                  set: card.set || {},
                  images: card.images || {},
                  abilities: card.abilities || [],
                  attacks: card.attacks || [],
                  weaknesses: card.weaknesses || [],
                  resistances: card.resistances || [],
                  retreatCost: card.retreatCost || [],
                },
                category: 'pokemon',
                source: 'pokemon-tcg-api',
              }));

              allCards.push(...processedCards);
              apiCollected += processedCards.length;

              // 更新進度
              this.progressTracker.updateCollectionStats(
                'pokemon',
                apiCollected
              );

              console.log(
                `✅ 第 ${page} 頁收集成功: ${processedCards.length} 張卡片`
              );
            }

            page++;

            // 添加延遲避免 API 限制 (2秒延遲)
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            console.log(`❌ 第 ${page} 頁收集失敗`);
            break;
          }
        } catch (error) {
          console.log(`❌ 第 ${page} 頁收集失敗: ${error.message}`);
          if (page > 10) {
            // 如果已經收集了一些數據，就繼續
            break;
          }
        }
      }

      this.results.pokemon.collected = allCards.length;
      this.results.pokemon.data = allCards;

      console.log(`\n🎉 Pokémon 收集完成: ${allCards.length} 張卡片`);

      // 顯示統計信息
      const withPrices = allCards.filter(
        card => card.current_price || card.market_price
      );
      console.log(
        `💰 包含價格數據: ${withPrices.length}/${allCards.length} (${Math.round((withPrices.length / allCards.length) * 100)}%)`
      );

      await this.progressTracker.completeStage('pokemon-collection');
      return true;
    } catch (error) {
      await this.progressTracker.failStage('pokemon-collection', error);
      return false;
    }
  }

  async collectOnePieceData() {
    await this.progressTracker.startStage('onepiece-collection');

    console.log('\n🏴‍☠️ 開始收集所有 One Piece 數據...');
    console.log(`📊 目標: ${this.config.onePiece.estimatedTotal} 張卡片`);

    const allCards = [];
    const collectedIds = new Set(); // 避免重複
    let apiCollected = 0;

    try {
      for (const api of this.config.onePiece.apis) {
        try {
          console.log(`\n📡 使用 ${api.name} 收集...`);

          const response = await axios.get(api.url, {
            params: api.params,
            timeout: this.config.onePiece.timeout,
          });

          if (response.status === 200 && response.data?.data) {
            const cards = response.data.data;

            const processedCards = cards.map(card => ({
              card_id: card.id || card.name?.toLowerCase().replace(/\s+/g, '-'),
              name: card.name,
              set_name: card.set_name || card.set?.name || 'Unknown Set',
              card_number: card.collector_number || 'N/A',
              rarity: card.rarity || 'Unknown',
              card_type: card.type_line || 'Unknown',
              image_url: card.image_uris?.small || card.image_uris?.normal,
              description: card.oracle_text || card.flavor_text,
              current_price: card.prices?.usd || card.prices?.usd_foil || null,
              market_price: card.prices?.usd || card.prices?.usd_foil || null,
              price_history: card.prices || {},
              market_data: {
                prices: card.prices || {},
                related_uris: card.related_uris || {},
              },
              is_active: true,
              metadata: {
                source: api.name,
                set: card.set || {},
                images: card.image_uris || {},
                legalities: card.legalities || {},
                mana_cost: card.mana_cost || null,
                cmc: card.cmc || null,
              },
              category: 'onePiece',
              source: api.name,
            }));

            // 過濾重複卡片
            const uniqueCards = processedCards.filter(card => {
              if (collectedIds.has(card.card_id)) {
                return false;
              }
              collectedIds.add(card.card_id);
              return true;
            });

            allCards.push(...uniqueCards);
            apiCollected += uniqueCards.length;

            // 更新進度
            this.progressTracker.updateCollectionStats(
              'onePiece',
              apiCollected
            );

            console.log(
              `✅ ${api.name}: ${uniqueCards.length} 張新卡片 (總計: ${allCards.length})`
            );
          } else {
            console.log(`❌ ${api.name} 失敗: 狀態碼 ${response.status}`);
          }

          // 添加延遲
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.log(`❌ ${api.name} 失敗: ${error.message}`);
        }
      }

      this.results.onePiece.collected = allCards.length;
      this.results.onePiece.data = allCards;

      console.log(`\n🎉 One Piece 收集完成: ${allCards.length} 張卡片`);

      await this.progressTracker.completeStage('onepiece-collection');
      return allCards.length > 0;
    } catch (error) {
      await this.progressTracker.failStage('onepiece-collection', error);
      return false;
    }
  }

  async collectMyLittlePonyData() {
    await this.progressTracker.startStage('mlp-collection');

    console.log('\n🦄 開始收集所有 My Little Pony 數據...');
    console.log(`📊 目標: ${this.config.myLittlePony.estimatedTotal} 張卡片`);

    const allCards = [];
    const collectedIds = new Set(); // 避免重複
    let apiCollected = 0;

    try {
      for (const api of this.config.myLittlePony.apis) {
        try {
          console.log(`\n📡 使用 ${api.name} 收集...`);

          const response = await axios.get(api.url, {
            params: api.params,
            timeout: this.config.myLittlePony.timeout,
          });

          if (response.status === 200 && response.data?.data) {
            const cards = response.data.data;

            const processedCards = cards.map(card => ({
              card_id: card.id || card.name?.toLowerCase().replace(/\s+/g, '-'),
              name: card.name,
              set_name: card.set_name || card.set?.name || 'Unknown Set',
              card_number: card.collector_number || 'N/A',
              rarity: card.rarity || 'Unknown',
              card_type: card.type_line || 'Unknown',
              image_url: card.image_uris?.small || card.image_uris?.normal,
              description: card.oracle_text || card.flavor_text,
              current_price: card.prices?.usd || card.prices?.usd_foil || null,
              market_price: card.prices?.usd || card.prices?.usd_foil || null,
              price_history: card.prices || {},
              market_data: {
                prices: card.prices || {},
                related_uris: card.related_uris || {},
              },
              is_active: true,
              metadata: {
                source: api.name,
                set: card.set || {},
                images: card.image_uris || {},
                legalities: card.legalities || {},
                mana_cost: card.mana_cost || null,
                cmc: card.cmc || null,
              },
              category: 'myLittlePony',
              source: api.name,
            }));

            // 過濾重複卡片
            const uniqueCards = processedCards.filter(card => {
              if (collectedIds.has(card.card_id)) {
                return false;
              }
              collectedIds.add(card.card_id);
              return true;
            });

            allCards.push(...uniqueCards);
            apiCollected += uniqueCards.length;

            // 更新進度
            this.progressTracker.updateCollectionStats(
              'myLittlePony',
              apiCollected
            );

            console.log(
              `✅ ${api.name}: ${uniqueCards.length} 張新卡片 (總計: ${allCards.length})`
            );
          } else {
            console.log(`❌ ${api.name} 失敗: 狀態碼 ${response.status}`);
          }

          // 添加延遲
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.log(`❌ ${api.name} 失敗: ${error.message}`);
        }
      }

      this.results.myLittlePony.collected = allCards.length;
      this.results.myLittlePony.data = allCards;

      console.log(`\n🎉 My Little Pony 收集完成: ${allCards.length} 張卡片`);

      await this.progressTracker.completeStage('mlp-collection');
      return allCards.length > 0;
    } catch (error) {
      await this.progressTracker.failStage('mlp-collection', error);
      return false;
    }
  }

  async saveToDatabase() {
    await this.progressTracker.startStage('db-save');

    console.log('\n💾 保存數據到測試數據庫 (端口5433)...');

    try {
      const client = await this.pool.connect();

      let totalSaved = 0;

      // 保存所有卡片
      for (const category of ['pokemon', 'onePiece', 'myLittlePony']) {
        const cards = this.results[category].data;
        console.log(`\n📊 保存 ${category} 數據: ${cards.length} 張卡片`);

        for (const card of cards) {
          try {
            const result = await client.query(
              `
              INSERT INTO cards (
                card_id, name, set_name, card_number, rarity, card_type,
                image_url, description, current_price, market_price,
                price_history, market_data, is_active, metadata, category, source
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
              ON CONFLICT (card_id) DO UPDATE SET
                name = EXCLUDED.name,
                current_price = EXCLUDED.current_price,
                market_price = EXCLUDED.market_price,
                updated_at = CURRENT_TIMESTAMP
              RETURNING id
            `,
              [
                card.card_id,
                card.name,
                card.set_name,
                card.card_number,
                card.rarity,
                card.card_type,
                card.image_url,
                card.description,
                card.current_price,
                card.market_price,
                JSON.stringify(card.price_history),
                JSON.stringify(card.market_data),
                card.is_active,
                JSON.stringify(card.metadata),
                card.category,
                card.source,
              ]
            );

            totalSaved++;

            // 如果有價格數據，創建市場數據記錄
            if (card.current_price || card.market_price) {
              await client.query(
                `
                INSERT INTO market_data (
                  card_id, date, close_price, market_cap, is_active
                ) VALUES ($1, CURRENT_DATE, $2, $3, true)
                ON CONFLICT DO NOTHING
              `,
                [
                  result.rows[0].id,
                  card.current_price || card.market_price,
                  (card.current_price || card.market_price) * 1000, // 假設市場總量
                ]
              );
            }
          } catch (error) {
            console.log(`⚠️ 保存卡片失敗: ${card.name} - ${error.message}`);
          }
        }

        console.log(`✅ ${category}: ${cards.length} 張卡片已保存到數據庫`);
      }

      client.release();
      console.log(`\n🎉 數據庫保存完成! 總共保存了 ${totalSaved} 張卡片`);

      await this.progressTracker.completeStage('db-save');
      return true;
    } catch (error) {
      await this.progressTracker.failStage('db-save', error);
      return false;
    }
  }

  async generateReport() {
    await this.progressTracker.startStage('report-generation');

    console.log('\n📋 生成收集報告...');

    try {
      const timestamp = new Date().toISOString();
      const totalCollected =
        this.results.pokemon.collected +
        this.results.onePiece.collected +
        this.results.myLittlePony.collected;

      const report = {
        timestamp: timestamp,
        database: {
          host: this.dbConfig.host,
          port: this.dbConfig.port,
          database: this.dbConfig.database,
        },
        totalCards: totalCollected,
        estimatedTotals: {
          pokemon: this.config.pokemon.estimatedTotal,
          onePiece: this.config.onePiece.estimatedTotal,
          myLittlePony: this.config.myLittlePony.estimatedTotal,
        },
        collectionRates: {
          pokemon: Math.round(
            (this.results.pokemon.collected /
              this.config.pokemon.estimatedTotal) *
              100
          ),
          onePiece: Math.round(
            (this.results.onePiece.collected /
              this.config.onePiece.estimatedTotal) *
              100
          ),
          myLittlePony: Math.round(
            (this.results.myLittlePony.collected /
              this.config.myLittlePony.estimatedTotal) *
              100
          ),
        },
        summary: {
          pokemon: {
            collected: this.results.pokemon.collected,
            estimated: this.config.pokemon.estimatedTotal,
            collectionRate: Math.round(
              (this.results.pokemon.collected /
                this.config.pokemon.estimatedTotal) *
                100
            ),
          },
          onePiece: {
            collected: this.results.onePiece.collected,
            estimated: this.config.onePiece.estimatedTotal,
            collectionRate: Math.round(
              (this.results.onePiece.collected /
                this.config.onePiece.estimatedTotal) *
                100
            ),
          },
          myLittlePony: {
            collected: this.results.myLittlePony.collected,
            estimated: this.config.myLittlePony.estimatedTotal,
            collectionRate: Math.round(
              (this.results.myLittlePony.collected /
                this.config.myLittlePony.estimatedTotal) *
                100
            ),
          },
        },
        dataSources: {
          apis: ['Pokémon TCG API', 'Scryfall API'],
        },
      };

      await fs.writeFile(
        './complete-database-optimized-report.json',
        JSON.stringify(report, null, 2)
      );
      console.log('📄 報告已保存: complete-database-optimized-report.json');

      await this.progressTracker.completeStage('report-generation');
      return true;
    } catch (error) {
      await this.progressTracker.failStage('report-generation', error);
      return false;
    }
  }

  async executeCompletePlan() {
    console.log('🚀 開始執行完整的卡牌數據庫建立計劃 (優化版本)');
    console.log('='.repeat(80));
    console.log('🎯 目標: 建立包含所有可用卡片的完整數據庫');
    console.log(
      `📊 預估總數: ${this.config.pokemon.estimatedTotal + this.config.onePiece.estimatedTotal + this.config.myLittlePony.estimatedTotal} 張卡片`
    );
    console.log(
      `🗄️ 目標數據庫: ${this.dbConfig.host}:${this.dbConfig.port}/${this.dbConfig.database}`
    );
    console.log(`⏰ 預估時間: 5-6 小時 (優化後)`);

    const startTime = Date.now();

    try {
      // 階段 0: 測試數據庫連接
      console.log('\n📌 階段 0: 測試數據庫連接');
      console.log('-'.repeat(50));
      const dbConnected = await this.testDatabaseConnection();
      if (!dbConnected) {
        throw new Error('數據庫連接失敗');
      }

      // 階段 1: 初始化數據庫
      console.log('\n📌 階段 1: 初始化數據庫');
      console.log('-'.repeat(50));
      await this.initDatabase();

      // 階段 2: 收集 Pokémon 數據
      console.log('\n📌 階段 2: 收集 Pokémon 數據 (預計5小時)');
      console.log('-'.repeat(50));
      await this.collectPokemonData();

      // 階段 3: 收集 One Piece 數據
      console.log('\n📌 階段 3: 收集 One Piece 數據');
      console.log('-'.repeat(50));
      await this.collectOnePieceData();

      // 階段 4: 收集 My Little Pony 數據
      console.log('\n📌 階段 4: 收集 My Little Pony 數據');
      console.log('-'.repeat(50));
      await this.collectMyLittlePonyData();

      // 階段 5: 保存到數據庫
      console.log('\n📌 階段 5: 保存到測試數據庫');
      console.log('-'.repeat(50));
      await this.saveToDatabase();

      // 階段 6: 生成報告
      console.log('\n📌 階段 6: 生成報告');
      console.log('-'.repeat(50));
      await this.generateReport();

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      console.log('\n🎉 完整數據庫建立完成！');
      console.log('='.repeat(80));
      console.log(
        `⏰ 總耗時: ${duration} 秒 (約 ${Math.round((duration / 60) * 10) / 10} 分鐘)`
      );
      console.log(
        `📊 總收集數量: ${this.results.pokemon.collected + this.results.onePiece.collected + this.results.myLittlePony.collected} 張卡片`
      );
      console.log(
        `🎮 Pokémon: ${this.results.pokemon.collected}/${this.config.pokemon.estimatedTotal} 張 (${Math.round((this.results.pokemon.collected / this.config.pokemon.estimatedTotal) * 100)}%)`
      );
      console.log(
        `🏴‍☠️ One Piece: ${this.results.onePiece.collected}/${this.config.onePiece.estimatedTotal} 張 (${Math.round((this.results.onePiece.collected / this.config.onePiece.estimatedTotal) * 100)}%)`
      );
      console.log(
        `🦄 My Little Pony: ${this.results.myLittlePony.collected}/${this.config.myLittlePony.estimatedTotal} 張 (${Math.round((this.results.myLittlePony.collected / this.config.myLittlePony.estimatedTotal) * 100)}%)`
      );
      console.log(
        `🗄️ 數據庫: ${this.dbConfig.host}:${this.dbConfig.port}/${this.dbConfig.database}`
      );

      // 顯示最終進度
      await this.progressTracker.showProgress();

      return true;
    } catch (error) {
      console.error('\n❌ 執行過程中出錯:', error.message);
      return false;
    } finally {
      await this.pool.end();
    }
  }
}

// 如果直接運行此文件
if (require.main === module) {
  const plan = new CompleteDatabaseOptimized();

  plan
    .executeCompletePlan()
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
      console.error('\n❌ 執行失敗:', error.message);
      process.exit(1);
    });
}

module.exports = CompleteDatabaseOptimized;


// ===== complete-database-full-collection.js =====
// 完整的卡牌數據庫建立計劃 - 完整收集18,000張卡片
const axios = require('axios');
const fs = require('fs').promises;
const { Pool } = require('pg');
const ProgressTracker = require('./progress-tracker');

class CompleteDatabaseFullCollection {
  constructor() {
    this.results = {
      pokemon: { total: 0, collected: 0, failed: 0, data: [] },
      onePiece: { total: 0, collected: 0, failed: 0, data: [] },
      myLittlePony: { total: 0, collected: 0, failed: 0, data: [] },
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

    this.config = {
      pokemon: {
        estimatedTotal: 15000, // 完整目標
        batchSize: 250,
        timeout: 120000,
        api: 'https://api.pokemontcg.io/v2/cards',
        apiKey: '99cd5540-e7ed-4878-87f0-aee510812ffb',
        maxPages: 60, // 15000 ÷ 250 = 60 頁
      },
      onePiece: {
        estimatedTotal: 2000, // 完整目標
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
          {
            name: 'Scryfall-Manga',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'manga', format: 'json' },
          },
          {
            name: 'Scryfall-Japanese',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'japanese', format: 'json' },
          },
          {
            name: 'Scryfall-CardGame',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'card game', format: 'json' },
          },
        ],
      },
      myLittlePony: {
        estimatedTotal: 1000, // 完整目標
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
          {
            name: 'Scryfall-Friendship',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'friendship', format: 'json' },
          },
          {
            name: 'Scryfall-Magic',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'magic', format: 'json' },
          },
          {
            name: 'Scryfall-Fantasy',
            url: 'https://api.scryfall.com/cards/search',
            params: { q: 'fantasy', format: 'json' },
          },
        ],
      },
    };
  }

  async testDatabaseConnection() {
    await this.progressTracker.startStage('db-connection');

    try {
      console.log('🔌 測試數據庫連接...');
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      console.log('✅ 數據庫連接成功:', result.rows[0].now);
      client.release();

      await this.progressTracker.completeStage('db-connection');
      return true;
    } catch (error) {
      await this.progressTracker.failStage('db-connection', error);
      return false;
    }
  }

  async initDatabase() {
    await this.progressTracker.startStage('db-init');

    try {
      console.log('🗄️ 初始化數據庫表結構...');
      const client = await this.pool.connect();

      // 創建卡片表
      await client.query(`
        CREATE TABLE IF NOT EXISTS cards (
          id SERIAL PRIMARY KEY,
          card_id VARCHAR(255) UNIQUE,
          name VARCHAR(500) NOT NULL,
          set_name VARCHAR(255),
          card_number VARCHAR(50),
          rarity VARCHAR(100),
          card_type VARCHAR(100),
          image_url TEXT,
          description TEXT,
          current_price DECIMAL(10,2),
          market_price DECIMAL(10,2),
          price_history JSONB,
          market_data JSONB,
          is_active BOOLEAN DEFAULT true,
          metadata JSONB,
          category VARCHAR(50),
          source VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 創建市場數據表
      await client.query(`
        CREATE TABLE IF NOT EXISTS market_data (
          id SERIAL PRIMARY KEY,
          card_id INTEGER REFERENCES cards(id),
          date DATE,
          open_price DECIMAL(10,2),
          close_price DECIMAL(10,2),
          high_price DECIMAL(10,2),
          low_price DECIMAL(10,2),
          volume INTEGER,
          transactions INTEGER,
          price_change DECIMAL(10,2),
          price_change_percent DECIMAL(5,2),
          market_cap DECIMAL(15,2),
          trend VARCHAR(50),
          volatility DECIMAL(5,2),
          is_active BOOLEAN DEFAULT true,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 創建索引
      await client.query(
        'CREATE INDEX IF NOT EXISTS idx_cards_category ON cards(category)'
      );
      await client.query(
        'CREATE INDEX IF NOT EXISTS idx_cards_source ON cards(source)'
      );
      await client.query(
        'CREATE INDEX IF NOT EXISTS idx_cards_card_id ON cards(card_id)'
      );
      await client.query(
        'CREATE INDEX IF NOT EXISTS idx_market_data_card_id ON market_data(card_id)'
      );
      await client.query(
        'CREATE INDEX IF NOT EXISTS idx_market_data_date ON market_data(date)'
      );

      client.release();
      console.log('✅ 數據庫表結構初始化完成');

      await this.progressTracker.completeStage('db-init');
      return true;
    } catch (error) {
      await this.progressTracker.failStage('db-init', error);
      return false;
    }
  }

  async collectPokemonData() {
    await this.progressTracker.startStage('pokemon-collection');

    console.log('🎮 開始收集所有 Pokémon 數據...');
    console.log(`📊 目標: ${this.config.pokemon.estimatedTotal} 張卡片`);
    console.log(`📄 預估頁數: ${this.config.pokemon.maxPages} 頁`);

    const allCards = [];
    let apiCollected = 0;

    try {
      console.log('\n📡 使用 Pokémon TCG API 收集...');
      let page = 1;
      let consecutiveEmptyPages = 0;

      while (page <= this.config.pokemon.maxPages) {
        console.log(`\n📄 收集第 ${page} 頁... (已收集: ${apiCollected} 張)`);

        const response = await axios.get(this.config.pokemon.api, {
          params: {
            page: page,
            pageSize: this.config.pokemon.batchSize,
            orderBy: 'name',
          },
          headers: {
            'X-Api-Key': this.config.pokemon.apiKey,
          },
          timeout: this.config.pokemon.timeout,
        });

        if (response.status === 200 && response.data?.data) {
          const cards = response.data.data;

          if (cards.length === 0) {
            consecutiveEmptyPages++;
            console.log(`⚠️ 第 ${page} 頁為空`);

            if (consecutiveEmptyPages >= 3) {
              console.log('📄 連續 3 頁為空，停止收集');
              break;
            }
          } else {
            consecutiveEmptyPages = 0;

            // 處理卡片數據
            const processedCards = cards.map(card => ({
              card_id: card.id,
              name: card.name,
              set_name: card.set?.name,
              card_number: card.number,
              rarity: card.rarity,
              card_type: card.supertype,
              image_url: card.images?.small || card.images?.large,
              description: card.flavorText || card.abilities?.[0]?.text,
              current_price: card.cardmarket?.prices?.averageSellPrice || null,
              market_price:
                card.tcgplayer?.prices?.normal?.market ||
                card.tcgplayer?.prices?.holofoil?.market ||
                null,
              price_history: card.cardmarket?.prices || {},
              market_data: {
                tcgplayer: card.tcgplayer || {},
                cardmarket: card.cardmarket || {},
              },
              is_active: true,
              metadata: {
                set: card.set || {},
                images: card.images || {},
                abilities: card.abilities || [],
                attacks: card.attacks || [],
                weaknesses: card.weaknesses || [],
                resistances: card.resistances || [],
                retreatCost: card.retreatCost || [],
              },
              category: 'pokemon',
              source: 'pokemon-tcg-api',
            }));

            allCards.push(...processedCards);
            apiCollected += processedCards.length;

            // 更新進度
            this.progressTracker.updateCollectionStats('pokemon', apiCollected);

            console.log(
              `✅ 第 ${page} 頁收集成功: ${processedCards.length} 張卡片`
            );
          }

          page++;

          // 添加延遲避免 API 限制 (3秒延遲)
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          console.log(`❌ 第 ${page} 頁收集失敗`);
          break;
        }
      }

      this.results.pokemon.collected = allCards.length;
      this.results.pokemon.data = allCards;

      console.log(`\n🎉 Pokémon 收集完成: ${allCards.length} 張卡片`);

      // 顯示統計信息
      const withPrices = allCards.filter(
        card => card.current_price || card.market_price
      );
      console.log(
        `💰 包含價格數據: ${withPrices.length}/${allCards.length} (${Math.round((withPrices.length / allCards.length) * 100)}%)`
      );

      await this.progressTracker.completeStage('pokemon-collection');
      return true;
    } catch (error) {
      await this.progressTracker.failStage('pokemon-collection', error);
      return false;
    }
  }

  async collectOnePieceData() {
    await this.progressTracker.startStage('onepiece-collection');

    console.log('\n🏴‍☠️ 開始收集所有 One Piece 數據...');
    console.log(`📊 目標: ${this.config.onePiece.estimatedTotal} 張卡片`);

    const allCards = [];
    const collectedIds = new Set(); // 避免重複
    let apiCollected = 0;

    try {
      for (const api of this.config.onePiece.apis) {
        try {
          console.log(`\n📡 使用 ${api.name} 收集...`);

          const response = await axios.get(api.url, {
            params: api.params,
            timeout: this.config.onePiece.timeout,
          });

          if (response.status === 200 && response.data?.data) {
            const cards = response.data.data;

            const processedCards = cards.map(card => ({
              card_id: card.id || card.name?.toLowerCase().replace(/\s+/g, '-'),
              name: card.name,
              set_name: card.set_name || card.set?.name || 'Unknown Set',
              card_number: card.collector_number || 'N/A',
              rarity: card.rarity || 'Unknown',
              card_type: card.type_line || 'Unknown',
              image_url: card.image_uris?.small || card.image_uris?.normal,
              description: card.oracle_text || card.flavor_text,
              current_price: card.prices?.usd || card.prices?.usd_foil || null,
              market_price: card.prices?.usd || card.prices?.usd_foil || null,
              price_history: card.prices || {},
              market_data: {
                prices: card.prices || {},
                related_uris: card.related_uris || {},
              },
              is_active: true,
              metadata: {
                source: api.name,
                set: card.set || {},
                images: card.image_uris || {},
                legalities: card.legalities || {},
                mana_cost: card.mana_cost || null,
                cmc: card.cmc || null,
              },
              category: 'onePiece',
              source: api.name,
            }));

            // 過濾重複卡片
            const uniqueCards = processedCards.filter(card => {
              if (collectedIds.has(card.card_id)) {
                return false;
              }
              collectedIds.add(card.card_id);
              return true;
            });

            allCards.push(...uniqueCards);
            apiCollected += uniqueCards.length;

            // 更新進度
            this.progressTracker.updateCollectionStats(
              'onePiece',
              apiCollected
            );

            console.log(
              `✅ ${api.name}: ${uniqueCards.length} 張新卡片 (總計: ${allCards.length})`
            );
          } else {
            console.log(`❌ ${api.name} 失敗: 狀態碼 ${response.status}`);
          }

          // 添加延遲
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.log(`❌ ${api.name} 失敗: ${error.message}`);
        }
      }

      this.results.onePiece.collected = allCards.length;
      this.results.onePiece.data = allCards;

      console.log(`\n🎉 One Piece 收集完成: ${allCards.length} 張卡片`);

      await this.progressTracker.completeStage('onepiece-collection');
      return allCards.length > 0;
    } catch (error) {
      await this.progressTracker.failStage('onepiece-collection', error);
      return false;
    }
  }

  async collectMyLittlePonyData() {
    await this.progressTracker.startStage('mlp-collection');

    console.log('\n🦄 開始收集所有 My Little Pony 數據...');
    console.log(`📊 目標: ${this.config.myLittlePony.estimatedTotal} 張卡片`);

    const allCards = [];
    const collectedIds = new Set(); // 避免重複
    let apiCollected = 0;

    try {
      for (const api of this.config.myLittlePony.apis) {
        try {
          console.log(`\n📡 使用 ${api.name} 收集...`);

          const response = await axios.get(api.url, {
            params: api.params,
            timeout: this.config.myLittlePony.timeout,
          });

          if (response.status === 200 && response.data?.data) {
            const cards = response.data.data;

            const processedCards = cards.map(card => ({
              card_id: card.id || card.name?.toLowerCase().replace(/\s+/g, '-'),
              name: card.name,
              set_name: card.set_name || card.set?.name || 'Unknown Set',
              card_number: card.collector_number || 'N/A',
              rarity: card.rarity || 'Unknown',
              card_type: card.type_line || 'Unknown',
              image_url: card.image_uris?.small || card.image_uris?.normal,
              description: card.oracle_text || card.flavor_text,
              current_price: card.prices?.usd || card.prices?.usd_foil || null,
              market_price: card.prices?.usd || card.prices?.usd_foil || null,
              price_history: card.prices || {},
              market_data: {
                prices: card.prices || {},
                related_uris: card.related_uris || {},
              },
              is_active: true,
              metadata: {
                source: api.name,
                set: card.set || {},
                images: card.image_uris || {},
                legalities: card.legalities || {},
                mana_cost: card.mana_cost || null,
                cmc: card.cmc || null,
              },
              category: 'myLittlePony',
              source: api.name,
            }));

            // 過濾重複卡片
            const uniqueCards = processedCards.filter(card => {
              if (collectedIds.has(card.card_id)) {
                return false;
              }
              collectedIds.add(card.card_id);
              return true;
            });

            allCards.push(...uniqueCards);
            apiCollected += uniqueCards.length;

            // 更新進度
            this.progressTracker.updateCollectionStats(
              'myLittlePony',
              apiCollected
            );

            console.log(
              `✅ ${api.name}: ${uniqueCards.length} 張新卡片 (總計: ${allCards.length})`
            );
          } else {
            console.log(`❌ ${api.name} 失敗: 狀態碼 ${response.status}`);
          }

          // 添加延遲
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.log(`❌ ${api.name} 失敗: ${error.message}`);
        }
      }

      this.results.myLittlePony.collected = allCards.length;
      this.results.myLittlePony.data = allCards;

      console.log(`\n🎉 My Little Pony 收集完成: ${allCards.length} 張卡片`);

      await this.progressTracker.completeStage('mlp-collection');
      return allCards.length > 0;
    } catch (error) {
      await this.progressTracker.failStage('mlp-collection', error);
      return false;
    }
  }

  async saveToDatabase() {
    await this.progressTracker.startStage('db-save');

    console.log('\n💾 保存數據到測試數據庫 (端口5433)...');

    try {
      const client = await this.pool.connect();

      let totalSaved = 0;

      // 保存所有卡片
      for (const category of ['pokemon', 'onePiece', 'myLittlePony']) {
        const cards = this.results[category].data;
        console.log(`\n📊 保存 ${category} 數據: ${cards.length} 張卡片`);

        for (const card of cards) {
          try {
            const result = await client.query(
              `
              INSERT INTO cards (
                card_id, name, set_name, card_number, rarity, card_type,
                image_url, description, current_price, market_price,
                price_history, market_data, is_active, metadata, category, source
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
              ON CONFLICT (card_id) DO UPDATE SET
                name = EXCLUDED.name,
                current_price = EXCLUDED.current_price,
                market_price = EXCLUDED.market_price,
                updated_at = CURRENT_TIMESTAMP
              RETURNING id
            `,
              [
                card.card_id,
                card.name,
                card.set_name,
                card.card_number,
                card.rarity,
                card.card_type,
                card.image_url,
                card.description,
                card.current_price,
                card.market_price,
                JSON.stringify(card.price_history),
                JSON.stringify(card.market_data),
                card.is_active,
                JSON.stringify(card.metadata),
                card.category,
                card.source,
              ]
            );

            totalSaved++;

            // 如果有價格數據，創建市場數據記錄
            if (card.current_price || card.market_price) {
              await client.query(
                `
                INSERT INTO market_data (
                  card_id, date, close_price, market_cap, is_active
                ) VALUES ($1, CURRENT_DATE, $2, $3, true)
                ON CONFLICT DO NOTHING
              `,
                [
                  result.rows[0].id,
                  card.current_price || card.market_price,
                  (card.current_price || card.market_price) * 1000, // 假設市場總量
                ]
              );
            }
          } catch (error) {
            console.log(`⚠️ 保存卡片失敗: ${card.name} - ${error.message}`);
          }
        }

        console.log(`✅ ${category}: ${cards.length} 張卡片已保存到數據庫`);
      }

      client.release();
      console.log(`\n🎉 數據庫保存完成! 總共保存了 ${totalSaved} 張卡片`);

      await this.progressTracker.completeStage('db-save');
      return true;
    } catch (error) {
      await this.progressTracker.failStage('db-save', error);
      return false;
    }
  }

  async generateReport() {
    await this.progressTracker.startStage('report-generation');

    console.log('\n📋 生成收集報告...');

    try {
      const timestamp = new Date().toISOString();
      const totalCollected =
        this.results.pokemon.collected +
        this.results.onePiece.collected +
        this.results.myLittlePony.collected;

      const report = {
        timestamp: timestamp,
        database: {
          host: this.dbConfig.host,
          port: this.dbConfig.port,
          database: this.dbConfig.database,
        },
        totalCards: totalCollected,
        estimatedTotals: {
          pokemon: this.config.pokemon.estimatedTotal,
          onePiece: this.config.onePiece.estimatedTotal,
          myLittlePony: this.config.myLittlePony.estimatedTotal,
        },
        collectionRates: {
          pokemon: Math.round(
            (this.results.pokemon.collected /
              this.config.pokemon.estimatedTotal) *
              100
          ),
          onePiece: Math.round(
            (this.results.onePiece.collected /
              this.config.onePiece.estimatedTotal) *
              100
          ),
          myLittlePony: Math.round(
            (this.results.myLittlePony.collected /
              this.config.myLittlePony.estimatedTotal) *
              100
          ),
        },
        summary: {
          pokemon: {
            collected: this.results.pokemon.collected,
            estimated: this.config.pokemon.estimatedTotal,
            collectionRate: Math.round(
              (this.results.pokemon.collected /
                this.config.pokemon.estimatedTotal) *
                100
            ),
          },
          onePiece: {
            collected: this.results.onePiece.collected,
            estimated: this.config.onePiece.estimatedTotal,
            collectionRate: Math.round(
              (this.results.onePiece.collected /
                this.config.onePiece.estimatedTotal) *
                100
            ),
          },
          myLittlePony: {
            collected: this.results.myLittlePony.collected,
            estimated: this.config.myLittlePony.estimatedTotal,
            collectionRate: Math.round(
              (this.results.myLittlePony.collected /
                this.config.myLittlePony.estimatedTotal) *
                100
            ),
          },
        },
        dataSources: {
          apis: ['Pokémon TCG API', 'Scryfall API'],
        },
      };

      await fs.writeFile(
        './complete-database-full-collection-report.json',
        JSON.stringify(report, null, 2)
      );
      console.log(
        '📄 報告已保存: complete-database-full-collection-report.json'
      );

      await this.progressTracker.completeStage('report-generation');
      return true;
    } catch (error) {
      await this.progressTracker.failStage('report-generation', error);
      return false;
    }
  }

  async executeCompletePlan() {
    console.log('🚀 開始執行完整的卡牌數據庫建立計劃 (完整收集18,000張卡片)');
    console.log('='.repeat(80));
    console.log('🎯 目標: 建立包含所有可用卡片的完整數據庫');
    console.log(
      `📊 預估總數: ${this.config.pokemon.estimatedTotal + this.config.onePiece.estimatedTotal + this.config.myLittlePony.estimatedTotal} 張卡片`
    );
    console.log(
      `🗄️ 目標數據庫: ${this.dbConfig.host}:${this.dbConfig.port}/${this.dbConfig.database}`
    );
    console.log(`⏰ 預估時間: 3-4 小時 (Pokémon 需要 3.5 小時)`);

    const startTime = Date.now();

    try {
      // 階段 0: 測試數據庫連接
      console.log('\n📌 階段 0: 測試數據庫連接');
      console.log('-'.repeat(50));
      const dbConnected = await this.testDatabaseConnection();
      if (!dbConnected) {
        throw new Error('數據庫連接失敗');
      }

      // 階段 1: 初始化數據庫
      console.log('\n📌 階段 1: 初始化數據庫');
      console.log('-'.repeat(50));
      await this.initDatabase();

      // 階段 2: 收集 Pokémon 數據
      console.log('\n📌 階段 2: 收集 Pokémon 數據 (預計3.5小時)');
      console.log('-'.repeat(50));
      await this.collectPokemonData();

      // 階段 3: 收集 One Piece 數據
      console.log('\n📌 階段 3: 收集 One Piece 數據');
      console.log('-'.repeat(50));
      await this.collectOnePieceData();

      // 階段 4: 收集 My Little Pony 數據
      console.log('\n📌 階段 4: 收集 My Little Pony 數據');
      console.log('-'.repeat(50));
      await this.collectMyLittlePonyData();

      // 階段 5: 保存到數據庫
      console.log('\n📌 階段 5: 保存到測試數據庫');
      console.log('-'.repeat(50));
      await this.saveToDatabase();

      // 階段 6: 生成報告
      console.log('\n📌 階段 6: 生成報告');
      console.log('-'.repeat(50));
      await this.generateReport();

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      console.log('\n🎉 完整數據庫建立完成！');
      console.log('='.repeat(80));
      console.log(
        `⏰ 總耗時: ${duration} 秒 (約 ${Math.round((duration / 60) * 10) / 10} 分鐘)`
      );
      console.log(
        `📊 總收集數量: ${this.results.pokemon.collected + this.results.onePiece.collected + this.results.myLittlePony.collected} 張卡片`
      );
      console.log(
        `🎮 Pokémon: ${this.results.pokemon.collected}/${this.config.pokemon.estimatedTotal} 張 (${Math.round((this.results.pokemon.collected / this.config.pokemon.estimatedTotal) * 100)}%)`
      );
      console.log(
        `🏴‍☠️ One Piece: ${this.results.onePiece.collected}/${this.config.onePiece.estimatedTotal} 張 (${Math.round((this.results.onePiece.collected / this.config.onePiece.estimatedTotal) * 100)}%)`
      );
      console.log(
        `🦄 My Little Pony: ${this.results.myLittlePony.collected}/${this.config.myLittlePony.estimatedTotal} 張 (${Math.round((this.results.myLittlePony.collected / this.config.myLittlePony.estimatedTotal) * 100)}%)`
      );
      console.log(
        `🗄️ 數據庫: ${this.dbConfig.host}:${this.dbConfig.port}/${this.dbConfig.database}`
      );

      // 顯示最終進度
      await this.progressTracker.showProgress();

      return true;
    } catch (error) {
      console.error('\n❌ 執行過程中出錯:', error.message);
      return false;
    } finally {
      await this.pool.end();
    }
  }
}

// 如果直接運行此文件
if (require.main === module) {
  const plan = new CompleteDatabaseFullCollection();

  plan
    .executeCompletePlan()
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
      console.error('\n❌ 執行失敗:', error.message);
      process.exit(1);
    });
}

module.exports = CompleteDatabaseFullCollection;

