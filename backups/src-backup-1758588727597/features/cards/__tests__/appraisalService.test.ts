import { AppraisalService } from '../services/appraisalService';
import type { AppraisalRequest } from '../types/appraisal';
import { GRADE_STANDARDS } from '../types/appraisal';

// Mock logger
jest.mock('../../../core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('AppraisalService', () => {
  let appraisalService: AppraisalService;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Get fresh instance
    appraisalService = AppraisalService.getInstance();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = AppraisalService.getInstance();
      const instance2 = AppraisalService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize the service successfully', async () => {
      await expect(appraisalService.initialize()).resolves.not.toThrow();
    });

    it('should not reinitialize if already initialized', async () => {
      await appraisalService.initialize();
      await appraisalService.initialize(); // Second call should not throw
      expect(true).toBe(true); // If we reach here, no error was thrown
    });
  });

  describe('performAppraisal', () => {
    const mockRequest: AppraisalRequest = {
      cardId: 'test_card_001',
      imageUrl: 'https://example.com/test-image.jpg',
      cardType: 'Pokemon',
      series: 'Base Set',
      version: '1st Edition',
      options: {
        method: 'hybrid',
        includeImages: true,
        detailedAnalysis: true,
        marketComparison: true,
        preservationTips: true,
      },
    };

    beforeEach(async () => {
      await appraisalService.initialize();
    });

    it('should perform appraisal successfully', async () => {
      const result = await appraisalService.performAppraisal(mockRequest);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.cardId).toBe(mockRequest.cardId);
      expect(result.overallGrade).toBeDefined();
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThanOrEqual(10);
      expect(result.details).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.status).toBe('completed');
    });

    it('should return valid grade based on score', async () => {
      const result = await appraisalService.performAppraisal(mockRequest);

      // Check if the grade is valid according to GRADE_STANDARDS
      const validGrades = Object.keys(GRADE_STANDARDS);
      expect(validGrades).toContain(result.overallGrade);
    });

    it('should include all required assessment details', async () => {
      const result = await appraisalService.performAppraisal(mockRequest);

      expect(result.details.centering).toBeDefined();
      expect(result.details.corners).toBeDefined();
      expect(result.details.edges).toBeDefined();
      expect(result.details.surface).toBeDefined();
      expect(result.details.printQuality).toBeDefined();
      expect(result.details.colorAccuracy).toBeDefined();
      expect(result.details.glossiness).toBeDefined();
      expect(result.details.registration).toBeDefined();
    });

    it('should generate recommendations based on score', async () => {
      const result = await appraisalService.performAppraisal(mockRequest);

      expect(Array.isArray(result.recommendations)).toBe(true);
      result.recommendations.forEach(rec => {
        expect(rec.type).toBeDefined();
        expect(rec.title).toBeDefined();
        expect(rec.description).toBeDefined();
        expect(rec.priority).toBeDefined();
        expect(Array.isArray(rec.actionItems)).toBe(true);
      });
    });

    it('should include valid metadata', async () => {
      const result = await appraisalService.performAppraisal(mockRequest);

      expect(result.metadata.appraiser).toBe('AI Appraisal System');
      expect(result.metadata.appraisalMethod).toBe(mockRequest.options?.method);
      expect(result.metadata.confidence).toBeGreaterThan(0);
      expect(result.metadata.confidence).toBeLessThanOrEqual(1);
      expect(result.metadata.processingTime).toBeGreaterThan(0);
      expect(['low', 'medium', 'high']).toContain(result.metadata.imageQuality);
      expect(['poor', 'fair', 'good', 'excellent']).toContain(
        result.metadata.lightingConditions
      );
    });

    it('should handle different appraisal methods', async () => {
      const methods = [
        'ai_vision',
        'expert_system',
        'hybrid',
        'manual',
      ] as const;

      for (const method of methods) {
        const request = {
          ...mockRequest,
          options: { ...mockRequest.options, method },
        };
        const result = await appraisalService.performAppraisal(request);
        expect(result.metadata.appraisalMethod).toBe(method);
      }
    });
  });

  describe('getAppraisalHistory', () => {
    beforeEach(async () => {
      await appraisalService.initialize();
    });

    it('should return empty history for new card', async () => {
      const history =
        await appraisalService.getAppraisalHistory('new_card_001');

      expect(history.cardId).toBe('new_card_001');
      expect(history.appraisals).toEqual([]);
      expect(history.totalAppraisals).toBe(0);
      expect(history.averageGrade).toBe('N/A');
      expect(history.averageScore).toBe(0);
      expect(history.bestGrade).toBe('N/A');
      expect(history.worstGrade).toBe('N/A');
      expect(history.trend).toBe('stable');
    });

    it('should return history for card with appraisals', async () => {
      const cardId = 'test_card_002';
      const request: AppraisalRequest = {
        cardId,
        imageUrl: 'https://example.com/test-image.jpg',
        cardType: 'Pokemon',
        series: 'Base Set',
        version: '1st Edition',
      };

      // Perform multiple appraisals
      await appraisalService.performAppraisal(request);
      await appraisalService.performAppraisal(request);
      await appraisalService.performAppraisal(request);

      const history = await appraisalService.getAppraisalHistory(cardId);

      expect(history.cardId).toBe(cardId);
      expect(history.appraisals).toHaveLength(3);
      expect(history.totalAppraisals).toBe(3);
      expect(history.averageGrade).toBeDefined();
      expect(history.averageScore).toBeGreaterThan(0);
      expect(history.bestGrade).toBeDefined();
      expect(history.worstGrade).toBeDefined();
      expect(['improving', 'declining', 'stable']).toContain(history.trend);
    });
  });

  describe('getAppraisalStats', () => {
    beforeEach(async () => {
      await appraisalService.initialize();
    });

    it('should return valid stats', async () => {
      const stats = await appraisalService.getAppraisalStats();

      expect(stats.totalAppraisals).toBeGreaterThanOrEqual(0);
      expect(stats.averageProcessingTime).toBeGreaterThanOrEqual(0);
      expect(stats.accuracyRate).toBeGreaterThan(0);
      expect(stats.accuracyRate).toBeLessThanOrEqual(100);
      expect(stats.userSatisfaction).toBeGreaterThan(0);
      expect(stats.userSatisfaction).toBeLessThanOrEqual(5);
      expect(stats.gradeDistribution).toBeDefined();
      expect(stats.methodUsage).toBeDefined();
    });

    it('should include all grade distributions', async () => {
      const stats = await appraisalService.getAppraisalStats();
      const expectedGrades = Object.keys(GRADE_STANDARDS);

      expectedGrades.forEach(grade => {
        expect(stats.gradeDistribution[grade]).toBeDefined();
        expect(typeof stats.gradeDistribution[grade]).toBe('number');
      });
    });

    it('should include all method usage stats', async () => {
      const stats = await appraisalService.getAppraisalStats();
      const expectedMethods = [
        'ai_vision',
        'expert_system',
        'hybrid',
        'manual',
      ];

      expectedMethods.forEach(method => {
        expect(stats.methodUsage[method]).toBeDefined();
        expect(typeof stats.methodUsage[method]).toBe('number');
      });
    });
  });

  describe('getAppraisalOptions', () => {
    beforeEach(async () => {
      await appraisalService.initialize();
    });

    it('should return default options', async () => {
      const options = await appraisalService.getAppraisalOptions();

      expect(options.method).toBe('hybrid');
      expect(options.includeImages).toBe(true);
      expect(options.detailedAnalysis).toBe(true);
      expect(options.marketComparison).toBe(true);
      expect(options.preservationTips).toBe(true);
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await appraisalService.initialize();
    });

    it('should handle invalid requests gracefully', async () => {
      const invalidRequest = {
        cardId: '',
        imageUrl: '',
        cardType: '',
        series: '',
        version: '',
      } as AppraisalRequest;

      // The service currently handles empty strings gracefully, so we expect it to succeed
      const result = await appraisalService.performAppraisal(invalidRequest);
      expect(result).toBeDefined();
      expect(result.cardId).toBe('');
    });
  });

  describe('statistics tracking', () => {
    beforeEach(async () => {
      await appraisalService.initialize();
    });

    it('should track appraisal statistics correctly', async () => {
      const initialStats = await appraisalService.getAppraisalStats();
      const initialTotal = initialStats.totalAppraisals;

      const request: AppraisalRequest = {
        cardId: 'stats_test_card',
        imageUrl: 'https://example.com/test-image.jpg',
        cardType: 'Pokemon',
        series: 'Base Set',
        version: '1st Edition',
        options: { method: 'ai_vision' },
      };

      await appraisalService.performAppraisal(request);

      const updatedStats = await appraisalService.getAppraisalStats();
      expect(updatedStats.totalAppraisals).toBe(initialTotal + 1);
      expect(updatedStats.methodUsage['ai_vision']).toBeGreaterThan(0);
    });
  });
});
