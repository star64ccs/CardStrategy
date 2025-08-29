// 台灣公平交易法服務測試
// Taiwan Fair Trade Act Service Tests

import { TaiwanFairTradeService } from '../services/fairTradeService';
import type {
  TaiwanFairTradePractice,
  TaiwanMergerControl,
  TaiwanUnfairCompetition,
} from '../types/fairTrade';
import {
  TaiwanFairTradePracticeType,
  TaiwanMarketImpact,
  TaiwanCompetitionEffect,
  TaiwanEnforcementMechanism,
  TaiwanPenaltyRange,
  TaiwanMergerType,
  TaiwanCompetitiveAnalysis,
  TaiwanMarketConcentration,
  TaiwanBuyerPower,
  TaiwanApprovalStatus,
  TaiwanUnfairCompetitionType,
  TaiwanMarketEffect,
  TaiwanComplianceStatus,
  TaiwanViolationSeverity,
  TaiwanRiskLevel,
} from '../types/fairTrade';

describe('TaiwanFairTradeService', () => {
  let service: TaiwanFairTradeService;

  beforeEach(() => {
    service = TaiwanFairTradeService.getInstance();
  });

  afterEach(() => {
    service.cleanup();
  });

  describe('getInstance', () => {
    it('應該返回單例實例', () => {
      const _instance1 = TaiwanFairTradeService.getInstance();
      const _instance2 = TaiwanFairTradeService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('validateFairTradePractice', () => {
    it('應該驗證合規的公平交易行為', () => {
      const practice: TaiwanFairTradePractice = {
        id: 'practice_1',
        practiceType: TaiwanFairTradePracticeType.OTHER,
        description: '正常的商業行為',
        applicableBusinesses: ['企業A', '企業B'],
        marketImpact: TaiwanMarketImpact.MINOR,
        consumerBenefit: true,
        competitionEffect: TaiwanCompetitionEffect.PRO_COMPETITIVE,
        enforcementMechanism: TaiwanEnforcementMechanism.ADMINISTRATIVE,
        penaltyRange: TaiwanPenaltyRange.WARNING,
        complianceRequirements: ['遵守公平交易法', '定期報告'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateFairTradePractice(practice);

      expect(result.complianceStatus).toBe(TaiwanComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
      expect(result.riskLevel).toBe(TaiwanRiskLevel.LOW);
    });

    it('應該檢測缺少描述', () => {
      const practice: TaiwanFairTradePractice = {
        id: 'practice_2',
        practiceType: TaiwanFairTradePracticeType.OTHER,
        description: '',
        applicableBusinesses: ['企業A'],
        marketImpact: TaiwanMarketImpact.MINOR,
        consumerBenefit: true,
        competitionEffect: TaiwanCompetitionEffect.PRO_COMPETITIVE,
        enforcementMechanism: TaiwanEnforcementMechanism.ADMINISTRATIVE,
        penaltyRange: TaiwanPenaltyRange.WARNING,
        complianceRequirements: ['遵守公平交易法'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateFairTradePractice(practice);

      expect(result.complianceStatus).toBe(
        TaiwanComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('缺少公平交易行為描述');
    });

    it('應該檢測獨占行為的嚴重市場影響', () => {
      const practice: TaiwanFairTradePractice = {
        id: 'practice_3',
        practiceType: TaiwanFairTradePracticeType.MONOPOLY,
        description: '獨占行為',
        applicableBusinesses: ['企業A'],
        marketImpact: TaiwanMarketImpact.SEVERE,
        consumerBenefit: false,
        competitionEffect: TaiwanCompetitionEffect.ANTI_COMPETITIVE,
        enforcementMechanism: TaiwanEnforcementMechanism.ADMINISTRATIVE,
        penaltyRange: TaiwanPenaltyRange.FINE_OVER_10M,
        complianceRequirements: ['遵守公平交易法'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateFairTradePractice(practice);

      expect(result.complianceStatus).toBe(
        TaiwanComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].violationType).toBe('monopoly_abuse');
    });
  });

  describe('validateMergerControl', () => {
    it('應該驗證合規的合併控制', () => {
      const merger: TaiwanMergerControl = {
        id: 'merger_1',
        mergerType: TaiwanMergerType.HORIZONTAL,
        parties: ['企業A', '企業B'],
        marketShare: 15,
        marketDefinition: '台灣手機市場',
        competitiveAnalysis: {
          marketConcentration: TaiwanMarketConcentration.LOW,
          entryBarriers: ['技術門檻'],
          buyerPower: TaiwanBuyerPower.MODERATE,
          efficiencyDefense: ['規模經濟'],
          failingFirmDefense: false,
          analysis: '合併對市場競爭影響有限',
        },
        efficiencyGains: ['降低成本'],
        antiCompetitiveEffects: [],
        remedies: [],
        approvalStatus: TaiwanApprovalStatus.PENDING,
        conditions: [],
        reviewPeriod: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateMergerControl(merger);

      expect(result.complianceStatus).toBe(TaiwanComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
    });

    it('應該檢測市場占有率過高', () => {
      const merger: TaiwanMergerControl = {
        id: 'merger_2',
        mergerType: TaiwanMergerType.HORIZONTAL,
        parties: ['企業A', '企業B'],
        marketShare: 60,
        marketDefinition: '台灣手機市場',
        competitiveAnalysis: {
          marketConcentration: TaiwanMarketConcentration.HIGH,
          entryBarriers: ['技術門檻'],
          buyerPower: TaiwanBuyerPower.WEAK,
          efficiencyDefense: ['規模經濟'],
          failingFirmDefense: false,
          analysis: '合併對市場競爭影響重大',
        },
        efficiencyGains: ['降低成本'],
        antiCompetitiveEffects: ['市場集中度過高'],
        remedies: [],
        approvalStatus: TaiwanApprovalStatus.PENDING,
        conditions: [],
        reviewPeriod: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateMergerControl(merger);

      expect(result.complianceStatus).toBe(
        TaiwanComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(2);
      expect(
        result.violations.some(v => v.description === '市場占有率過高')
      ).toBe(true);
      expect(
        result.violations.some(v => v.description === '水平合併市場占有率過高')
      ).toBe(true);
    });
  });

  describe('validateUnfairCompetition', () => {
    it('應該驗證合規的不公平競爭', () => {
      const competition: TaiwanUnfairCompetition = {
        id: 'competition_1',
        competitionType: TaiwanUnfairCompetitionType.OTHER,
        description: '正常的競爭行為',
        affectedParties: ['競爭對手A'],
        marketEffect: TaiwanMarketEffect.MINOR,
        evidence: [],
        damages: [],
        ceaseAndDesist: false,
        compensation: false,
        penalty: {
          id: 'penalty_1',
          penaltyType: 'administrative_fine',
          amount: 0,
          currency: 'TWD',
          basis: '公平交易法',
          aggravatingFactors: [],
          mitigatingFactors: [],
          createdAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateUnfairCompetition(competition);

      expect(result.complianceStatus).toBe(TaiwanComplianceStatus.COMPLIANT);
      expect(result.violations).toHaveLength(0);
    });

    it('應該檢測營業秘密不當取得', () => {
      const competition: TaiwanUnfairCompetition = {
        id: 'competition_2',
        competitionType:
          TaiwanUnfairCompetitionType.TRADE_SECRET_MISAPPROPRIATION,
        description: '營業秘密不當取得',
        affectedParties: ['競爭對手A'],
        marketEffect: TaiwanMarketEffect.SIGNIFICANT,
        evidence: [],
        damages: [],
        ceaseAndDesist: true,
        compensation: true,
        penalty: {
          id: 'penalty_2',
          penaltyType: 'administrative_fine',
          amount: 1000000,
          currency: 'TWD',
          basis: '公平交易法',
          aggravatingFactors: ['故意行為'],
          mitigatingFactors: [],
          createdAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.validateUnfairCompetition(competition);

      expect(result.complianceStatus).toBe(
        TaiwanComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].violationType).toBe('trade_secret_violation');
    });
  });

  describe('processMergerApplication', () => {
    it('應該處理合規的合併申請', () => {
      const merger: TaiwanMergerControl = {
        id: 'merger_3',
        mergerType: TaiwanMergerType.VERTICAL,
        parties: ['企業A', '企業B'],
        marketShare: 20,
        marketDefinition: '台灣電子商務市場',
        competitiveAnalysis: {
          marketConcentration: TaiwanMarketConcentration.MODERATE,
          entryBarriers: ['技術門檻'],
          buyerPower: TaiwanBuyerPower.STRONG,
          efficiencyDefense: ['垂直整合效益'],
          failingFirmDefense: false,
          analysis: '合併對市場競爭影響有限',
        },
        efficiencyGains: ['降低交易成本'],
        antiCompetitiveEffects: [],
        remedies: [],
        approvalStatus: TaiwanApprovalStatus.PENDING,
        conditions: [],
        reviewPeriod: 45,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.processMergerApplication(merger);

      expect(result.success).toBe(true);
      expect(result.message).toBe('合併申請已核准');
    });

    it('應該拒絕不合規的合併申請', () => {
      const merger: TaiwanMergerControl = {
        id: 'merger_4',
        mergerType: TaiwanMergerType.HORIZONTAL,
        parties: ['企業A'],
        marketShare: 80,
        marketDefinition: '',
        competitiveAnalysis: {
          marketConcentration: TaiwanMarketConcentration.VERY_HIGH,
          entryBarriers: ['技術門檻'],
          buyerPower: TaiwanBuyerPower.WEAK,
          efficiencyDefense: [],
          failingFirmDefense: false,
          analysis: '合併對市場競爭影響重大',
        },
        efficiencyGains: [],
        antiCompetitiveEffects: ['市場集中度過高'],
        remedies: [],
        approvalStatus: TaiwanApprovalStatus.PENDING,
        conditions: [],
        reviewPeriod: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const _result = service.processMergerApplication(merger);

      expect(result.success).toBe(false);
      expect(result.message).toBe('合併申請被拒絕，存在合規問題');
    });
  });

  describe('generateComplianceReport', () => {
    it('應該生成合規報告', () => {
      const _startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30天前
      const _endDate = new Date();

      const _result = service.generateComplianceReport(startDate, endDate);

      expect(result).toHaveProperty('totalPractices');
      expect(result).toHaveProperty('compliantPractices');
      expect(result).toHaveProperty('nonCompliantPractices');
      expect(result).toHaveProperty('totalViolations');
      expect(result).toHaveProperty('violationsByType');
      expect(result).toHaveProperty('riskDistribution');
      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('getAuditTrails', () => {
    it('應該返回審計追蹤', () => {
      const _trails = service.getAuditTrails();
      expect(Array.isArray(trails)).toBe(true);
    });
  });

  describe('getViolations', () => {
    it('應該返回違規記錄', () => {
      const _violations = service.getViolations();
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('getMergers', () => {
    it('應該返回合併記錄', () => {
      const _mergers = service.getMergers();
      expect(Array.isArray(mergers)).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('應該清理過期資料', () => {
      expect(() => service.cleanup()).not.toThrow();
    });
  });
});
