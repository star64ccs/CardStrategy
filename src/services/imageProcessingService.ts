import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

import { logger } from '../core/utils/logger';

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
}

class ImageProcessingService {
  private readonly defaultOptions: ImageProcessingOptions = {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'jpeg',
    compress: true,
  };

  /**
   * HandleGraph像（壓縮、調整大小、格式Convert）
   */
  async processImage(
    imageUri: string,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImage> {
    try {
      const _finalOptions = { ...this.defaultOptions, ...options };

      logger.info('開始處理圖像', { uri: imageUri, options: finalOptions });

      // GetGraph像Information
      const _imageInfo = await this.getImageInfo(imageUri);

      // 計算新的尺寸
      const { width, height } = this.calculateDimensions(
        imageInfo.width,
        imageInfo.height,
        finalOptions.maxWidth,
        finalOptions.maxHeight
      );

      // HandleGraph像（簡化Version，實際應該使用 ImageManipulator）
      const _processedImage = {
        uri: imageUri, // 簡化Handle，實際應該ReturnHandle後的 URI
      };

      // GetHandle後的Graph像Information
      const _processedInfo = await this.getImageInfo(processedImage.uri);

      logger.info('圖像處理完成', {
        originalSize: imageInfo.size,
        processedSize: processedInfo.size,
        compressionRatio: `${((processedInfo.size / imageInfo.size) * 100).toFixed(2)}%`,
      });

      return {
        uri: processedImage.uri,
        width: processedInfo.width,
        height: processedInfo.height,
        size: processedInfo.size,
        format: finalOptions.format,
      };
    } catch (error: unknown) {
      logger.error('圖像HandleFailed', { error: error.message, imageUri });
      throw new Error(`圖像HandleFailed: ${error.message}`);
    }
  }

  /**
   * 從Graph像中提取文字（OCR）
   */
  async extractText(imageUri: string): Promise<TextExtractionResult> {
    try {
      logger.info('開始文字提取', { imageUri });

      // 模擬 OCR Handle
      const mockResult: TextExtractionResult = {
        text: '青眼白龍\n攻擊力: 3000\n防禦力: 2500',
        confidence: 0.88,
        language: 'zh-TW',
        boundingBoxes: [
          {
            text: '青眼白龍',
            confidence: 0.95,
            boundingBox: { x: 10, y: 10, width: 100, height: 30 },
          },
          {
            text: '攻擊力: 3000',
            confidence: 0.88,
            boundingBox: { x: 10, y: 50, width: 120, height: 25 },
          },
          {
            text: '防禦力: 2500',
            confidence: 0.85,
            boundingBox: { x: 10, y: 80, width: 120, height: 25 },
          },
        ],
      };

      logger.info('文字提取完成', {
        textLength: mockResult.text.length,
        confidence: mockResult.confidence,
        boundingBoxesCount: mockResult.boundingBoxes?.length,
      });

      return mockResult;
    } catch (error: unknown) {
      logger.error('文字提取Failed', { error: error.message, imageUri });
      throw new Error(`文字提取Failed: ${error.message}`);
    }
  }

  /**
   * GetGraph像Information
   */
  private async getImageInfo(
    imageUri: string
  ): Promise<{ width: number; height: number; size: number }> {
    try {
      const _fileInfo = await FileSystem.getInfoAsync(imageUri);

      if (!fileInfo.exists) {
        throw new Error('圖像文件不存在');
      }

      // 模擬Graph像尺寸Information
      return {
        width: 1920,
        height: 1080,
        size: fileInfo.size || 1024000,
      };
    } catch (error: unknown) {
      logger.error('Get圖像信息Failed', { error: error.message, imageUri });
      throw new Error(`Get圖像信息Failed: ${error.message}`);
    }
  }

  /**
   * 計算Graph像尺寸
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

  /**
   * VerifyGraph像格式
   */
  validateImageFormat(imageUri: string): boolean {
    const _validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const _extension = imageUri.toLowerCase().split('.').pop();
    return validExtensions.includes(`.${extension}`);
  }

  /**
   * CheckGraph像大小
   */
  async checkImageSize(
    imageUri: string,
    maxSize: number = 10 * 1024 * 1024
  ): Promise<boolean> {
    try {
      const _fileInfo = await FileSystem.getInfoAsync(imageUri);
      return fileInfo.exists && (fileInfo.size || 0) <= maxSize;
    } catch (error) {
      return false;
    }
  }
}

// Create單例Instance
export const _imageProcessingService = new ImageProcessingService();
