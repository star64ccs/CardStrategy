// 台灣公平交易法服務實現
// Taiwan Fair Trade Act Service Implementation

import type {
  TaiwanFairTradePractice,
  TaiwanMergerControl,
  TaiwanUnfairCompetition,
  TaiwanFairTradeComplianceResult,
  TaiwanFairTradeViolation,
  TaiwanAuditTrail,
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
  TaiwanMergerRemedy,
  TaiwanRemedyType,
  TaiwanRemedyEffectiveness,
  TaiwanApprovalStatus,
  TaiwanUnfairCompetitionType,
  TaiwanMarketEffect,
  TaiwanEvidence,
  TaiwanEvidenceType,
  TaiwanEvidenceReliability,
  TaiwanEvidenceRelevance,
  TaiwanDamage,
  TaiwanDamageType,
  TaiwanPenalty,
  TaiwanPenaltyType,
  TaiwanComplianceStatus,
  TaiwanFairTradeViolationType,
  TaiwanViolationSeverity,
  TaiwanViolationStatus,
  TaiwanRiskLevel,
} from '../types/fairTrade';

export class TaiwanFairTradeService {
  private static instance: TaiwanFairTradeService;
  private auditTrails: TaiwanAuditTrail[] = [];
  private violations: TaiwanFairTradeViolation[] = [];
  private readonly practices: TaiwanFairTradePractice[] = [];
  private readonly mergers: TaiwanMergerControl[] = [];
  private readonly unfairCompetitions: TaiwanUnfairCompetition[] = [];

  private constructor() {}

  public static getInstance(): TaiwanFairTradeService {
    if (!TaiwanFairTradeService.instance) {
      TaiwanFairTradeService.instance = new TaiwanFairTradeService();
    }
    return TaiwanFairTradeService.instance;
  }

  public validateFairTradePractice(
    practice: TaiwanFairTradePractice
  ): TaiwanFairTradeComplianceResult {
    const violations: TaiwanFairTradeViolation[] = [];
    const recommendations: string[] = [];

    // 驗證基本要求
    if (!practice.description || practice.description.trim().length === 0) {
      violations.push(
        this.createViolation(
          practice.id,
          TaiwanFairTradeViolationType.OTHER,
          '缺少公平交易行為描述',
          TaiwanViolationSeverity.MODERATE
        )
      );
      recommendations.push('請提供詳細的公平交易行為描述');
    }

    if (
      !practice.applicableBusinesses ||
      practice.applicableBusinesses.length === 0
    ) {
      violations.push(
        this.createViolation(
          practice.id,
          TaiwanFairTradeViolationType.OTHER,
          '缺少適用企業範圍',
          TaiwanViolationSeverity.MINOR
        )
      );
      recommendations.push('請明確指定適用的企業範圍');
    }

    if (
      !practice.complianceRequirements ||
      practice.complianceRequirements.length === 0
    ) {
      violations.push(
        this.createViolation(
          practice.id,
          TaiwanFairTradeViolationType.OTHER,
          '缺少合規要求',
          TaiwanViolationSeverity.MODERATE
        )
      );
      recommendations.push('請列出具體的合規要求');
    }

    // 根據行為類型進行特定驗證
    switch (practice.practiceType) {
      case TaiwanFairTradePracticeType.MONOPOLY:
        if (practice.marketImpact === TaiwanMarketImpact.SEVERE) {
          violations.push(
            this.createViolation(
              practice.id,
              TaiwanFairTradeViolationType.MONOPOLY_ABUSE,
              '獨占行為對市場影響嚴重',
              TaiwanViolationSeverity.SERIOUS
            )
          );
          recommendations.push('建議重新評估獨占行為的市場影響');
        }
        break;

      case TaiwanFairTradePracticeType.CARTEL:
        if (
          practice.competitionEffect ===
          TaiwanCompetitionEffect.ANTI_COMPETITIVE
        ) {
          violations.push(
            this.createViolation(
              practice.id,
              TaiwanFairTradeViolationType.CARTEL_ACTIVITY,
              '聯合行為具有反競爭效果',
              TaiwanViolationSeverity.CRITICAL
            )
          );
          recommendations.push('聯合行為可能違反公平交易法，建議立即停止');
        }
        break;

      case TaiwanFairTradePracticeType.FALSE_ADVERTISING:
        violations.push(
          this.createViolation(
            practice.id,
            TaiwanFairTradeViolationType.FALSE_ADVERTISING,
            '虛偽不實廣告行為',
            TaiwanViolationSeverity.SERIOUS
          )
        );
        recommendations.push('請立即停止虛偽不實廣告，並更正相關資訊');
        break;

      case TaiwanFairTradePracticeType.TRADE_SECRET:
        if (
          practice.marketImpact === TaiwanMarketImpact.SIGNIFICANT ||
          practice.marketImpact === TaiwanMarketImpact.SEVERE
        ) {
          violations.push(
            this.createViolation(
              practice.id,
              TaiwanFairTradeViolationType.TRADE_SECRET_VIOLATION,
              '營業秘密侵害對市場影響重大',
              TaiwanViolationSeverity.CRITICAL
            )
          );
          recommendations.push('建議立即停止營業秘密侵害行為');
        }
        break;
    }

    // 記錄審計追蹤
    this.createAuditTrail(
      'validate_fair_trade_practice',
      'TaiwanFairTradePractice',
      practice.id,
      {
        practiceType: practice.practiceType,
        violationsCount: violations.length,
        recommendationsCount: recommendations.length,
      }
    );

    const complianceStatus =
      violations.length === 0
        ? TaiwanComplianceStatus.COMPLIANT
        : TaiwanComplianceStatus.NON_COMPLIANT;

    const riskLevel = this.calculateRiskLevel(violations);

    return {
      id: `compliance_${Date.now()}`,
      practiceId: practice.id,
      complianceStatus,
      violations,
      recommendations,
      riskLevel,
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  public validateMergerControl(
    merger: TaiwanMergerControl
  ): TaiwanFairTradeComplianceResult {
    const violations: TaiwanFairTradeViolation[] = [];
    const recommendations: string[] = [];

    // 驗證基本要求
    if (!merger.parties || merger.parties.length < 2) {
      violations.push(
        this.createViolation(
          merger.id,
          TaiwanFairTradeViolationType.MERGER_VIOLATION,
          '合併當事人不足',
          TaiwanViolationSeverity.MODERATE
        )
      );
      recommendations.push('合併當事人至少需要兩方');
    }

    if (
      !merger.marketDefinition ||
      merger.marketDefinition.trim().length === 0
    ) {
      violations.push(
        this.createViolation(
          merger.id,
          TaiwanFairTradeViolationType.MERGER_VIOLATION,
          '缺少市場定義',
          TaiwanViolationSeverity.MODERATE
        )
      );
      recommendations.push('請明確定義相關市場');
    }

    if (merger.marketShare > 50) {
      violations.push(
        this.createViolation(
          merger.id,
          TaiwanFairTradeViolationType.MERGER_VIOLATION,
          '市場占有率過高',
          TaiwanViolationSeverity.SERIOUS
        )
      );
      recommendations.push('建議重新評估合併對市場競爭的影響');
    }

    // 根據合併類型進行特定驗證
    switch (merger.mergerType) {
      case TaiwanMergerType.HORIZONTAL:
        if (merger.marketShare > 30) {
          violations.push(
            this.createViolation(
              merger.id,
              TaiwanFairTradeViolationType.MERGER_VIOLATION,
              '水平合併市場占有率過高',
              TaiwanViolationSeverity.SERIOUS
            )
          );
          recommendations.push('水平合併可能導致市場集中度過高');
        }
        break;

      case TaiwanMergerType.VERTICAL:
        if (merger.marketShare > 40) {
          violations.push(
            this.createViolation(
              merger.id,
              TaiwanFairTradeViolationType.MERGER_VIOLATION,
              '垂直合併市場占有率過高',
              TaiwanViolationSeverity.MODERATE
            )
          );
          recommendations.push('建議評估垂直合併的封鎖效果');
        }
        break;
    }

    // 記錄審計追蹤
    this.createAuditTrail(
      'validate_merger_control',
      'TaiwanMergerControl',
      merger.id,
      {
        mergerType: merger.mergerType,
        marketShare: merger.marketShare,
        violationsCount: violations.length,
      }
    );

    const complianceStatus =
      violations.length === 0
        ? TaiwanComplianceStatus.COMPLIANT
        : TaiwanComplianceStatus.NON_COMPLIANT;

    const riskLevel = this.calculateRiskLevel(violations);

    return {
      id: `compliance_${Date.now()}`,
      practiceId: merger.id,
      complianceStatus,
      violations,
      recommendations,
      riskLevel,
      nextReviewDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60天後
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  public validateUnfairCompetition(
    competition: TaiwanUnfairCompetition
  ): TaiwanFairTradeComplianceResult {
    const violations: TaiwanFairTradeViolation[] = [];
    const recommendations: string[] = [];

    // 驗證基本要求
    if (
      !competition.description ||
      competition.description.trim().length === 0
    ) {
      violations.push(
        this.createViolation(
          competition.id,
          TaiwanFairTradeViolationType.UNFAIR_COMPETITION,
          '缺少不公平競爭行為描述',
          TaiwanViolationSeverity.MODERATE
        )
      );
      recommendations.push('請提供詳細的不公平競爭行為描述');
    }

    if (
      !competition.affectedParties ||
      competition.affectedParties.length === 0
    ) {
      violations.push(
        this.createViolation(
          competition.id,
          TaiwanFairTradeViolationType.UNFAIR_COMPETITION,
          '缺少受影響當事人',
          TaiwanViolationSeverity.MINOR
        )
      );
      recommendations.push('請明確指定受影響的當事人');
    }

    // 根據不公平競爭類型進行特定驗證
    switch (competition.competitionType) {
      case TaiwanUnfairCompetitionType.TRADE_SECRET_MISAPPROPRIATION:
        violations.push(
          this.createViolation(
            competition.id,
            TaiwanFairTradeViolationType.TRADE_SECRET_VIOLATION,
            '營業秘密不當取得',
            TaiwanViolationSeverity.CRITICAL
          )
        );
        recommendations.push('請立即停止營業秘密侵害行為');
        break;

      case TaiwanUnfairCompetitionType.FALSE_ADVERTISING:
        violations.push(
          this.createViolation(
            competition.id,
            TaiwanFairTradeViolationType.FALSE_ADVERTISING,
            '虛偽不實廣告',
            TaiwanViolationSeverity.SERIOUS
          )
        );
        recommendations.push('請立即停止虛偽不實廣告');
        break;

      case TaiwanUnfairCompetitionType.COMMERCIAL_DISPARAGEMENT:
        violations.push(
          this.createViolation(
            competition.id,
            TaiwanFairTradeViolationType.UNFAIR_COMPETITION,
            '商業誹謗行為',
            TaiwanViolationSeverity.SERIOUS
          )
        );
        recommendations.push('請停止商業誹謗行為');
        break;

      case TaiwanUnfairCompetitionType.PASSING_OFF:
        violations.push(
          this.createViolation(
            competition.id,
            TaiwanFairTradeViolationType.UNFAIR_COMPETITION,
            '仿冒行為',
            TaiwanViolationSeverity.SERIOUS
          )
        );
        recommendations.push('請停止仿冒行為');
        break;
    }

    // 記錄審計追蹤
    this.createAuditTrail(
      'validate_unfair_competition',
      'TaiwanUnfairCompetition',
      competition.id,
      {
        competitionType: competition.competitionType,
        marketEffect: competition.marketEffect,
        violationsCount: violations.length,
      }
    );

    const complianceStatus =
      violations.length === 0
        ? TaiwanComplianceStatus.COMPLIANT
        : TaiwanComplianceStatus.NON_COMPLIANT;

    const riskLevel = this.calculateRiskLevel(violations);

    return {
      id: `compliance_${Date.now()}`,
      practiceId: competition.id,
      complianceStatus,
      violations,
      recommendations,
      riskLevel,
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  public processMergerApplication(merger: TaiwanMergerControl): {
    success: boolean;
    message: string;
    data?: unknown;
  } {
    try {
      // 檢查是否已存在相同合併申請
      const existingMerger = this.mergers.find(
        m =>
          m.parties.sort().join(',') === merger.parties.sort().join(',') &&
          m.mergerType === merger.mergerType
      );

      if (existingMerger) {
        return {
          success: false,
          message: '已存在相同的合併申請',
        };
      }

      // 進行合規性檢查
      const complianceResult = this.validateMergerControl(merger);

      if (
        complianceResult.complianceStatus === TaiwanComplianceStatus.COMPLIANT
      ) {
        merger.approvalStatus = TaiwanApprovalStatus.APPROVED;
        this.mergers.push(merger);

        this.createAuditTrail(
          'process_merger_application',
          'TaiwanMergerControl',
          merger.id,
          {
            approvalStatus: merger.approvalStatus,
            reviewPeriod: merger.reviewPeriod,
          }
        );

        return {
          success: true,
          message: '合併申請已核准',
          data: {
            approvalStatus: merger.approvalStatus,
            reviewPeriod: merger.reviewPeriod,
          },
        };
      } else {
        merger.approvalStatus = TaiwanApprovalStatus.REJECTED;

        this.createAuditTrail(
          'process_merger_application',
          'TaiwanMergerControl',
          merger.id,
          {
            approvalStatus: merger.approvalStatus,
            violations: complianceResult.violations.length,
          }
        );

        return {
          success: false,
          message: '合併申請被拒絕，存在合規問題',
          data: {
            approvalStatus: merger.approvalStatus,
            violations: complianceResult.violations,
          },
        };
      }
    } catch (error) {
      this.createAuditTrail(
        'process_merger_application_error',
        'TaiwanMergerControl',
        merger.id,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );

      return {
        success: false,
        message: '處理合併申請時發生錯誤',
      };
    }
  }

  public updateMergerStatus(
    mergerId: string,
    newStatus: TaiwanApprovalStatus,
    conditions?: string[]
  ): { success: boolean; message: string; data?: unknown } {
    try {
      const merger = this.mergers.find(m => m.id === mergerId);

      if (!merger) {
        return {
          success: false,
          message: '找不到指定的合併申請',
        };
      }

      const oldStatus = merger.approvalStatus;
      merger.approvalStatus = newStatus;
      merger.updatedAt = new Date();

      if (conditions && conditions.length > 0) {
        merger.conditions = conditions;
      }

      this.createAuditTrail(
        'update_merger_status',
        'TaiwanMergerControl',
        mergerId,
        {
          oldStatus,
          newStatus,
          conditions: conditions || [],
        }
      );

      return {
        success: true,
        message: '合併狀態已更新',
        data: {
          approvalStatus: newStatus,
          conditions: merger.conditions,
        },
      };
    } catch (error) {
      this.createAuditTrail(
        'update_merger_status_error',
        'TaiwanMergerControl',
        mergerId,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );

      return {
        success: false,
        message: '更新合併狀態時發生錯誤',
      };
    }
  }

  public generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): {
    totalPractices: number;
    compliantPractices: number;
    nonCompliantPractices: number;
    totalViolations: number;
    violationsByType: Record<string, number>;
    riskDistribution: Record<string, number>;
    recommendations: string[];
  } {
    const practicesInPeriod = this.practices.filter(
      p => p.createdAt >= startDate && p.createdAt <= endDate
    );

    const violationsInPeriod = this.violations.filter(
      v => v.createdAt >= startDate && v.createdAt <= endDate
    );

    const violationsByType: Record<string, number> = {};
    const riskDistribution: Record<string, number> = {};

    violationsInPeriod.forEach(violation => {
      violationsByType[violation.violationType] =
        (violationsByType[violation.violationType] || 0) + 1;

      riskDistribution[violation.severity] =
        (riskDistribution[violation.severity] || 0) + 1;
    });

    const recommendations = [
      '定期進行公平交易法合規檢查',
      '加強員工公平交易法培訓',
      '建立內部合規監控機制',
      '及時處理違規問題',
    ];

    this.createAuditTrail(
      'generate_compliance_report',
      'Report',
      'compliance_report',
      {
        startDate,
        endDate,
        totalPractices: practicesInPeriod.length,
        totalViolations: violationsInPeriod.length,
      }
    );

    return {
      totalPractices: practicesInPeriod.length,
      compliantPractices: practicesInPeriod.length - violationsInPeriod.length,
      nonCompliantPractices: violationsInPeriod.length,
      totalViolations: violationsInPeriod.length,
      violationsByType,
      riskDistribution,
      recommendations,
    };
  }

  public getAuditTrails(
    entityType?: string,
    entityId?: string,
    startDate?: Date,
    endDate?: Date
  ): TaiwanAuditTrail[] {
    let filteredTrails = this.auditTrails;

    if (entityType) {
      filteredTrails = filteredTrails.filter(
        trail => trail.entityType === entityType
      );
    }

    if (entityId) {
      filteredTrails = filteredTrails.filter(
        trail => trail.entityId === entityId
      );
    }

    if (startDate) {
      filteredTrails = filteredTrails.filter(
        trail => trail.timestamp >= startDate
      );
    }

    if (endDate) {
      filteredTrails = filteredTrails.filter(
        trail => trail.timestamp <= endDate
      );
    }

    return filteredTrails.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  public getViolations(
    practiceId?: string,
    violationType?: TaiwanFairTradeViolationType,
    status?: TaiwanViolationStatus
  ): TaiwanFairTradeViolation[] {
    let filteredViolations = this.violations;

    if (practiceId) {
      filteredViolations = filteredViolations.filter(
        v => v.practiceId === practiceId
      );
    }

    if (violationType) {
      filteredViolations = filteredViolations.filter(
        v => v.violationType === violationType
      );
    }

    if (status) {
      filteredViolations = filteredViolations.filter(v => v.status === status);
    }

    return filteredViolations.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  public getMergers(
    approvalStatus?: TaiwanApprovalStatus,
    mergerType?: TaiwanMergerType
  ): TaiwanMergerControl[] {
    let filteredMergers = this.mergers;

    if (approvalStatus) {
      filteredMergers = filteredMergers.filter(
        m => m.approvalStatus === approvalStatus
      );
    }

    if (mergerType) {
      filteredMergers = filteredMergers.filter(
        m => m.mergerType === mergerType
      );
    }

    return filteredMergers.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  public cleanup(): void {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    this.auditTrails = this.auditTrails.filter(
      trail => trail.timestamp >= thirtyDaysAgo
    );
    this.violations = this.violations.filter(
      violation => violation.createdAt >= thirtyDaysAgo
    );
  }

  private createViolation(
    practiceId: string,
    violationType: TaiwanFairTradeViolationType,
    description: string,
    severity: TaiwanViolationSeverity
  ): TaiwanFairTradeViolation {
    const violation: TaiwanFairTradeViolation = {
      id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      practiceId,
      violationType,
      description,
      severity,
      evidence: [],
      penalty: {
        id: `penalty_${Date.now()}`,
        penaltyType: TaiwanPenaltyType.ADMINISTRATIVE_FINE,
        amount: 0,
        currency: 'TWD',
        basis: '公平交易法',
        aggravatingFactors: [],
        mitigatingFactors: [],
        createdAt: new Date(),
      },
      rectificationRequired: true,
      status: TaiwanViolationStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.violations.push(violation);
    return violation;
  }

  private createAuditTrail(
    action: string,
    entityType: string,
    entityId: string,
    details: unknown
  ): void {
    const auditTrail: TaiwanAuditTrail = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      entityType,
      entityId,
      userId: 'system',
      timestamp: new Date(),
      details,
    };

    this.auditTrails.push(auditTrail);
  }

  private calculateRiskLevel(
    violations: TaiwanFairTradeViolation[]
  ): TaiwanRiskLevel {
    if (violations.length === 0) {
      return TaiwanRiskLevel.LOW;
    }

    const criticalCount = violations.filter(
      v => v.severity === TaiwanViolationSeverity.CRITICAL
    ).length;
    const seriousCount = violations.filter(
      v => v.severity === TaiwanViolationSeverity.SERIOUS
    ).length;
    const moderateCount = violations.filter(
      v => v.severity === TaiwanViolationSeverity.MODERATE
    ).length;

    if (criticalCount > 0) {
      return TaiwanRiskLevel.CRITICAL;
    } else if (seriousCount > 0) {
      return TaiwanRiskLevel.HIGH;
    } else if (moderateCount > 0) {
      return TaiwanRiskLevel.MEDIUM;
    } else {
      return TaiwanRiskLevel.LOW;
    }
  }
}
