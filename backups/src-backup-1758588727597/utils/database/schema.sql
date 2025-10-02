-- Smart Card Database Schema
-- Simplified version without Chinese comments to avoid encoding issues

-- 1. Cards table (enhanced)
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    card_id VARCHAR(255) UNIQUE,
    set_name VARCHAR(255),
    set_code VARCHAR(50),
    card_number VARCHAR(50),
    category VARCHAR(50),
    subcategory VARCHAR(100),
    rarity VARCHAR(100),
    card_type VARCHAR(100),
    image_url TEXT,
    image_hash VARCHAR(64),
    image_quality_score DECIMAL(3,2),
    card_dimensions JSONB,
    dominant_colors JSONB,
    text_regions JSONB,
    artwork_features JSONB,
    border_style VARCHAR(50),
    description TEXT,
    artist VARCHAR(255),
    release_date DATE,
    language VARCHAR(10) DEFAULT 'en',
    current_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    data_source VARCHAR(100),
    confidence_score DECIMAL(3,2) DEFAULT 0.9,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Price history table
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    price_type VARCHAR(50),
    platform VARCHAR(100),
    seller_id VARCHAR(255),
    listing_id VARCHAR(255),
    condition VARCHAR(50),
    price_date TIMESTAMP,
    listing_date TIMESTAMP,
    sold_date TIMESTAMP,
    market_volume INTEGER,
    demand_indicator DECIMAL(3,2),
    supply_indicator DECIMAL(3,2),
    raw_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Card authentications table
CREATE TABLE IF NOT EXISTS card_authentications (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    company VARCHAR(50) NOT NULL,
    certification_number VARCHAR(100),
    grade DECIMAL(3,1),
    authentication_date DATE,
    verification_status VARCHAR(20),
    confidence_score DECIMAL(3,2),
    raw_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Image features table
CREATE TABLE IF NOT EXISTS image_features (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    feature_type VARCHAR(50) NOT NULL,
    feature_data JSONB NOT NULL,
    extraction_method VARCHAR(100),
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Market analytics table
CREATE TABLE IF NOT EXISTS market_analytics (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    time_period VARCHAR(20),
    avg_price DECIMAL(10,2),
    median_price DECIMAL(10,2),
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    price_volatility DECIMAL(5,4),
    total_volume INTEGER,
    unique_sellers INTEGER,
    avg_listing_duration INTEGER,
    price_trend VARCHAR(20),
    momentum_score DECIMAL(3,2),
    rsi_indicator DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Data sources table
CREATE TABLE IF NOT EXISTS data_sources (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(100) UNIQUE NOT NULL,
    source_type VARCHAR(50),
    api_endpoint TEXT,
    last_updated TIMESTAMP,
    status VARCHAR(20),
    rate_limit INTEGER,
    success_rate DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Card reports table
CREATE TABLE IF NOT EXISTS card_reports (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    report_type VARCHAR(20) NOT NULL,
    report_category VARCHAR(50),
    user_id VARCHAR(100),
    user_type VARCHAR(20),
    report_title VARCHAR(255),
    report_description TEXT,
    confidence_level DECIMAL(3,2),
    evidence_images JSONB,
    evidence_details JSONB,
    comparison_data JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    verified_by VARCHAR(100),
    verification_date TIMESTAMP,
    verification_notes TEXT,
    impact_score DECIMAL(3,2),
    reliability_score DECIMAL(3,2),
    community_agreement DECIMAL(3,2),
    report_source VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Report verifications table
CREATE TABLE IF NOT EXISTS report_verifications (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES card_reports(id) ON DELETE CASCADE,
    verifier_id VARCHAR(100) NOT NULL,
    verifier_type VARCHAR(20),
    verifier_credentials JSONB,
    verification_result VARCHAR(20) NOT NULL,
    verification_score DECIMAL(3,2),
    verification_reason TEXT,
    technical_analysis JSONB,
    comparison_analysis JSONB,
    authenticity_indicators JSONB,
    verification_method VARCHAR(50),
    verification_tools JSONB,
    verification_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. ML feedback loops table
CREATE TABLE IF NOT EXISTS ml_feedback_loops (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    report_id INTEGER REFERENCES card_reports(id) ON DELETE CASCADE,
    predicted_authenticity DECIMAL(3,2),
    actual_authenticity DECIMAL(3,2),
    prediction_error DECIMAL(5,4),
    feature_importance JSONB,
    feature_accuracy JSONB,
    misclassified_features JSONB,
    model_version VARCHAR(50),
    improvement_suggestions JSONB,
    retraining_priority DECIMAL(3,2),
    feedback_type VARCHAR(30),
    learning_weight DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Community consensus table
CREATE TABLE IF NOT EXISTS community_consensus (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    total_reports INTEGER DEFAULT 0,
    authentic_reports INTEGER DEFAULT 0,
    fake_reports INTEGER DEFAULT 0,
    uncertain_reports INTEGER DEFAULT 0,
    authenticity_consensus DECIMAL(3,2),
    confidence_level DECIMAL(3,2),
    agreement_rate DECIMAL(3,2),
    expert_consensus DECIMAL(3,2),
    expert_weight DECIMAL(3,2),
    consensus_trend JSONB,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cards_category ON cards(category);
CREATE INDEX IF NOT EXISTS idx_cards_set_name ON cards(set_name);
CREATE INDEX IF NOT EXISTS idx_cards_card_id ON cards(card_id);
CREATE INDEX IF NOT EXISTS idx_price_history_card_id ON price_history(card_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(price_date);
CREATE INDEX IF NOT EXISTS idx_authentications_card_id ON card_authentications(card_id);
CREATE INDEX IF NOT EXISTS idx_image_features_card_id ON image_features(card_id);
CREATE INDEX IF NOT EXISTS idx_market_analytics_card_id ON market_analytics(card_id);
CREATE INDEX IF NOT EXISTS idx_reports_card_id ON card_reports(card_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON card_reports(status);
CREATE INDEX IF NOT EXISTS idx_consensus_card_id ON community_consensus(card_id);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_reports_updated_at BEFORE UPDATE ON card_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Community consensus update function
CREATE OR REPLACE FUNCTION update_community_consensus()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO community_consensus (card_id, total_reports, authentic_reports, fake_reports, uncertain_reports)
    VALUES (
        NEW.card_id,
        1,
        CASE WHEN NEW.report_type = 'authentic' THEN 1 ELSE 0 END,
        CASE WHEN NEW.report_type = 'fake' THEN 1 ELSE 0 END,
        CASE WHEN NEW.report_type = 'uncertain' THEN 1 ELSE 0 END
    )
    ON CONFLICT (card_id) DO UPDATE SET
        total_reports = community_consensus.total_reports + 1,
        authentic_reports = community_consensus.authentic_reports + 
            CASE WHEN NEW.report_type = 'authentic' THEN 1 ELSE 0 END,
        fake_reports = community_consensus.fake_reports + 
            CASE WHEN NEW.report_type = 'fake' THEN 1 ELSE 0 END,
        uncertain_reports = community_consensus.uncertain_reports + 
            CASE WHEN NEW.report_type = 'uncertain' THEN 1 ELSE 0 END,
        last_updated = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_consensus AFTER INSERT ON card_reports
    FOR EACH ROW EXECUTE FUNCTION update_community_consensus();
