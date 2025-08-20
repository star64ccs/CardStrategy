const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const redisConfig = require('../../config/redis');

/**
 * 數據庫查詢優化服務
 * 提供查詢優化、索引建議、批量操作等功能
 */
class DatabaseOptimizer {
  constructor() {
    this.queryStats = new Map();
    this.slowQueryThreshold = 1000; // 1秒
    this.maxQueryTime = 30000; // 30秒
    this.cacheEnabled = true;
    this.batchSize = 100;
  }

  /**
   * 優化查詢參數
   */
  optimizeQuery(queryOptions) {
    const optimized = { ...queryOptions };

    // 限制結果數量
    if (!optimized.limit || optimized.limit > 1000) {
      optimized.limit = Math.min(optimized.limit || 50, 1000);
    }

    // 優化 include 關聯
    if (optimized.include) {
      optimized.include = this.optimizeIncludes(optimized.include);
    }

    // 添加查詢超時
    if (!optimized.timeout) {
      optimized.timeout = this.maxQueryTime;
    }

    // 優化排序
    if (optimized.order) {
      optimized.order = this.optimizeOrder(optimized.order);
    }

    // 添加查詢統計
    optimized.benchmark = true;

    return optimized;
  }

  /**
   * 優化關聯查詢
   */
  optimizeIncludes(includes) {
    return includes.map(include => {
      const optimized = { ...include };

      // 限制關聯查詢的結果數量
      if (!optimized.limit) {
        optimized.limit = 100;
      }

      // 優化嵌套關聯
      if (optimized.include) {
        optimized.include = this.optimizeIncludes(optimized.include);
      }

      // 只選擇必要的字段
      if (!optimized.attributes) {
        optimized.attributes = { exclude: ['createdAt', 'updatedAt'] };
      }

      return optimized;
    });
  }

  /**
   * 優化排序
   */
  optimizeOrder(order) {
    if (Array.isArray(order)) {
      return order.map(item => {
        if (typeof item === 'string') {
          return [item, 'ASC'];
        }
        return item;
      });
    }
    return order;
  }

  /**
   * 批量查詢優化
   */
  async batchQuery(model, ids, options = {}) {
    const { batchSize = this.batchSize, include, where = {} } = options;
    const results = [];
    const batches = this.chunkArray(ids, batchSize);

    logger.info(`開始批量查詢 ${model.name}，共 ${ids.length} 個 ID，分 ${batches.length} 批`);

    for (let i = 0; i < batches.length; i++) {
      const batchIds = batches[i];
      const batchWhere = {
        ...where,
        id: { [Op.in]: batchIds }
      };

      try {
        const batchResults = await model.findAll({
          where: batchWhere,
          include,
          benchmark: true
        });

        results.push(...batchResults);
        logger.info(`批次 ${i + 1}/${batches.length} 完成，獲取 ${batchResults.length} 條記錄`);
      } catch (error) {
        logger.error(`批次 ${i + 1} 查詢失敗:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * 優化分頁查詢
   */
  async paginatedQuery(model, page = 1, limit = 20, options = {}) {
    const offset = (page - 1) * limit;
    const optimizedOptions = this.optimizeQuery({
      ...options,
      limit,
      offset
    });

    try {
      const { count, rows } = await model.findAndCountAll(optimizedOptions);

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
          hasNext: page * limit < count,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('分頁查詢失敗:', error);
      throw error;
    }
  }

  /**
   * 緩存查詢結果
   */
  async cachedQuery(model, cacheKey, queryOptions, ttl = 300) {
    if (!this.cacheEnabled) {
      return await model.findAll(queryOptions);
    }

    try {
      // 嘗試從緩存獲取
      const redisClient = redisConfig.getClient();
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        logger.info(`緩存命中: ${cacheKey}`);
        return JSON.parse(cached);
      }

      // 執行查詢
      const results = await model.findAll(queryOptions);

      // 緩存結果
      await redisClient.setEx(cacheKey, ttl, JSON.stringify(results));
      logger.info(`查詢結果已緩存: ${cacheKey}`);

      return results;
    } catch (error) {
      logger.error('緩存查詢失敗:', error);
      // 降級到直接查詢
      return await model.findAll(queryOptions);
    }
  }

  /**
   * 批量插入優化
   */
  async batchInsert(model, records, options = {}) {
    const { batchSize = this.batchSize, ignoreDuplicates = false } = options;
    const batches = this.chunkArray(records, batchSize);
    const results = [];

    logger.info(`開始批量插入 ${model.name}，共 ${records.length} 條記錄，分 ${batches.length} 批`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      try {
        let batchResults;
        if (ignoreDuplicates) {
          batchResults = await model.bulkCreate(batch, {
            ignoreDuplicates: true,
            returning: true
          });
        } else {
          batchResults = await model.bulkCreate(batch, {
            returning: true
          });
        }

        results.push(...batchResults);
        logger.info(`批次 ${i + 1}/${batches.length} 插入完成，插入 ${batchResults.length} 條記錄`);
      } catch (error) {
        logger.error(`批次 ${i + 1} 插入失敗:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * 批量更新優化
   */
  async batchUpdate(model, updates, options = {}) {
    const { batchSize = this.batchSize, whereField = 'id' } = options;
    const results = [];

    logger.info(`開始批量更新 ${model.name}，共 ${updates.length} 條記錄`);

    for (const update of updates) {
      try {
        const result = await model.update(update.data, {
          where: { [whereField]: update[whereField] },
          returning: true
        });
        results.push(result);
      } catch (error) {
        logger.error('更新記錄失敗:', error);
        throw error;
      }
    }

    return results;
  }

  /**
   * 查詢性能分析
   */
  async analyzeQuery(model, queryOptions) {
    const startTime = Date.now();

    try {
      // 執行查詢並獲取執行計劃
      const explainQuery = await model.sequelize.query(
        `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${model.sequelize.getQueryInterface().queryGenerator.selectQuery(
          model.getTableName(),
          queryOptions,
          model
        )}`,
        { type: model.sequelize.QueryTypes.SELECT }
      );

      const executionTime = Date.now() - startTime;

      return {
        executionTime,
        explainPlan: explainQuery[0],
        isSlow: executionTime > this.slowQueryThreshold,
        recommendations: this.generateRecommendations(explainQuery[0], executionTime)
      };
    } catch (error) {
      logger.error('查詢分析失敗:', error);
      throw error;
    }
  }

  /**
   * 生成優化建議
   */
  generateRecommendations(explainPlan, executionTime) {
    const recommendations = [];

    if (executionTime > this.slowQueryThreshold) {
      recommendations.push('查詢執行時間過長，建議添加索引或優化查詢條件');
    }

    if (explainPlan['Planning Time'] > 100) {
      recommendations.push('查詢計劃時間過長，建議更新統計信息');
    }

    if (explainPlan['Execution Time'] > 500) {
      recommendations.push('查詢執行時間過長，建議檢查索引使用情況');
    }

    return recommendations;
  }

  /**
   * 索引建議
   */
  async suggestIndexes(model, queryPatterns) {
    const suggestions = [];

    for (const pattern of queryPatterns) {
      const { where, order, include } = pattern;

      // 分析 where 條件
      if (where) {
        const whereFields = this.extractFields(where);
        if (whereFields.length > 0) {
          suggestions.push({
            type: 'WHERE',
            fields: whereFields,
            priority: 'high'
          });
        }
      }

      // 分析排序字段
      if (order) {
        const orderFields = this.extractOrderFields(order);
        if (orderFields.length > 0) {
          suggestions.push({
            type: 'ORDER',
            fields: orderFields,
            priority: 'medium'
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * 提取查詢字段
   */
  extractFields(where) {
    const fields = [];

    const extract = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          extract(value);
        } else {
          fields.push(key);
        }
      }
    };

    extract(where);
    return [...new Set(fields)];
  }

  /**
   * 提取排序字段
   */
  extractOrderFields(order) {
    if (Array.isArray(order)) {
      return order.map(item => {
        if (Array.isArray(item)) {
          return item[0];
        }
        return item;
      });
    }
    return [order];
  }

  /**
   * 數組分塊
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 獲取查詢統計
   */
  getQueryStats() {
    const stats = {};
    for (const [query, data] of this.queryStats) {
      stats[query] = {
        count: data.count,
        avgTime: data.totalTime / data.count,
        maxTime: data.maxTime,
        minTime: data.minTime,
        slowQueries: data.slowQueries
      };
    }
    return stats;
  }

  /**
   * 記錄查詢統計
   */
  recordQueryStats(query, executionTime) {
    if (!this.queryStats.has(query)) {
      this.queryStats.set(query, {
        count: 0,
        totalTime: 0,
        maxTime: 0,
        minTime: Infinity,
        slowQueries: 0
      });
    }

    const stats = this.queryStats.get(query);
    stats.count++;
    stats.totalTime += executionTime;
    stats.maxTime = Math.max(stats.maxTime, executionTime);
    stats.minTime = Math.min(stats.minTime, executionTime);

    if (executionTime > this.slowQueryThreshold) {
      stats.slowQueries++;
    }
  }

  /**
   * 清理查詢統計
   */
  clearQueryStats() {
    this.queryStats.clear();
    logger.info('查詢統計已清理');
  }

  /**
   * 設置配置
   */
  setConfig(config) {
    Object.assign(this, config);
    logger.info('數據庫優化器配置已更新:', config);
  }

  /**
   * 獲取配置
   */
  getConfig() {
    return {
      slowQueryThreshold: this.slowQueryThreshold,
      maxQueryTime: this.maxQueryTime,
      cacheEnabled: this.cacheEnabled,
      batchSize: this.batchSize
    };
  }
}

// 創建單例實例
const databaseOptimizer = new DatabaseOptimizer();

module.exports = databaseOptimizer;
