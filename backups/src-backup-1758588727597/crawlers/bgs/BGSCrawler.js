// BGS 全面爬蟲 - 每款卡牌各一張策略
const axios = require('axios');
const cheerio = require('cheerio');
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

class BGSComprehensiveCrawler {
  constructor() {
    // 數據庫配置
    this.dbConfig = {
      host: 'localhost',
      port: 5433,
      database: 'cardstrategy_test',
      user: 'cardstrategy_test',
      password: 'TestPassword123!',
    };

    // 反爬蟲配置
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    ];

    // BGS 配置 - 更保守的設置
    this.bgsConfig = {
      baseUrl: 'https://www.beckett.com',
      rateLimit: { requestsPerMinute: 3, requestsPerHour: 30 }, // 更保守
      delayBetweenRequests: 6000, // 6秒延遲
      maxRetries: 3,
      timeout: 30000,
    };

    this.pool = new Pool(this.dbConfig);
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.startTime = Date.now();

    // 進度追蹤
    this.progress = {
      totalCards: 0,
      processedCards: 0,
      successCount: 0,
      failCount: 0,
      noDataCount: 0,
      currentCard: null,
      startTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
    };
  }

  // 初始化數據庫連接
  async initializeDatabase() {
    try {
      console.log('🔌 初始化數據庫連接...');
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ 數據庫連接成功');
      await this.ensureGradingDataTable();
      return true;
    } catch (error) {
      console.error('❌ 數據庫連接失敗:', error.message);
      return false;
    }
  }

  // 確保 grading_data 表存在
  async ensureGradingDataTable() {
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS grading_data (
          id SERIAL PRIMARY KEY,
          card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
          grading_company VARCHAR(10) NOT NULL CHECK (grading_company IN ('PSA', 'BGS', 'CGC', 'SGC', 'OTHER')),
          grade DECIMAL(3,1),
          population INTEGER,
          value DECIMAL(10,2),
          last_sale VARCHAR(255),
          last_updated TIMESTAMP,
          source VARCHAR(100) NOT NULL DEFAULT 'unknown',
          metadata TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(card_id, grading_company)
        )
      `);

      // 創建索引
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_grading_data_card_id ON grading_data(card_id)`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_grading_data_company ON grading_data(grading_company)`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_grading_data_grade ON grading_data(grade)`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_grading_data_value ON grading_data(value)`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_grading_data_active ON grading_data(is_active)`
      );

      console.log('✅ grading_data 表結構確認完成');
    } finally {
      client.release();
    }
  }

  // 獲取每款卡牌各一張的策略
  async getUniqueCards() {
    const client = await this.pool.connect();
    try {
      // 使用 DISTINCT ON 獲取每款卡牌的第一張（按名稱和系列分組）
      const result = await client.query(`
        SELECT DISTINCT ON (name, set_name) 
          id, name, set_name, card_id, category, source
        FROM cards 
        WHERE is_active = true 
        AND (
          category IN ('pokemon', 'onePiece', 'onepiece', 'mlp', 'myLittlePony')
          OR (category IS NULL AND (
            (name ILIKE '%pokemon%' OR name ILIKE '%pikachu%' OR name ILIKE '%charizard%') AND name NOT ILIKE '%one piece%'
            OR (name ILIKE '%monkey%luffy%' OR name ILIKE '%roronoa%zoro%' OR name ILIKE '%one piece%') AND name NOT ILIKE '%pokemon%'
            OR (name ILIKE '%my little pony%' OR name ILIKE '%twilight sparkle%' OR name ILIKE '%mlp%') AND name NOT ILIKE '%pokemon%'
          ))
        )
        ORDER BY name, set_name, id
      `);

      console.log(`📊 找到 ${result.rows.length} 張獨特卡牌`);

      // 分類統計
      const categoryStats = result.rows.reduce((acc, card) => {
        acc[card.category] = (acc[card.category] || 0) + 1;
        return acc;
      }, {});

      console.log('📋 卡牌分布:');
      Object.entries(categoryStats).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} 張`);
      });

      return result.rows;
    } finally {
      client.release();
    }
  }

  // 獲取隨機用戶代理
  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  // 構建請求頭
  getHeaders() {
    const userAgent = this.getRandomUserAgent();
    return {
      'User-Agent': userAgent,
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
    };
  }

  // 智能延遲
  async intelligentDelay() {
    const baseDelay = this.bgsConfig.delayBetweenRequests;
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    const frequencyPenalty = timeSinceLastRequest < 1000 ? 2000 : 0;
    const randomDelay = Math.floor(Math.random() * 1000);
    const totalDelay = baseDelay + frequencyPenalty + randomDelay;

    console.log(`   ⏱️ 延遲 ${totalDelay}ms...`);
    await new Promise(resolve => setTimeout(resolve, totalDelay));
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  // 帶反爬蟲的請求
  async makeRequest(url, params = {}) {
    for (let attempt = 1; attempt <= this.bgsConfig.maxRetries; attempt++) {
      try {
        console.log(
          `   🔄 嘗試 ${attempt}/${this.bgsConfig.maxRetries}: ${url}`
        );
        await this.intelligentDelay();

        const response = await axios.get(url, {
          params,
          headers: this.getHeaders(),
          timeout: this.bgsConfig.timeout,
          maxRedirects: 5,
          validateStatus: status => status < 500,
        });

        if (response.status === 200) {
          console.log(`   ✅ 成功獲取數據 (${response.status})`);
          return {
            success: true,
            data: response.data,
            response: response,
            attempt: attempt,
          };
        } else if (response.status === 403) {
          console.log(`   ⚠️ 403 錯誤，嘗試不同策略...`);
          const bypassResult = await this.tryBypass403(url, params);
          if (bypassResult.success) {
            return bypassResult;
          }
        } else {
          console.log(`   ⚠️ HTTP ${response.status}，重試中...`);
        }
      } catch (error) {
        console.log(`   ❌ 嘗試 ${attempt} 失敗: ${error.message}`);
        if (attempt === this.bgsConfig.maxRetries) {
          return {
            success: false,
            error: error.message,
            attempts: this.bgsConfig.maxRetries,
          };
        }
        await new Promise(resolve =>
          setTimeout(resolve, this.bgsConfig.delayBetweenRequests * attempt)
        );
      }
    }
    return {
      success: false,
      error: 'Max retries exceeded',
      attempts: this.bgsConfig.maxRetries,
    };
  }

  // 嘗試繞過 403 錯誤
  async tryBypass403(url, params) {
    const strategies = [
      () => this.tryMobileUserAgent(url, params),
      () => this.tryDifferentHeaders(url, params),
      () => this.trySessionCookies(url, params),
    ];

    for (const strategy of strategies) {
      try {
        console.log(`   🛡️ 嘗試反 403 策略...`);
        const result = await strategy();
        if (result && result.status === 200) {
          console.log(`   ✅ 策略成功！`);
          return { success: true, data: result.data, response: result };
        }
      } catch (error) {
        console.log(`   ⚠️ 策略失敗: ${error.message}`);
      }
    }
    throw new Error('All 403 bypass strategies failed');
  }

  // 策略 1: 移動端用戶代理
  async tryMobileUserAgent(url, params) {
    const mobileUserAgent = this.userAgents.find(
      ua => ua.includes('iPhone') || ua.includes('Mobile')
    );
    return await axios.get(url, {
      params,
      headers: {
        ...this.getHeaders(),
        'User-Agent': mobileUserAgent,
        'Sec-Ch-Ua-Mobile': '?1',
      },
      timeout: this.bgsConfig.timeout,
    });
  }

  // 策略 2: 不同請求頭
  async tryDifferentHeaders(url, params) {
    return await axios.get(url, {
      params,
      headers: {
        'User-Agent': this.getRandomUserAgent(),
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: this.bgsConfig.timeout,
    });
  }

  // 策略 3: 會話 Cookie
  async trySessionCookies(url, params) {
    try {
      const homeResponse = await axios.get(this.bgsConfig.baseUrl, {
        headers: this.getHeaders(),
        timeout: 10000,
      });
      const cookies = this.extractCookies(homeResponse.headers);
      return await axios.get(url, {
        params,
        headers: { ...this.getHeaders(), Cookie: cookies },
        timeout: this.bgsConfig.timeout,
      });
    } catch (error) {
      throw error;
    }
  }

  // 提取 Cookie
  extractCookies(headers) {
    const setCookieHeaders = headers['set-cookie'] || [];
    return setCookieHeaders.map(cookie => cookie.split(';')[0]).join('; ');
  }

  // 爬取 BGS 數據
  async scrapeBGSData(card) {
    try {
      console.log(`🔍 爬取 BGS 數據: ${card.name} (${card.set_name})`);

      // 構建搜索 URL
      const searchUrl = `${this.bgsConfig.baseUrl}/grading/`;
      const searchParams = {
        card: card.name,
        year: this.extractYearFromSet(card.set_name),
        sport: '1',
      };

      const result = await this.makeRequest(searchUrl, searchParams);

      if (!result.success) {
        console.log(`❌ 無法獲取 BGS 數據: ${result.error}`);
        return null;
      }

      // 解析 HTML
      const $ = cheerio.load(result.data);
      const gradingData = this.parseBGSGradingReport($, card);

      if (gradingData) {
        console.log(
          `✅ 解析成功: ${gradingData.grade} 分, 人口: ${gradingData.population}`
        );
        return {
          ...gradingData,
          cardId: card.id,
          searchUrl,
          searchParams,
          scrapedAt: new Date().toISOString(),
        };
      }

      return null;
    } catch (error) {
      console.error(`❌ BGS 爬取失敗 - ${card.name}:`, error.message);
      return null;
    }
  }

  // 解析 BGS 鑑定報告
  parseBGSGradingReport($, card) {
    try {
      const gradingTable = $(
        '.grading-report table, .population-report table, table'
      );
      if (gradingTable.length === 0) {
        console.log(`   ⚠️ 未找到鑑定表格`);
        return null;
      }

      const rows = gradingTable.find('tr');
      let bestGrade = null;
      let maxValue = 0;

      rows.each((index, row) => {
        if (index === 0) return;
        const cells = $(row).find('td');
        if (cells.length >= 3) {
          const gradeText = $(cells[0]).text().trim();
          const populationText = $(cells[1]).text().trim();
          const valueText = $(cells[2]).text().trim();

          const grade = parseFloat(gradeText) || null;
          const population = parseInt(populationText) || 0;
          const value = parseFloat(valueText.replace(/[$,]/g, '')) || 0;

          if (grade && value > maxValue) {
            maxValue = value;
            bestGrade = {
              grade: grade,
              population: population,
              value: value,
              lastSale: cells.length >= 4 ? $(cells[3]).text().trim() : null,
            };
          }
        }
      });

      return bestGrade;
    } catch (error) {
      console.error('❌ 解析 BGS 鑑定報告失敗:', error);
      return null;
    }
  }

  // 從套裝名稱提取年份
  extractYearFromSet(setName) {
    if (!setName) return null;
    const yearMatch = setName.match(/(\d{4})/);
    return yearMatch ? yearMatch[1] : null;
  }

  // 保存到數據庫
  async saveGradingData(gradingData) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `
        INSERT INTO grading_data (
          card_id, grading_company, grade, population, value, last_sale,
          last_updated, source, metadata, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (card_id, grading_company) DO UPDATE SET
          grade = EXCLUDED.grade,
          population = EXCLUDED.population,
          value = EXCLUDED.value,
          last_sale = EXCLUDED.last_sale,
          last_updated = EXCLUDED.last_updated,
          source = EXCLUDED.source,
          metadata = EXCLUDED.metadata,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `,
        [
          gradingData.cardId,
          'BGS',
          gradingData.grade,
          gradingData.population,
          gradingData.value,
          gradingData.lastSale,
          gradingData.scrapedAt,
          'bgs_website',
          JSON.stringify({
            url: gradingData.searchUrl,
            params: gradingData.searchParams,
            scrapedAt: gradingData.scrapedAt,
            rawData: gradingData,
          }),
          true,
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );

      console.log(`💾 保存成功: ID ${result.rows[0].id}`);
      return result.rows[0].id;
    } catch (error) {
      console.error('❌ 保存失敗:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // 更新進度
  updateProgress(card, status, result = null) {
    this.progress.processedCards++;
    this.progress.currentCard = card;
    this.progress.lastUpdate = new Date().toISOString();

    if (status === 'success') {
      this.progress.successCount++;
    } else if (status === 'no_data') {
      this.progress.noDataCount++;
    } else {
      this.progress.failCount++;
    }

    // 計算進度百分比
    const progressPercent = (
      (this.progress.processedCards / this.progress.totalCards) *
      100
    ).toFixed(1);
    const elapsedTime = Date.now() - this.startTime;
    const avgTimePerCard = elapsedTime / this.progress.processedCards;
    const estimatedRemaining =
      (this.progress.totalCards - this.progress.processedCards) *
      avgTimePerCard;
    const estimatedEndTime = new Date(Date.now() + estimatedRemaining);

    console.log(`\n📊 進度更新 (${progressPercent}%):`);
    console.log(
      `   處理: ${this.progress.processedCards}/${this.progress.totalCards}`
    );
    console.log(`   成功: ${this.progress.successCount}`);
    console.log(`   無數據: ${this.progress.noDataCount}`);
    console.log(`   失敗: ${this.progress.failCount}`);
    console.log(`   當前: ${card.name}`);
    console.log(`   預計完成: ${estimatedEndTime.toLocaleString()}`);

    // 每處理10張卡牌保存進度
    if (this.progress.processedCards % 10 === 0) {
      this.saveProgressReport();
    }
  }

  // 保存進度報告
  async saveProgressReport() {
    const report = {
      ...this.progress,
      requestCount: this.requestCount,
      elapsedTime: Date.now() - this.startTime,
      estimatedRemaining:
        this.progress.totalCards > 0
          ? ((this.progress.totalCards - this.progress.processedCards) *
              (Date.now() - this.startTime)) /
            this.progress.processedCards
          : 0,
    };

    try {
      await fs.writeFile(
        'bgs-progress-report.json',
        JSON.stringify(report, null, 2)
      );
    } catch (error) {
      console.error('❌ 保存進度報告失敗:', error.message);
    }
  }

  // 主要執行方法
  async run() {
    console.log('🚀 開始 BGS 全面爬蟲 - 每款卡牌各一張策略');
    console.log('='.repeat(80));

    try {
      // 初始化數據庫
      const dbReady = await this.initializeDatabase();
      if (!dbReady) {
        throw new Error('數據庫初始化失敗');
      }

      // 獲取獨特卡牌數據
      const cards = await this.getUniqueCards();
      if (cards.length === 0) {
        console.log('⚠️ 沒有找到卡牌數據');
        return;
      }

      this.progress.totalCards = cards.length;
      this.progress.startTime = new Date().toISOString();

      const results = [];

      // 逐個處理卡牌
      for (const card of cards) {
        try {
          const gradingData = await this.scrapeBGSData(card);

          if (gradingData) {
            const savedId = await this.saveGradingData(gradingData);
            results.push({
              cardId: card.id,
              cardName: card.name,
              setName: card.set_name,
              category: card.category,
              grade: gradingData.grade,
              population: gradingData.population,
              value: gradingData.value,
              savedId: savedId,
              status: 'success',
            });
            this.updateProgress(card, 'success', gradingData);
          } else {
            results.push({
              cardId: card.id,
              cardName: card.name,
              setName: card.set_name,
              category: card.category,
              status: 'no_data',
            });
            this.updateProgress(card, 'no_data');
          }
        } catch (error) {
          console.error(`❌ 處理卡牌失敗 - ${card.name}:`, error.message);
          results.push({
            cardId: card.id,
            cardName: card.name,
            setName: card.set_name,
            category: card.category,
            status: 'error',
            error: error.message,
          });
          this.updateProgress(card, 'error');
        }
      }

      // 生成最終報告
      console.log('\n' + '='.repeat(80));
      console.log('📊 BGS 全面爬蟲執行報告');
      console.log('='.repeat(80));
      console.log(`✅ 成功: ${this.progress.successCount} 張卡牌`);
      console.log(`⚠️ 無數據: ${this.progress.noDataCount} 張卡牌`);
      console.log(`❌ 失敗: ${this.progress.failCount} 張卡牌`);
      console.log(`📊 總計: ${cards.length} 張卡牌`);
      console.log(`🔄 請求次數: ${this.requestCount}`);
      console.log(
        `⏱️ 總耗時: ${Math.round((Date.now() - this.startTime) / 1000 / 60)} 分鐘`
      );

      // 保存結果報告
      const finalReport = {
        ...this.progress,
        timestamp: new Date().toISOString(),
        totalCards: cards.length,
        requestCount: this.requestCount,
        totalTime: Date.now() - this.startTime,
        results: results,
      };

      await fs.writeFile(
        'bgs-comprehensive-report.json',
        JSON.stringify(finalReport, null, 2)
      );
      console.log('📄 詳細報告已保存到: bgs-comprehensive-report.json');

      return finalReport;
    } catch (error) {
      console.error('❌ BGS 全面爬蟲執行失敗:', error.message);
      throw error;
    } finally {
      await this.pool.end();
    }
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  const crawler = new BGSComprehensiveCrawler();
  crawler
    .run()
    .then(report => {
      console.log('\n🎉 BGS 全面爬蟲執行完成！');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ BGS 全面爬蟲執行失敗:', error.message);
      process.exit(1);
    });
}

module.exports = BGSComprehensiveCrawler;
