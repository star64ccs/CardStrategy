#!/usr/bin/env node

/**
 * BGS專用API端點
 */

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

class BGSAPI {
  constructor() {
    this.app = express();
    this.pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'cardstrategy_test',
      password: 'PostgresAdmin123!',
      port: 5433,
    });

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    // BGS分級數據API
    this.app.get(
      '/api/v1/bgs/grading/:cardId',
      this.getBGSGradingData.bind(this)
    );
    this.app.get('/api/v1/bgs/grading', this.getAllBGSGradingData.bind(this));

    // BGS認證分析API
    this.app.post(
      '/api/v1/bgs/authenticate',
      this.analyzeAuthenticity.bind(this)
    );
    this.app.get(
      '/api/v1/bgs/authenticate/:cardId',
      this.getAuthenticityAnalysis.bind(this)
    );

    // BGS質量評估API
    this.app.get(
      '/api/v1/bgs/quality/:cardId',
      this.assessCardQuality.bind(this)
    );
    this.app.get('/api/v1/bgs/quality', this.getQualityAssessment.bind(this));

    // BGS專家建議API
    this.app.get('/api/v1/bgs/advice/:grade', this.getGradingAdvice.bind(this));
    this.app.get('/api/v1/bgs/advice', this.getAllAdvice.bind(this));

    // BGS統計數據API
    this.app.get('/api/v1/bgs/stats', this.getBGSStats.bind(this));
    this.app.get('/api/v1/bgs/stats/trends', this.getTrendingData.bind(this));

    // 健康檢查
    this.app.get('/api/v1/bgs/health', this.healthCheck.bind(this));
  }

  async getBGSGradingData(req, res) {
    try {
      const { cardId } = req.params;

      const client = await this.pool.connect();
      try {
        const result = await client.query(
          'SELECT gd.*, c.name, c.set_name, c.category FROM grading_data gd JOIN cards c ON gd.card_id = c.id WHERE gd.card_id = $1 AND gd.grading_company = $2',
          [cardId, 'BGS']
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'BGS分級數據未找到',
            cardId: cardId,
          });
        }

        res.json({
          success: true,
          data: result.rows[0],
          timestamp: new Date().toISOString(),
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ 獲取BGS分級數據失敗:', error.message);
      res.status(500).json({
        success: false,
        message: '服務器內部錯誤',
        error: error.message,
      });
    }
  }

  async getAllBGSGradingData(req, res) {
    try {
      const { limit = 50, offset = 0, grade_min, grade_max } = req.query;

      const client = await this.pool.connect();
      try {
        let query =
          'SELECT gd.*, c.name, c.set_name, c.category FROM grading_data gd JOIN cards c ON gd.card_id = c.id WHERE gd.grading_company = $1';
        const params = ['BGS'];

        if (grade_min) {
          query += ' AND gd.grade >= $' + (params.length + 1);
          params.push(parseFloat(grade_min));
        }

        if (grade_max) {
          query += ' AND gd.grade <= $' + (params.length + 1);
          params.push(parseFloat(grade_max));
        }

        query +=
          ' ORDER BY gd.grade DESC, gd.created_at DESC LIMIT $' +
          (params.length + 1) +
          ' OFFSET $' +
          (params.length + 2);
        params.push(parseInt(limit), parseInt(offset));

        const result = await client.query(query, params);

        res.json({
          success: true,
          data: result.rows,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            total: result.rows.length,
          },
          timestamp: new Date().toISOString(),
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ 獲取所有BGS分級數據失敗:', error.message);
      res.status(500).json({
        success: false,
        message: '服務器內部錯誤',
        error: error.message,
      });
    }
  }

  async analyzeAuthenticity(req, res) {
    try {
      const { cardId, imageUrl, cardData } = req.body;

      if (!cardId) {
        return res.status(400).json({
          success: false,
          message: '缺少必需參數: cardId',
        });
      }

      // 使用防偽分析器
      const AntiAnalyzer = require('./bgs-anti-counterfeiting-analyzer');
      const analyzer = new AntiAnalyzer();

      const analysis = await analyzer.analyzeAuthenticity(cardData, {
        imageUrl,
      });

      if (!analysis) {
        return res.status(500).json({
          success: false,
          message: '認證分析失敗',
        });
      }

      res.json({
        success: true,
        data: analysis,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ 認證分析失敗:', error.message);
      res.status(500).json({
        success: false,
        message: '服務器內部錯誤',
        error: error.message,
      });
    }
  }

  async getAuthenticityAnalysis(req, res) {
    try {
      const { cardId } = req.params;

      const client = await this.pool.connect();
      try {
        const result = await client.query(
          'SELECT confidence_score, expert_notes, condition_details FROM grading_data WHERE card_id = $1 AND grading_company = $2',
          [cardId, 'BGS']
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: '認證分析數據未找到',
          });
        }

        const row = result.rows[0];
        res.json({
          success: true,
          data: {
            confidenceScore: row.confidence_score,
            expertNotes: row.expert_notes,
            conditionDetails: row.condition_details,
          },
          timestamp: new Date().toISOString(),
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ 獲取認證分析失敗:', error.message);
      res.status(500).json({
        success: false,
        message: '服務器內部錯誤',
        error: error.message,
      });
    }
  }

  async assessCardQuality(req, res) {
    try {
      const { cardId } = req.params;

      // 使用質量評估系統
      const QualitySystem = require('./bgs-quality-assessment-system');
      const qualitySystem = new QualitySystem();

      const assessment = await qualitySystem.assessCardQuality(cardId);

      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: '卡牌質量評估失敗',
        });
      }

      res.json({
        success: true,
        data: assessment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ 質量評估失敗:', error.message);
      res.status(500).json({
        success: false,
        message: '服務器內部錯誤',
        error: error.message,
      });
    }
  }

  async getQualityAssessment(req, res) {
    try {
      const { limit = 20, minScore } = req.query;

      const client = await this.pool.connect();
      try {
        let query =
          'SELECT card_id, quality_score, confidence_score FROM grading_data WHERE grading_company = $1 AND quality_score IS NOT NULL';
        const params = ['BGS'];

        if (minScore) {
          query += ' AND quality_score >= $' + (params.length + 1);
          params.push(parseFloat(minScore));
        }

        query += ' ORDER BY quality_score DESC LIMIT $' + (params.length + 1);
        params.push(parseInt(limit));

        const result = await client.query(query, params);

        res.json({
          success: true,
          data: result.rows,
          timestamp: new Date().toISOString(),
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ 獲取質量評估失敗:', error.message);
      res.status(500).json({
        success: false,
        message: '服務器內部錯誤',
        error: error.message,
      });
    }
  }

  async getGradingAdvice(req, res) {
    try {
      const { grade } = req.params;
      const { cardType = 'Pokemon' } = req.query;

      // 使用專家知識庫
      const KnowledgeBase = require('./bgs-expert-knowledge-base');
      const knowledgeBase = new KnowledgeBase();

      const advice = await knowledgeBase.getGradingAdvice(
        parseFloat(grade),
        cardType
      );

      if (!advice) {
        return res.status(404).json({
          success: false,
          message: '無法獲取分級建議',
        });
      }

      res.json({
        success: true,
        data: advice,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ 獲取分級建議失敗:', error.message);
      res.status(500).json({
        success: false,
        message: '服務器內部錯誤',
        error: error.message,
      });
    }
  }

  async getAllAdvice(req, res) {
    try {
      const { cardType = 'Pokemon' } = req.query;

      // 使用專家知識庫
      const KnowledgeBase = require('./bgs-expert-knowledge-base');
      const knowledgeBase = new KnowledgeBase();

      const grades = [10.0, 9.5, 9.0, 8.5, 8.0, 7.5, 7.0];
      const allAdvice = [];

      for (const grade of grades) {
        const advice = await knowledgeBase.getGradingAdvice(grade, cardType);
        if (advice) {
          allAdvice.push(advice);
        }
      }

      res.json({
        success: true,
        data: allAdvice,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ 獲取所有建議失敗:', error.message);
      res.status(500).json({
        success: false,
        message: '服務器內部錯誤',
        error: error.message,
      });
    }
  }

  async getBGSStats(req, res) {
    try {
      const client = await this.pool.connect();
      try {
        // 基本統計
        const basicStats = await client.query(
          'SELECT COUNT(*) as total_cards, AVG(grade) as avg_grade, MAX(grade) as max_grade, MIN(grade) as min_grade FROM grading_data WHERE grading_company = $1',
          ['BGS']
        );

        // 分級分布
        const gradeDistribution = await client.query(
          'SELECT grade, COUNT(*) as count FROM grading_data WHERE grading_company = $1 GROUP BY grade ORDER BY grade DESC',
          ['BGS']
        );

        // 最近添加
        const recentAdditions = await client.query(
          "SELECT COUNT(*) as recent_count FROM grading_data WHERE grading_company = $1 AND created_at >= NOW() - INTERVAL '7 days'",
          ['BGS']
        );

        res.json({
          success: true,
          data: {
            basic: basicStats.rows[0],
            gradeDistribution: gradeDistribution.rows,
            recentAdditions: recentAdditions.rows[0].recent_count,
          },
          timestamp: new Date().toISOString(),
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ 獲取BGS統計失敗:', error.message);
      res.status(500).json({
        success: false,
        message: '服務器內部錯誤',
        error: error.message,
      });
    }
  }

  async getTrendingData(req, res) {
    try {
      const client = await this.pool.connect();
      try {
        // 趨勢數據（基於創建時間）
        const trends = await client.query(
          "SELECT DATE(created_at) as date, COUNT(*) as count, AVG(grade) as avg_grade FROM grading_data WHERE grading_company = $1 AND created_at >= NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY date DESC",
          ['BGS']
        );

        res.json({
          success: true,
          data: trends.rows,
          timestamp: new Date().toISOString(),
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ 獲取趨勢數據失敗:', error.message);
      res.status(500).json({
        success: false,
        message: '服務器內部錯誤',
        error: error.message,
      });
    }
  }

  async healthCheck(req, res) {
    try {
      const client = await this.pool.connect();
      try {
        await client.query('SELECT 1');

        res.json({
          success: true,
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            database: 'connected',
            api: 'running',
          },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  start(port = 3001) {
    this.app.listen(port, () => {
      console.log('🚀 BGS API服務器已啟動');
      console.log('📡 端口: ' + port);
      console.log(
        '🔗 健康檢查: http://localhost:' + port + '/api/v1/bgs/health'
      );
    });
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  const bgsAPI = new BGSAPI();
  bgsAPI.start(3001);
}

module.exports = BGSAPI;
