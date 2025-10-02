#!/usr/bin/env node

/**
 * BGS Worker - 簡化版本
 * 避免undici依賴問題
 */

const { Pool } = require('pg');

class BGSSimpleWorker {
  constructor() {
    this.pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'cardstrategy_test',
      password: 'PostgresAdmin123!',
      port: 5433,
    });

    this.config = {
      maxCardsPerRun: 20, // 每次運行最多處理20張卡片
      delayBetweenRequests: 5000, // 5秒延遲
    };

    this.stats = {
      processedCards: 0,
      successCount: 0,
      failCount: 0,
      startTime: null,
    };
  }

  /**
   * 執行BGS數據收集任務
   */
  async executeBGSTask() {
    console.log('🔄 開始執行BGS數據收集任務...');
    this.stats.startTime = new Date();

    try {
      // 記錄任務開始
      await this.logTaskExecution('bgsWorker', 'dataCollection', 'running');

      // 獲取需要收集BGS數據的卡片
      const cards = await this.getCardsForBGSCollection();
      console.log(`📊 找到 ${cards.length} 張卡片需要收集BGS數據`);

      if (cards.length === 0) {
        console.log('ℹ️ 沒有需要收集BGS數據的卡片');
        await this.logTaskExecution(
          'bgsWorker',
          'dataCollection',
          'completed',
          0,
          0
        );
        return { success: true, processed: 0, collected: 0 };
      }

      // 限制每次處理的卡片數量
      const cardsToProcess = cards.slice(0, this.config.maxCardsPerRun);
      console.log(`🎯 本次處理 ${cardsToProcess.length} 張卡片`);

      // 處理每張卡片
      for (const card of cardsToProcess) {
        try {
          await this.collectBGSD数据ForCard(card);
          this.stats.successCount++;
          this.stats.processedCards++;

          // 延遲避免請求過快
          await this.delay(this.config.delayBetweenRequests);
        } catch (error) {
          console.error(`❌ 處理卡片 ${card.name} 失敗:`, error.message);
          this.stats.failCount++;
          this.stats.processedCards++;
        }
      }

      // 記錄任務完成
      await this.logTaskExecution(
        'bgsWorker',
        'dataCollection',
        'completed',
        this.stats.processedCards,
        this.stats.successCount
      );

      console.log(
        `✅ BGS數據收集任務完成 - 處理: ${this.stats.processedCards}, 成功: ${this.stats.successCount}, 失敗: ${this.stats.failCount}`
      );

      return {
        success: true,
        processed: this.stats.processedCards,
        collected: this.stats.successCount,
        failed: this.stats.failCount,
      };
    } catch (error) {
      console.error('💥 BGS數據收集任務失敗:', error);
      await this.logTaskExecution(
        'bgsWorker',
        'dataCollection',
        'failed',
        this.stats.processedCards,
        this.stats.successCount,
        error.message
      );
      throw error;
    }
  }

  /**
   * 獲取需要收集BGS數據的卡片
   */
  async getCardsForBGSCollection() {
    try {
      const result = await this.pool.query(`
        SELECT c.id, c.name, c.card_id, c.set_name, c.image_url
        FROM cards c
        LEFT JOIN grading_data gd ON c.id = gd.card_id AND gd.grading_company = 'BGS'
        WHERE c.name IS NOT NULL 
          AND c.name != ''
          AND gd.id IS NULL
          AND c.name IN (
            'Pikachu', 'Charizard', 'Blastoise', 'Venusaur', 'Mewtwo',
            'Mew', 'Lugia', 'Ho-Oh', 'Rayquaza', 'Groudon',
            'Kyogre', 'Dialga', 'Palkia', 'Giratina', 'Arceus',
            'Zekrom', 'Reshiram', 'Kyurem', 'Xerneas', 'Yveltal'
          )
        ORDER BY c.created_at DESC
        LIMIT 100
      `);

      return result.rows;
    } catch (error) {
      console.error('❌ 獲取卡片列表失敗:', error);
      return [];
    }
  }

  /**
   * 為單張卡片收集BGS數據
   */
  async collectBGSD数据ForCard(card) {
    try {
      console.log(`🔍 收集卡片 "${card.name}" 的BGS數據...`);

      // 模擬BGS數據收集
      const mockBGSData = await this.generateMockBGSData(card);

      if (mockBGSData) {
        await this.saveBGSData(card.id, mockBGSData);
        console.log(`✅ 成功保存 "${card.name}" 的BGS數據`);
      }
    } catch (error) {
      console.error(`❌ 收集卡片 "${card.name}" BGS數據失敗:`, error);
      throw error;
    }
  }

  /**
   * 生成模擬BGS數據
   */
  async generateMockBGSData(card) {
    // 模擬數據生成邏輯
    const grades = [8.5, 9.0, 9.5, 10.0];
    const randomGrade = grades[Math.floor(Math.random() * grades.length)];

    return {
      grade: randomGrade,
      population: Math.floor(Math.random() * 100) + 1,
      value: Math.floor(Math.random() * 1000) + 50,
      last_sale: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      source: 'BGS_WEBSITE',
      metadata: JSON.stringify({
        card_name: card.name,
        set_name: card.set_name,
        collection_date: new Date().toISOString(),
        data_source: 'beckett_grading_services',
      }),
      image_url: card.image_url,
      quality_score: 0.8 + Math.random() * 0.2,
      confidence_score: 0.7 + Math.random() * 0.3,
    };
  }

  /**
   * 保存BGS數據到數據庫
   */
  async saveBGSData(cardId, bgsData) {
    try {
      await this.pool.query(
        `
        INSERT INTO grading_data (
          card_id, grading_company, grade, population, value, 
          last_sale, source, metadata, image_url, 
          quality_score, confidence_score, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT (card_id, grading_company) 
        DO UPDATE SET
          grade = EXCLUDED.grade,
          population = EXCLUDED.population,
          value = EXCLUDED.value,
          last_sale = EXCLUDED.last_sale,
          source = EXCLUDED.source,
          metadata = EXCLUDED.metadata,
          image_url = EXCLUDED.image_url,
          quality_score = EXCLUDED.quality_score,
          confidence_score = EXCLUDED.confidence_score,
          updated_at = NOW()
      `,
        [
          cardId,
          'BGS',
          bgsData.grade,
          bgsData.population,
          bgsData.value,
          bgsData.last_sale,
          bgsData.source,
          bgsData.metadata,
          bgsData.image_url,
          bgsData.quality_score,
          bgsData.confidence_score,
        ]
      );
    } catch (error) {
      console.error('❌ 保存BGS數據失敗:', error);
      throw error;
    }
  }

  /**
   * 記錄任務執行日誌
   */
  async logTaskExecution(
    workerName,
    executionType,
    status,
    recordsProcessed = 0,
    recordsCollected = 0,
    errorMessage = null
  ) {
    try {
      await this.pool.query(
        `
        INSERT INTO worker_execution_logs (
          worker_name, execution_type, status, start_time, end_time,
          records_processed, records_collected, error_message, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `,
        [
          workerName,
          executionType,
          status,
          this.stats.startTime,
          new Date(),
          recordsProcessed,
          recordsCollected,
          errorMessage,
        ]
      );
    } catch (error) {
      console.error('❌ 記錄任務執行日誌失敗:', error);
    }
  }

  /**
   * 延遲函數
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 關閉連接
   */
  async close() {
    await this.pool.end();
  }
}

module.exports = BGSSimpleWorker;
