const { getSimulatedGradingModel, generateGradingNumber } = require('../models/SimulatedGrading');
const { getCardModel } = require('../models/Card');
const { getUserModel } = require('../models/User');
const logger = require('../utils/logger');

class SimulatedGradingService {
  constructor() {
    this.SimulatedGrading = null;
    this.Card = null;
    this.User = null;
  }

  async initializeModels() {
    if (!this.SimulatedGrading) {
      this.SimulatedGrading = getSimulatedGradingModel();
    }
    if (!this.Card) {
      this.Card = getCardModel();
    }
    if (!this.User) {
      this.User = getUserModel();
    }
  }

  /**
   * 創建模擬鑑定報告
   */
  async createGradingReport(userId, cardId, gradingResult, imageData) {
    try {
      await this.initializeModels();

      // 獲取卡牌信息
      const card = await this.Card.findByPk(cardId);
      if (!card) {
        throw new Error('卡牌不存在');
      }

      // 從鑑定結果中獲取機構信息
      const {agency} = gradingResult;

      // 生成鑑定編號
      const gradingNumber = generateGradingNumber(agency);

      // 準備卡牌信息
      const cardInfo = {
        name: card.name,
        setName: card.setName,
        cardNumber: card.cardNumber,
        rarity: card.rarity,
        imageUrl: card.imageUrl || ''
      };

      // 創建鑑定記錄
      const grading = await this.SimulatedGrading.create({
        cardId,
        userId,
        agency,
        gradingNumber,
        cardInfo,
        gradingResult,
        metadata: {
          imageData: imageData ? 'provided' : 'not_provided',
          createdAt: new Date().toISOString()
        }
      });

      logger.info('模擬鑑定報告創建成功', {
        userId,
        cardId,
        agency,
        gradingNumber: grading.gradingNumber
      });

      return {
        id: grading.id,
        cardId: grading.cardId,
        userId: grading.userId,
        agency: grading.agency,
        gradingNumber: grading.gradingNumber,
        cardInfo: grading.cardInfo,
        gradingResult: grading.gradingResult,
        shareUrl: grading.shareUrl,
        qrCode: grading.qrCode,
        expiresAt: grading.expiresAt,
        viewCount: grading.viewCount,
        createdAt: grading.createdAt,
        updatedAt: grading.updatedAt
      };
    } catch (error) {
      logger.error('創建模擬鑑定報告失敗:', error);
      throw error;
    }
  }

  /**
   * 查詢鑑定報告
   */
  async getGradingReport(gradingNumber) {
    try {
      await this.initializeModels();

      // 查找鑑定記錄
      const grading = await this.SimulatedGrading.findOne({
        where: {
          gradingNumber,
          isActive: true
        },
        include: [
          {
            model: this.Card,
            as: 'card',
            attributes: ['id', 'name', 'setName', 'rarity', 'imageUrl', 'currentPrice']
          },
          {
            model: this.User,
            as: 'user',
            attributes: ['id', 'username', 'avatar']
          }
        ]
      });

      if (!grading) {
        throw new Error('鑑定報告不存在或已失效');
      }

      // 檢查是否過期
      const isExpired = new Date() > grading.expiresAt;
      const isValid = !isExpired && grading.isActive;

      // 更新查看次數和最後查看時間
      await grading.update({
        viewCount: grading.viewCount + 1,
        lastViewedAt: new Date()
      });

      logger.info('鑑定報告查詢成功', {
        gradingNumber,
        viewCount: grading.viewCount + 1,
        isExpired,
        isValid
      });

      return {
        id: grading.id,
        cardId: grading.cardId,
        userId: grading.userId,
        agency: grading.agency,
        gradingNumber: grading.gradingNumber,
        cardInfo: grading.cardInfo,
        gradingResult: grading.gradingResult,
        shareUrl: grading.shareUrl,
        qrCode: grading.qrCode,
        expiresAt: grading.expiresAt,
        viewCount: grading.viewCount + 1,
        lastViewedAt: grading.lastViewedAt,
        createdAt: grading.createdAt,
        updatedAt: grading.updatedAt,
        card: grading.card,
        user: grading.user,
        isExpired,
        isValid
      };
    } catch (error) {
      logger.error('查詢鑑定報告失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取用戶的鑑定報告列表
   */
  async getUserGradingReports(userId, options = {}) {
    try {
      await this.initializeModels();

      const { page = 1, limit = 20, agency, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

      const where = {
        userId,
        isActive: true
      };

      if (agency) {
        where.agency = agency;
      }

      const { count, rows } = await this.SimulatedGrading.findAndCountAll({
        where,
        include: [
          {
            model: this.Card,
            as: 'card',
            attributes: ['id', 'name', 'setName', 'rarity', 'imageUrl', 'currentPrice']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      const reports = rows.map(grading => ({
        id: grading.id,
        cardId: grading.cardId,
        userId: grading.userId,
        agency: grading.agency,
        gradingNumber: grading.gradingNumber,
        cardInfo: grading.cardInfo,
        gradingResult: grading.gradingResult,
        shareUrl: grading.shareUrl,
        qrCode: grading.qrCode,
        expiresAt: grading.expiresAt,
        viewCount: grading.viewCount,
        lastViewedAt: grading.lastViewedAt,
        createdAt: grading.createdAt,
        updatedAt: grading.updatedAt,
        card: grading.card,
        isExpired: new Date() > grading.expiresAt
      }));

      return {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / parseInt(limit))
        }
      };
    } catch (error) {
      logger.error('獲取用戶鑑定報告失敗:', error);
      throw error;
    }
  }

  /**
   * 搜索鑑定報告
   */
  async searchGradingReports(query, options = {}) {
    try {
      await this.initializeModels();

      const { page = 1, limit = 20, agency, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

      const where = {
        isActive: true
      };

      if (agency) {
        where.agency = agency;
      }

      // 支持按鑑定編號、卡牌名稱搜索
      if (query) {
        where[Op.or] = [
          { gradingNumber: { [Op.like]: `%${query}%` } },
          { '$cardInfo.name$': { [Op.like]: `%${query}%` } },
          { '$cardInfo.setName$': { [Op.like]: `%${query}%` } }
        ];
      }

      const { count, rows } = await this.SimulatedGrading.findAndCountAll({
        where,
        include: [
          {
            model: this.Card,
            as: 'card',
            attributes: ['id', 'name', 'setName', 'rarity', 'imageUrl', 'currentPrice']
          },
          {
            model: this.User,
            as: 'user',
            attributes: ['id', 'username', 'avatar']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      const reports = rows.map(grading => ({
        id: grading.id,
        cardId: grading.cardId,
        userId: grading.userId,
        agency: grading.agency,
        gradingNumber: grading.gradingNumber,
        cardInfo: grading.cardInfo,
        gradingResult: grading.gradingResult,
        shareUrl: grading.shareUrl,
        qrCode: grading.qrCode,
        expiresAt: grading.expiresAt,
        viewCount: grading.viewCount,
        lastViewedAt: grading.lastViewedAt,
        createdAt: grading.createdAt,
        updatedAt: grading.updatedAt,
        card: grading.card,
        user: grading.user,
        isExpired: new Date() > grading.expiresAt
      }));

      return {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / parseInt(limit))
        }
      };
    } catch (error) {
      logger.error('搜索鑑定報告失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取鑑定統計數據
   */
  async getGradingStats(userId = null) {
    try {
      await this.initializeModels();

      const where = { isActive: true };
      if (userId) {
        where.userId = userId;
      }

      const stats = await this.SimulatedGrading.findAll({
        where,
        attributes: [
          'agency',
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
          [sequelize.fn('AVG', sequelize.literal('JSON_EXTRACT(gradingResult, "$.confidence")')), 'avgConfidence'],
          [sequelize.fn('MAX', sequelize.col('viewCount')), 'maxViews'],
          [sequelize.fn('SUM', sequelize.col('viewCount')), 'totalViews']
        ],
        group: ['agency'],
        raw: true
      });

      const totalReports = await this.SimulatedGrading.count({ where });
      const recentReports = await this.SimulatedGrading.count({
        where: {
          ...where,
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
          }
        }
      });

      return {
        agencyStats: stats,
        totalReports,
        recentReports,
        topViewedReports: await this.getTopViewedReports(userId)
      };
    } catch (error) {
      logger.error('獲取鑑定統計失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取最受歡迎的鑑定報告
   */
  async getTopViewedReports(userId = null, limit = 10) {
    try {
      await this.initializeModels();

      const where = { isActive: true };
      if (userId) {
        where.userId = userId;
      }

      const reports = await this.SimulatedGrading.findAll({
        where,
        include: [
          {
            model: this.Card,
            as: 'card',
            attributes: ['id', 'name', 'setName', 'rarity', 'imageUrl']
          }
        ],
        order: [['viewCount', 'DESC']],
        limit
      });

      return reports.map(grading => ({
        id: grading.id,
        gradingNumber: grading.gradingNumber,
        agency: grading.agency,
        cardInfo: grading.cardInfo,
        gradingResult: grading.gradingResult,
        viewCount: grading.viewCount,
        createdAt: grading.createdAt,
        card: grading.card
      }));
    } catch (error) {
      logger.error('獲取最受歡迎鑑定報告失敗:', error);
      throw error;
    }
  }
}

module.exports = new SimulatedGradingService();
