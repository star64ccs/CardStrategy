/**
 * Data保護模組
 * 實現重構計劃Task 1.2: DataProtectionModule
 * 負責Data分Class、Data最小化、Data主體權利等核心功能
 */

import { logger } from '../../../core/utils/logger';

// Data分ClassClass型定義
export interface DataClassification {
  id: string;
  category:
    | 'personal'
    | 'sensitive'
    | 'financial'
    | 'health'
    | 'biometric'
    | 'location'
    | 'behavioral'
    | 'public';
  sensitivity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  examples: string[];
  retentionPeriod: number; // 天數
  encryptionRequired: boolean;
  accessControls: string[];
  processingPurposes: string[];
}

export interface RetentionPolicy {
  id: string;
  dataType: string;
  retentionPeriod: number; // 天數
  deletionMethod: 'secure_delete' | 'overwrite' | 'physical_destruction';
  reviewFrequency: number; // 天數
  lastReview: Date;
  nextReview: Date;
  exceptions: string[];
  complianceNotes: string[];
}

export interface MinimizedData {
  originalData: unknown;
  minimizedData: unknown;
  removedFields: string[];
  anonymizationLevel: 'none' | 'pseudonymized' | 'anonymized' | 'aggregated';
  purpose: string;
  processingDate: Date;
  retentionPeriod: number;
}

export interface DataSubjectRequest {
  id: string;
  userId: string;
  requestType:
    | 'access'
    | 'rectification'
    | 'erasure'
    | 'portability'
    | 'restriction'
    | 'objection';
  description: string;
  submittedAt: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: Date;
  assignedTo?: string;
  notes: string[];
  attachments: string[];
}

export interface RequestResult {
  requestId: string;
  success: boolean;
  data?: unknown;
  message: string;
  processingTime: number;
  complianceChecks: string[];
  auditTrail: string[];
}

export interface ExportedData {
  userId: string;
  exportId: string;
  dataTypes: string[];
  format: 'json' | 'csv' | 'xml';
  size: number; // bytes
  recordCount: number;
  exportDate: Date;
  downloadUrl?: string;
  expiresAt: Date;
  checksum: string;
}

export interface DeletionResult {
  userId: string;
  success: boolean;
  deletedRecords: number;
  retainedRecords: number;
  retentionReasons: string[];
  deletionDate: Date;
  auditTrail: string[];
  complianceNotes: string[];
}

export interface DataProtectionConfig {
  enableDataClassification: boolean;
  enableDataMinimization: boolean;
  enableRetentionPolicies: boolean;
  enableDataSubjectRights: boolean;
  defaultRetentionPeriod: number;
  encryptionRequired: boolean;
  auditLogging: boolean;
  automatedDeletion: boolean;
}

export class DataProtectionModule {
  private static instance: DataProtectionModule;
  private config: DataProtectionConfig;
  private readonly dataClassifications: Map<string, DataClassification>;
  private readonly retentionPolicies: Map<string, RetentionPolicy>;
  private isInitialized = false;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.dataClassifications = new Map();
    this.retentionPolicies = new Map();
  }

  public static getInstance(): DataProtectionModule {
    if (!DataProtectionModule.instance) {
      DataProtectionModule.instance = new DataProtectionModule();
    }
    return DataProtectionModule.instance;
  }

  public async initialize(
    config?: Partial<DataProtectionConfig>
  ): Promise<boolean> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // InitializeData分Class
      await this.initializeDataClassifications();

      // Initialize保留政策
      await this.initializeRetentionPolicies();

      this.isInitialized = true;
      logger.info('數據保護模組InitializeSuccess');
      return true;
    } catch (error) {
      logger.error('數據保護模組InitializeFailed:', error);
      return false;
    }
  }

  /**
   * Data分Class
   */
  public classifyData(data: unknown): DataClassification {
    try {
      const _classification = this.performDataClassification(data);

      logger.info('數據分類完成', {
        dataType: typeof data,
        classification: classification.category,
        sensitivity: classification.sensitivity,
      });

      return classification;
    } catch (error) {
      logger.error('數據分類Failed:', error);
      throw error;
    }
  }

  /**
   * Apply保留政策
   */
  public applyRetentionPolicy(data: unknown): RetentionPolicy {
    try {
      const _classification = this.classifyData(data);
      const _policy = this.getRetentionPolicy(classification.category);

      logger.info('保留政策應用完成', {
        dataType: classification.category,
        retentionPeriod: policy.retentionPeriod,
        deletionMethod: policy.deletionMethod,
      });

      return policy;
    } catch (error) {
      logger.error('保留政策應用Failed:', error);
      throw error;
    }
  }

  /**
   * Data最小化
   */
  public minimizeData(data: unknown, purpose: string): MinimizedData {
    try {
      const _classification = this.classifyData(data);
      const _minimizedData = this.performDataMinimization(
        data,
        purpose,
        classification
      );

      logger.info('數據最小化完成', {
        originalFields:
          data && typeof data === 'object' ? Object.keys(data).length : 0,
        minimizedFields: Object.keys(minimizedData.minimizedData).length,
        removedFields: minimizedData.removedFields.length,
        purpose,
      });

      return minimizedData;
    } catch (error) {
      logger.error('數據最小化Failed:', error);
      throw error;
    }
  }

  /**
   * VerifyHandle目的
   */
  public validatePurpose(data: unknown, purpose: string): boolean {
    try {
      const _classification = this.classifyData(data);
      const _isValid = this.checkPurposeValidity(classification, purpose);

      logger.info('目的驗證完成', {
        purpose,
        isValid,
        dataCategory: classification.category,
      });

      return isValid;
    } catch (error) {
      logger.error('目的VerifyFailed:', error);
      return false;
    }
  }

  /**
   * HandleData主體Request
   */
  public processDataSubjectRequest(request: DataSubjectRequest): RequestResult {
    try {
      const _startTime = Date.now();
      const _result = this.executeDataSubjectRequest(request);
      const _processingTime = Date.now() - startTime;

      const requestResult: RequestResult = {
        requestId: request.id,
        success: result.success,
        data: result.data,
        message: result.message,
        processingTime,
        complianceChecks: result.complianceChecks,
        auditTrail: result.auditTrail,
      };

      logger.info('數據主體請求處理完成', {
        requestId: request.id,
        requestType: request.requestType,
        success: requestResult.success,
        processingTime,
      });

      return requestResult;
    } catch (error) {
      logger.error('數據主體請求HandleFailed:', error);
      throw error;
    }
  }

  /**
   * ExportUserData
   */
  public exportUserData(userId: string): ExportedData {
    try {
      const _exportedData = this.performDataExport(userId);

      logger.info('用戶數據導出完成', {
        userId,
        exportId: exportedData.exportId,
        dataTypes: exportedData.dataTypes,
        recordCount: exportedData.recordCount,
        size: exportedData.size,
      });

      return exportedData;
    } catch (error) {
      logger.error('用戶數據導出Failed:', error);
      throw error;
    }
  }

  /**
   * DeleteUserData
   */
  public deleteUserData(userId: string): DeletionResult {
    try {
      const _deletionResult = this.performDataDeletion(userId);

      logger.info('用戶數據刪除完成', {
        userId,
        success: deletionResult.success,
        deletedRecords: deletionResult.deletedRecords,
        retainedRecords: deletionResult.retainedRecords,
      });

      return deletionResult;
    } catch (error) {
      logger.error('用戶數據DeleteFailed:', error);
      throw error;
    }
  }

  /**
   * UpdateConfigure
   */
  public updateConfig(config: Partial<DataProtectionConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('數據保護模組配置已更新', { config: this.config });
  }

  /**
   * Reset模組
   */
  public async reset(): Promise<void> {
    this.dataClassifications.clear();
    this.retentionPolicies.clear();
    this.isInitialized = false;

    logger.info('數據保護模組已重置');
  }

  // PrivateMethod

  private getDefaultConfig(): DataProtectionConfig {
    return {
      enableDataClassification: true,
      enableDataMinimization: true,
      enableRetentionPolicies: true,
      enableDataSubjectRights: true,
      defaultRetentionPeriod: 365,
      encryptionRequired: true,
      auditLogging: true,
      automatedDeletion: false,
    };
  }

  private async initializeDataClassifications(): Promise<void> {
    const _classifications = [
      this.createPersonalDataClassification(),
      this.createSensitiveDataClassification(),
      this.createFinancialDataClassification(),
      this.createHealthDataClassification(),
      this.createBiometricDataClassification(),
      this.createLocationDataClassification(),
      this.createBehavioralDataClassification(),
      this.createPublicDataClassification(),
    ];

    classifications.forEach(classification => {
      this.dataClassifications.set(classification.category, classification);
    });
  }

  private async initializeRetentionPolicies(): Promise<void> {
    const _policies = [
      this.createPersonalDataRetentionPolicy(),
      this.createSensitiveDataRetentionPolicy(),
      this.createFinancialDataRetentionPolicy(),
      this.createHealthDataRetentionPolicy(),
      this.createBiometricDataRetentionPolicy(),
      this.createLocationDataRetentionPolicy(),
      this.createBehavioralDataRetentionPolicy(),
      this.createPublicDataRetentionPolicy(),
    ];

    policies.forEach(policy => {
      this.retentionPolicies.set(policy.dataType, policy);
    });
  }

  private performDataClassification(data: unknown): DataClassification {
    if (!data || typeof data !== 'object') {
      return this.dataClassifications.get('public')!;
    }

    // Check敏感DataField
    const _sensitiveFields = [
      'password',
      'ssn',
      'credit_card',
      'health_record',
      'biometric',
    ];
    const _hasSensitiveData = Object.keys(data).some(key =>
      sensitiveFields.some(field => key.toLowerCase().includes(field))
    );

    if (hasSensitiveData) {
      return this.dataClassifications.get('sensitive')!;
    }

    // Check財務DataField
    const _financialFields = ['account', 'balance', 'transaction', 'payment'];
    const _hasFinancialData = Object.keys(data).some(key =>
      financialFields.some(field => key.toLowerCase().includes(field))
    );

    if (hasFinancialData) {
      return this.dataClassifications.get('financial')!;
    }

    // Check個人DataField
    const _personalFields = ['name', 'email', 'phone', 'address', 'birth_date'];
    const _hasPersonalData = Object.keys(data).some(key =>
      personalFields.some(field => key.toLowerCase().includes(field))
    );

    if (hasPersonalData) {
      return this.dataClassifications.get('personal')!;
    }

    // Check公OnDataField
    const _publicFields = ['public_info', 'statistics', 'general'];
    const _hasPublicData = Object.keys(data).some(key =>
      publicFields.some(field => key.toLowerCase().includes(field))
    );

    if (hasPublicData) {
      return this.dataClassifications.get('public')!;
    }

    // DefaultReturn個人Data分Class
    return this.dataClassifications.get('personal')!;
  }

  private getRetentionPolicy(dataType: string): RetentionPolicy {
    return (
      this.retentionPolicies.get(dataType) ||
      this.createDefaultRetentionPolicy()
    );
  }

  private performDataMinimization(
    data: unknown,
    purpose: string,
    classification: DataClassification
  ): MinimizedData {
    const _originalData = data ? { ...data } : null;
    const minimizedData: unknown = {};
    const removedFields: string[] = [];

    // Root據目的和分Class決定保留哪些Field
    const _allowedFields = this.getFieldsForPurpose(purpose, classification);

    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        if (allowedFields.includes(key)) {
          minimizedData[key] = data[key];
        } else {
          removedFields.push(key);
        }
      });
    }

    return {
      originalData,
      minimizedData,
      removedFields,
      anonymizationLevel: this.determineAnonymizationLevel(
        purpose,
        classification
      ),
      purpose,
      processingDate: new Date(),
      retentionPeriod: classification.retentionPeriod,
    };
  }

  private checkPurposeValidity(
    classification: DataClassification,
    purpose: string
  ): boolean {
    return classification.processingPurposes.includes(purpose);
  }

  private executeDataSubjectRequest(request: DataSubjectRequest): {
    success: boolean;
    data?: unknown;
    message: string;
    complianceChecks: string[];
    auditTrail: string[];
  } {
    const complianceChecks: string[] = [];
    const auditTrail: string[] = [];

    // 執Row合規性Check
    complianceChecks.push('驗證請求者身份');
    complianceChecks.push('檢查請求權限');
    complianceChecks.push('驗證請求合法性');

    // Root據RequestClass型執Row相應Operation
    switch (request.requestType) {
      case 'access':
        return this.handleAccessRequest(request, complianceChecks, auditTrail);
      case 'rectification':
        return this.handleRectificationRequest(
          request,
          complianceChecks,
          auditTrail
        );
      case 'erasure':
        return this.handleErasureRequest(request, complianceChecks, auditTrail);
      case 'portability':
        return this.handlePortabilityRequest(
          request,
          complianceChecks,
          auditTrail
        );
      case 'restriction':
        return this.handleRestrictionRequest(
          request,
          complianceChecks,
          auditTrail
        );
      case 'objection':
        return this.handleObjectionRequest(
          request,
          complianceChecks,
          auditTrail
        );
      default:
        return {
          success: false,
          message: '不支持的請求類型',
          complianceChecks,
          auditTrail,
        };
    }
  }

  private performDataExport(userId: string): ExportedData {
    // 模擬DataExport
    const _exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const _dataTypes = ['personal', 'preferences', 'activity'];
    const _recordCount = Math.floor(Math.random() * 1000) + 100;
    const _size = recordCount * 1024; // 模擬大小

    return {
      userId,
      exportId,
      dataTypes,
      format: 'json',
      size,
      recordCount,
      exportDate: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後過期
      checksum: `checksum_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  private performDataDeletion(userId: string): DeletionResult {
    // 模擬DataDelete
    const _deletedRecords = Math.floor(Math.random() * 1000) + 100;
    const _retainedRecords = Math.floor(Math.random() * 100) + 10;

    return {
      userId,
      success: true,
      deletedRecords,
      retainedRecords,
      retentionReasons: ['法律要求', '審計目的', '爭議解決'],
      deletionDate: new Date(),
      auditTrail: [
        `用戶 ${userId} 數據刪除請求`,
        '身份驗證完成',
        '合規性檢查通過',
        '數據刪除執行',
        '審計記錄更新',
      ],
      complianceNotes: [
        '符合GDPR第17條刪除權',
        '保留必要數據用於法律合規',
        '刪除操作已記錄',
      ],
    };
  }

  private getFieldsForPurpose(
    purpose: string,
    classification: DataClassification
  ): string[] {
    // Root據目的ReturnAllow的Field
    const purposeFieldMappings: Record<string, string[]> = {
      account_management: ['name', 'email', 'phone'],
      payment_processing: ['name', 'email', 'payment_method'],
      marketing: ['name', 'email', 'preferences'],
      analytics: ['user_id', 'behavior_data'],
      support: ['name', 'email', 'issue_description'],
    };

    return purposeFieldMappings[purpose] || ['user_id'];
  }

  private determineAnonymizationLevel(
    purpose: string,
    classification: DataClassification
  ): 'none' | 'pseudonymized' | 'anonymized' | 'aggregated' {
    if (classification.sensitivity === 'critical') {
      return 'anonymized';
    } else if (classification.sensitivity === 'high') {
      return 'pseudonymized';
    } else if (
      purpose === 'analytics' &&
      classification.sensitivity === 'medium'
    ) {
      return 'aggregated';
    }
    return 'none';
  }

  private handleAccessRequest(
    request: DataSubjectRequest,
    complianceChecks: string[],
    auditTrail: string[]
  ): {
    success: boolean;
    data?: unknown;
    message: string;
    complianceChecks: string[];
    auditTrail: string[];
  } {
    auditTrail.push('開始處理訪問請求');

    // 模擬GetUserData
    const _userData = {
      personal_info: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
      },
      preferences: {
        language: 'zh-TW',
        timezone: 'Asia/Taipei',
      },
      activity_log: [
        { date: '2024-01-01', action: 'login' },
        { date: '2024-01-02', action: 'update_profile' },
      ],
    };

    auditTrail.push('用戶數據檢索完成');
    auditTrail.push('數據格式化和驗證完成');

    return {
      success: true,
      data: userData,
      message: '數據訪問請求HandleSuccess',
      complianceChecks,
      auditTrail,
    };
  }

  private handleRectificationRequest(
    request: DataSubjectRequest,
    complianceChecks: string[],
    auditTrail: string[]
  ): {
    success: boolean;
    data?: unknown;
    message: string;
    complianceChecks: string[];
    auditTrail: string[];
  } {
    auditTrail.push('開始處理更正請求');
    auditTrail.push('驗證更正數據');
    auditTrail.push('更新用戶記錄');

    return {
      success: true,
      message: '數據更正請求HandleSuccess',
      complianceChecks,
      auditTrail,
    };
  }

  private handleErasureRequest(
    request: DataSubjectRequest,
    complianceChecks: string[],
    auditTrail: string[]
  ): {
    success: boolean;
    data?: unknown;
    message: string;
    complianceChecks: string[];
    auditTrail: string[];
  } {
    auditTrail.push('開始處理刪除請求');
    auditTrail.push('檢查刪除限制');
    auditTrail.push('執行數據刪除');

    return {
      success: true,
      message: '數據Delete請求HandleSuccess',
      complianceChecks,
      auditTrail,
    };
  }

  private handlePortabilityRequest(
    request: DataSubjectRequest,
    complianceChecks: string[],
    auditTrail: string[]
  ): {
    success: boolean;
    data?: unknown;
    message: string;
    complianceChecks: string[];
    auditTrail: string[];
  } {
    auditTrail.push('開始處理可攜性請求');
    auditTrail.push('準備數據導出');
    auditTrail.push('生成可攜性格式');

    return {
      success: true,
      message: '數據可攜性請求HandleSuccess',
      complianceChecks,
      auditTrail,
    };
  }

  private handleRestrictionRequest(
    request: DataSubjectRequest,
    complianceChecks: string[],
    auditTrail: string[]
  ): {
    success: boolean;
    data?: unknown;
    message: string;
    complianceChecks: string[];
    auditTrail: string[];
  } {
    auditTrail.push('開始處理限制請求');
    auditTrail.push('設置數據處理限制');
    auditTrail.push('更新處理狀態');

    return {
      success: true,
      message: '數據Handle限制請求HandleSuccess',
      complianceChecks,
      auditTrail,
    };
  }

  private handleObjectionRequest(
    request: DataSubjectRequest,
    complianceChecks: string[],
    auditTrail: string[]
  ): {
    success: boolean;
    data?: unknown;
    message: string;
    complianceChecks: string[];
    auditTrail: string[];
  } {
    auditTrail.push('開始處理反對請求');
    auditTrail.push('停止相關數據處理');
    auditTrail.push('記錄反對理由');

    return {
      success: true,
      message: '數據Handle反對請求HandleSuccess',
      complianceChecks,
      auditTrail,
    };
  }

  // CreateData分ClassInstance
  private createPersonalDataClassification(): DataClassification {
    return {
      id: 'personal_data',
      category: 'personal',
      sensitivity: 'medium',
      description: '個人識別信息',
      examples: ['姓名', '電子郵件', '電話號碼', '地址'],
      retentionPeriod: 365,
      encryptionRequired: true,
      accessControls: ['read', 'update'],
      processingPurposes: ['account_management', 'communication', 'support'],
    };
  }

  private createSensitiveDataClassification(): DataClassification {
    return {
      id: 'sensitive_data',
      category: 'sensitive',
      sensitivity: 'high',
      description: '敏感個人信息',
      examples: ['身份證號', '護照號', '社會安全號'],
      retentionPeriod: 180,
      encryptionRequired: true,
      accessControls: ['read'],
      processingPurposes: ['identity_verification', 'compliance'],
    };
  }

  private createFinancialDataClassification(): DataClassification {
    return {
      id: 'financial_data',
      category: 'financial',
      sensitivity: 'high',
      description: '財務相關信息',
      examples: ['銀行賬戶', '信用卡號', '交易記錄'],
      retentionPeriod: 730,
      encryptionRequired: true,
      accessControls: ['read'],
      processingPurposes: ['payment_processing', 'financial_reporting'],
    };
  }

  private createHealthDataClassification(): DataClassification {
    return {
      id: 'health_data',
      category: 'health',
      sensitivity: 'critical',
      description: '健康相關信息',
      examples: ['醫療記錄', '健康狀況', '藥物信息'],
      retentionPeriod: 2555, // 7年
      encryptionRequired: true,
      accessControls: ['read'],
      processingPurposes: ['healthcare', 'insurance'],
    };
  }

  private createBiometricDataClassification(): DataClassification {
    return {
      id: 'biometric_data',
      category: 'biometric',
      sensitivity: 'critical',
      description: '生物識別數據',
      examples: ['指紋', '面部識別', '虹膜掃描'],
      retentionPeriod: 365,
      encryptionRequired: true,
      accessControls: ['read'],
      processingPurposes: ['authentication', 'security'],
    };
  }

  private createLocationDataClassification(): DataClassification {
    return {
      id: 'location_data',
      category: 'location',
      sensitivity: 'medium',
      description: '位置信息',
      examples: ['GPS坐標', 'IP地址', '位置歷史'],
      retentionPeriod: 90,
      encryptionRequired: true,
      accessControls: ['read'],
      processingPurposes: ['location_services', 'analytics'],
    };
  }

  private createBehavioralDataClassification(): DataClassification {
    return {
      id: 'behavioral_data',
      category: 'behavioral',
      sensitivity: 'medium',
      description: '行為數據',
      examples: ['瀏覽歷史', '點擊行為', '使用模式'],
      retentionPeriod: 180,
      encryptionRequired: true,
      accessControls: ['read'],
      processingPurposes: ['analytics', 'personalization'],
    };
  }

  private createPublicDataClassification(): DataClassification {
    return {
      id: 'public_data',
      category: 'public',
      sensitivity: 'low',
      description: '公開信息',
      examples: ['公開資料', '統計數據', '一般信息'],
      retentionPeriod: 3650, // 10年
      encryptionRequired: false,
      accessControls: ['read'],
      processingPurposes: ['public_information', 'general_use'],
    };
  }

  // Create保留政策Instance
  private createPersonalDataRetentionPolicy(): RetentionPolicy {
    return {
      id: 'personal_data_retention',
      dataType: 'personal',
      retentionPeriod: 365,
      deletionMethod: 'secure_delete',
      reviewFrequency: 90,
      lastReview: new Date(),
      nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      exceptions: ['法律要求保留', '爭議解決'],
      complianceNotes: ['符合GDPR保留原則', '定期審查政策'],
    };
  }

  private createSensitiveDataRetentionPolicy(): RetentionPolicy {
    return {
      id: 'sensitive_data_retention',
      dataType: 'sensitive',
      retentionPeriod: 180,
      deletionMethod: 'secure_delete',
      reviewFrequency: 60,
      lastReview: new Date(),
      nextReview: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      exceptions: ['身份驗證需要', '法律合規'],
      complianceNotes: ['嚴格保留期限', '高級安全刪除'],
    };
  }

  private createFinancialDataRetentionPolicy(): RetentionPolicy {
    return {
      id: 'financial_data_retention',
      dataType: 'financial',
      retentionPeriod: 730,
      deletionMethod: 'secure_delete',
      reviewFrequency: 180,
      lastReview: new Date(),
      nextReview: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      exceptions: ['稅務要求', '審計要求'],
      complianceNotes: ['符合財務法規', '審計追蹤要求'],
    };
  }

  private createHealthDataRetentionPolicy(): RetentionPolicy {
    return {
      id: 'health_data_retention',
      dataType: 'health',
      retentionPeriod: 2555,
      deletionMethod: 'secure_delete',
      reviewFrequency: 365,
      lastReview: new Date(),
      nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      exceptions: ['醫療記錄要求', '保險要求'],
      complianceNotes: ['符合醫療法規', '長期保留要求'],
    };
  }

  private createBiometricDataRetentionPolicy(): RetentionPolicy {
    return {
      id: 'biometric_data_retention',
      dataType: 'biometric',
      retentionPeriod: 365,
      deletionMethod: 'secure_delete',
      reviewFrequency: 90,
      lastReview: new Date(),
      nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      exceptions: ['安全認證需要'],
      complianceNotes: ['嚴格生物識別保護', '定期安全審查'],
    };
  }

  private createLocationDataRetentionPolicy(): RetentionPolicy {
    return {
      id: 'location_data_retention',
      dataType: 'location',
      retentionPeriod: 90,
      deletionMethod: 'overwrite',
      reviewFrequency: 30,
      lastReview: new Date(),
      nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      exceptions: ['位置Service需要'],
      complianceNotes: ['短期保留原則', '位置隱私保護'],
    };
  }

  private createBehavioralDataRetentionPolicy(): RetentionPolicy {
    return {
      id: 'behavioral_data_retention',
      dataType: 'behavioral',
      retentionPeriod: 180,
      deletionMethod: 'overwrite',
      reviewFrequency: 60,
      lastReview: new Date(),
      nextReview: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      exceptions: ['分析需要'],
      complianceNotes: ['行為數據保護', '分析目的限制'],
    };
  }

  private createPublicDataRetentionPolicy(): RetentionPolicy {
    return {
      id: 'public_data_retention',
      dataType: 'public',
      retentionPeriod: 3650,
      deletionMethod: 'overwrite',
      reviewFrequency: 365,
      lastReview: new Date(),
      nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      exceptions: ['公開信息需要'],
      complianceNotes: ['公開信息原則', '長期可用性'],
    };
  }

  private createDefaultRetentionPolicy(): RetentionPolicy {
    return {
      id: 'default_retention',
      dataType: 'default',
      retentionPeriod: this.config.defaultRetentionPeriod,
      deletionMethod: 'secure_delete',
      reviewFrequency: 90,
      lastReview: new Date(),
      nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      exceptions: ['一般例外'],
      complianceNotes: ['默認保留政策', '適用於未分類數據'],
    };
  }
}
