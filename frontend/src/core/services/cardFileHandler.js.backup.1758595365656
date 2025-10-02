// 卡牌文件處理服務
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

class CardFileHandler {
  constructor() {
    this.config = {
      maxSize: 10 * 1024 * 1024, // 10MB
      supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      compression: {
        quality: 85,
        maxWidth: 1920,
        maxHeight: 1080
      },
      thumbnail: {
        width: 300,
        height: 300,
        quality: 75
      }
    };
  }

  // 處理上傳的文件
  async processUploadedFile(file) {
    try {
      // 1. 驗證文件
      const validation = await this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // 2. 壓縮文件
      const compressedFile = await this.compressFile(file);

      // 3. 生成縮略圖
      const thumbnail = await this.generateThumbnail(compressedFile.path);

      // 4. 提取元數據
      const metadata = await this.extractMetadata(compressedFile.path);

      return {
        success: true,
        data: {
          original: {
            filename: file.filename,
            size: file.size,
            path: file.path
          },
          compressed: compressedFile,
          thumbnail,
          metadata
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 驗證文件
  async validateFile(file) {
    // 檢查文件大小
    if (file.size > this.config.maxSize) {
      return {
        valid: false,
        error: `文件大小超過限制 (${this.formatFileSize(this.config.maxSize)})`
      };
    }

    // 檢查文件格式
    const ext = path.extname(file.filename).toLowerCase().slice(1);
    if (!this.config.supportedFormats.includes(ext)) {
      return {
        valid: false,
        error: `不支持的文件格式，支持的格式: ${this.config.supportedFormats.join(', ')}`
      };
    }

    // 檢查文件是否為有效圖片
    try {
      await sharp(file.path).metadata();
    } catch (error) {
      return {
        valid: false,
        error: '文件不是有效的圖片格式'
      };
    }

    return { valid: true };
  }

  // 壓縮文件
  async compressFile(file) {
    const outputPath = file.path.replace(/\.(jpg|jpeg|png)$/i, '_compressed.webp');
    
    const metadata = await sharp(file.path).metadata();
    const { width, height } = this.calculateDimensions(
      metadata.width,
      metadata.height,
      this.config.compression.maxWidth,
      this.config.compression.maxHeight
    );

    await sharp(file.path)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: this.config.compression.quality })
      .toFile(outputPath);

    const stats = await fs.stat(outputPath);

    return {
      filename: path.basename(outputPath),
      path: outputPath,
      size: stats.size,
      dimensions: { width, height },
      compressionRatio: ((file.size - stats.size) / file.size * 100).toFixed(2)
    };
  }

  // 生成縮略圖
  async generateThumbnail(filePath) {
    const outputPath = filePath.replace(/\.(jpg|jpeg|png|webp)$/i, '_thumb.jpg');
    
    await sharp(filePath)
      .resize(this.config.thumbnail.width, this.config.thumbnail.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: this.config.thumbnail.quality })
      .toFile(outputPath);

    return {
      filename: path.basename(outputPath),
      path: outputPath,
      dimensions: {
        width: this.config.thumbnail.width,
        height: this.config.thumbnail.height
      }
    };
  }

  // 提取元數據
  async extractMetadata(filePath) {
    const metadata = await sharp(filePath).metadata();
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      hasAlpha: metadata.hasAlpha,
      colorSpace: metadata.space,
      density: metadata.density,
      channels: metadata.channels
    };
  }

  // 計算新尺寸
  calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio)
    };
  }

  // 格式化文件大小
  formatFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // 清理臨時文件
  async cleanupTempFiles(filePaths) {
    for (const filePath of filePaths) {
      try {
        await fs.unlink(filePath);
        console.log(`已清理臨時文件: ${filePath}`);
      } catch (error) {
        console.error(`清理臨時文件失敗: ${filePath}`, error);
      }
    }
  }
}

export default new CardFileHandler();
