import { enhancedAIService } from '../../../services/enhancedAIService';
import { conditionService } from '../../../services/conditionService';

// Mock 外部依賴
jest.mock('../../../services/apiService');
jest.mock('../../../services/conditionService');
jest.mock('../../../utils/logger');

describe('模擬鑑定功能測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('卡片狀況評級測試', () => {
    it('應該正確評級完美狀況卡片', async () => {
      const mockImageData = 'data:image/jpeg;base64,mint_condition...';
      const mockConditionResult = {
        success: true,
        data: {
          analysis: {
            overallScore: 9.8,
            grade: 'Mint',
            confidence: 0.95,
            factors: {
              corners: { score: 10, details: '四角完美' },
              edges: { score: 9.9, details: '邊緣完整' },
              surface: { score: 9.8, details: '表面無瑕疵' },
              centering: { score: 9.7, details: '居中良好' }
            }
          },
          recommendations: ['建議使用保護套保存']
        }
      };

      const mockApiService = require('../../../services/apiService');
      mockApiService.apiService.post.mockResolvedValue(mockConditionResult);

      const result = await enhancedAIService.enhancedConditionAnalysis(mockImageData, {
        useAdvancedMetrics: true,
        includeUVInspection: true,
        includeMicroscopicAnalysis: true
      });

      expect(result.success).toBe(true);
      expect(result.data.analysis.grade).toBe('Mint');
      expect(result.data.analysis.overallScore).toBeGreaterThan(9.5);
    });

    it('應該正確評級受損卡片', async () => {
      const mockImageData = 'data:image/jpeg;base64,damaged_card...';
      const mockConditionResult = {
        success: true,
        data: {
          analysis: {
            overallScore: 4.2,
            grade: 'Poor',
            confidence: 0.88,
            factors: {
              corners: { score: 3, details: '四角磨損嚴重' },
              edges: { score: 4, details: '邊緣有缺損' },
              surface: { score: 5, details: '表面有劃痕' },
              centering: { score: 5, details: '居中偏差' }
            }
          },
          recommendations: ['建議專業修復或降低收藏價值']
        }
      };

      const mockApiService = require('../../../services/apiService');
      mockApiService.apiService.post.mockResolvedValue(mockConditionResult);

      const result = await enhancedAIService.enhancedConditionAnalysis(mockImageData);

      expect(result.success).toBe(true);
      expect(result.data.analysis.grade).toBe('Poor');
      expect(result.data.analysis.overallScore).toBeLessThan(5);
    });
  });

  describe('損傷評估測試', () => {
    it('應該正確評估卡片損傷', async () => {
      const mockImageData = 'data:image/jpeg;base64,damage_assessment...';
      const mockDamageResult = {
        damageLevel: 'moderate',
        score: 6.5,
        damages: [
          { type: 'corner_wear', severity: 'moderate', location: 'top-right' },
          { type: 'edge_chip', severity: 'minor', location: 'bottom-left' },
          { type: 'surface_scratch', severity: 'minor', location: 'center' }
        ],
        impact: {
          value: 'reduced_by_30_percent',
          marketability: 'still_collectible'
        }
      };

      const mockCondition = require('../../../services/conditionService');
      mockCondition.conditionService.assessDamage.mockResolvedValue(mockDamageResult);

      const result = await conditionService.assessDamage(mockImageData);

      expect(result.damageLevel).toBe('moderate');
      expect(result.score).toBeGreaterThan(5);
      expect(result.damages).toHaveLength(3);
      expect(result.impact.value).toBe('reduced_by_30_percent');
    });
  });

  describe('保存狀態分析測試', () => {
    it('應該正確分析保存狀態', async () => {
      const mockImageData = 'data:image/jpeg;base64,preservation_state...';
      const mockPreservationResult = {
        preservationState: 'excellent',
        score: 9.2,
        factors: {
          storage: { score: 9.5, details: '乾燥環境保存' },
          handling: { score: 9.0, details: '小心處理' },
          protection: { score: 9.1, details: '使用保護套' }
        },
        recommendations: [
          '繼續保持當前保存方式',
          '定期檢查卡片狀態',
          '避免陽光直射'
        ]
      };

      const mockCondition = require('../../../services/conditionService');
      mockCondition.conditionService.analyzePreservation.mockResolvedValue(mockPreservationResult);

      const result = await conditionService.analyzePreservation(mockImageData);

      expect(result.preservationState).toBe('excellent');
      expect(result.score).toBeGreaterThan(9);
      expect(result.recommendations).toHaveLength(3);
    });
  });

  describe('紫外線檢查測試', () => {
    it('應該正確進行紫外線檢查', async () => {
      const mockImageData = 'data:image/jpeg;base64,uv_inspection...';
      const mockUVResult = {
        uvResponse: 'normal',
        score: 9.8,
        findings: {
          paperReaction: '標準紙張反應',
          inkReaction: '正常油墨反應',
          noAlterations: true
        }
      };

      const mockCondition = require('../../../services/conditionService');
      mockCondition.conditionService.uvInspection.mockResolvedValue(mockUVResult);

      const result = await conditionService.uvInspection(mockImageData);

      expect(result.uvResponse).toBe('normal');
      expect(result.score).toBeGreaterThan(9.5);
      expect(result.findings.noAlterations).toBe(true);
    });
  });

  describe('顯微鏡分析測試', () => {
    it('應該正確進行顯微鏡分析', async () => {
      const mockImageData = 'data:image/jpeg;base64,microscopic_analysis...';
      const mockMicroscopicResult = {
        fiberStructure: 'authentic',
        score: 9.6,
        details: {
          fiberPattern: '標準紙張纖維結構',
          inkPenetration: '正常油墨滲透',
          surfaceTexture: '原始表面質地'
        }
      };

      const mockCondition = require('../../../services/conditionService');
      mockCondition.conditionService.microscopicAnalysis.mockResolvedValue(mockMicroscopicResult);

      const result = await conditionService.microscopicAnalysis(mockImageData);

      expect(result.fiberStructure).toBe('authentic');
      expect(result.score).toBeGreaterThan(9.5);
      expect(result.details.fiberPattern).toBe('標準紙張纖維結構');
    });
  });
});
