const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class ImageOptimizer {
  constructor() {
    this.supportedFormats = ['jpeg', 'png', 'webp', 'avif'];
    this.quality = 85;
    this.maxWidth = 800;
    this.maxHeight = 1200;
  }

  async optimizeImage(inputPath, outputPath, options = {}) {
    try {
      const {
        width = this.maxWidth,
        height = this.maxHeight,
        quality = this.quality,
        format = 'webp'
      } = options;

      const image = sharp(inputPath);
      const metadata = await image.metadata();

      let pipeline = image.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });

      switch (format) {
        case 'webp':
          pipeline = pipeline.webp({ quality });
          break;
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality });
          break;
        case 'png':
          pipeline = pipeline.png({ quality });
          break;
        case 'avif':
          pipeline = pipeline.avif({ quality });
          break;
      }

      await pipeline.toFile(outputPath);
      
      const originalSize = metadata.size;
      const optimizedSize = (await fs.stat(outputPath)).size;
      const compressionRatio = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

      return {
        success: true,
        originalSize,
        optimizedSize,
        compressionRatio: `${compressionRatio}%`,
        format,
        dimensions: { width, height }
      };
    } catch (error) {
      console.error('圖片優化失敗:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateThumbnail(inputPath, outputPath, size = 200) {
    try {
      await sharp(inputPath)
        .resize(size, size, { fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(outputPath);
      
      return { success: true, size };
    } catch (error) {
      console.error('縮略圖生成失敗:', error);
      return { success: false, error: error.message };
    }
  }

  async batchOptimize(inputDir, outputDir, options = {}) {
    try {
      const files = await fs.readdir(inputDir);
      const imageFiles = files.filter(file => 
        /.(jpg|jpeg|png|webp)$/i.test(file)
      );

      const results = [];
      for (const file of imageFiles) {
        const inputPath = path.join(inputDir, file);
        const outputName = path.parse(file).name + '.webp';
        const outputPath = path.join(outputDir, outputName);
        
        const result = await this.optimizeImage(inputPath, outputPath, options);
        results.push({ file, ...result });
      }

      return results;
    } catch (error) {
      console.error('批量優化失敗:', error);
      return [];
    }
  }
}

module.exports = new ImageOptimizer();