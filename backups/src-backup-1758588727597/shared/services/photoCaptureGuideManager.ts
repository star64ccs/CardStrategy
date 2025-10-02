// 統一的拍攝指引管理器
import { logger } from '../../core/utils/logger';

export interface PhotoCaptureGuidelines {
  title: string;
  description: string;
  requirements: {
    resolution: string;
    format: string;
    lighting: string;
    background: string;
  };
  steps: PhotoCaptureStep[];
  qualityCheck: string[];
  commonMistakes: string[];
}

export interface PhotoCaptureStep {
  step: number;
  title: string;
  description: string;
  tips: string[];
}

export interface PhotoValidationResult {
  isValid: boolean;
  issues: string[];
  quality: {
    resolution: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unknown';
    lighting: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unknown';
    focus: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unknown';
    angle: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unknown';
    coverage: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unknown';
  };
  score: number;
}

export interface ImageData {
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  url?: string;
  base64?: string;
}

export type FeatureType =
  | 'bgs_grading'
  | 'card_recognition'
  | 'centering_assessment'
  | 'authenticity_check'
  | 'fake_card_report'
  | 'real_card_report';

class PhotoCaptureGuideManager {
  private static instance: PhotoCaptureGuideManager;
  private guidelines: Record<FeatureType, PhotoCaptureGuidelines>;

  private constructor() {
    this.guidelines = this.initializeGuidelines();
  }

  public static getInstance(): PhotoCaptureGuideManager {
    if (!PhotoCaptureGuideManager.instance) {
      PhotoCaptureGuideManager.instance = new PhotoCaptureGuideManager();
    }
    return PhotoCaptureGuideManager.instance;
  }

  private initializeGuidelines(): Record<FeatureType, PhotoCaptureGuidelines> {
    return {
      bgs_grading: {
        title: 'BGS 模擬鑑定拍攝指引',
        description: '為了獲得準確的 BGS 模擬鑑定結果，請按照以下指引拍攝照片',
        requirements: {
          resolution: '至少 2MP (建議 8MP 以上)',
          format: 'JPG 或 PNG',
          lighting: '自然光或均勻的室內光',
          background: '純色背景，避免複雜圖案',
        },
        steps: [
          {
            step: 1,
            title: '準備環境',
            description: '選擇光線充足、背景簡潔的環境',
            tips: [
              '避免強烈陽光直射',
              '使用白色或淺色背景',
              '確保環境安靜穩定',
            ],
          },
          {
            step: 2,
            title: '卡片擺放',
            description: '將卡片平放在背景上，確保完全平整',
            tips: [
              '卡片四角完全貼合背景',
              '避免卡片彎曲或翹起',
              '保持卡片清潔無污漬',
            ],
          },
          {
            step: 3,
            title: '相機設置',
            description: '調整相機參數以獲得最佳效果',
            tips: [
              '使用最高解析度設置',
              '關閉閃光燈',
              '啟用防抖功能',
              '設置為自動對焦',
            ],
          },
          {
            step: 4,
            title: '拍攝角度',
            description: '保持相機垂直於卡片表面',
            tips: [
              '相機距離卡片 30-50cm',
              '保持相機水平，避免傾斜',
              '確保卡片完全在取景框內',
              '留出適當的邊距',
            ],
          },
          {
            step: 5,
            title: '多角度拍攝',
            description: '拍攝多個角度以獲得完整信息',
            tips: [
              '正面照片：完整卡片圖像',
              '邊角特寫：四個角落的詳細照片',
              '邊緣特寫：四條邊的詳細照片',
              '表面特寫：卡片表面的細節照片',
            ],
          },
        ],
        qualityCheck: [
          '照片清晰度：文字和圖案清晰可見',
          '光照均勻：無明顯陰影或反光',
          '色彩準確：卡片顏色真實還原',
          '完整覆蓋：卡片完全在照片中',
          '無遮擋：卡片未被手指或其他物體遮擋',
        ],
        commonMistakes: [
          '手抖導致照片模糊',
          '光照不足或過強',
          '拍攝角度傾斜',
          '卡片未完全平整',
          '背景過於複雜',
          '卡片被遮擋或部分缺失',
        ],
      },

      card_recognition: {
        title: '卡牌辨識拍攝指引',
        description: '為了準確識別卡牌，請按照以下指引拍攝',
        requirements: {
          resolution: '至少 1MP',
          format: 'JPG 或 PNG',
          lighting: '充足均勻的光線',
          background: '對比度高的背景',
        },
        steps: [
          {
            step: 1,
            title: '卡片準備',
            description: '確保卡片清晰可見',
            tips: ['移除保護套或卡套', '清潔卡片表面', '確保卡片平整'],
          },
          {
            step: 2,
            title: '拍攝設置',
            description: '調整相機以獲得清晰圖像',
            tips: ['使用自動對焦', '保持穩定', '確保充足光線'],
          },
          {
            step: 3,
            title: '拍攝角度',
            description: '保持相機垂直於卡片',
            tips: [
              '相機距離卡片 20-40cm',
              '保持相機水平',
              '確保卡片完全在取景框內',
            ],
          },
        ],
        qualityCheck: [
          '文字清晰可讀',
          '圖案細節清楚',
          '卡片完整在照片中',
          '光照均勻無陰影',
        ],
        commonMistakes: [
          '照片模糊不清',
          '卡片被遮擋',
          '光照不足',
          '拍攝角度傾斜',
        ],
      },

      centering_assessment: {
        title: '置中評估拍攝指引',
        description: '為了準確評估卡片置中，需要特別注意拍攝角度',
        requirements: {
          resolution: '至少 2MP',
          format: 'JPG 或 PNG',
          lighting: '均勻光照，避免陰影',
          background: '純色背景',
        },
        steps: [
          {
            step: 1,
            title: '精確對齊',
            description: '確保相機完全垂直於卡片',
            tips: ['使用水平儀檢查', '避免任何角度傾斜', '保持相機穩定'],
          },
          {
            step: 2,
            title: '邊框對齊',
            description: '確保卡片邊框與取景框平行',
            tips: ['檢查四條邊是否平行', '調整相機位置', '確保卡片完全平整'],
          },
          {
            step: 3,
            title: '距離控制',
            description: '保持適當的拍攝距離',
            tips: [
              '相機距離卡片 40-60cm',
              '確保卡片佔取景框的 80-90%',
              '留出適當邊距',
            ],
          },
        ],
        qualityCheck: [
          '相機完全垂直於卡片',
          '卡片邊框與取景框平行',
          '光照均勻無陰影',
          '卡片完全平整',
        ],
        commonMistakes: [
          '拍攝角度傾斜',
          '卡片未完全平整',
          '光照不均勻',
          '距離過近或過遠',
        ],
      },

      authenticity_check: {
        title: '防偽判斷拍攝指引',
        description: '為了檢測防偽特徵，需要高解析度多角度照片',
        requirements: {
          resolution: '至少 4MP',
          format: 'JPG 或 PNG',
          lighting: '強光照射以顯示防偽特徵',
          background: '深色背景以突出細節',
        },
        steps: [
          {
            step: 1,
            title: '防偽特徵拍攝',
            description: '重點拍攝防偽標記和特殊效果',
            tips: ['使用強光照射', '拍攝全息效果', '捕捉特殊印刷細節'],
          },
          {
            step: 2,
            title: '多角度拍攝',
            description: '從不同角度拍攝防偽特徵',
            tips: ['正面直射光', '側面斜射光', '背面透射光'],
          },
          {
            step: 3,
            title: '細節特寫',
            description: '拍攝關鍵防偽細節',
            tips: ['全息標籤特寫', '印刷質量細節', '材質紋理特寫'],
          },
        ],
        qualityCheck: [
          '防偽特徵清晰可見',
          '全息效果明顯',
          '印刷細節清楚',
          '材質紋理清晰',
        ],
        commonMistakes: [
          '光照不足',
          '角度不當',
          '解析度過低',
          '防偽特徵被遮擋',
        ],
      },

      fake_card_report: {
        title: '假卡回報拍攝指引',
        description: '為了準確識別假卡特徵，需要詳細的證據照片',
        requirements: {
          resolution: '至少 2MP',
          format: 'JPG 或 PNG',
          lighting: '充足光照以顯示細節',
          background: '對比度高的背景',
        },
        steps: [
          {
            step: 1,
            title: '整體照片',
            description: '拍攝卡片的完整照片',
            tips: ['正面完整照片', '背面完整照片', '側面厚度照片'],
          },
          {
            step: 2,
            title: '問題特寫',
            description: '重點拍攝可疑的特徵',
            tips: ['印刷質量問題', '顏色偏差', '材質異常'],
          },
          {
            step: 3,
            title: '對比照片',
            description: '與真卡進行對比拍攝',
            tips: ['並排對比', '細節對比', '材質對比'],
          },
        ],
        qualityCheck: [
          '問題特徵清晰可見',
          '對比效果明顯',
          '細節清楚',
          '證據充分',
        ],
        commonMistakes: ['照片模糊', '光照不足', '角度不當', '證據不充分'],
      },

      real_card_report: {
        title: '真卡回報拍攝指引',
        description: '為了確認真卡特徵，需要展示正面的證據',
        requirements: {
          resolution: '至少 2MP',
          format: 'JPG 或 PNG',
          lighting: '充足光照以顯示細節',
          background: '純色背景',
        },
        steps: [
          {
            step: 1,
            title: '正面照片',
            description: '拍攝卡片的正面完整照片',
            tips: ['卡片完全在照片中', '光照均勻', '對焦清晰'],
          },
          {
            step: 2,
            title: '背面照片',
            description: '拍攝卡片的背面照片',
            tips: ['背面完整可見', '光照充足', '細節清楚'],
          },
          {
            step: 3,
            title: '特徵照片',
            description: '拍攝關鍵真卡特徵',
            tips: ['防偽標記', '印刷質量', '材質紋理'],
          },
        ],
        qualityCheck: ['卡片完整可見', '特徵清晰', '光照均勻', '對焦準確'],
        commonMistakes: ['照片模糊', '卡片不完整', '光照不均', '特徵不明顯'],
      },
    };
  }

  /**
   * 獲取指定功能的拍攝指引
   */
  public getGuidelines(featureType: FeatureType): PhotoCaptureGuidelines {
    const guidelines = this.guidelines[featureType];
    if (!guidelines) {
      logger.warn(`未找到功能類型 ${featureType} 的拍攝指引，返回默認指引`);
      return this.guidelines.bgs_grading;
    }
    return guidelines;
  }

  /**
   * 驗證照片質量
   */
  public async validatePhotoQuality(
    imageData: ImageData,
    featureType: FeatureType
  ): Promise<PhotoValidationResult> {
    const validation: PhotoValidationResult = {
      isValid: true,
      issues: [],
      quality: {
        resolution: 'unknown',
        lighting: 'unknown',
        focus: 'unknown',
        angle: 'unknown',
        coverage: 'unknown',
      },
      score: 0,
    };

    try {
      const guidelines = this.getGuidelines(featureType);

      // 檢查解析度
      if (imageData.width && imageData.height) {
        const megapixels = (imageData.width * imageData.height) / 1000000;
        const minResolution = this.getMinResolution(featureType);

        if (megapixels >= minResolution * 2) {
          validation.quality.resolution = 'excellent';
          validation.score += 20;
        } else if (megapixels >= minResolution) {
          validation.quality.resolution = 'good';
          validation.score += 15;
        } else if (megapixels >= minResolution * 0.5) {
          validation.quality.resolution = 'acceptable';
          validation.score += 10;
        } else {
          validation.quality.resolution = 'poor';
          validation.issues.push(
            `解析度過低，建議使用至少 ${minResolution}MP 的相機`
          );
        }
      }

      // 檢查文件格式
      if (imageData.format) {
        const validFormats = ['jpg', 'jpeg', 'png'];
        if (!validFormats.includes(imageData.format.toLowerCase())) {
          validation.issues.push('不支援的文件格式，請使用 JPG 或 PNG');
        }
      }

      // 檢查文件大小
      if (imageData.size) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (imageData.size > maxSize) {
          validation.issues.push('文件過大，請壓縮後再上傳');
        }
      }

      // 模擬其他質量檢查
      validation.quality.lighting = this.simulateQualityCheck('lighting');
      validation.quality.focus = this.simulateQualityCheck('focus');
      validation.quality.angle = this.simulateQualityCheck('angle');
      validation.quality.coverage = this.simulateQualityCheck('coverage');

      // 計算總分
      Object.values(validation.quality).forEach(quality => {
        if (quality === 'excellent') validation.score += 20;
        else if (quality === 'good') validation.score += 15;
        else if (quality === 'acceptable') validation.score += 10;
        else if (quality === 'poor') validation.score += 5;
      });

      // 判斷是否合格
      const minScore = this.getMinScore(featureType);
      validation.isValid =
        validation.score >= minScore && validation.issues.length <= 2;

      logger.info('照片質量驗證完成', {
        featureType,
        score: validation.score,
        isValid: validation.isValid,
        issues: validation.issues,
      });

      return validation;
    } catch (error) {
      logger.error('照片質量驗證失敗:', error);
      return {
        isValid: false,
        issues: ['照片質量驗證失敗'],
        quality: validation.quality,
        score: 0,
      };
    }
  }

  /**
   * 獲取所有支援的功能類型
   */
  public getSupportedFeatureTypes(): FeatureType[] {
    return Object.keys(this.guidelines) as FeatureType[];
  }

  /**
   * 獲取功能類型的描述
   */
  public getFeatureDescription(featureType: FeatureType): string {
    const guidelines = this.getGuidelines(featureType);
    return guidelines.description;
  }

  private getMinResolution(featureType: FeatureType): number {
    const resolutionMap: Record<FeatureType, number> = {
      bgs_grading: 2,
      card_recognition: 1,
      centering_assessment: 2,
      authenticity_check: 4,
      fake_card_report: 2,
      real_card_report: 2,
    };
    return resolutionMap[featureType] || 1;
  }

  private getMinScore(featureType: FeatureType): number {
    const scoreMap: Record<FeatureType, number> = {
      bgs_grading: 70,
      card_recognition: 50,
      centering_assessment: 60,
      authenticity_check: 80,
      fake_card_report: 60,
      real_card_report: 50,
    };
    return scoreMap[featureType] || 50;
  }

  private simulateQualityCheck(
    type: string
  ): 'excellent' | 'good' | 'acceptable' | 'poor' {
    const score = Math.random() * 100;
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'acceptable';
    return 'poor';
  }
}

export default PhotoCaptureGuideManager;
