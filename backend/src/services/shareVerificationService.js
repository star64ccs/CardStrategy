const { Op } = require('sequelize');
const getShareVerificationModel = require('../models/ShareVerification');
const getCardModel = require('../models/Card');
const getUserModel = require('../models/User');
const logger = require('../utils/logger');
const {
  generateVerificationCode,
  generateShareUrl,
  generateQRCodeUrl,
  generateSocialShareLinks
} = require('../models/ShareVerification');

class ShareVerificationService {
  constructor() {
    this.ShareVerification = null;
    this.Card = null;
    this.User = null;
  }

  async initializeModels() {
    if (!this.ShareVerification) this.ShareVerification = getShareVerificationModel();
    if (!this.Card) this.Card = getCardModel();
    if (!this.User) this.User = getUserModel();

    if (!this.ShareVerification || !this.Card || !this.User) {
      throw new Error('Failed to initialize share verification service models');
    }
  }

  // 創建分享驗證
  async createShareVerification(userId, cardId, analysisType, analysisResult, expiresInDays = 30) {
    try {
      await this.initializeModels();

      // 驗證卡牌是否存在
      const card = await this.Card.findByPk(cardId);
      if (!card) {
        throw new Error('卡牌不存在');
      }

      // 驗證用戶是否存在
      const user = await this.User.findByPk(userId);
      if (!user) {
        throw new Error('用戶不存在');
      }

      // 設置過期時間
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      // 創建分享驗證記錄
      const shareVerification = await this.ShareVerification.create({
        userId,
        cardId,
        analysisType,
        analysisResult,
        expiresAt,
        metadata: {
          createdBy: userId,
          expiresInDays,
          analysisTimestamp: new Date().toISOString()
        }
      });

      // 生成分享相關 URL 和鏈接
      const {shareUrl} = shareVerification;
      const qrCodeUrl = generateQRCodeUrl(shareUrl);
      const socialShareLinks = generateSocialShareLinks(shareUrl);

      logger.info('Share verification created', {
        verificationCode: shareVerification.verificationCode,
        userId,
        cardId,
        analysisType
      });

      return {
        verificationCode: shareVerification.verificationCode,
        shareUrl,
        qrCodeUrl,
        socialShareLinks,
        expiresAt: shareVerification.expiresAt
      };
    } catch (error) {
      logger.error('Create share verification error:', error);
      throw error;
    }
  }

  // 查詢分享驗證
  async lookupVerification(verificationCode) {
    try {
      await this.initializeModels();

      // 查找驗證記錄
      const verification = await this.ShareVerification.findOne({
        where: {
          verificationCode,
          isActive: true
        },
        include: [
          {
            model: this.Card,
            as: 'card',
            attributes: ['id', 'name', 'setName', 'rarity', 'imageUrl', 'price']
          },
          {
            model: this.User,
            as: 'user',
            attributes: ['id', 'username', 'avatar']
          }
        ]
      });

      if (!verification) {
        throw new Error('驗證碼不存在或已失效');
      }

      // 檢查是否過期
      const isExpired = new Date() > verification.expiresAt;
      const isValid = !isExpired && verification.isActive;

      // 更新查看次數和最後查看時間
      await verification.update({
        viewCount: verification.viewCount + 1,
        lastViewedAt: new Date()
      });

      logger.info('Share verification lookup', {
        verificationCode,
        viewCount: verification.viewCount + 1,
        isExpired,
        isValid
      });

      return {
        verification: {
          id: verification.id,
          verificationCode: verification.verificationCode,
          userId: verification.userId,
          cardId: verification.cardId,
          analysisType: verification.analysisType,
          analysisResult: verification.analysisResult,
          shareUrl: verification.shareUrl,
          expiresAt: verification.expiresAt,
          isActive: verification.isActive,
          viewCount: verification.viewCount + 1,
          lastViewedAt: verification.lastViewedAt,
          createdAt: verification.createdAt,
          updatedAt: verification.updatedAt
        },
        card: verification.card,
        user: verification.user,
        isExpired,
        isValid
      };
    } catch (error) {
      logger.error('Lookup verification error:', error);
      throw error;
    }
  }

  // 驗證分享驗證
  async validateVerification(verificationCode) {
    try {
      await this.initializeModels();

      const verification = await this.ShareVerification.findOne({
        where: {
          verificationCode,
          isActive: true
        }
      });

      if (!verification) {
        return { isValid: false, reason: '驗證碼不存在或已失效' };
      }

      const isExpired = new Date() > verification.expiresAt;
      if (isExpired) {
        return { isValid: false, reason: '驗證碼已過期' };
      }

      return { isValid: true, reason: '驗證成功' };
    } catch (error) {
      logger.error('Validate verification error:', error);
      throw error;
    }
  }

  // 獲取用戶的分享驗證統計
  async getUserShareStats(userId) {
    try {
      await this.initializeModels();

      const stats = await this.ShareVerification.findAll({
        where: { userId },
        attributes: [
          'analysisType',
          [this.ShareVerification.sequelize.fn('COUNT', '*'), 'total'],
          [this.ShareVerification.sequelize.fn('SUM', this.ShareVerification.sequelize.col('viewCount')), 'totalViews']
        ],
        group: ['analysisType']
      });

      const totalShares = await this.ShareVerification.count({
        where: { userId }
      });

      const activeShares = await this.ShareVerification.count({
        where: {
          userId,
          isActive: true,
          expiresAt: { [Op.gt]: new Date() }
        }
      });

      return {
        totalShares,
        activeShares,
        expiredShares: totalShares - activeShares,
        byType: stats,
        totalViews: stats.reduce((sum, stat) => sum + parseInt(stat.dataValues.totalViews || 0), 0)
      };
    } catch (error) {
      logger.error('Get user share stats error:', error);
      throw error;
    }
  }

  // 刪除分享驗證
  async deleteShareVerification(userId, verificationCode) {
    try {
      await this.initializeModels();

      const verification = await this.ShareVerification.findOne({
        where: {
          verificationCode,
          userId
        }
      });

      if (!verification) {
        throw new Error('分享驗證不存在或無權限刪除');
      }

      await verification.update({ isActive: false });

      logger.info('Share verification deleted', {
        verificationCode,
        userId
      });

      return { success: true, message: '分享驗證已刪除' };
    } catch (error) {
      logger.error('Delete share verification error:', error);
      throw error;
    }
  }

  // 清理過期的分享驗證
  async cleanupExpiredVerifications() {
    try {
      await this.initializeModels();

      const expiredCount = await this.ShareVerification.update(
        { isActive: false },
        {
          where: {
            expiresAt: { [Op.lt]: new Date() },
            isActive: true
          }
        }
      );

      logger.info('Expired verifications cleaned up', {
        count: expiredCount[0]
      });

      return { cleanedCount: expiredCount[0] };
    } catch (error) {
      logger.error('Cleanup expired verifications error:', error);
      throw error;
    }
  }

  // 獲取熱門分享驗證
  async getPopularVerifications(limit = 10) {
    try {
      await this.initializeModels();

      const popularVerifications = await this.ShareVerification.findAll({
        where: {
          isActive: true,
          expiresAt: { [Op.gt]: new Date() }
        },
        include: [
          {
            model: this.Card,
            as: 'card',
            attributes: ['id', 'name', 'setName', 'rarity', 'imageUrl']
          },
          {
            model: this.User,
            as: 'user',
            attributes: ['id', 'username', 'avatar']
          }
        ],
        order: [['viewCount', 'DESC']],
        limit
      });

      return popularVerifications;
    } catch (error) {
      logger.error('Get popular verifications error:', error);
      throw error;
    }
  }
}

module.exports = new ShareVerificationService();
