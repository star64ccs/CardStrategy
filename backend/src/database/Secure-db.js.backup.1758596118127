const { Pool } = require('pg');

class SecureDatabase {
  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'cardstrategy_test',
      password: process.env.DB_PASSWORD || 'PostgresAdmin123!',
      port: process.env.DB_PORT || 5433,
      // 連接安全配置
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      // 連接池配置
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  // 安全的參數化查詢
  async safeQuery(text, params = []) {
    try {
      // 驗證參數
      this.validateQueryParams(params);
      
      // 執行參數化查詢
      const result = await this.pool.query(text, params);
      return result;
    } catch (error) {
      console.error('數據庫查詢錯誤:', error);
      throw new Error('數據庫操作失敗');
    }
  }

  // 驗證查詢參數
  validateQueryParams(params) {
    if (!Array.isArray(params)) {
      throw new Error('查詢參數必須是數組');
    }

    params.forEach((param, index) => {
      if (param === null || param === undefined) {
        throw new Error(`參數 ${index} 不能為null或undefined`);
      }
      
      // 檢查是否包含潛在的SQL注入模式
      if (typeof param === 'string') {
        const dangerousPatterns = [
          /('|(\\)|;|--|\/\*|\*\/)/i,
          /(union|select|insert|update|delete|drop|create|alter)/i
        ];
        
        if (dangerousPatterns.some(pattern => pattern.test(param))) {
          throw new Error(`參數 ${index} 包含潛在的危險字符`);
        }
      }
    });
  }

  // 安全的用戶查詢
  async findUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    const result = await this.safeQuery(query, [email]);
    return result.rows[0];
  }

  // 安全的卡片查詢
  async findCardsByCategory(category, limit = 50, offset = 0) {
    const query = `
      SELECT id, name, card_id, category, image_url, rarity, price
      FROM cards 
      WHERE category = $1 
      ORDER BY name 
      LIMIT $2 OFFSET $3
    `;
    const result = await this.safeQuery(query, [category, limit, offset]);
    return result.rows;
  }

  // 安全的搜索查詢
  async searchCards(searchTerm, limit = 50) {
    const query = `
      SELECT id, name, card_id, category, image_url, rarity, price
      FROM cards 
      WHERE name ILIKE $1 OR card_id ILIKE $1
      ORDER BY name 
      LIMIT $2
    `;
    const result = await this.safeQuery(query, [`%${searchTerm}%`, limit]);
    return result.rows;
  }

  // 關閉連接池
  async close() {
    await this.pool.end();
  }
}

module.exports = new SecureDatabase();