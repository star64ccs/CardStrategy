/**
 * 真實圖像處理服務實現
 * 替換模擬數據，實現實際的圖像處理功能
 */

import * as FileSystem from 'expo-file-system';
import { logger } from '../core/utils/logger';
import { apiService } from './apiService';

export interface RealImageProcessingOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
  compress?: boolean;
  enhance?: boolean;
  sharpen?: boolean;
  adjustBrightness?: boolean;
  adjustContrast?: boolean;
}

export interface RealProcessedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
  format: string;
  compressionRatio: number;
  processingTime: number;
}

export interface RealTextExtractionResult {
  text: string;
  confidence: number;
  language?: string;
  boundingBoxes?: {
    text: string;
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }[];
  extractedFields?: {
    cardName?: string;
    attack?: number;
    defense?: number;
    level?: number;
    type?: string;
    attribute?: string;
  };
}

export interface ImageEnhancementResult {
  originalUri: string;
  enhancedUri: string;
  enhancements: {
    brightness?: number;
    contrast?: number;
    sharpness?: number;
    saturation?: number;
  };
  qualityImprovement: number;
}

class RealImageProcessingService {
  private static instance: RealImageProcessingService;
  private isInitialized = false;
  private readonly defaultOptions: RealImageProcessingOptions = {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'jpeg',
    compress: true,
    enhance: true,
    sharpen: true,
    adjustBrightness: true,
    adjustContrast: true,
  };

  public static getInstance(): RealImageProcessingService {
    if (!RealImageProcessingService.instance) {
      RealImageProcessingService.instance = new RealImageProcessingService();
    }
    return RealImageProcessingService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('初始化真實圖像處理服務');

      // 檢查圖像處理服務可用性
      await this.checkImageProcessingServiceHealth();

      // 加載圖像處理模型
      await this.loadImageProcessingModels();

      this.isInitialized = true;
      logger.info('真實圖像處理服務初始化完成');
    } catch (error) {
      logger.error('真實圖像處理服務初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 處理圖像（壓縮、調整大小、格式轉換、增強）
   */
  async processImage(
    imageUri: string,
    options: RealImageProcessingOptions = {}
  ): Promise<RealProcessedImage> {
    try {
      const startTime = Date.now();
      const finalOptions = { ...this.defaultOptions, ...options };

      logger.info('開始真實圖像處理', { uri: imageUri, options: finalOptions });

      // 1. 獲取原始圖像信息
      const originalImageInfo = await this.getImageInfo(imageUri);

      // 2. 上傳圖像到處理服務
      const uploadedImageData = await this.uploadImageForProcessing(imageUri);

      // 3. 執行圖像處理
      const processedImageData = await this.performImageProcessing(
        uploadedImageData,
        finalOptions
      );

      // 4. 下載處理後的圖像
      const processedImageUri = await this.downloadProcessedImage(
        processedImageData.processedImageId
      );

      // 5. 獲取處理後的圖像信息
      const processedImageInfo = await this.getImageInfo(processedImageUri);

      const processingTime = Date.now() - startTime;
      const compressionRatio =
        (processedImageInfo.size / originalImageInfo.size) * 100;

      logger.info('真實圖像處理完成', {
        originalSize: originalImageInfo.size,
        processedSize: processedImageInfo.size,
        compressionRatio: `${compressionRatio.toFixed(2)}%`,
        processingTime,
      });

      return {
        uri: processedImageUri,
        width: processedImageInfo.width,
        height: processedImageInfo.height,
        size: processedImageInfo.size,
        format: finalOptions.format,
        compressionRatio,
        processingTime,
      };
    } catch (error: unknown) {
      logger.error('真實圖像處理失敗', { error: error.message, imageUri });
      throw new Error(`圖像處理失敗: ${error.message}`);
    }
  }

  /**
   * 從圖像中提取文字（真實 OCR）
   */
  async extractText(imageUri: string): Promise<RealTextExtractionResult> {
    try {
      logger.info('開始真實文字提取', { imageUri });

      const startTime = Date.now();

      // 1. 上傳圖像到 OCR 服務
      const uploadedImageData = await this.uploadImageForOCR(imageUri);

      // 2. 執行 OCR 處理
      const ocrResult = await this.performOCR(uploadedImageData);

      // 3. 解析卡牌信息
      const extractedFields = await this.parseCardInformation(ocrResult.text);

      const processingTime = Date.now() - startTime;

      logger.info('真實文字提取完成', {
        textLength: ocrResult.text.length,
        confidence: ocrResult.confidence,
        boundingBoxesCount: ocrResult.boundingBoxes?.length,
        processingTime,
      });

      return {
        text: ocrResult.text,
        confidence: ocrResult.confidence,
        language: ocrResult.language,
        boundingBoxes: ocrResult.boundingBoxes,
        extractedFields,
      };
    } catch (error: unknown) {
      logger.error('真實文字提取失敗', { error: error.message, imageUri });
      throw new Error(`文字提取失敗: ${error.message}`);
    }
  }

  /**
   * 增強圖像質量
   */
  async enhanceImage(
    imageUri: string,
    enhancementOptions: {
      brightness?: number;
      contrast?: number;
      sharpness?: number;
      saturation?: number;
    } = {}
  ): Promise<ImageEnhancementResult> {
    try {
      logger.info('開始圖像增強', { imageUri, enhancementOptions });

      const startTime = Date.now();

      // 1. 上傳圖像到增強服務
      const uploadedImageData = await this.uploadImageForEnhancement(imageUri);

      // 2. 執行圖像增強
      const enhancementResult = await this.performImageEnhancement(
        uploadedImageData,
        enhancementOptions
      );

      // 3. 下載增強後的圖像
      const enhancedImageUri = await this.downloadEnhancedImage(
        enhancementResult.enhancedImageId
      );

      const processingTime = Date.now() - startTime;

      logger.info('圖像增強完成', {
        processingTime,
        qualityImprovement: enhancementResult.qualityImprovement,
      });

      return {
        originalUri: imageUri,
        enhancedUri: enhancedImageUri,
        enhancements: enhancementResult.enhancements,
        qualityImprovement: enhancementResult.qualityImprovement,
      };
    } catch (error: unknown) {
      logger.error('圖像增強失敗', { error: error.message, imageUri });
      throw new Error(`圖像增強失敗: ${error.message}`);
    }
  }

  /**
   * 上傳圖像用於處理
   */
  private async uploadImageForProcessing(imageUri: string): Promise<string> {
    try {
      const response = await apiService.post('/image/upload', {
        imageUri,
        purpose: 'processing',
      });

      if (response.success && response.data) {
        return response.data.imageId;
      } else {
        throw new Error('圖像上傳失敗');
      }
    } catch (error) {
      logger.error('圖像上傳失敗:', error);
      throw error;
    }
  }

  /**
   * 執行圖像處理
   */
  private async performImageProcessing(
    imageId: string,
    options: RealImageProcessingOptions
  ): Promise<{ processedImageId: string }> {
    try {
      const response = await apiService.post('/image/process', {
        imageId,
        options,
      });

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('圖像處理失敗');
      }
    } catch (error) {
      logger.error('圖像處理失敗:', error);
      throw error;
    }
  }

  /**
   * 下載處理後的圖像
   */
  private async downloadProcessedImage(
    processedImageId: string
  ): Promise<string> {
    try {
      const response = await apiService.get(
        `/image/download/${processedImageId}`
      );

      if (response.success && response.data) {
        return response.data.imageUri;
      } else {
        throw new Error('圖像下載失敗');
      }
    } catch (error) {
      logger.error('圖像下載失敗:', error);
      throw error;
    }
  }

  /**
   * 上傳圖像用於 OCR
   */
  private async uploadImageForOCR(imageUri: string): Promise<string> {
    try {
      const response = await apiService.post('/image/upload', {
        imageUri,
        purpose: 'ocr',
      });

      if (response.success && response.data) {
        return response.data.imageId;
      } else {
        throw new Error('圖像上傳失敗');
      }
    } catch (error) {
      logger.error('OCR 圖像上傳失敗:', error);
      throw error;
    }
  }

  /**
   * 執行 OCR 處理
   */
  private async performOCR(imageId: string): Promise<RealTextExtractionResult> {
    try {
      const response = await apiService.post('/image/ocr', {
        imageId,
        options: {
          language: 'zh-TW',
          extractFields: true,
          confidenceThreshold: 0.7,
        },
      });

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('OCR 處理失敗');
      }
    } catch (error) {
      logger.error('OCR 處理失敗:', error);
      throw error;
    }
  }

  /**
   * 解析卡牌信息
   */
  private async parseCardInformation(text: string): Promise<{
    cardName?: string;
    attack?: number;
    defense?: number;
    level?: number;
    type?: string;
    attribute?: string;
  }> {
    try {
      const response = await apiService.post('/image/parse-card', {
        text,
        language: 'zh-TW',
      });

      if (response.success && response.data) {
        return response.data;
      } else {
        return {};
      }
    } catch (error) {
      logger.warn('卡牌信息解析失敗:', error);
      return {};
    }
  }

  /**
   * 上傳圖像用於增強
   */
  private async uploadImageForEnhancement(imageUri: string): Promise<string> {
    try {
      const response = await apiService.post('/image/upload', {
        imageUri,
        purpose: 'enhancement',
      });

      if (response.success && response.data) {
        return response.data.imageId;
      } else {
        throw new Error('圖像上傳失敗');
      }
    } catch (error) {
      logger.error('增強圖像上傳失敗:', error);
      throw error;
    }
  }

  /**
   * 執行圖像增強
   */
  private async performImageEnhancement(
    imageId: string,
    enhancementOptions: {
      brightness?: number;
      contrast?: number;
      sharpness?: number;
      saturation?: number;
    }
  ): Promise<{
    enhancedImageId: string;
    enhancements: any;
    qualityImprovement: number;
  }> {
    try {
      const response = await apiService.post('/image/enhance', {
        imageId,
        enhancementOptions,
      });

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('圖像增強失敗');
      }
    } catch (error) {
      logger.error('圖像增強失敗:', error);
      throw error;
    }
  }

  /**
   * 下載增強後的圖像
   */
  private async downloadEnhancedImage(
    enhancedImageId: string
  ): Promise<string> {
    try {
      const response = await apiService.get(
        `/image/download/${enhancedImageId}`
      );

      if (response.success && response.data) {
        return response.data.imageUri;
      } else {
        throw new Error('增強圖像下載失敗');
      }
    } catch (error) {
      logger.error('增強圖像下載失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取圖像信息
   */
  private async getImageInfo(
    imageUri: string
  ): Promise<{ width: number; height: number; size: number }> {
    try {
      const response = await apiService.post('/image/info', {
        imageUri,
      });

      if (response.success && response.data) {
        return response.data;
      } else {
        // 回退到本地文件系統檢查
        const fileInfo = await FileSystem.getInfoAsync(imageUri);

        if (!fileInfo.exists) {
          throw new Error('圖像文件不存在');
        }

        return {
          width: 1920,
          height: 1080,
          size: fileInfo.size || 1024000,
        };
      }
    } catch (error: unknown) {
      logger.error('獲取圖像信息失敗', { error: error.message, imageUri });
      throw new Error(`獲取圖像信息失敗: ${error.message}`);
    }
  }

  /**
   * 檢查圖像處理服務健康狀態
   */
  private async checkImageProcessingServiceHealth(): Promise<void> {
    try {
      const response = await apiService.get('/image/health');

      if (!response.success) {
        throw new Error('圖像處理服務不可用');
      }

      logger.info('圖像處理服務健康檢查通過');
    } catch (error) {
      logger.error('圖像處理服務健康檢查失敗:', error);
      throw new Error('圖像處理服務不可用，請檢查服務配置');
    }
  }

  /**
   * 加載圖像處理模型
   */
  private async loadImageProcessingModels(): Promise<void> {
    try {
      const response = await apiService.get('/image/models');

      if (response.success && response.data) {
        logger.info('圖像處理模型加載完成', {
          modelCount: response.data.modelCount,
          version: response.data.version,
        });
      }
    } catch (error) {
      logger.warn('圖像處理模型加載失敗:', error);
    }
  }

  /**
   * 驗證圖像格式
   */
  validateImageFormat(imageUri: string): boolean {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const extension = imageUri.toLowerCase().split('.').pop();
    return validExtensions.includes(`.${extension}`);
  }

  /**
   * 計算圖像尺寸
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }
}

export const realImageProcessingService =
  RealImageProcessingService.getInstance();
