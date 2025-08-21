
// 創建預測模型表
const createPredictionModelsTable = async (sequelize) => {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS prediction_models (
        id SERIAL PRIMARY KEY,
        card_id INTEGER NOT NULL REFERENCES cards(id),
        model_type VARCHAR(20) NOT NULL DEFAULT 'linear' CHECK (model_type IN ('linear', 'polynomial', 'exponential', 'arima', 'lstm', 'ensemble')),
        timeframe VARCHAR(10) NOT NULL DEFAULT '30d' CHECK (timeframe IN ('1d', '7d', '30d', '90d', '180d', '365d')),
        predicted_price DECIMAL(10,2) NOT NULL,
        confidence DECIMAL(5,4) NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
        accuracy DECIMAL(5,4) CHECK (accuracy >= 0 AND accuracy <= 1),
        trend VARCHAR(10) NOT NULL DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
        volatility DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        factors JSONB NOT NULL DEFAULT '{}',
        risk_level VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
        prediction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        target_date TIMESTAMP NOT NULL,
        model_parameters JSONB NOT NULL DEFAULT '{}',
        training_data_size INTEGER NOT NULL DEFAULT 0,
        last_training_date TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 創建索引
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_prediction_models_card_id ON prediction_models(card_id);
      CREATE INDEX IF NOT EXISTS idx_prediction_models_model_type ON prediction_models(model_type);
      CREATE INDEX IF NOT EXISTS idx_prediction_models_timeframe ON prediction_models(timeframe);
      CREATE INDEX IF NOT EXISTS idx_prediction_models_prediction_date ON prediction_models(prediction_date);
      CREATE INDEX IF NOT EXISTS idx_prediction_models_target_date ON prediction_models(target_date);
      CREATE INDEX IF NOT EXISTS idx_prediction_models_confidence ON prediction_models(confidence);
      CREATE INDEX IF NOT EXISTS idx_prediction_models_trend ON prediction_models(trend);
      CREATE INDEX IF NOT EXISTS idx_prediction_models_card_timeframe ON prediction_models(card_id, timeframe);
      CREATE INDEX IF NOT EXISTS idx_prediction_models_card_model ON prediction_models(card_id, model_type);
    `);

    // logger.info('✅ Prediction models table created successfully');
  } catch (error) {
    // logger.info('❌ Error creating prediction models table:', error);
    throw error;
  }
};

// 在主要遷移函數中添加預測模型表創建
const runMigrations = async () => {
  try {
    // ... existing migrations ...

    // 創建預測模型表
    await createPredictionModelsTable(sequelize);

    // ... existing code ...
  } catch (error) {
    // logger.info('❌ Migration failed:', error);
    process.exit(1);
  }
};

