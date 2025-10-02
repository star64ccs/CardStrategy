/**
 * 消費者保護模組
 * 實現重構計劃Task 1.4: ConsumerProtectionModule
 */

import { logger } from '../../../core/utils/logger';

export interface ConsumerRights {
  id: string;
  name: string;
  description: string;
  category: 'information' | 'choice' | 'safety' | 'redress' | 'education';
  jurisdiction: string;
}

export interface UnfairTerm {
  id: string;
  termText: string;
  category: 'exclusion' | 'limitation' | 'penalty' | 'unilateral' | 'unclear';
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskLevel: number;
  description: string;
  recommendation: string;
}

export interface ConsumerComplaint {
  id: string;
  consumerId: string;
  category: 'product' | 'service' | 'billing' | 'privacy' | 'contract';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'under_review' | 'resolved' | 'closed';
  title: string;
  description: string;
  submittedAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface ConsumerProtectionConfig {
  enableRightsProtection: boolean;
  enableUnfairTermsDetection: boolean;
  enableComplaintManagement: boolean;
  autoEscalationThreshold: number;
  maxResolutionTime: number;
}

export class ConsumerProtectionModule {
  private static instance: ConsumerProtectionModule;
  private config: ConsumerProtectionConfig;
  private readonly rights: Map<string, ConsumerRights>;
  private readonly unfairTerms: Map<string, UnfairTerm>;
  private readonly complaints: Map<string, ConsumerComplaint>;
  private isInitialized = false;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.rights = new Map();
    this.unfairTerms = new Map();
    this.complaints = new Map();
  }

  public static getInstance(): ConsumerProtectionModule {
    if (!ConsumerProtectionModule.instance) {
      ConsumerProtectionModule.instance = new ConsumerProtectionModule();
    }
    return ConsumerProtectionModule.instance;
  }

  public async initialize(
    config?: Partial<ConsumerProtectionConfig>
  ): Promise<boolean> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      await this.initializeRights();
      await this.initializeUnfairTerms();

      this.isInitialized = true;
      logger.info('消費者保護模組InitializeSuccess');
      return true;
    } catch (error) {
      logger.error('消費者保護模組InitializeFailed:', error);
      return false;
    }
  }

  public detectUnfairTerms(
    contractText: string,
    jurisdiction: string
  ): UnfairTerm[] {
    try {
      const detectedTerms: UnfairTerm[] = [];
      const _applicableTerms = Array.from(this.unfairTerms.values());

      applicableTerms.forEach(term => {
        if (contractText.toLowerCase().includes(term.termText.toLowerCase())) {
          detectedTerms.push({
            ...term,
            id: `detected_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          });
        }
      });

      logger.info('不公平條款檢測完成', {
        contractLength: contractText.length,
        jurisdiction,
        detectedCount: detectedTerms.length,
      });

      return detectedTerms;
    } catch (error) {
      logger.error('不公平條款檢測Failed:', error);
      throw error;
    }
  }

  public submitComplaint(
    complaint: Omit<ConsumerComplaint, 'id' | 'submittedAt' | 'updatedAt'>
  ): ConsumerComplaint {
    try {
      const newComplaint: ConsumerComplaint = {
        ...complaint,
        id: `complaint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'submitted',
        submittedAt: new Date(),
        updatedAt: new Date(),
      };

      this.complaints.set(newComplaint.id, newComplaint);

      logger.info('消費者投訴提交Success', {
        complaintId: newComplaint.id,
        consumerId: newComplaint.consumerId,
        category: newComplaint.category,
        priority: newComplaint.priority,
      });

      return newComplaint;
    } catch (error) {
      logger.error('消費者投訴提交Failed:', error);
      throw error;
    }
  }

  public updateComplaintStatus(
    complaintId: string,
    status: ConsumerComplaint['status']
  ): boolean {
    try {
      const _complaint = this.complaints.get(complaintId);
      if (!complaint) {
        throw new Error(`未找到投訴: ${complaintId}`);
      }

      complaint.status = status;
      complaint.updatedAt = new Date();

      if (status === 'resolved') {
        complaint.resolvedAt = new Date();
      }

      logger.info('投訴狀態UpdateSuccess', {
        complaintId,
        newStatus: status,
      });

      return true;
    } catch (error) {
      logger.error('投訴狀態UpdateFailed:', error);
      throw error;
    }
  }

  public getConsumerRights(jurisdiction: string): ConsumerRights[] {
    try {
      const _applicableRights = Array.from(this.rights.values()).filter(
        right =>
          right.jurisdiction === jurisdiction || right.jurisdiction === 'global'
      );

      logger.info('消費者權利查詢完成', {
        jurisdiction,
        rightsCount: applicableRights.length,
      });

      return applicableRights;
    } catch (error) {
      logger.error('Get消費者權利Failed:', error);
      throw error;
    }
  }

  public updateConfig(config: Partial<ConsumerProtectionConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('消費者保護模組配置已更新', { config: this.config });
  }

  public async reset(): Promise<void> {
    this.rights.clear();
    this.unfairTerms.clear();
    this.complaints.clear();
    this.isInitialized = false;
    logger.info('消費者保護模組已重置');
  }

  private getDefaultConfig(): ConsumerProtectionConfig {
    return {
      enableRightsProtection: true,
      enableUnfairTermsDetection: true,
      enableComplaintManagement: true,
      autoEscalationThreshold: 24,
      maxResolutionTime: 30,
    };
  }

  private async initializeRights(): Promise<void> {
    const _rights = [
      {
        id: 'information_right',
        name: '知情權',
        description: '消費者有權獲得有關商品和Service的完整、準確Information',
        category: 'information' as const,
        jurisdiction: 'global',
      },
      {
        id: 'choice_right',
        name: '選擇權',
        description: '消費者有權自由選擇商品和Service',
        category: 'choice' as const,
        jurisdiction: 'global',
      },
      {
        id: 'safety_right',
        name: '安全權',
        description: '消費者有權獲得安全的商品和Service',
        category: 'safety' as const,
        jurisdiction: 'global',
      },
    ];

    rights.forEach(right => {
      this.rights.set(right.id, right);
    });
  }

  private async initializeUnfairTerms(): Promise<void> {
    const _unfairTerms = [
      {
        id: 'exclusion_liability',
        termText: '排除責任',
        category: 'exclusion' as const,
        severity: 'high' as const,
        riskLevel: 80,
        description: '完全排除商家責任的條款',
        recommendation: '修改為合理的責任限制條款',
      },
      {
        id: 'limitation_compensation',
        termText: '限制賠償',
        category: 'limitation' as const,
        severity: 'medium' as const,
        riskLevel: 60,
        description: '過度限制消費者賠償權利的條款',
        recommendation: '確保賠償金額合理且符合法律規定',
      },
      {
        id: 'penalty_clause',
        termText: '懲罰條款',
        category: 'penalty' as const,
        severity: 'critical' as const,
        riskLevel: 90,
        description: '對消費者施加過重懲罰的條款',
        recommendation: '移除或大幅降低懲罰金額',
      },
    ];

    unfairTerms.forEach(term => {
      this.unfairTerms.set(term.id, term);
    });
  }
}
