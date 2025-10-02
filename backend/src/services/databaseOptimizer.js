const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const redisConfig = require('../../config/redis');

/**
 * DatabaseQuery優化Service
 * 提供Query優化、Index建議、BatchOperation等功能
 */
class DatabaseOptimizer {
  constructor() {
    this.queryStats = new Map();
    this.slowQueryThreshold = 1000; // 1Second
    this.maxQueryTime = 30000; // 30Second
    this.cacheEnabled = true;
    this.batchSize = 100;
  }

  /**
   * 優化QueryParameter
   */
  optimizeQuery(queryOptions) {
    const optimized = { ...queryOptions };

    // Limit結果數量
    if (!optimized.limit || optimized.limit > 1000) {
      optimized.limit = Math.min(optimized.limit || 50, 1000);
    }

    // 優化 include Off聯
    if (optimized.include) {
      optimized.include = this.optimizeIncludes(optimized.include);
    }

    // AddQuery超時
    if (!optimized.timeout) {
      optimized.timeout = this.maxQueryTime;
    }

    // 優化Sort
    if (optimized.order) {
      optimized.order = this.optimizeOrder(optimized.order);
    }

    // AddQueryStatistics
    optimized.benchmark = true;

    return optimized;
  }

  /**
   * 優化Off聯Query
   */
  optimizeIncludes(includes) {
    return includes.map((include) => {
      const optimized = { ...include };

      // LimitOff聯Query的結果數量
      if (!optimized.limit) {
        optimized.limit = 100;
      }

      // 優化嵌套Off聯
      if (optimized.include) {
        optimized.include = this.optimizeIncludes(optimized.include);
      }

      // 只Select必要的Field
      if (!optimized.attributes) {
        optimized.attributes = { exclude: ['createdAt', 'updatedAt'] };
      }

      return optimized;
    });
  }

  /**
   * 優化Sort
   */
  optimizeOrder(order) {
    if (Array.isArray(order)) {
      return order.map((item) => {
        if (typeof item === 'string') {
          return [item, 'ASC'];
        }
        return item;
      });
    }
    return order;
  }

  /**
   * BatchQuery優化
   */
  async batchQuery(model, ids, options = {}) {
    const { batchSize = this.batchSize, include, where = {} } = options;
// eslint-disable-next-line no-unused-vars
    const results = [];
    const batches = this.chunkArray(ids, batchSize);

    logger.info(
      `開始批量查詢 ${model.name}，共 ${ids.length} 個 ID，分 ${batches.length} 批`
    );

    for (let i = 0; i < batches.length; i++) {
      const batchIds = batches[i];
      const batchWhere = {
        ...where,
        id: { [Op.in]: batchIds },
      };

      try {
        const batchResults = await model.findAll({
          where: batchWhere,
          include,
          benchmark: true,
        });

        results.push(...batchResults);
        logger.info(
          `批次 ${i + 1}/${batches.length} 完成，獲取 ${batchResults.length} 條記錄`
        );
      } catch (error) {
        logger.error(`批次 ${i + 1} 查詢Failed:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * 優化PaginateQuery
   */
  async paginatedQuery(model, page = 1, limit = 20, options = {}) {
    const offset = (page - 1) * limit;
    const optimizedOptions = this.optimizeQuery({
      ...options,
      limit,
      offset,
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
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error('分頁查詢Failed:', error);
      throw error;
    }
  }

  /**
   * CacheQuery結果
   */
  async cachedQuery(model, cacheKey, queryOptions, ttl = 300) {
    if (!this.cacheEnabled) {
      return await model.findAll(queryOptions);
    }

    try {
      // 嘗試從CacheGet
      const redisClient = redisConfig.getClient();
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        logger.info(`緩存命中: ${cacheKey}`);
        return JSON.parse(cached);
      }

      // 執RowQuery
// eslint-disable-next-line no-unused-vars
      const results = await model.findAll(queryOptions);

      // Cache結果
      await redisClient.setEx(cacheKey, ttl, JSON.stringify(results));
      logger.info(`查詢結果已緩存: ${cacheKey}`);

      return results;
    } catch (error) {
      logger.error('緩存查詢Failed:', error);
      // Downgrade到直接Query
      return await model.findAll(queryOptions);
    }
  }

  /**
   * BatchInsert優化
   */
  async batchInsert(model, records, options = {}) {
    const { batchSize = this.batchSize, ignoreDuplicates = false } = options;
    const batches = this.chunkArray(records, batchSize);
// eslint-disable-next-line no-unused-vars
    const results = [];

    logger.info(
      `開始批量插入 ${model.name}，共 ${records.length} 條記錄，分 ${batches.length} 批`
    );

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      try {
        let batchResults;
        if (ignoreDuplicates) {
          batchResults = await model.bulkCreate(batch, {
            ignoreDuplicates: true,
            returning: true,
          });
        } else {
          batchResults = await model.bulkCreate(batch, {
            returning: true,
          });
        }

        results.push(...batchResults);
        logger.info(
          `批次 ${i + 1}/${batches.length} 插入完成，插入 ${batchResults.length} 條記錄`
        );
      } catch (error) {
        logger.error(`批次 ${i + 1} 插入Failed:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * BatchUpdate優化
   */
  async batchUpdate(model, updates, options = {}) {
    const { batchSize = this.batchSize, whereField = 'id' } = options;
// eslint-disable-next-line no-unused-vars
    const results = [];

    logger.info(`開始批量更新 ${model.name}，共 ${updates.length} 條記錄`);

    for (const update of updates) {
      try {
// eslint-disable-next-line no-unused-vars
        const result = await model.update(update.data, {
          where: { [whereField]: update[whereField] },
          returning: true,
        });
        results.push(result);
      } catch (error) {
        logger.error('Update記錄Failed:', error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Query性能Analysis
   */
  async analyzeQuery(model, queryOptions) {
    const startTime = Date.now();

    try {
      // 執RowQuery並Get執Row計劃
      const explainQuery = await model.sequelize.query(
        `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${model.sequelize
          .getQueryInterface()
          .queryGenerator.selectQuery(
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
        recommendations: this.generateRecommendations(
          explainQuery[0],
          executionTime
        ),
      };
    } catch (error) {
      logger.error('查詢分析Failed:', error);
      throw error;
    }
  }

  /**
   * 生成優化建議
   */
  generateRecommendations(explainPlan, executionTime) {
// eslint-disable-next-line no-unused-vars
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
   * Index建議
   */
  async suggestIndexes(model, queryPatterns) {
    const suggestions = [];

// eslint-disable-next-line no-unused-vars
    for (const pattern of queryPatterns) {
      const { where, order, include } = pattern;

      // Analysis where Condition
      if (where) {
        const whereFields = this.extractFields(where);
        if (whereFields.length > 0) {
          suggestions.push({
            type: 'WHERE',
            fields: whereFields,
            priority: 'high',
          });
        }
      }

      // AnalysisSortField
      if (order) {
        const orderFields = this.extractOrderFields(order);
        if (orderFields.length > 0) {
          suggestions.push({
            type: 'ORDER',
            fields: orderFields,
            priority: 'medium',
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * 提取QueryField
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
   * 提取SortField
   */
  extractOrderFields(order) {
    if (Array.isArray(order)) {
      return order.map((item) => {
        if (Array.isArray(item)) {
          return item[0];
        }
        return item;
      });
    }
    return [order];
  }

  /**
   * Array分塊
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * GetQueryStatistics
   */
  getQueryStats() {
    const stats = {};
    for (const [query, data] of this.queryStats) {
      stats[query] = {
        count: data.count,
        avgTime: data.totalTime / data.count,
        maxTime: data.maxTime,
        minTime: data.minTime,
        slowQueries: data.slowQueries,
      };
    }
    return stats;
  }

  /**
   * RecordQueryStatistics
   */
  recordQueryStats(query, executionTime) {
    if (!this.queryStats.has(query)) {
      this.queryStats.set(query, {
        count: 0,
        totalTime: 0,
        maxTime: 0,
        minTime: Infinity,
        slowQueries: 0,
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
   * 清理QueryStatistics
   */
  clearQueryStats() {
    this.queryStats.clear();
    logger.info('查詢統計已清理');
  }

  /**
   * SettingsConfigure
   */
  setConfig(config) {
    Object.assign(this, config);
    logger.info('數據庫優化器配置已更新:', config);
  }

  /**
   * GetConfigure
   */
  getConfig() {
    return {
      slowQueryThreshold: this.slowQueryThreshold,
      maxQueryTime: this.maxQueryTime,
      cacheEnabled: this.cacheEnabled,
      batchSize: this.batchSize,
    };
  }
}

// Create單例Instance
// eslint-disable-next-line no-unused-vars
const databaseOptimizer = new DatabaseOptimizer();

module.exports = databaseOptimizer;
