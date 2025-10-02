import FakeCardDetectionService from '../services/detectionService';
import {
  DetectionMethod,
  CounterfeitRisk,
  DetectionStatus,
  PriceAlertType,
} from '../types/detection';

// Mock logger
jest.mock('../../../core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('FakeCardDetectionService', () => {
  let service: FakeCardDetectionService;

  beforeEach(() => {
    // 清理單例Instance
    (FakeCardDetectionService as any).instance = undefined;
    service = FakeCardDetectionService.getInstance();
  });

  afterEach(() => {
    // 清理Resource
    service.destroy();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const _instance1 = FakeCardDetectionService.getInstance();
      const _instance2 = FakeCardDetectionService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize the service successfully', async () => {
      await expect(service.initialize()).resolves.not.toThrow();
    });

    it('should initialize with custom config', async () => {
      const _customConfig = {
        baseUrl: 'https://custom-detection-api.com',
        timeout: 15000,
        maxConcurrentDetections: 10,
      };

      await expect(service.initialize(customConfig)).resolves.not.toThrow();
    });

    it('should handle initialization errors', async () => {
      // 模擬InitializeError
      jest
        .spyOn(service as any, 'loadDetectionConfig')
        .mockImplementation(() => {
          throw new Error('Config loading failed');
        });

      await expect(service.initialize()).rejects.toThrow(
        'Config loading failed'
      );
    });
  });

  describe('detectFakeCard', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should detect fake card successfully', async () => {
      const _request = {
        cardId: 'pokemon_card_test_1',
        imageUrl: 'https://example.com/pokemon_card.jpg',
        methods: [DetectionMethod.AI_DETECTION, DetectionMethod.IMAGE_ANALYSIS],
      };

      const _response = await service.detectFakeCard(request);

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data.cardId).toBe('pokemon_card_test_1');
      expect(response.data.imageUrl).toBe(
        'https://example.com/pokemon_card.jpg'
      );
      expect(response.data.overallRisk).toBeDefined();
      expect(response.data.overallConfidence).toBeGreaterThan(0);
      expect(response.data.riskScore).toBeGreaterThanOrEqual(0);
      expect(response.data.riskScore).toBeLessThanOrEqual(100);
      expect(response.data.features).toBeDefined();
      expect(response.data.features.length).toBeGreaterThan(0);
      expect(response.processingTime).toBeGreaterThan(0);
    });

    it('should return cached results when available', async () => {
      const _request = {
        cardId: 'pokemon_card_test_2',
        imageUrl: 'https://example.com/pokemon_card_2.jpg',
      };

      // 第一次檢測
      const _response1 = await service.detectFakeCard(request);
      expect(response1.success).toBe(true);

      // 第二次檢測應該使用Cache
      const _response2 = await service.detectFakeCard(request);
      expect(response2.success).toBe(true);
      expect(response2.data.id).toBe(response1.data.id);
    });

    it('should include all requested detection methods', async () => {
      const _request = {
        cardId: 'pokemon_card_test_3',
        imageUrl: 'https://example.com/pokemon_card_3.jpg',
        methods: [
          DetectionMethod.AI_DETECTION,
          DetectionMethod.COLOR_ANALYSIS,
          DetectionMethod.TEXTURE_ANALYSIS,
          DetectionMethod.HOLOGRAM_ANALYSIS,
        ],
      };

      const _response = await service.detectFakeCard(request);

      expect(response.success).toBe(true);
      expect(response.data.methods).toEqual(
        expect.arrayContaining(request.methods)
      );
    });

    it('should handle different risk levels correctly', async () => {
      const _lowRiskRequest = {
        cardId: 'authentic_card',
        imageUrl: 'https://example.com/authentic_card.jpg',
      };

      const _response = await service.detectFakeCard(lowRiskRequest);

      expect(response.success).toBe(true);
      expect(Object.values(CounterfeitRisk)).toContain(
        response.data.overallRisk
      );
      expect(response.data.authenticity).toBeGreaterThanOrEqual(0);
      expect(response.data.authenticity).toBeLessThanOrEqual(1);
    });

    it('should validate request parameters', async () => {
      const _invalidRequest = {
        cardId: '',
        imageUrl: 'invalid-url',
      };

      const _response = await service.detectFakeCard(invalidRequest);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('should include feature analysis', async () => {
      const _request = {
        cardId: 'pokemon_card_test_4',
        imageUrl: 'https://example.com/pokemon_card_4.jpg',
        options: {
          includeFeatureAnalysis: true,
        },
      };

      const _response = await service.detectFakeCard(request);

      expect(response.success).toBe(true);
      expect(response.data.features).toBeDefined();
      expect(response.data.features.length).toBeGreaterThan(0);

      const _feature = response.data.features[0];
      expect(feature.id).toBeDefined();
      expect(feature.name).toBeDefined();
      expect(feature.category).toBeDefined();
      expect(feature.importance).toBeGreaterThan(0);
      expect(feature.importance).toBeLessThanOrEqual(1);
      expect(typeof feature.detected).toBe('boolean');
      expect(feature.confidence).toBeGreaterThan(0);
      expect(feature.confidence).toBeLessThanOrEqual(1);
    });

    it('should set appropriate flags for different scenarios', async () => {
      const _request = {
        cardId: 'suspicious_card',
        imageUrl: 'https://example.com/suspicious_card.jpg',
      };

      const _response = await service.detectFakeCard(request);

      expect(response.success).toBe(true);
      expect(response.data.flags).toBeDefined();
      expect(typeof response.data.flags.requiresManualReview).toBe('boolean');
      expect(typeof response.data.flags.hasHighRiskFeatures).toBe('boolean');
      expect(typeof response.data.flags.lowImageQuality).toBe('boolean');
      expect(typeof response.data.flags.multipleAnomalies).toBe('boolean');
    });

    it('should include metadata information', async () => {
      const _request = {
        cardId: 'pokemon_card_test_5',
        imageUrl: 'https://example.com/pokemon_card_5.jpg',
      };

      const _response = await service.detectFakeCard(request);

      expect(response.success).toBe(true);
      expect(response.data.metadata).toBeDefined();
      expect(response.data.metadata?.imageResolution).toBeDefined();
      expect(response.data.metadata?.imageFormat).toBeDefined();
      expect(response.data.metadata?.analysisEngine).toBeDefined();
      expect(response.data.metadata?.modelVersion).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      // 模擬檢測過程中的Error
      jest.spyOn(service as any, 'performDetection').mockImplementation(() => {
        throw new Error('Detection process failed');
      });

      const _request = {
        cardId: 'error_card',
        imageUrl: 'https://example.com/error_card.jpg',
      };

      const _response = await service.detectFakeCard(request);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Detection process failed');
    });
  });

  describe('batchDetect', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should handle batch detection successfully', async () => {
      const _requests = [
        {
          cardId: 'batch_card_1',
          imageUrl: 'https://example.com/batch_card_1.jpg',
        },
        {
          cardId: 'batch_card_2',
          imageUrl: 'https://example.com/batch_card_2.jpg',
        },
        {
          cardId: 'batch_card_3',
          imageUrl: 'https://example.com/batch_card_3.jpg',
        },
      ];

      const _responses = await service.batchDetect(requests);

      expect(responses).toHaveLength(3);
      responses.forEach((response, index) => {
        expect(response.success).toBe(true);
        expect(response.data.cardId).toBe(requests[index].cardId);
      });
    });

    it('should handle empty batch request', async () => {
      const _responses = await service.batchDetect([]);

      expect(responses).toHaveLength(0);
    });

    it('should respect concurrent detection limits', async () => {
      const _requests = Array.from({ length: 15 }, (_, i) => ({
        cardId: `concurrent_card_${i}`,
        imageUrl: `https://example.com/concurrent_card_${i}.jpg`,
      }));

      const _responses = await service.batchDetect(requests);

      expect(responses).toHaveLength(15);
      // 所有檢測都應該Complete
      responses.forEach(response => {
        expect(response.success).toBe(true);
      });
    });
  });

  describe('getDetectionHistory', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should return detection history', async () => {
      const _history = await service.getDetectionHistory();

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);

      const _historyItem = history[0];
      expect(historyItem.id).toBeDefined();
      expect(historyItem.cardId).toBeDefined();
      expect(historyItem.userId).toBeDefined();
      expect(historyItem.detectionId).toBeDefined();
      expect(historyItem.result).toBeDefined();
      expect(historyItem.createdAt).toBeDefined();
    });

    it('should filter history by card ID', async () => {
      const _cardId = 'card_1';
      const _history = await service.getDetectionHistory(cardId);

      expect(Array.isArray(history)).toBe(true);
      history.forEach(item => {
        expect(item.cardId).toBe(cardId);
      });
    });

    it('should filter history by user ID', async () => {
      const _userId = 'user_1';
      const _history = await service.getDetectionHistory(undefined, userId);

      expect(Array.isArray(history)).toBe(true);
      history.forEach(item => {
        expect(item.userId).toBe(userId);
      });
    });

    it('should handle both card ID and user ID filters', async () => {
      const _cardId = 'card_1';
      const _userId = 'user_1';
      const _history = await service.getDetectionHistory(cardId, userId);

      expect(Array.isArray(history)).toBe(true);
      history.forEach(item => {
        expect(item.cardId).toBe(cardId);
        expect(item.userId).toBe(userId);
      });
    });
  });

  describe('getDetectionStats', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should return detection statistics', async () => {
      const _stats = await service.getDetectionStats();

      expect(stats.totalDetections).toBeGreaterThan(0);
      expect(stats.authenticCards).toBeGreaterThanOrEqual(0);
      expect(stats.suspiciousCards).toBeGreaterThanOrEqual(0);
      expect(stats.fakeCards).toBeGreaterThanOrEqual(0);
      expect(stats.averageConfidence).toBeGreaterThan(0);
      expect(stats.averageConfidence).toBeLessThanOrEqual(1);
      expect(stats.averageProcessingTime).toBeGreaterThan(0);
      expect(Array.isArray(stats.topFakeFeatures)).toBe(true);
      expect(Array.isArray(stats.detectionTrends)).toBe(true);
      expect(stats.accuracyMetrics).toBeDefined();
      expect(stats.accuracyMetrics.precision).toBeGreaterThan(0);
      expect(stats.accuracyMetrics.precision).toBeLessThanOrEqual(1);
    });

    it('should include accuracy metrics', async () => {
      const _stats = await service.getDetectionStats();

      expect(stats.accuracyMetrics.precision).toBeDefined();
      expect(stats.accuracyMetrics.recall).toBeDefined();
      expect(stats.accuracyMetrics.f1Score).toBeDefined();
      expect(stats.accuracyMetrics.falsePositiveRate).toBeDefined();
      expect(stats.accuracyMetrics.falseNegativeRate).toBeDefined();
    });

    it('should include trending data', async () => {
      const _stats = await service.getDetectionStats();

      expect(Array.isArray(stats.detectionTrends)).toBe(true);
      if (stats.detectionTrends.length > 0) {
        const _trend = stats.detectionTrends[0];
        expect(trend.date).toBeDefined();
        expect(trend.authentic).toBeGreaterThanOrEqual(0);
        expect(trend.fake).toBeGreaterThanOrEqual(0);
        expect(trend.suspicious).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('reportFakeCard', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should create fake card report successfully', async () => {
      const _report = {
        detectionId: 'detection_123',
        cardId: 'suspicious_card_1',
        reporterInfo: {
          userId: 'reporter_user',
          expertise: 'expert' as const,
          reputation: 95,
        },
        evidence: {
          description: '發現多項可疑特徵',
          additionalImages: ['https://example.com/evidence1.jpg'],
          comparisonImages: ['https://example.com/comparison1.jpg'],
          references: ['https://official-db.com/card_info'],
        },
        severity: 'high' as const,
        tags: ['fake_hologram', 'wrong_font'],
      };

      const _result = await service.reportFakeCard(report);

      expect(result.success).toBe(true);
      expect(result.reportId).toBeDefined();
      expect(result.reportId).toMatch(/^report_/);
    });

    it('should handle different severity levels', async () => {
      const _severities = ['low', 'medium', 'high', 'critical'] as const;

      for (const severity of severities) {
        const _report = {
          detectionId: `detection_${severity}`,
          cardId: `card_${severity}`,
          reporterInfo: {
            userId: 'test_user',
            expertise: 'intermediate' as const,
            reputation: 75,
          },
          evidence: {
            description: `${severity} severity issue`,
          },
          severity,
        };

        const _result = await service.reportFakeCard(report);
        expect(result.success).toBe(true);
      }
    });

    it('should handle errors in report submission', async () => {
      // 模擬ReportHandleError
      jest
        .spyOn(service as any, 'updateFakeCardDatabase')
        .mockImplementation(() => {
          throw new Error('Database update failed');
        });

      const _report = {
        detectionId: 'error_detection',
        cardId: 'error_card',
        reporterInfo: {
          userId: 'error_user',
          expertise: 'novice' as const,
          reputation: 50,
        },
        evidence: {
          description: 'Error test',
        },
        severity: 'medium' as const,
      };

      await expect(service.reportFakeCard(report)).rejects.toThrow(
        'Database update failed'
      );
    });
  });

  describe('getFeatureTemplates', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should return all feature templates', async () => {
      const _templates = await service.getFeatureTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);

      const _template = templates[0];
      expect(template.id).toBeDefined();
      expect(template.cardType).toBeDefined();
      expect(template.category).toBeDefined();
      expect(Array.isArray(template.features)).toBe(true);
    });

    it('should filter templates by card type', async () => {
      const _cardType = 'Pokemon Trading Card';
      const _templates = await service.getFeatureTemplates(cardType);

      expect(Array.isArray(templates)).toBe(true);
      templates.forEach(template => {
        expect(template.cardType).toBe(cardType);
      });
    });

    it('should include feature definitions', async () => {
      const _templates = await service.getFeatureTemplates();

      if (templates.length > 0) {
        const _template = templates[0];
        expect(Array.isArray(template.features)).toBe(true);

        if (template.features.length > 0) {
          const _feature = template.features[0];
          expect(feature.name).toBeDefined();
          expect(feature.description).toBeDefined();
          expect(feature.importance).toBeGreaterThan(0);
          expect(feature.importance).toBeLessThanOrEqual(1);
          expect(Array.isArray(feature.checkPoints)).toBe(true);
        }
      }
    });
  });

  describe('updateConfig', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should update configuration successfully', async () => {
      const _newConfig = {
        enabledMethods: [DetectionMethod.AI_DETECTION],
        confidenceThreshold: 0.85,
        riskThreshold: 75,
      };

      await expect(service.updateConfig(newConfig)).resolves.not.toThrow();
    });
  });

  describe('edge cases and error handling', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should handle invalid image URLs', async () => {
      const _request = {
        cardId: 'test_card',
        imageUrl: 'not-a-valid-url',
      };

      const _response = await service.detectFakeCard(request);

      expect(response.success).toBe(false);
      expect(response.error).toContain('無效的圖片URL格式');
    });

    it('should handle empty card ID', async () => {
      const _request = {
        cardId: '',
        imageUrl: 'https://example.com/test.jpg',
      };

      const _response = await service.detectFakeCard(request);

      expect(response.success).toBe(false);
      expect(response.error).toContain('卡片ID不能為空');
    });

    it('should handle service destruction', () => {
      expect(() => service.destroy()).not.toThrow();
    });

    it('should handle multiple initializations', async () => {
      await service.initialize();
      await service.initialize(); // 第二次Initialize不應該出錯

      expect(true).toBe(true); // 如果沒有ThrowError，Test通過
    });

    it('should handle concurrent detections properly', async () => {
      const _requests = Array.from({ length: 10 }, (_, i) =>
        service.detectFakeCard({
          cardId: `concurrent_test_${i}`,
          imageUrl: `https://example.com/test_${i}.jpg`,
        })
      );

      const _responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.success).toBe(true);
      });
    });
  });

  describe('feature analysis', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should analyze multiple feature categories', async () => {
      const _request = {
        cardId: 'feature_test_card',
        imageUrl: 'https://example.com/feature_test.jpg',
      };

      const _response = await service.detectFakeCard(request);

      expect(response.success).toBe(true);

      const _categories = new Set(response.data.features.map(f => f.category));
      expect(categories.size).toBeGreaterThan(1); // 應該有MultipleClass別
    });

    it('should provide confidence scores for each feature', async () => {
      const _request = {
        cardId: 'confidence_test_card',
        imageUrl: 'https://example.com/confidence_test.jpg',
      };

      const _response = await service.detectFakeCard(request);

      expect(response.success).toBe(true);
      response.data.features.forEach(feature => {
        expect(feature.confidence).toBeGreaterThan(0);
        expect(feature.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should weight features by importance', async () => {
      const _request = {
        cardId: 'importance_test_card',
        imageUrl: 'https://example.com/importance_test.jpg',
      };

      const _response = await service.detectFakeCard(request);

      expect(response.success).toBe(true);
      response.data.features.forEach(feature => {
        expect(feature.importance).toBeGreaterThan(0);
        expect(feature.importance).toBeLessThanOrEqual(1);
      });

      // 應該有一些高重要性的特徵
      const _highImportanceFeatures = response.data.features.filter(
        f => f.importance > 0.8
      );
      expect(highImportanceFeatures.length).toBeGreaterThan(0);
    });
  });
});
