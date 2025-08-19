import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { validateInput, validateApiResponse } from '../utils/validationService';
import { z } from 'zod';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 防偽檢測配置
export interface AntiCounterfeitConfig {
  // AI 模型配置
  aiModel: {
    modelVersion: string;
    confidenceThreshold: number;
    useMultiModel: boolean;
    imagePreprocessing: boolean;
  };

  // 多維度分析配置
  analysis: {
    includePrintQuality: boolean;
    includeMaterial: boolean;
    includeColor: boolean;
    includeFont: boolean;
    includeHologram: boolean;
    includeUVInspection: boolean;
  };

  // 數據庫比對配置
  database: {
    includeOfficialDatabase: boolean;
    includeHistoricalData: boolean;
    includeVersionValidation: boolean;
    includeReleaseInfo: boolean;
  };

  // 警報配置
  alert: {
    enableAutoAlert: boolean;
    alertThreshold: number;
    notificationMethods: string[];
  };
}

// 防偽檢測結果
export interface CounterfeitAnalysis {
  isCounterfeit: boolean;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  analysisDetails: {
    printQuality: PrintQualityScore;
    material: MaterialScore;
    color: ColorScore;
    font: FontScore;
    hologram: HologramScore;
    databaseMatch: DatabaseMatchScore;
  };
  anomalies: Anomaly[];
  recommendations: string[];
  timestamp: Date;
  processingTime: number;
  metadata: {
    analysisMethod: string;
    modelVersion: string;
    imageQuality: string;
    lightingConditions: string;
  };
}

// 印刷質量分析
export interface PrintQualityScore {
  resolution: number; // 0-100
  sharpness: number; // 0-100
  colorAccuracy: number; // 0-100
  overallScore: number; // 0-100
  issues: string[];
  details: {
    pixelDensity: number;
    colorGamut: string;
    printMethod: string;
  };
}

// 材質分析
export interface MaterialScore {
  texture: number; // 0-100
  thickness: number; // 0-100
  finish: number; // 0-100
  overallScore: number; // 0-100
  issues: string[];
  details: {
    materialType: string;
    weight: number;
    surfaceFinish: string;
  };
}

// 顏色分析
export interface ColorScore {
  hueAccuracy: number; // 0-100
  saturation: number; // 0-100
  brightness: number; // 0-100
  overallScore: number; // 0-100
  issues: string[];
  details: {
    dominantColors: string[];
    colorTemperature: number;
    colorShift: number;
  };
}

// 字體分析
export interface FontScore {
  fontType: number; // 0-100
  spacing: number; // 0-100
  alignment: number; // 0-100
  overallScore: number; // 0-100
  issues: string[];
  details: {
    fontFamily: string;
    fontSize: number;
    kerning: number;
  };
}

// 全息圖分析
export interface HologramScore {
  pattern: number; // 0-100
  reflection: number; // 0-100
  depth: number; // 0-100
  overallScore: number; // 0-100
  issues: string[];
  details: {
    hologramType: string;
    patternComplexity: number;
    reflectionAngle: number;
  };
}

// 數據庫比對
export interface DatabaseMatchScore {
  officialMatch: number; // 0-100
  versionMatch: number; // 0-100
  releaseMatch: number; // 0-100
  overallScore: number; // 0-100
  issues: string[];
  details: {
    officialDatabase: string;
    versionInfo: string;
    releaseDate: string;
  };
}

// 異常點
export interface Anomaly {
  type: 'print' | 'material' | 'color' | 'font' | 'hologram' | 'database';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  confidence: number;
  suggestions: string[];
}

// 防偽檢測請求
export interface AntiCounterfeitRequest {
  imageData: string; // base64
  cardInfo?: {
    cardId: string;
    cardName: string;
    cardType: string;
    set: string;
    releaseDate?: string;
  };
  config?: Partial<AntiCounterfeitConfig>;
}

// 防偽檢測響應
export interface AntiCounterfeitResponse {
  success: boolean;
  message: string;
  data: CounterfeitAnalysis;
}

// 防偽警報
export interface CounterfeitAlert {
  alertId: string;
  cardId: string;
  alertType: 'counterfeit_detected' | 'suspicious_item' | 'database_mismatch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: CounterfeitAnalysis;
  timestamp: Date;
  acknowledged: boolean;
}

// 防偽報告
export interface AntiCounterfeitReport {
  reportId: string;
  cardInfo: {
    cardId: string;
    cardName: string;
    cardType: string;
    set: string;
  };
  analysis: CounterfeitAnalysis;
  summary: {
    isAuthentic: boolean;
    confidence: number;
    riskLevel: string;
    keyFindings: string[];
  };
  recommendations: {
    immediate: string[];
    longTerm: string[];
    prevention: string[];
  };
  generatedAt: Date;
  expiresAt: Date;
}

// 防偽判斷服務類
class AntiCounterfeitService {
  private config: AntiCounterfeitConfig = {
    aiModel: {
      modelVersion: 'v2.1',
      confidenceThreshold: 0.85,
      useMultiModel: true,
      imagePreprocessing: true
    },
    analysis: {
      includePrintQuality: true,
      includeMaterial: true,
      includeColor: true,
      includeFont: true,
      includeHologram: true,
      includeUVInspection: true
    },
    database: {
      includeOfficialDatabase: true,
      includeHistoricalData: true,
      includeVersionValidation: true,
      includeReleaseInfo: true
    },
    alert: {
      enableAutoAlert: true,
      alertThreshold: 0.7,
      notificationMethods: ['email', 'push', 'sms']
    }
  };

  // 獲取當前配置
  getConfig(): AntiCounterfeitConfig {
    return this.config;
  }

  // 更新配置
  updateConfig(newConfig: Partial<AntiCounterfeitConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 核心防偽檢測
  async detectCounterfeit(imageData: string, cardInfo?: any): Promise<CounterfeitAnalysis> {
    try {
      logger.info('開始防偽檢測:', { cardId: cardInfo?.cardId });

      const startTime = Date.now();

      // 驗證輸入
      const validationResult = validateInput(z.object({
        imageData: z.string().min(1, '圖片數據不能為空'),
        cardInfo: z.object({
          cardId: z.string().optional(),
          cardName: z.string().optional(),
          cardType: z.string().optional(),
          set: z.string().optional(),
          releaseDate: z.string().optional()
        }).optional()
      }), { imageData, cardInfo });

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '輸入驗證失敗');
      }

      // 並行執行多維度分析
      const [
        printQualityAnalysis,
        materialAnalysis,
        colorAnalysis,
        fontAnalysis,
        hologramAnalysis,
        databaseComparison
      ] = await Promise.all([
        this.analyzePrintQuality(imageData),
        this.analyzeMaterial(imageData),
        this.analyzeColor(imageData),
        this.analyzeFont(imageData),
        this.analyzeHologram(imageData),
        this.compareWithOfficialDatabase(cardInfo)
      ]);

      // 綜合分析結果
      const analysisDetails = {
        printQuality: printQualityAnalysis,
        material: materialAnalysis,
        color: colorAnalysis,
        font: fontAnalysis,
        hologram: hologramAnalysis,
        databaseMatch: databaseComparison
      };

      // 計算綜合分數和風險等級
      const overallScore = this.calculateOverallScore(analysisDetails);
      const isCounterfeit = overallScore < this.config.aiModel.confidenceThreshold;
      const riskLevel = this.calculateRiskLevel(overallScore);

      // 識別異常點
      const anomalies = this.identifyAnomalies(analysisDetails);

      // 生成建議
      const recommendations = this.generateRecommendations(analysisDetails, anomalies);

      const processingTime = Date.now() - startTime;

      const result: CounterfeitAnalysis = {
        isCounterfeit,
        confidence: overallScore,
        riskLevel,
        analysisDetails,
        anomalies,
        recommendations,
        timestamp: new Date(),
        processingTime,
        metadata: {
          analysisMethod: 'AI + Multi-dimensional Analysis',
          modelVersion: this.config.aiModel.modelVersion,
          imageQuality: 'High',
          lightingConditions: 'Optimal'
        }
      };

      // 如果檢測到假卡，發送警報
      if (isCounterfeit && this.config.alert.enableAutoAlert) {
        await this.alertCounterfeitDetection(cardInfo?.cardId || 'unknown', overallScore);
      }

      logger.info('防偽檢測完成', {
        cardId: cardInfo?.cardId,
        isCounterfeit,
        confidence: overallScore,
        processingTime
      });

      return result;
    } catch (error: any) {
      logger.error('防偽檢測失敗:', { error: error.message });
      throw error;
    }
  }

  // 印刷質量分析
  async analyzePrintQuality(imageData: string): Promise<PrintQualityScore> {
    try {
      const response = await apiService.post<PrintQualityScore>(
        API_ENDPOINTS.ANTI_COUNTERFEIT.PRINT_QUALITY || '/anti-counterfeit/print-quality',
        { imageData }
      );

      const validationResult = validateApiResponse(z.object({
        resolution: z.number().min(0).max(100),
        sharpness: z.number().min(0).max(100),
        colorAccuracy: z.number().min(0).max(100),
        overallScore: z.number().min(0).max(100),
        issues: z.array(z.string()),
        details: z.object({
          pixelDensity: z.number(),
          colorGamut: z.string(),
          printMethod: z.string()
        })
      }), response.data);

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '印刷質量分析數據驗證失敗');
      }

      return validationResult.data!;
    } catch (error: any) {
      logger.error('印刷質量分析失敗:', { error: error.message });
      // 返回默認結果
      return {
        resolution: 50,
        sharpness: 50,
        colorAccuracy: 50,
        overallScore: 50,
        issues: ['分析失敗'],
        details: {
          pixelDensity: 0,
          colorGamut: 'unknown',
          printMethod: 'unknown'
        }
      };
    }
  }

  // 材質分析
  async analyzeMaterial(imageData: string): Promise<MaterialScore> {
    try {
      const response = await apiService.post<MaterialScore>(
        API_ENDPOINTS.ANTI_COUNTERFEIT.MATERIAL || '/anti-counterfeit/material',
        { imageData }
      );

      const validationResult = validateApiResponse(z.object({
        texture: z.number().min(0).max(100),
        thickness: z.number().min(0).max(100),
        finish: z.number().min(0).max(100),
        overallScore: z.number().min(0).max(100),
        issues: z.array(z.string()),
        details: z.object({
          materialType: z.string(),
          weight: z.number(),
          surfaceFinish: z.string()
        })
      }), response.data);

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '材質分析數據驗證失敗');
      }

      return validationResult.data!;
    } catch (error: any) {
      logger.error('材質分析失敗:', { error: error.message });
      return {
        texture: 50,
        thickness: 50,
        finish: 50,
        overallScore: 50,
        issues: ['分析失敗'],
        details: {
          materialType: 'unknown',
          weight: 0,
          surfaceFinish: 'unknown'
        }
      };
    }
  }

  // 顏色分析
  async analyzeColor(imageData: string): Promise<ColorScore> {
    try {
      const response = await apiService.post<ColorScore>(
        API_ENDPOINTS.ANTI_COUNTERFEIT.COLOR || '/anti-counterfeit/color',
        { imageData }
      );

      const validationResult = validateApiResponse(z.object({
        hueAccuracy: z.number().min(0).max(100),
        saturation: z.number().min(0).max(100),
        brightness: z.number().min(0).max(100),
        overallScore: z.number().min(0).max(100),
        issues: z.array(z.string()),
        details: z.object({
          dominantColors: z.array(z.string()),
          colorTemperature: z.number(),
          colorShift: z.number()
        })
      }), response.data);

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '顏色分析數據驗證失敗');
      }

      return validationResult.data!;
    } catch (error: any) {
      logger.error('顏色分析失敗:', { error: error.message });
      return {
        hueAccuracy: 50,
        saturation: 50,
        brightness: 50,
        overallScore: 50,
        issues: ['分析失敗'],
        details: {
          dominantColors: [],
          colorTemperature: 0,
          colorShift: 0
        }
      };
    }
  }

  // 字體分析
  async analyzeFont(imageData: string): Promise<FontScore> {
    try {
      const response = await apiService.post<FontScore>(
        API_ENDPOINTS.ANTI_COUNTERFEIT.FONT || '/anti-counterfeit/font',
        { imageData }
      );

      const validationResult = validateApiResponse(z.object({
        fontType: z.number().min(0).max(100),
        spacing: z.number().min(0).max(100),
        alignment: z.number().min(0).max(100),
        overallScore: z.number().min(0).max(100),
        issues: z.array(z.string()),
        details: z.object({
          fontFamily: z.string(),
          fontSize: z.number(),
          kerning: z.number()
        })
      }), response.data);

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '字體分析數據驗證失敗');
      }

      return validationResult.data!;
    } catch (error: any) {
      logger.error('字體分析失敗:', { error: error.message });
      return {
        fontType: 50,
        spacing: 50,
        alignment: 50,
        overallScore: 50,
        issues: ['分析失敗'],
        details: {
          fontFamily: 'unknown',
          fontSize: 0,
          kerning: 0
        }
      };
    }
  }

  // 全息圖分析
  async analyzeHologram(imageData: string): Promise<HologramScore> {
    try {
      const response = await apiService.post<HologramScore>(
        API_ENDPOINTS.ANTI_COUNTERFEIT.HOLOGRAM || '/anti-counterfeit/hologram',
        { imageData }
      );

      const validationResult = validateApiResponse(z.object({
        pattern: z.number().min(0).max(100),
        reflection: z.number().min(0).max(100),
        depth: z.number().min(0).max(100),
        overallScore: z.number().min(0).max(100),
        issues: z.array(z.string()),
        details: z.object({
          hologramType: z.string(),
          patternComplexity: z.number(),
          reflectionAngle: z.number()
        })
      }), response.data);

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '全息圖分析數據驗證失敗');
      }

      return validationResult.data!;
    } catch (error: any) {
      logger.error('全息圖分析失敗:', { error: error.message });
      return {
        pattern: 50,
        reflection: 50,
        depth: 50,
        overallScore: 50,
        issues: ['分析失敗'],
        details: {
          hologramType: 'unknown',
          patternComplexity: 0,
          reflectionAngle: 0
        }
      };
    }
  }

  // 與官方數據庫比對
  async compareWithOfficialDatabase(cardInfo?: any): Promise<DatabaseMatchScore> {
    try {
      if (!cardInfo?.cardId) {
        return {
          officialMatch: 0,
          versionMatch: 0,
          releaseMatch: 0,
          overallScore: 0,
          issues: ['缺少卡片信息'],
          details: {
            officialDatabase: 'unknown',
            versionInfo: 'unknown',
            releaseDate: 'unknown'
          }
        };
      }

      const response = await apiService.post<DatabaseMatchScore>(
        API_ENDPOINTS.ANTI_COUNTERFEIT.DATABASE || '/anti-counterfeit/database',
        { cardInfo }
      );

      const validationResult = validateApiResponse(z.object({
        officialMatch: z.number().min(0).max(100),
        versionMatch: z.number().min(0).max(100),
        releaseMatch: z.number().min(0).max(100),
        overallScore: z.number().min(0).max(100),
        issues: z.array(z.string()),
        details: z.object({
          officialDatabase: z.string(),
          versionInfo: z.string(),
          releaseDate: z.string()
        })
      }), response.data);

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '數據庫比對驗證失敗');
      }

      return validationResult.data!;
    } catch (error: any) {
      logger.error('數據庫比對失敗:', { error: error.message });
      return {
        officialMatch: 0,
        versionMatch: 0,
        releaseMatch: 0,
        overallScore: 0,
        issues: ['比對失敗'],
        details: {
          officialDatabase: 'unknown',
          versionInfo: 'unknown',
          releaseDate: 'unknown'
        }
      };
    }
  }

  // 計算綜合分數
  private calculateOverallScore(analysisDetails: any): number {
    const scores = [
      analysisDetails.printQuality.overallScore,
      analysisDetails.material.overallScore,
      analysisDetails.color.overallScore,
      analysisDetails.font.overallScore,
      analysisDetails.hologram.overallScore,
      analysisDetails.databaseMatch.overallScore
    ];

    // 加權平均，數據庫比對權重更高
    const weights = [0.15, 0.15, 0.15, 0.15, 0.15, 0.25];
    const weightedSum = scores.reduce((sum, score, index) => sum + score * weights[index], 0);

    return Math.round(weightedSum);
  }

  // 計算風險等級
  private calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }

  // 識別異常點
  private identifyAnomalies(analysisDetails: any): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // 檢查印刷質量異常
    if (analysisDetails.printQuality.overallScore < 60) {
      anomalies.push({
        type: 'print',
        severity: analysisDetails.printQuality.overallScore < 30 ? 'critical' : 'high',
        description: '印刷質量異常',
        location: '整體印刷',
        confidence: analysisDetails.printQuality.overallScore / 100,
        suggestions: ['檢查印刷設備', '驗證印刷材料']
      });
    }

    // 檢查材質異常
    if (analysisDetails.material.overallScore < 60) {
      anomalies.push({
        type: 'material',
        severity: analysisDetails.material.overallScore < 30 ? 'critical' : 'high',
        description: '材質異常',
        location: '卡片材質',
        confidence: analysisDetails.material.overallScore / 100,
        suggestions: ['檢查材質類型', '驗證材質來源']
      });
    }

    // 檢查顏色異常
    if (analysisDetails.color.overallScore < 60) {
      anomalies.push({
        type: 'color',
        severity: analysisDetails.color.overallScore < 30 ? 'critical' : 'high',
        description: '顏色異常',
        location: '整體顏色',
        confidence: analysisDetails.color.overallScore / 100,
        suggestions: ['檢查顏色配置', '驗證色彩標準']
      });
    }

    // 檢查字體異常
    if (analysisDetails.font.overallScore < 60) {
      anomalies.push({
        type: 'font',
        severity: analysisDetails.font.overallScore < 30 ? 'critical' : 'high',
        description: '字體異常',
        location: '文字區域',
        confidence: analysisDetails.font.overallScore / 100,
        suggestions: ['檢查字體類型', '驗證字體來源']
      });
    }

    // 檢查全息圖異常
    if (analysisDetails.hologram.overallScore < 60) {
      anomalies.push({
        type: 'hologram',
        severity: analysisDetails.hologram.overallScore < 30 ? 'critical' : 'high',
        description: '全息圖異常',
        location: '全息圖區域',
        confidence: analysisDetails.hologram.overallScore / 100,
        suggestions: ['檢查全息圖質量', '驗證全息圖類型']
      });
    }

    // 檢查數據庫比對異常
    if (analysisDetails.databaseMatch.overallScore < 60) {
      anomalies.push({
        type: 'database',
        severity: analysisDetails.databaseMatch.overallScore < 30 ? 'critical' : 'high',
        description: '數據庫比對異常',
        location: '卡片信息',
        confidence: analysisDetails.databaseMatch.overallScore / 100,
        suggestions: ['檢查卡片信息', '驗證版本信息']
      });
    }

    return anomalies;
  }

  // 生成建議
  private generateRecommendations(analysisDetails: any, anomalies: Anomaly[]): string[] {
    const recommendations: string[] = [];

    // 基於異常點生成建議
    anomalies.forEach(anomaly => {
      recommendations.push(...anomaly.suggestions);
    });

    // 基於整體分數生成建議
    const overallScore = this.calculateOverallScore(analysisDetails);

    if (overallScore < 30) {
      recommendations.push('建議進行專業鑑定');
      recommendations.push('聯繫官方驗證');
    } else if (overallScore < 60) {
      recommendations.push('建議進一步檢查');
      recommendations.push('收集更多樣本進行比對');
    } else if (overallScore < 80) {
      recommendations.push('建議定期檢查');
      recommendations.push('保持監控狀態');
    } else {
      recommendations.push('卡片狀態良好');
      recommendations.push('建議正常使用');
    }

    return [...new Set(recommendations)]; // 去重
  }

  // 發送假卡警報
  async alertCounterfeitDetection(cardId: string, confidence: number): Promise<CounterfeitAlert> {
    try {
      const alert: CounterfeitAlert = {
        alertId: `alert_${Date.now()}`,
        cardId,
        alertType: 'counterfeit_detected',
        severity: confidence < 30 ? 'critical' : confidence < 60 ? 'high' : 'medium',
        message: `檢測到可疑卡片: ${cardId}`,
        details: null as any, // 這裡應該包含詳細的檢測結果
        timestamp: new Date(),
        acknowledged: false
      };

      // 發送到後端
      const response = await apiService.post<CounterfeitAlert>(
        API_ENDPOINTS.ANTI_COUNTERFEIT.ALERT || '/anti-counterfeit/alert',
        alert
      );

      logger.info('假卡警報已發送', { cardId, confidence });
      return response.data;
    } catch (error: any) {
      logger.error('發送假卡警報失敗:', { error: error.message });
      throw error;
    }
  }

  // 生成防偽報告
  async generateAntiCounterfeitReport(
    cardInfo: any,
    analysis: CounterfeitAnalysis
  ): Promise<AntiCounterfeitReport> {
    try {
      const report: AntiCounterfeitReport = {
        reportId: `report_${Date.now()}`,
        cardInfo: {
          cardId: cardInfo.cardId || 'unknown',
          cardName: cardInfo.cardName || 'unknown',
          cardType: cardInfo.cardType || 'unknown',
          set: cardInfo.set || 'unknown'
        },
        analysis,
        summary: {
          isAuthentic: !analysis.isCounterfeit,
          confidence: analysis.confidence,
          riskLevel: analysis.riskLevel,
          keyFindings: analysis.anomalies.map(a => a.description)
        },
        recommendations: {
          immediate: analysis.recommendations.filter(r =>
            r.includes('立即') || r.includes('緊急') || r.includes('專業鑑定')
          ),
          longTerm: analysis.recommendations.filter(r =>
            r.includes('定期') || r.includes('監控') || r.includes('檢查')
          ),
          prevention: analysis.recommendations.filter(r =>
            r.includes('建議') || r.includes('保持') || r.includes('正常')
          )
        },
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天後過期
      };

      // 保存到後端
      const response = await apiService.post<AntiCounterfeitReport>(
        API_ENDPOINTS.ANTI_COUNTERFEIT.REPORT || '/anti-counterfeit/report',
        report
      );

      logger.info('防偽報告已生成', { reportId: report.reportId });
      return response.data;
    } catch (error: any) {
      logger.error('生成防偽報告失敗:', { error: error.message });
      throw error;
    }
  }

  // 驗證卡片真偽
  async validateCardAuthenticity(cardData: any): Promise<{ isValid: boolean; confidence: number; details: string[] }> {
    try {
      const analysis = await this.detectCounterfeit(cardData.imageData, cardData.cardInfo);

      return {
        isValid: !analysis.isCounterfeit,
        confidence: analysis.confidence,
        details: analysis.recommendations
      };
    } catch (error: any) {
      logger.error('驗證卡片真偽失敗:', { error: error.message });
      throw error;
    }
  }
}

export const antiCounterfeitService = new AntiCounterfeitService();
