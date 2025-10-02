// 數據庫優化工具
import { Pool } from 'pg';

class DatabaseOptimizer {
  constructor() {
    this.db = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'cardstrategy',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
      max: 20, // 最大連接數
      min: 5,  // 最小連接數
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    });
  }

  // 創建索引
  async createIndexes() {
    const indexes = [
      // 卡片表索引
      'CREATE INDEX IF NOT EXISTS idx_cards_card_id ON cards(card_id)',
      'CREATE INDEX IF NOT EXISTS idx_cards_series ON cards(series)',
      'CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity)',
      'CREATE INDEX IF NOT EXISTS idx_cards_name ON cards USING gin(to_tsvector('english', name))',
      
      // 市場數據表索引
      'CREATE INDEX IF NOT EXISTS idx_market_data_card_id ON market_data(card_id)',
      'CREATE INDEX IF NOT EXISTS idx_market_data_date ON market_data(date)',
      'CREATE INDEX IF NOT EXISTS idx_market_data_source ON market_data(source)',
      'CREATE INDEX IF NOT EXISTS idx_market_data_currency ON market_data(currency)',
      'CREATE INDEX IF NOT EXISTS idx_market_data_composite ON market_data(card_id, date, currency)',
      
      // 用戶表索引
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      
      // AI 預測表索引
      'CREATE INDEX IF NOT EXISTS idx_ai_predictions_card_id ON ai_predictions(card_id)',
      'CREATE INDEX IF NOT EXISTS idx_ai_predictions_type ON ai_predictions(prediction_type)',
      'CREATE INDEX IF NOT EXISTS idx_ai_predictions_created ON ai_predictions(created_at)',
      
      // 性能日誌表索引
      'CREATE INDEX IF NOT EXISTS idx_performance_logs_timestamp ON performance_logs(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_performance_logs_function ON performance_logs(function_name)'
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

  // 優化查詢計劃
  async optimizeQueryPlans() {
    const queries = [
      // 分析表統計信息
      'ANALYZE cards',
      'ANALYZE market_data',
      'ANALYZE users',
      'ANALYZE ai_predictions',
      
      // 更新表統計信息
      'UPDATE pg_stat_user_tables SET n_tup_ins = 0, n_tup_upd = 0, n_tup_del = 0',
      
      // 清理過期數據
      'DELETE FROM performance_logs WHERE timestamp < NOW() - INTERVAL '30 days'',
      'DELETE FROM market_data WHERE date < NOW() - INTERVAL '2 years''
    ];

    for (const query of queries) {
      try {
        await this.db.query(query);
        console.log('查詢優化成功');
      } catch (error) {
        console.warn('查詢優化失敗:', error.message);
      }
    }
  }

  // 連接池優化
  optimizeConnectionPool() {
    // 監控連接池狀態
    setInterval(async () => {
      try {
        const stats = await this.db.query('SELECT * FROM pg_stat_activity');
        const activeConnections = stats.rows.length;
        
        console.log(`活躍連接數: ${activeConnections}`);
        
        if (activeConnections > 15) {
          console.warn('連接數過高，考慮優化查詢');
        }
      } catch (error) {
        console.error('連接池監控失敗:', error);
      }
    }, 30000); // 每30秒檢查一次
  }

  // 查詢緩存
  createQueryCache() {
    const cache = new Map();
    const maxSize = 1000;
    const ttl = 5 * 60 * 1000; // 5分鐘

    return {
      get: (key) => {
        const item = cache.get(key);
        if (item && Date.now() - item.timestamp < ttl) {
          return item.data;
        }
        cache.delete(key);
        return null;
      },

      set: (key, data) => {
        if (cache.size >= maxSize) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        
        cache.set(key, {
          data,
          timestamp: Date.now()
        });
      },

      clear: () => {
        cache.clear();
      },

      size: () => cache.size
    };
  }

  // 批量操作優化
  async batchInsert(table, data, batchSize = 1000) {
    const batches = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const columns = Object.keys(batch[0]);
      const values = batch.map(item => 
        columns.map(col => item[col])
      );

      const placeholders = values.map((_, i) => 
        `(${columns.map((_, j) => `$${i * columns.length + j + 1}`).join(', ')})`
      ).join(', ');

      const query = `
        INSERT INTO ${table} (${columns.join(', ')})
        VALUES ${placeholders}
        ON CONFLICT DO NOTHING
      `;

      await this.db.query(query, values.flat());
    }
  }

  // 查詢性能分析
  async analyzeQueryPerformance(query, params = []) {
    const start = Date.now();
    
    try {
      const result = await this.db.query(`EXPLAIN ANALYZE ${query}`, params);
      const executionTime = Date.now() - start;
      
      return {
        success: true,
        executionTime,
        explainPlan: result.rows,
        query,
        params
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - start,
        query,
        params
      };
    }
  }

  // 數據庫健康檢查
  async healthCheck() {
    try {
      const start = Date.now();
      await this.db.query('SELECT 1');
      const responseTime = Date.now() - start;

      const stats = await this.db.query(`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity
      `);

      return {
        healthy: true,
        responseTime,
        connections: stats.rows[0]
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  // 清理資源
  async close() {
    await this.db.end();
  }
}

export default DatabaseOptimizer;
