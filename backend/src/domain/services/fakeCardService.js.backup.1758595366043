const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

let FakeCard = null;
let User = null;

class FakeCardService {
  constructor() {
    this.rewardPoints = {
      counterfeit: 100,
      reprint: 50,
      custom: 30,
      proxy: 20,
    };
  }

  async initializeModels() {
    if (!FakeCard || !User) {
      const { FakeCard: FakeCardModel, User: UserModel } = require('../models');
      FakeCard = FakeCardModel;
      User = UserModel;
    }
  }

  // 提交假卡報告
  async submitFakeCard({
    userId,
    cardName,
    cardType,
    fakeType,
    imageData,
    description,
    fakeIndicators,
  }) {
    try {
      await this.initializeModels();

      // 上傳圖片到Cloudinary
      const imageUrls = [];
      for (const image of imageData) {
        try {
          const result = await cloudinary.uploader.upload(image, {
            folder: 'fake-cards',
            resource_type: 'image',
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
            ],
          });
          imageUrls.push(result.secure_url);
        } catch (error) {
          logger.error('上傳圖片失敗:', error);
          throw new Error('圖片上傳失敗');
        }
      }

      // 創建假卡記錄
      const fakeCard = await FakeCard.create({
        id: uuidv4(),
        userId,
        cardName,
        cardType,
        fakeType,
        imageUrls,
        description,
        fakeIndicators,
        status: 'pending',
        submissionDate: new Date(),
        metadata: {
          submittedBy: userId,
          imageCount: imageData.length,
          fakeIndicatorsCount: fakeIndicators.length,
        },
      });

      logger.info('假卡記錄創建成功', {
        fakeCardId: fakeCard.id,
        userId,
        cardName,
        fakeType,
      });

      return {
        id: fakeCard.id,
        cardName: fakeCard.cardName,
        cardType: fakeCard.cardType,
        fakeType: fakeCard.fakeType,
        status: fakeCard.status,
        submissionDate: fakeCard.submissionDate,
        imageCount: imageUrls.length,
      };
    } catch (error) {
      logger.error('提交假卡報告失敗:', error);
      throw error;
    }
  }

  // 獲取用戶提交的假卡列表
  async getUserSubmissions(userId, { page = 1, limit = 10, status }) {
    try {
      await this.initializeModels();

      const whereClause = { userId };
      if (status) {
        whereClause.status = status;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await FakeCard.findAndCountAll({
        where: whereClause,
        order: [['submissionDate', 'DESC']],
        limit: parseInt(limit),
        offset,
        attributes: [
          'id',
          'cardName',
          'cardType',
          'fakeType',
          'status',
          'submissionDate',
          'reviewerNotes',
          'rewardPoints',
        ],
      });

      return {
        submissions: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error('獲取用戶提交失敗:', error);
      throw error;
    }
  }

  // 獲取假卡數據庫（僅供AI訓練）
  async getFakeCardDatabase({ page = 1, limit = 50, status = 'approved' }) {
    try {
      await this.initializeModels();

      const whereClause = { status };
      const offset = (page - 1) * limit;

      const { count, rows } = await FakeCard.findAndCountAll({
        where: whereClause,
        order: [['submissionDate', 'DESC']],
        limit: parseInt(limit),
        offset,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username'],
          },
        ],
      });

      return {
        fakeCards: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error('獲取假卡數據庫失敗:', error);
      throw error;
    }
  }

  // 獲取獎勵積分
  async getRewardPoints(userId) {
    try {
      await this.initializeModels();

      // 計算總積分
      const approvedSubmissions = await FakeCard.findAll({
        where: {
          userId,
          status: 'approved',
        },
        attributes: ['fakeType', 'rewardPoints'],
      });

      let totalPoints = 0;
      const history = [];

      for (const submission of approvedSubmissions) {
        const points = submission.rewardPoints || this.rewardPoints[submission.fakeType] || 0;
        totalPoints += points;
        history.push({
          fakeType: submission.fakeType,
          points,
          date: submission.updatedAt,
        });
      }

      return {
        points: totalPoints,
        history,
        totalSubmissions: approvedSubmissions.length,
      };
    } catch (error) {
      logger.error('獲取獎勵積分失敗:', error);
      throw error;
    }
  }

  // 審核假卡報告
  async reviewFakeCard(id, { status, reviewerNotes, rewardPoints, reviewerId }) {
    try {
      await this.initializeModels();

      const fakeCard = await FakeCard.findByPk(id);
      if (!fakeCard) {
        throw new Error('假卡記錄不存在');
      }

      // 計算獎勵積分
      let calculatedRewardPoints = rewardPoints;
      if (!calculatedRewardPoints) {
        calculatedRewardPoints = this.rewardPoints[fakeCard.fakeType] || 0;
      }

      // 更新假卡記錄
      await fakeCard.update({
        status,
        reviewerNotes,
        rewardPoints: calculatedRewardPoints,
        reviewDate: new Date(),
        reviewerId,
        metadata: {
          ...fakeCard.metadata,
          reviewedBy: reviewerId,
          reviewDate: new Date().toISOString(),
        },
      });

      // 如果審核通過，給用戶增加積分
      if (status === 'approved') {
        const user = await User.findByPk(fakeCard.userId);
        if (user) {
          const currentPoints = user.points || 0;
          await user.update({
            points: currentPoints + calculatedRewardPoints,
          });

          logger.info('用戶積分更新', {
            userId: fakeCard.userId,
            addedPoints: calculatedRewardPoints,
            totalPoints: currentPoints + calculatedRewardPoints,
          });
        }
      }

      return {
        id: fakeCard.id,
        status: fakeCard.status,
        rewardPoints: fakeCard.rewardPoints,
        reviewDate: fakeCard.reviewDate,
      };
    } catch (error) {
      logger.error('審核假卡報告失敗:', error);
      throw error;
    }
  }

  // 獲取假卡統計信息
  async getFakeCardStats() {
    try {
      await this.initializeModels();

      const [
        totalCount,
        pendingCount,
        approvedCount,
        rejectedCount,
        typeStats,
        recentSubmissions,
      ] = await Promise.all([
        FakeCard.count(),
        FakeCard.count({ where: { status: 'pending' } }),
        FakeCard.count({ where: { status: 'approved' } }),
        FakeCard.count({ where: { status: 'rejected' } }),
        FakeCard.findAll({
          attributes: [
            'fakeType',
            [FakeCard.sequelize.fn('COUNT', '*'), 'count'],
          ],
          group: ['fakeType'],
        }),
        FakeCard.findAll({
          where: {
            submissionDate: {
              [FakeCard.sequelize.Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 最近7天
            },
          },
          attributes: [
            [FakeCard.sequelize.fn('DATE', FakeCard.sequelize.col('submissionDate')), 'date'],
            [FakeCard.sequelize.fn('COUNT', '*'), 'count'],
          ],
          group: [FakeCard.sequelize.fn('DATE', FakeCard.sequelize.col('submissionDate'))],
          order: [[FakeCard.sequelize.fn('DATE', FakeCard.sequelize.col('submissionDate')), 'ASC']],
        }),
      ]);

      return {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        typeDistribution: typeStats.map(stat => ({
          type: stat.fakeType,
          count: parseInt(stat.dataValues.count),
        })),
        recentActivity: recentSubmissions.map(stat => ({
          date: stat.dataValues.date,
          count: parseInt(stat.dataValues.count),
        })),
      };
    } catch (error) {
      logger.error('獲取假卡統計失敗:', error);
      throw error;
    }
  }
}

module.exports = new FakeCardService();
