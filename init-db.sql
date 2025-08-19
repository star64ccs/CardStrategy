-- CardStrategy 數據庫初始化腳本
-- 創建數據庫和用戶

-- 創建數據庫
CREATE DATABASE cardstrategy_db;

-- 創建用戶
CREATE USER cardstrategy_user WITH PASSWORD 'cardstrategy_password';

-- 授予權限
GRANT ALL PRIVILEGES ON DATABASE cardstrategy_db TO cardstrategy_user;

-- 連接到數據庫
\c cardstrategy_db;

-- 創建擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 創建用戶表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建卡牌表
CREATE TABLE cards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    set_name VARCHAR(255),
    card_number VARCHAR(50),
    rarity VARCHAR(50),
    condition_grade VARCHAR(10),
    estimated_value DECIMAL(10,2),
    image_url VARCHAR(500),
    description TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建投資記錄表
CREATE TABLE investments (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    purchase_price DECIMAL(10,2) NOT NULL,
    purchase_date DATE NOT NULL,
    current_value DECIMAL(10,2),
    profit_loss DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建市場數據表
CREATE TABLE market_data (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    volume INTEGER,
    trend VARCHAR(20),
    source VARCHAR(100),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建 AI 預測記錄表
CREATE TABLE ai_predictions (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    predicted_price DECIMAL(10,2) NOT NULL,
    confidence_score DECIMAL(5,4),
    model_type VARCHAR(50),
    prediction_date DATE NOT NULL,
    actual_price DECIMAL(10,2),
    accuracy DECIMAL(5,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建模型持久化表
CREATE TABLE model_persistence (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    version VARCHAR(20) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    checksum VARCHAR(64),
    metadata JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建監控告警表
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    message TEXT NOT NULL,
    value DECIMAL(10,4),
    threshold DECIMAL(10,4),
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建系統日誌表
CREATE TABLE system_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(10) NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建性能指標表
CREATE TABLE performance_metrics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    unit VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建備份記錄表
CREATE TABLE backup_records (
    id SERIAL PRIMARY KEY,
    backup_type VARCHAR(20) NOT NULL CHECK (backup_type IN ('database', 'files', 'full')),
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    checksum VARCHAR(64),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_name ON cards USING gin(name gin_trgm_ops);
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_card_id ON investments(card_id);
CREATE INDEX idx_market_data_card_id ON market_data(card_id);
CREATE INDEX idx_market_data_recorded_at ON market_data(recorded_at);
CREATE INDEX idx_ai_predictions_card_id ON ai_predictions(card_id);
CREATE INDEX idx_ai_predictions_prediction_date ON ai_predictions(prediction_date);
CREATE INDEX idx_model_persistence_model_name ON model_persistence(model_name);
CREATE INDEX idx_model_persistence_model_type ON model_persistence(model_type);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX idx_performance_metrics_metric_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX idx_backup_records_backup_type ON backup_records(backup_type);
CREATE INDEX idx_backup_records_created_at ON backup_records(created_at);

-- 創建觸發器函數來更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為需要 updated_at 的表創建觸發器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_model_persistence_updated_at BEFORE UPDATE ON model_persistence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 創建視圖
CREATE VIEW card_investment_summary AS
SELECT 
    c.id as card_id,
    c.name as card_name,
    c.set_name,
    c.condition_grade,
    c.estimated_value,
    i.purchase_price,
    i.purchase_date,
    i.current_value,
    i.profit_loss,
    u.username as owner
FROM cards c
LEFT JOIN investments i ON c.id = i.card_id
LEFT JOIN users u ON c.user_id = u.id;

CREATE VIEW market_trends AS
SELECT 
    c.name as card_name,
    c.set_name,
    AVG(md.price) as avg_price,
    COUNT(md.id) as data_points,
    MIN(md.recorded_at) as first_recorded,
    MAX(md.recorded_at) as last_recorded
FROM market_data md
JOIN cards c ON md.card_id = c.id
GROUP BY c.id, c.name, c.set_name
HAVING COUNT(md.id) > 1;

-- 插入初始管理員用戶
INSERT INTO users (username, email, password_hash, role, is_active, email_verified) 
VALUES (
    'admin',
    'admin@cardstrategy.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', -- 密碼: admin123
    'admin',
    true,
    true
);

-- 插入示例數據
INSERT INTO cards (name, set_name, card_number, rarity, condition_grade, estimated_value, description, user_id) VALUES
('Charizard', 'Base Set', '4/102', 'Holo Rare', 'NM', 1500.00, '經典的噴火龍卡片', 1),
('Pikachu', 'Base Set', '58/102', 'Common', 'LP', 25.00, '皮卡丘基礎卡片', 1),
('Blastoise', 'Base Set', '2/102', 'Holo Rare', 'NM', 800.00, '水箭龜全息卡片', 1);

INSERT INTO investments (card_id, user_id, purchase_price, purchase_date, current_value, profit_loss, notes) VALUES
(1, 1, 1200.00, '2023-01-15', 1500.00, 300.00, '從收藏家手中購入'),
(2, 1, 20.00, '2023-02-20', 25.00, 5.00, '網上拍賣購入'),
(3, 1, 650.00, '2023-03-10', 800.00, 150.00, '卡牌店購入');

INSERT INTO market_data (card_id, price, volume, trend, source) VALUES
(1, 1500.00, 5, 'up', 'TCGPlayer'),
(1, 1450.00, 3, 'down', 'eBay'),
(2, 25.00, 15, 'stable', 'TCGPlayer'),
(3, 800.00, 2, 'up', 'eBay');

-- 授予用戶對所有表的權限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cardstrategy_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cardstrategy_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO cardstrategy_user;

-- 設置默認權限
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO cardstrategy_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO cardstrategy_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO cardstrategy_user;

-- 創建數據庫統計信息
ANALYZE;

-- 顯示創建結果
SELECT 'Database initialization completed successfully!' as status;
