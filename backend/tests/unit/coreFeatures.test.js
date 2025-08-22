const request = require('supertest');
const app = require('../../src/app');
const { setupTestDatabase, teardownTestDatabase } = require('../setup');
const { createTestUser, createTestCard } = require('../helpers');

describe('核心功能測試', () => {
  let testUser, testCard, authToken;

  beforeAll(async () => {
    await setupTestDatabase();
    testUser = await createTestUser();
    testCard = await createTestCard();
    
    // 獲取認證令牌
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'testpassword123'
      });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('卡牌識別功能', () => {
    it('應該正確識別卡片圖像', async () => {
      const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
      
      const response = await request(app)
        .post('/api/cards/recognize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageData: mockImageData,
          options: {
            confidenceThreshold: 0.9,
            useMultiModel: true
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.recognizedCard).toBeDefined();
      expect(response.body.data.confidence).toBeGreaterThan(0.8);
    });

    it('應該處理無法識別的圖像', async () => {
      const mockInvalidImageData = 'data:image/jpeg;base64,invalid_data...';
      
      const response = await request(app)
        .post('/api/cards/recognize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageData: mockInvalidImageData
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('無法識別');
    });
  });

  describe('防偽判斷功能', () => {
    it('應該正確驗證卡片真偽', async () => {
      const mockImageData = 'data:image/jpeg;base64,authentic_card...';
      
      const response = await request(app)
        .post('/api/cards/verify-authenticity')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageData: mockImageData,
          cardId: testCard.id,
          options: {
            useBlockchainVerification: true,
            includeHologramAnalysis: true
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.authenticity).toBeDefined();
      expect(response.body.data.authenticity.isAuthentic).toBeDefined();
    });

    it('應該檢測假卡', async () => {
      const mockFakeImageData = 'data:image/jpeg;base64,fake_card...';
      
      const response = await request(app)
        .post('/api/cards/verify-authenticity')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageData: mockFakeImageData,
          cardId: testCard.id
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.authenticity.isAuthentic).toBe(false);
    });
  });

  describe('模擬鑑定功能', () => {
    it('應該正確評級卡片狀況', async () => {
      const mockImageData = 'data:image/jpeg;base64,mint_condition...';
      
      const response = await request(app)
        .post('/api/cards/analyze-condition')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageData: mockImageData,
          cardId: testCard.id,
          options: {
            useAdvancedMetrics: true,
            includeUVInspection: true
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.analysis).toBeDefined();
      expect(response.body.data.analysis.grade).toBeDefined();
      expect(response.body.data.analysis.overallScore).toBeGreaterThan(0);
    });

    it('應該評估卡片損傷', async () => {
      const mockDamagedImageData = 'data:image/jpeg;base64,damaged_card...';
      
      const response = await request(app)
        .post('/api/cards/assess-damage')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageData: mockDamagedImageData,
          cardId: testCard.id
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.damageLevel).toBeDefined();
      expect(response.body.data.damages).toBeInstanceOf(Array);
    });
  });

  describe('AI預測價格功能', () => {
    it('應該正確預測卡片價格', async () => {
      const response = await request(app)
        .post('/api/predictions/predict')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cardId: testCard.id,
          timeframe: '30d',
          modelType: 'ensemble'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.predictedPrice).toBeDefined();
      expect(response.body.data.confidence).toBeGreaterThan(0);
      expect(response.body.data.change).toBeDefined();
    });

    it('應該處理數據不足的情況', async () => {
      const newCard = await createTestCard({ name: 'New Card', series: 'Test Series' });
      
      const response = await request(app)
        .post('/api/predictions/predict')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cardId: newCard.id,
          timeframe: '7d',
          modelType: 'ensemble'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('數據不足');
    });
  });

  describe('投資評估功能', () => {
    it('應該分析投資組合', async () => {
      const response = await request(app)
        .post('/api/investment/analyze-portfolio')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUser.id
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalValue).toBeDefined();
      expect(response.body.data.returnRate).toBeDefined();
      expect(response.body.data.diversification).toBeDefined();
    });

    it('應該評估投資風險', async () => {
      const response = await request(app)
        .post('/api/investment/assess-risk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUser.id
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.overallRisk).toBeDefined();
      expect(response.body.data.score).toBeGreaterThan(0);
      expect(response.body.data.factors).toBeDefined();
    });

    it('應該提供投資建議', async () => {
      const response = await request(app)
        .post('/api/investment/get-advice')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUser.id,
          riskTolerance: 'medium',
          investmentGoal: 'growth',
          timeHorizon: '5y'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.recommendations).toBeInstanceOf(Array);
      expect(response.body.data.portfolioOptimization).toBeDefined();
    });
  });

  describe('綜合分析功能', () => {
    it('應該執行完整的卡片分析流程', async () => {
      const mockImageData = 'data:image/jpeg;base64,comprehensive_analysis...';
      
      const response = await request(app)
        .post('/api/cards/comprehensive-analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageData: mockImageData,
          options: {
            recognition: { confidenceThreshold: 0.9 },
            conditionAnalysis: { useAdvancedMetrics: true },
            authenticityVerification: { useBlockchainVerification: true },
            pricePrediction: { useEnsembleModels: true }
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.recognition).toBeDefined();
      expect(response.body.data.conditionAnalysis).toBeDefined();
      expect(response.body.data.authenticityVerification).toBeDefined();
      expect(response.body.data.pricePrediction).toBeDefined();
    });
  });
});
