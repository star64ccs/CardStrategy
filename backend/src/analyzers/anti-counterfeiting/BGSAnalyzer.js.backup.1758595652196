#!/usr/bin/env node

/**
 * BGS增強防偽判斷分析器 (修復版)
 * 排除拍賣網站圖像，優先使用BGS圖像進行防偽判斷
 */

const { Pool } = require('pg');

class BGSEnhancedAntiCounterfeitingAnalyzer {
  constructor() {
    this.pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'cardstrategy_test',
      password: 'PostgresAdmin123!',
      port: 5433,
    });

    // 定義不可信的圖像來源（拍賣網站）
    this.untrustedImageSources = [
      'eBay API',
      'ebay-api',
      'enhanced', // 包含eBay數據
      'auction-site',
      'marketplace',
      'shopee',
      'yahoo',
      'taobao',
      'mercari',
    ];

    // 定義可信的圖像來源
    this.trustedImageSources = [
      'BGS',
      'PSA',
      'CGC',
      'pokemon-tcg-api', // 官方API
      'Scryfall-Magic', // 官方數據
      'official-website',
      'manufacturer',
    ];

    // 定義中等可信度的來源
    this.moderateTrustSources = [
      'Scryfall-OnePiece',
      'Scryfall-Unicorn',
      'Scryfall-Pony',
      'Scryfall-Friendship',
      'Scryfall-Anime',
      'community-database',
      'fan-site',
    ];

    this.authenticFeatures = {
      gradingStandards: {
        pristine: {
          minGrade: 10.0,
          characteristics: [
            'perfect_centering',
            'sharp_corners',
            'clean_surface',
          ],
        },
        gem_mint: {
          minGrade: 9.5,
          characteristics: [
            'excellent_centering',
            'sharp_corners',
            'clean_surface',
          ],
        },
        mint: {
          minGrade: 9.0,
          characteristics: ['good_centering', 'sharp_corners', 'minor_flaws'],
        },
      },
      commonFakePatterns: [
        'blurry_text',
        'incorrect_colors',
        'poor_cut_quality',
        'wrong_cardstock',
        'missing_holo_patterns',
        'incorrect_font',
        'wrong_dimensions',
      ],
    };
  }

  async analyzeCardAuthenticity(cardId) {
    try {
      console.log('🔍 開始分析卡牌真實性:', cardId);

      // 獲取卡牌基本信息
      const cardData = await this.getCardData(cardId);
      if (!cardData) {
        console.log('❌ 未找到卡牌數據:', cardId);
        return null;
      }

      // 獲取最佳圖像來源
      const bestImageSource = await this.getBestImageSource(cardId, cardData);

      // 獲取BGS評級數據
      const bgsData = await this.getBGSData(cardId);

      // 獲取圖像特徵
      const imageFeatures = await this.getImageFeatures(
        cardId,
        bestImageSource
      );

      // 執行防偽分析
      const analysis = await this.performAuthenticityAnalysis(
        cardData,
        bestImageSource,
        bgsData,
        imageFeatures
      );

      // 保存分析結果（可選，避免數據庫錯誤）
      try {
        await this.saveAnalysisResult(cardId, analysis);
      } catch (saveError) {
        console.log('⚠️ 保存分析結果失敗，但分析本身成功:', saveError.message);
      }

      console.log('✅ 防偽分析完成:', cardId, '可信度:', analysis.trustLevel);
      return analysis;
    } catch (error) {
      console.error('❌ 防偽分析失敗:', error.message);
      return null;
    }
  }

  async getCardData(cardId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM cards WHERE card_id = $1',
        [cardId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getBestImageSource(cardId, cardData) {
    const client = await this.pool.connect();
    try {
      // 優先查找BGS圖像
      const bgsResult = await client.query(
        'SELECT gd.image_url, gd.quality_score FROM grading_data gd JOIN cards c ON gd.card_id = c.id WHERE c.card_id = $1 AND gd.grading_company = $2 AND gd.image_url IS NOT NULL ORDER BY gd.quality_score DESC LIMIT 1',
        [cardId, 'BGS']
      );

      if (bgsResult.rows.length > 0) {
        return {
          source: 'BGS',
          imageUrl: bgsResult.rows[0].image_url,
          qualityScore: bgsResult.rows[0].quality_score,
          trustLevel: 'high',
          reason: 'BGS官方評級圖像',
        };
      }

      // 查找可信來源的圖像
      const trustedSources = this.trustedImageSources.join("','");
      const trustedResult = await client.query(
        `SELECT image_url, data_source FROM cards WHERE card_id = $1 AND data_source IN ('${trustedSources}') AND image_url IS NOT NULL LIMIT 1`,
        [cardId]
      );

      if (trustedResult.rows.length > 0) {
        const row = trustedResult.rows[0];
        return {
          source: row.data_source,
          imageUrl: row.image_url,
          trustLevel: 'high',
          reason: '官方或可信來源圖像',
        };
      }

      // 查找中等可信度的圖像
      const moderateSources = this.moderateTrustSources.join("','");
      const moderateResult = await client.query(
        `SELECT image_url, data_source FROM cards WHERE card_id = $1 AND data_source IN ('${moderateSources}') AND image_url IS NOT NULL LIMIT 1`,
        [cardId]
      );

      if (moderateResult.rows.length > 0) {
        const row = moderateResult.rows[0];
        return {
          source: row.data_source,
          imageUrl: row.image_url,
          trustLevel: 'medium',
          reason: '中等可信度來源圖像',
        };
      }

      // 如果只有不可信來源的圖像，返回警告
      const untrustedSources = this.untrustedImageSources.join("','");
      const untrustedResult = await client.query(
        `SELECT image_url, data_source FROM cards WHERE card_id = $1 AND data_source IN ('${untrustedSources}') AND image_url IS NOT NULL LIMIT 1`,
        [cardId]
      );

      if (untrustedResult.rows.length > 0) {
        const row = untrustedResult.rows[0];
        return {
          source: row.data_source,
          imageUrl: row.image_url,
          trustLevel: 'low',
          reason: '僅有拍賣網站圖像，真實性無法保證',
          warning: '此圖像來源不可信，建議尋找官方或BGS圖像進行分析',
        };
      }

      // 沒有找到任何圖像
      return {
        source: null,
        imageUrl: null,
        trustLevel: 'none',
        reason: '未找到圖像數據',
        warning: '無法進行圖像分析，建議添加可信來源的圖像',
      };
    } finally {
      client.release();
    }
  }

  async getBGSData(cardId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT gd.* FROM grading_data gd JOIN cards c ON gd.card_id = c.id WHERE c.card_id = $1 AND gd.grading_company = $2',
        [cardId, 'BGS']
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getImageFeatures(cardId, imageSource) {
    if (!imageSource.imageUrl || imageSource.trustLevel === 'low') {
      return null;
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM image_features WHERE card_id = $1',
        [cardId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async performAuthenticityAnalysis(
    cardData,
    imageSource,
    bgsData,
    imageFeatures
  ) {
    const analysis = {
      cardId: cardData.card_id,
      cardName: cardData.name,
      authenticityScore: 0,
      trustLevel: imageSource.trustLevel,
      imageSource: imageSource,
      bgsData: bgsData,
      riskFactors: [],
      confidenceLevel: 'unknown',
      recommendations: [],
      analysisDetails: {
        imageAnalysis: null,
        gradingAnalysis: null,
        sourceAnalysis: null,
      },
    };

    // 1. 圖像來源可信度分析
    const sourceScore = this.analyzeImageSourceTrust(imageSource);
    analysis.authenticityScore += sourceScore;
    analysis.analysisDetails.sourceAnalysis = {
      source: imageSource.source,
      trustLevel: imageSource.trustLevel,
      score: sourceScore,
      reason: imageSource.reason,
    };

    if (imageSource.warning) {
      analysis.riskFactors.push(imageSource.warning);
      analysis.recommendations.push('建議尋找BGS或官方圖像進行重新分析');
    }

    // 2. BGS評級數據分析
    if (bgsData) {
      const gradingScore = this.analyzeBGSGrading(bgsData);
      analysis.authenticityScore += gradingScore;
      analysis.analysisDetails.gradingAnalysis = {
        grade: bgsData.grade,
        population: bgsData.population,
        score: gradingScore,
        details: bgsData.condition_details,
      };
    } else {
      analysis.riskFactors.push('缺少BGS評級數據');
      analysis.recommendations.push('建議提交BGS進行官方評級');
    }

    // 3. 圖像特徵分析（僅對可信圖像進行）
    if (imageFeatures && imageSource.trustLevel !== 'low') {
      const imageScore = this.analyzeImageFeatures(imageFeatures);
      analysis.authenticityScore += imageScore;
      analysis.analysisDetails.imageAnalysis = {
        qualityScore: imageFeatures.quality_score,
        hasArtwork: imageFeatures.artwork_features?.hasArtwork,
        score: imageScore,
      };
    } else if (imageSource.trustLevel === 'low') {
      analysis.riskFactors.push('圖像來源不可信，無法進行可靠的圖像分析');
      analysis.recommendations.push('使用BGS或官方圖像重新分析');
    }

    // 計算最終分數和建議
    analysis.authenticityScore = Math.min(
      100,
      Math.max(0, analysis.authenticityScore)
    );

    if (analysis.authenticityScore >= 85) {
      analysis.confidenceLevel = 'high';
      analysis.recommendations.push('卡牌真實性極高，建議收藏');
    } else if (analysis.authenticityScore >= 65) {
      analysis.confidenceLevel = 'medium';
      analysis.recommendations.push('卡牌真實性較高，建議進一步驗證');
    } else if (analysis.authenticityScore >= 40) {
      analysis.confidenceLevel = 'low';
      analysis.recommendations.push('卡牌真實性存疑，建議專業鑑定');
    } else {
      analysis.confidenceLevel = 'very_low';
      analysis.recommendations.push('卡牌真實性極低，建議避免購買');
    }

    return analysis;
  }

  analyzeImageSourceTrust(imageSource) {
    switch (imageSource.trustLevel) {
      case 'high':
        return 40;
      case 'medium':
        return 25;
      case 'low':
        return 5;
      case 'none':
        return 0;
      default:
        return 10;
    }
  }

  analyzeBGSGrading(bgsData) {
    let score = 0;

    if (bgsData.grade) {
      if (bgsData.grade >= 9.5) score += 35;
      else if (bgsData.grade >= 9.0) score += 30;
      else if (bgsData.grade >= 8.5) score += 25;
      else if (bgsData.grade >= 8.0) score += 20;
      else score += 10;
    }

    if (bgsData.population) {
      if (bgsData.population >= 100) score += 15;
      else if (bgsData.population >= 50) score += 10;
      else if (bgsData.population >= 10) score += 5;
    }

    return score;
  }

  analyzeImageFeatures(imageFeatures) {
    let score = 0;

    if (imageFeatures.quality_score >= 0.9) score += 15;
    else if (imageFeatures.quality_score >= 0.7) score += 10;
    else score += 5;

    if (imageFeatures.artwork_features?.hasArtwork) score += 10;

    return score;
  }

  async saveAnalysisResult(cardId, analysis) {
    const client = await this.pool.connect();
    try {
      // 先檢查是否已存在記錄
      const existingResult = await client.query(
        'SELECT id FROM card_authentications WHERE card_id = (SELECT id FROM cards WHERE card_id = $1) AND company = $2',
        [cardId, 'BGS_Enhanced']
      );

      if (existingResult.rows.length > 0) {
        // 更新現有記錄
        await client.query(
          'UPDATE card_authentications SET grade = $3, verification_status = $4, confidence_score = $5, raw_data = $6 WHERE card_id = (SELECT id FROM cards WHERE card_id = $1) AND company = $2',
          [
            cardId,
            'BGS_Enhanced',
            analysis.authenticityScore / 100,
            analysis.confidenceLevel,
            analysis.authenticityScore / 100,
            JSON.stringify(analysis),
          ]
        );
      } else {
        // 插入新記錄
        await client.query(
          'INSERT INTO card_authentications (card_id, company, certification_number, grade, verification_status, confidence_score, raw_data, created_at) VALUES ((SELECT id FROM cards WHERE card_id = $1), $2, $3, $4, $5, $6, $7, NOW())',
          [
            cardId,
            'BGS_Enhanced',
            'AI_ANALYSIS_' + Date.now(),
            analysis.authenticityScore / 100,
            analysis.confidenceLevel,
            analysis.authenticityScore / 100,
            JSON.stringify(analysis),
          ]
        );
      }

      // 如果有BGS數據，也更新grading_data表
      if (analysis.bgsData) {
        await client.query(
          'UPDATE grading_data SET confidence_score = $2, expert_notes = $3, condition_details = $4 FROM cards c WHERE grading_data.card_id = c.id AND c.card_id = $1 AND grading_data.grading_company = $5',
          [
            cardId,
            analysis.authenticityScore / 100,
            JSON.stringify(analysis.recommendations),
            JSON.stringify(analysis.analysisDetails),
            'BGS',
          ]
        );
      }

      console.log('✅ 防偽分析結果已保存: 卡牌ID ' + cardId);
    } finally {
      client.release();
    }
  }

  async analyzeBatchCards(cardIds) {
    const results = [];
    console.log('🚀 開始批量防偽分析:', cardIds.length, '張卡牌');

    for (const cardId of cardIds) {
      try {
        const result = await this.analyzeCardAuthenticity(cardId);
        if (result) {
          results.push(result);
        }

        // 添加延遲避免過載
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('❌ 卡牌分析失敗:', cardId, error.message);
      }
    }

    console.log('✅ 批量分析完成:', results.length, '張卡牌');
    return results;
  }

  async generateTrustReport() {
    const client = await this.pool.connect();
    try {
      // 統計不同來源的圖像數量
      const sourceStats = await client.query(
        'SELECT data_source, COUNT(*) as count FROM cards WHERE image_url IS NOT NULL GROUP BY data_source ORDER BY count DESC'
      );

      // 統計需要BGS圖像的卡牌
      const needsBGS = await client.query(
        `SELECT COUNT(*) as count FROM cards WHERE card_id NOT IN (
          SELECT DISTINCT c.card_id FROM grading_data gd JOIN cards c ON gd.card_id = c.id WHERE gd.grading_company = 'BGS' AND gd.image_url IS NOT NULL
        ) AND image_url IS NOT NULL`
      );

      const report = {
        totalCardsWithImages: sourceStats.rows.reduce(
          (sum, row) => sum + parseInt(row.count),
          0
        ),
        sourceBreakdown: sourceStats.rows,
        untrustedSources: sourceStats.rows.filter(row =>
          this.untrustedImageSources.includes(row.data_source)
        ),
        trustedSources: sourceStats.rows.filter(row =>
          this.trustedImageSources.includes(row.data_source)
        ),
        moderateSources: sourceStats.rows.filter(row =>
          this.moderateTrustSources.includes(row.data_source)
        ),
        cardsNeedingBGS: needsBGS.rows[0].count,
        recommendations: [
          '優先收集BGS官方評級圖像',
          '排除拍賣網站圖像進行防偽分析',
          '建立圖像來源可信度分級系統',
          '定期更新可信來源列表',
        ],
      };

      return report;
    } finally {
      client.release();
    }
  }
}

module.exports = BGSEnhancedAntiCounterfeitingAnalyzer;
