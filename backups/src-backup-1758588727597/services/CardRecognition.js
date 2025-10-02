// 卡牌識別服務
import sharp from 'sharp';
import { Pool } from 'pg';

class CardRecognition {
  constructor() {
    this.db = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'cardstrategy',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432
    });
  }

  // 識別卡牌
  async recognizeCard(imagePath) {
    try {
      // 1. 預處理圖片
      const preprocessedImage = await this.preprocessImage(imagePath);

      // 2. 提取特徵
      const features = await this.extractFeatures(preprocessedImage);

      // 3. 搜索匹配的卡牌
      const matches = await this.findMatches(features);

      // 4. 計算置信度
      const results = this.calculateConfidence(matches);

      return {
        success: true,
        data: {
          matches: results,
          confidence: Math.max(...results.map(r => r.confidence)),
          totalMatches: results.length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 預處理圖片
  async preprocessImage(imagePath) {
    const outputPath = imagePath.replace(/\.(jpg|jpeg|png|webp)$/i, '_preprocessed.jpg');
    
    await sharp(imagePath)
      .resize(800, 600, { fit: 'inside' })
      .normalize()
      .sharpen()
      .jpeg({ quality: 95 })
      .toFile(outputPath);

    return outputPath;
  }

  // 提取特徵
  async extractFeatures(imagePath) {
    const metadata = await sharp(imagePath).metadata();
    
    // 提取基本特徵
    const features = {
      dimensions: {
        width: metadata.width,
        height: metadata.height
      },
      aspectRatio: metadata.width / metadata.height,
      colorSpace: metadata.space,
      channels: metadata.channels,
      hasAlpha: metadata.hasAlpha
    };

    // 提取顏色特徵
    const colorFeatures = await this.extractColorFeatures(imagePath);
    features.colors = colorFeatures;

    // 提取紋理特徵
    const textureFeatures = await this.extractTextureFeatures(imagePath);
    features.texture = textureFeatures;

    return features;
  }

  // 提取顏色特徵
  async extractColorFeatures(imagePath) {
    const { data } = await sharp(imagePath)
      .resize(100, 100)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const colors = {};
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const color = `${r},${g},${b}`;
      colors[color] = (colors[color] || 0) + 1;
    }

    // 獲取主要顏色
    const sortedColors = Object.entries(colors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([color]) => color);

    return {
      dominantColors: sortedColors,
      colorCount: Object.keys(colors).length
    };
  }

  // 提取紋理特徵
  async extractTextureFeatures(imagePath) {
    const { data } = await sharp(imagePath)
      .greyscale()
      .resize(200, 200)
      .raw()
      .toBuffer({ resolveWithObject: true });

    // 計算紋理統計
    const pixels = Array.from(data);
    const mean = pixels.reduce((a, b) => a + b, 0) / pixels.length;
    const variance = pixels.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / pixels.length;
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      variance,
      stdDev,
      contrast: stdDev / mean
    };
  }

  // 搜索匹配的卡牌
  async findMatches(features) {
    const query = `
      SELECT 
        c.id,
        c.card_id,
        c.name,
        c.series,
        c.rarity,
        c.image_url,
        c.image_features,
        SIMILARITY(c.image_features::text, $1::text) as similarity
      FROM cards c
      WHERE c.image_features IS NOT NULL
      ORDER BY similarity DESC
      LIMIT 20
    `;

    const featuresText = JSON.stringify(features);
    const result = await this.db.query(query, [featuresText]);
    
    return result.rows;
  }

  // 計算置信度
  calculateConfidence(matches) {
    return matches.map(match => {
      const similarity = parseFloat(match.similarity) || 0;
      const confidence = Math.min(similarity * 100, 95); // 最高 95% 置信度
      
      return {
        ...match,
        confidence: Math.round(confidence * 100) / 100,
        similarity: Math.round(similarity * 100) / 100
      };
    }).filter(match => match.confidence > 30); // 只返回置信度 > 30% 的結果
  }

  // 多嘗試識別
  async recognizeWithMultipleAttempts(imagePath, attempts = 3) {
    const results = [];
    
    for (let i = 0; i < attempts; i++) {
      try {
        const result = await this.recognizeCard(imagePath);
        if (result.success) {
          results.push(result.data);
        }
      } catch (error) {
        console.warn(`識別嘗試 ${i + 1} 失敗:`, error.message);
      }
    }

    if (results.length === 0) {
      return {
        success: false,
        error: '所有識別嘗試都失敗了'
      };
    }

    // 合併結果
    const mergedResults = this.mergeResults(results);
    
    return {
      success: true,
      data: mergedResults
    };
  }

  // 合併識別結果
  mergeResults(results) {
    const cardMap = new Map();
    
    results.forEach(result => {
      result.matches.forEach(match => {
        const key = match.card_id;
        if (cardMap.has(key)) {
          const existing = cardMap.get(key);
          existing.confidence = Math.max(existing.confidence, match.confidence);
          existing.attempts = (existing.attempts || 1) + 1;
        } else {
          cardMap.set(key, { ...match, attempts: 1 });
        }
      });
    });

    return Array.from(cardMap.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }

  // 更新卡牌特徵
  async updateCardFeatures(cardId, features) {
    const query = `
      UPDATE cards 
      SET image_features = $1, updated_at = NOW()
      WHERE id = $2
    `;
    
    await this.db.query(query, [JSON.stringify(features), cardId]);
  }
}

export default new CardRecognition();
