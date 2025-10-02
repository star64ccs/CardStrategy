import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { uploadConfig } from '../config/upload-config.js';

class ImageCompressionService {
  constructor() {
    this.config = uploadConfig.imageProcessing;
  }

  /**
   * 壓縮圖片
   */
  async compressImage(inputPath, outputPath, options = {}) {
    try {
      const {
        quality = this.config.compression.quality,
        maxWidth = this.config.compression.maxWidth,
        maxHeight = this.config.compression.maxHeight,
        format = this.config.compression.format
      } = options;

      const sharpInstance = sharp(inputPath);

      // 獲取圖片信息
      const metadata = await sharpInstance.metadata();
      
      // 計算新尺寸
      let { width, height } = metadata;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // 壓縮圖片
      await sharpInstance
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFormat(format, { quality })
        .toFile(outputPath);

      // 獲取壓縮後的文件大小
      const stats = await fs.stat(outputPath);
      
      return {
        success: true,
        outputPath,
        originalSize: metadata.size,
        compressedSize: stats.size,
        compressionRatio: ((metadata.size - stats.size) / metadata.size * 100).toFixed(2),
        dimensions: { width, height },
        format
      };
    } catch (error) {
      console.error('圖片壓縮失敗:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 生成縮略圖
   */
  async generateThumbnail(inputPath, outputPath) {
    try {
      const { width, height, quality } = this.config.thumbnail;

      await sharp(inputPath)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality })
        .toFile(outputPath);

      return {
        success: true,
        outputPath,
        dimensions: { width, height }
      };
    } catch (error) {
      console.error('縮略圖生成失敗:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 批量處理圖片
   */
  async batchProcessImages(files, options = {}) {
    const results = [];
    
    for (const file of files) {
      const result = await this.compressImage(file.path, file.outputPath, options);
      results.push({
        filename: file.filename,
        ...result
      });
    }
    
    return results;
  }

  /**
   * 驗證圖片格式
   */
  validateImageFormat(mimetype, filename) {
    const allowedTypes = uploadConfig.limits.image.allowedTypes;
    const allowedExtensions = uploadConfig.limits.image.allowedExtensions;
    
    const isValidType = allowedTypes.includes(mimetype);
    const extension = path.extname(filename).toLowerCase();
    const isValidExtension = allowedExtensions.includes(extension);
    
    return isValidType && isValidExtension;
  }

  /**
   * 獲取圖片信息
   */
  async getImageInfo(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        hasAlpha: metadata.hasAlpha,
        colorSpace: metadata.space
      };
    } catch (error) {
      throw new Error(`無法讀取圖片信息: ${error.message}`);
    }
  }
}

export default new ImageCompressionService();
