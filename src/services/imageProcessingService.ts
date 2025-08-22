import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { logger } from '@/utils/logger';

export interface ImageProcessingOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
  compress?: boolean;
}

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
  format: string;
}

export interface TextExtractionResult {
  text: string;
  confidence: number;
  language?: string;
  blocks?: Array<{
    text: string;
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}

class ImageProcessingService {
  private defaultOptions: ImageProcessingOptions = {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'jpeg',
    compress: true,
  };

  /**
   * 處理圖像（壓縮、調整大小、格式轉換）
   */
  async processImage(
    imageUri: string,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImage> {
    try {
      const finalOptions = { ...this.defaultOptions, ...options };
      
      logger.info('開始處理圖像', { uri: imageUri, options: finalOptions });

      // 獲取圖像信息
      const imageInfo = await this.getImageInfo(imageUri);
      
      // 計算新的尺寸
      const { width, height } = this.calculateDimensions(
        imageInfo.width,
        imageInfo.height,
        finalOptions.maxWidth!,
        finalOptions.maxHeight!
      );

      // 處理圖像（簡化版本，實際應該使用 ImageManipulator）
      const processedImage = {
        uri: imageUri, // 簡化處理，實際應該返回處理後的 URI
      };

      // 獲取處理後的圖像信息
      const processedInfo = await this.getImageInfo(processedImage.uri);

      logger.info('圖像處理完成', {
        originalSize: imageInfo.size,
        processedSize: processedInfo.size,
        compressionRatio: (processedInfo.size / imageInfo.size * 100).toFixed(2) + '%',
      });

      return {
        uri: processedImage.uri,
        width: processedInfo.width,
        height: processedInfo.height,
        size: processedInfo.size,
        format: finalOptions.format!,
      };
    } catch (error: any) {
      logger.error('圖像處理失敗', { error: error.message, imageUri });
      throw new Error(`圖像處理失敗: ${error.message}`);
    }
  }

  /**
   * 從圖像中提取文字（OCR）
   */
  async extractText(imageUri: string): Promise<TextExtractionResult> {
    try {
      logger.info('開始文字提取', { uri: imageUri });

      // 這裡應該調用實際的 OCR 服務
      // 目前返回模擬數據
      const mockResult: TextExtractionResult = {
        text: '模擬提取的文字內容',
        confidence: 0.85,
        language: 'zh-TW',
        blocks: [
          {
            text: '模擬提取的文字內容',
            confidence: 0.85,
            boundingBox: { x: 0, y: 0, width: 100, height: 20 },
          },
        ],
      };

      logger.info('文字提取完成', { 
        textLength: mockResult.text.length,
        confidence: mockResult.confidence 
      });

      return mockResult;
    } catch (error: any) {
      logger.error('文字提取失敗', { error: error.message, imageUri });
      throw new Error(`文字提取失敗: ${error.message}`);
    }
  }

  /**
   * 獲取圖像信息
   */
  async getImageInfo(imageUri: string): Promise<{
    width: number;
    height: number;
    size: number;
  }> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('圖像文件不存在');
      }

      // 這裡應該獲取實際的圖像尺寸
      // 目前返回模擬數據
      return {
        width: 1920,
        height: 1080,
        size: fileInfo.size || 0,
      };
    } catch (error: any) {
      logger.error('獲取圖像信息失敗', { error: error.message, imageUri });
      throw new Error(`獲取圖像信息失敗: ${error.message}`);
    }
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

    // 如果圖像超過最大尺寸，按比例縮放
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    return { width, height };
  }

  /**
   * 將圖像轉換為 Base64
   */
  async imageToBase64(imageUri: string): Promise<string> {
    try {
      logger.info('開始轉換圖像為 Base64', { uri: imageUri });

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      logger.info('Base64 轉換完成', { 
        length: base64.length,
        size: (base64.length * 0.75).toFixed(2) + ' bytes'
      });

      return base64;
    } catch (error: any) {
      logger.error('Base64 轉換失敗', { error: error.message, imageUri });
      throw new Error(`Base64 轉換失敗: ${error.message}`);
    }
  }

  /**
   * 驗證圖像格式
   */
  validateImageFormat(imageUri: string): boolean {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp'];
    const extension = imageUri.toLowerCase().split('.').pop();
    return validExtensions.includes(`.${extension}`);
  }

  /**
   * 清理臨時圖像文件
   */
  async cleanupTempImages(tempUris: string[]): Promise<void> {
    try {
      for (const uri of tempUris) {
        if (uri.startsWith('file://') || uri.startsWith(FileSystem.documentDirectory!)) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
      }
      logger.info('臨時圖像文件清理完成', { count: tempUris.length });
    } catch (error: any) {
      logger.warn('清理臨時文件失敗', { error: error.message });
    }
  }
}

export const imageProcessingService = new ImageProcessingService();
export default imageProcessingService;
