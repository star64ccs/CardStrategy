const { Pool } = require('pg');

class QueryOptimizer {
  constructor(pool) {
    this.pool = pool;
    this.queryCache = new Map();
    this.slowQueryThreshold = 1000; // 1秒
  }

  async executeOptimizedQuery(query, params = [], options = {}) {
    const startTime = Date.now();
    const cacheKey = `${query}:${JSON.stringify(params)}`;
    
    try {
      // 檢查緩存
      if (options.cache && this.queryCache.has(cacheKey)) {
        const cached = this.queryCache.get(cacheKey);
        if (Date.now() - cached.timestamp < (options.cacheTTL || 300000)) {
          return cached.result;
        }
      }

      // 執行查詢
      const result = await this.pool.query(query, params);
      const executionTime = Date.now() - startTime;

      // 記錄慢查詢
      if (executionTime > this.slowQueryThreshold) {
        console.warn(`慢查詢檢測: ${executionTime}ms`);
        console.warn(`查詢: ${query}`);
        console.warn(`參數: ${JSON.stringify(params)}`);
      }

      // 緩存結果
      if (options.cache) {
        this.queryCache.set(cacheKey, {
          result,
          timestamp: Date.now()
        });
      }

      return result;
    } catch (error) {
      console.error('查詢執行失敗:', error);
      throw error;
    }
  }

  // 分頁查詢優化
  async paginatedQuery(query, params = [], page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as count_query`;
    const paginatedQuery = `${query} LIMIT ${limit} OFFSET ${offset}`;

    const [countResult, dataResult] = await Promise.all([
      this.executeOptimizedQuery(countQuery, params),
      this.executeOptimizedQuery(paginatedQuery, params)
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  // 批量插入優化
  async batchInsert(table, columns, values) {
    if (values.length === 0) return { rowCount: 0 };

    const placeholders = values.map((_, index) => {
      const rowStart = index * columns.length + 1;
      const rowPlaceholders = columns.map((_, colIndex) => 
        `$${rowStart + colIndex}`
      ).join(', ');
      return `(${rowPlaceholders})`;
    }).join(', ');

    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES ${placeholders}
      ON CONFLICT DO NOTHING
    `;

    const flatValues = values.flat();
    return await this.executeOptimizedQuery(query, flatValues);
  }

  // 清理緩存
  clearCache() {
    this.queryCache.clear();
  }

  // 獲取緩存統計
  getCacheStats() {
    return {
      size: this.queryCache.size,
      keys: Array.from(this.queryCache.keys())
    };
  }
}

module.exports = QueryOptimizer;