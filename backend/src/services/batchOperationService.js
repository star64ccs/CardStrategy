const { Op } = require('sequelize');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
// eslint-disable-next-line no-unused-vars
const moment = require('moment');
const Bull = require('bull');
const redis = require('redis');

class BatchOperationService {
  constructor() {
    this.redisClient = null;
    this.batchQueue = null;
    this.initializeRedis();
    this.initializeQueue();
  }

  /**
   * Initialize Redis client
   */
  async initializeRedis() {
    try {
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });

      await this.redisClient.connect();
      logger.info('Batch operation service Redis connection successful');
    } catch (error) {
      logger.error('Batch operation service Redis connection failed:', error);
      this.redisClient = null;
    }
  }

  /**
   * InitializeQueue
   */
  initializeQueue() {
    try {
      this.batchQueue = new Bull('batch-operations', {
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
        },
      });

      // SettingsQueueHandle器
      this.setupQueueProcessors();

      logger.info('批量操作隊列InitializeSuccess');
    } catch (error) {
      logger.error('批量操作隊列InitializeFailed:', error);
    }
  }

  /**
   * SettingsQueueHandle器
   */
  setupQueueProcessors() {
    // Batch卡片OperationHandle器
    this.batchQueue.process('batch-cards', async (job) => {
      return await this.processBatchCards(job.data);
    });

    // Batch投資OperationHandle器
    this.batchQueue.process('batch-investments', async (job) => {
      return await this.processBatchInvestments(job.data);
    });

    // Batch市場DataOperationHandle器
    this.batchQueue.process('batch-market-data', async (job) => {
      return await this.processBatchMarketData(job.data);
    });

    // BatchUserOperationHandle器
    this.batchQueue.process('batch-users', async (job) => {
      return await this.processBatchUsers(job.data);
    });

    // BatchNotificationOperationHandle器
    this.batchQueue.process('batch-notifications', async (job) => {
      return await this.processBatchNotifications(job.data);
    });

    // ErrorHandle
    this.batchQueue.on('error', (error) => {
      logger.error('批量操作隊列Error:', error);
    });

    this.batchQueue.on('failed', (job, error) => {
      logger.error(`批量操作任務Failed: ${job.id}`, error);
    });

    this.batchQueue.on('completed', (job) => {
      logger.info(`批量操作任務完成: ${job.id}`);
    });
  }

  /**
   * Batch卡片Operation
   */
  async processBatchCards(data) {
    try {
      const { operation, cards, options = {} } = data;
// eslint-disable-next-line no-unused-vars
      const results = {
        success: [],
        failed: [],
        total: cards.length,
        operation,
      };

// eslint-disable-next-line no-unused-vars
      const Card = require('../models/Card');
// eslint-disable-next-line no-unused-vars
      const batchSize = options.batchSize || 100;
      const batches = this.chunkArray(cards, batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        try {
          switch (operation) {
            case 'create':
              const createdCards = await Card.bulkCreate(batch, {
                validate: true,
                returning: true,
              });
              results.success.push(...createdCards.map((card) => card.id));
              break;

            case 'update':
              for (const card of batch) {
                const updated = await Card.update(card.data, {
                  where: { id: card.id },
                  returning: true,
                });
                if (updated[0] > 0) {
                  results.success.push(card.id);
                } else {
                  results.failed.push({
                    id: card.id,
                    reason: 'Card not found',
                  });
                }
              }
              break;

            case 'delete':
              const deletedCount = await Card.destroy({
                where: {
                  id: { [Op.in]: batch.map((card) => card.id) },
                },
              });
              results.success.push(
                ...batch.map((card) => card.id).slice(0, deletedCount)
              );
              break;

            case 'bulk-update':
              const bulkUpdatePromises = batch.map((card) =>
                Card.update(card.data, { where: { id: card.id } })
              );
              const bulkResults = await Promise.allSettled(bulkUpdatePromises);

              bulkResults.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value[0] > 0) {
                  results.success.push(batch[index].id);
                } else {
                  results.failed.push({
                    id: batch[index].id,
                    reason:
                      result.status === 'rejected'
                        ? result.reason.message
                        : 'Update failed',
                  });
                }
              });
              break;

            default:
              throw new Error(`未知的批量操作: ${operation}`);
          }
        } catch (error) {
          logger.error(`批量卡片操作批次 ${i + 1} Failed:`, error);
          results.failed.push(
            ...batch.map((card) => ({
              id: card.id || card.data?.id,
              reason: error.message,
            }))
          );
        }
      }

      return results;
    } catch (error) {
      logger.error('批量卡片操作Failed:', error);
      throw error;
    }
  }

  /**
   * Batch投資Operation
   */
  async processBatchInvestments(data) {
    try {
      const { operation, investments, options = {} } = data;
// eslint-disable-next-line no-unused-vars
      const results = {
        success: [],
        failed: [],
        total: investments.length,
        operation,
      };

      const Investment = require('../models/Investment');
// eslint-disable-next-line no-unused-vars
      const batchSize = options.batchSize || 50;
      const batches = this.chunkArray(investments, batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        try {
          switch (operation) {
            case 'create':
              const createdInvestments = await Investment.bulkCreate(batch, {
                validate: true,
                returning: true,
              });
              results.success.push(...createdInvestments.map((inv) => inv.id));
              break;

            case 'update':
              for (const investment of batch) {
                const updated = await Investment.update(investment.data, {
                  where: { id: investment.id },
                  returning: true,
                });
                if (updated[0] > 0) {
                  results.success.push(investment.id);
                } else {
                  results.failed.push({
                    id: investment.id,
                    reason: 'Investment not found',
                  });
                }
              }
              break;

            case 'delete':
              const deletedCount = await Investment.destroy({
                where: {
                  id: { [Op.in]: batch.map((inv) => inv.id) },
                },
              });
              results.success.push(
                ...batch.map((inv) => inv.id).slice(0, deletedCount)
              );
              break;

            case 'calculate-returns':
              for (const investment of batch) {
                try {
                  const inv = await Investment.findByPk(investment.id, {
                    include: [{ model: require('../models/Card'), as: 'card' }],
                  });

                  if (inv && inv.card) {
                    const currentValue = inv.quantity * inv.card.currentPrice;
                    const totalCost = inv.quantity * inv.purchasePrice;
                    const returnAmount = currentValue - totalCost;
                    const returnPercentage = (returnAmount / totalCost) * 100;

                    await inv.update({
                      currentValue,
                      returnAmount,
                      returnPercentage,
                      lastCalculated: new Date(),
                    });

                    results.success.push(investment.id);
                  } else {
                    results.failed.push({
                      id: investment.id,
                      reason: 'Investment or card not found',
                    });
                  }
                } catch (error) {
                  results.failed.push({
                    id: investment.id,
                    reason: error.message,
                  });
                }
              }
              break;

            default:
              throw new Error(`未知的批量投資操作: ${operation}`);
          }
        } catch (error) {
          logger.error(`批量投資操作批次 ${i + 1} Failed:`, error);
          results.failed.push(
            ...batch.map((inv) => ({
              id: inv.id || inv.data?.id,
              reason: error.message,
            }))
          );
        }
      }

      return results;
    } catch (error) {
      logger.error('批量投資操作Failed:', error);
      throw error;
    }
  }

  /**
   * Batch市場DataOperation
   */
  async processBatchMarketData(data) {
    try {
      const { operation, marketData, options = {} } = data;
// eslint-disable-next-line no-unused-vars
      const results = {
        success: [],
        failed: [],
        total: marketData.length,
        operation,
      };

// eslint-disable-next-line no-unused-vars
      const MarketData = require('../models/MarketData');
// eslint-disable-next-line no-unused-vars
      const batchSize = options.batchSize || 200;
      const batches = this.chunkArray(marketData, batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        try {
          switch (operation) {
            case 'create':
              const createdData = await MarketData.bulkCreate(batch, {
                validate: true,
                returning: true,
              });
              results.success.push(...createdData.map((data) => data.id));
              break;

            case 'update':
// eslint-disable-next-line no-unused-vars
              for (const data of batch) {
                const updated = await MarketData.update(data.data, {
                  where: { id: data.id },
                  returning: true,
                });
                if (updated[0] > 0) {
                  results.success.push(data.id);
                } else {
                  results.failed.push({
                    id: data.id,
                    reason: 'Market data not found',
                  });
                }
              }
              break;

            case 'aggregate':
              // 聚合市場Data
// eslint-disable-next-line no-unused-vars
              for (const data of batch) {
                try {
                  const aggregated = await this.aggregateMarketData(
                    data.cardId,
                    data.date
                  );
                  results.success.push(data.cardId);
                } catch (error) {
                  results.failed.push({
                    id: data.cardId,
                    reason: error.message,
                  });
                }
              }
              break;

            case 'cleanup':
              // 清理過期市場Data
              const cutoffDate = moment()
                .subtract(options.days || 365, 'days')
                .toDate();
              const deletedCount = await MarketData.destroy({
                where: {
                  date: { [Op.lt]: cutoffDate },
                },
              });
              results.success.push(`Deleted ${deletedCount} records`);
              break;

            default:
              throw new Error(`未知的批量市場數據操作: ${operation}`);
          }
        } catch (error) {
          logger.error(`批量市場數據操作批次 ${i + 1} Failed:`, error);
          results.failed.push(
            ...batch.map((data) => ({
              id: data.id || data.cardId,
              reason: error.message,
            }))
          );
        }
      }

      return results;
    } catch (error) {
      logger.error('批量市場數據操作Failed:', error);
      throw error;
    }
  }

  /**
   * BatchUserOperation
   */
  async processBatchUsers(data) {
    try {
      const { operation, users, options = {} } = data;
// eslint-disable-next-line no-unused-vars
      const results = {
        success: [],
        failed: [],
        total: users.length,
        operation,
      };

      const User = require('../models/User');
// eslint-disable-next-line no-unused-vars
      const batchSize = options.batchSize || 50;
      const batches = this.chunkArray(users, batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        try {
          switch (operation) {
            case 'update':
// eslint-disable-next-line no-unused-vars
              for (const user of batch) {
                const updated = await User.update(user.data, {
                  where: { id: user.id },
                  returning: true,
                });
                if (updated[0] > 0) {
                  results.success.push(user.id);
                } else {
                  results.failed.push({
                    id: user.id,
                    reason: 'User not found',
                  });
                }
              }
              break;

            case 'deactivate':
              const deactivatedCount = await User.update(
                { isActive: false, deactivatedAt: new Date() },
                {
                  where: {
                    id: { [Op.in]: batch.map((user) => user.id) },
                  },
                }
              );
              results.success.push(
                ...batch.map((user) => user.id).slice(0, deactivatedCount[0])
              );
              break;

            case 'activate':
              const activatedCount = await User.update(
                { isActive: true, deactivatedAt: null },
                {
                  where: {
                    id: { [Op.in]: batch.map((user) => user.id) },
                  },
                }
              );
              results.success.push(
                ...batch.map((user) => user.id).slice(0, activatedCount[0])
              );
              break;

            case 'send-notification':
// eslint-disable-next-line no-unused-vars
              const notificationService = require('./notificationService');
// eslint-disable-next-line no-unused-vars
              for (const user of batch) {
                try {
                  await notificationService.sendInstantNotification(
                    user.id,
                    user.notificationType || 'system_notification',
                    user.notificationData || {},
                    user.channels || ['websocket']
                  );
                  results.success.push(user.id);
                } catch (error) {
                  results.failed.push({ id: user.id, reason: error.message });
                }
              }
              break;

            default:
              throw new Error(`未知的批量用戶操作: ${operation}`);
          }
        } catch (error) {
          logger.error(`批量用戶操作批次 ${i + 1} Failed:`, error);
          results.failed.push(
            ...batch.map((user) => ({
              id: user.id,
              reason: error.message,
            }))
          );
        }
      }

      return results;
    } catch (error) {
      logger.error('批量用戶操作Failed:', error);
      throw error;
    }
  }

  /**
   * BatchNotificationOperation
   */
  async processBatchNotifications(data) {
    try {
      const { operation, notifications, options = {} } = data;
// eslint-disable-next-line no-unused-vars
      const results = {
        success: [],
        failed: [],
        total: notifications.length,
        operation,
      };

// eslint-disable-next-line no-unused-vars
      const notificationService = require('./notificationService');
// eslint-disable-next-line no-unused-vars
      const batchSize = options.batchSize || 100;
      const batches = this.chunkArray(notifications, batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        try {
          switch (operation) {
            case 'send':
// eslint-disable-next-line no-unused-vars
              for (const notification of batch) {
                try {
// eslint-disable-next-line no-unused-vars
                  const notificationId =
                    await notificationService.sendInstantNotification(
                      notification.userId,
                      notification.type,
                      notification.data,
                      notification.channels
                    );
                  results.success.push(notificationId);
                } catch (error) {
                  results.failed.push({
                    userId: notification.userId,
                    reason: error.message,
                  });
                }
              }
              break;

            case 'schedule':
// eslint-disable-next-line no-unused-vars
              for (const notification of batch) {
                try {
// eslint-disable-next-line no-unused-vars
                  const notificationId =
                    await notificationService.scheduleNotification(
                      notification.userId,
                      notification.type,
                      notification.data,
                      notification.scheduleTime,
                      notification.channels
                    );
                  results.success.push(notificationId);
                } catch (error) {
                  results.failed.push({
                    userId: notification.userId,
                    reason: error.message,
                  });
                }
              }
              break;

            case 'cancel':
// eslint-disable-next-line no-unused-vars
              for (const notification of batch) {
                try {
                  await notificationService.cancelScheduledNotification(
                    notification.notificationId
                  );
                  results.success.push(notification.notificationId);
                } catch (error) {
                  results.failed.push({
                    notificationId: notification.notificationId,
                    reason: error.message,
                  });
                }
              }
              break;

            default:
              throw new Error(`未知的批量通知操作: ${operation}`);
          }
        } catch (error) {
          logger.error(`批量通知操作批次 ${i + 1} Failed:`, error);
          results.failed.push(
            ...batch.map((notification) => ({
              id: notification.userId || notification.notificationId,
              reason: error.message,
            }))
          );
        }
      }

      return results;
    } catch (error) {
      logger.error('批量通知操作Failed:', error);
      throw error;
    }
  }

  /**
   * SubmitBatchOperationTask
   */
  async submitBatchOperation(type, data, options = {}) {
    try {
      const jobId = uuidv4();
      const job = await this.batchQueue.add(type, data, {
        jobId,
        attempts: options.attempts || 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
        ...options,
      });

      logger.info(`批量操作任務已提交: ${jobId}, 類型: ${type}`);
      return {
        jobId,
        status: 'queued',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('提交批量操作任務Failed:', error);
      throw error;
    }
  }

  /**
   * GetTaskStatus
   */
  async getJobStatus(jobId) {
    try {
      const job = await this.batchQueue.getJob(jobId);

      if (!job) {
        return { status: 'not_found' };
      }

      const state = await job.getState();
      const progress = job._progress;
// eslint-disable-next-line no-unused-vars
      const result = job.returnvalue;
      const { failedReason } = job;

      return {
        jobId,
        status: state,
        progress,
        result,
        failedReason,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Get任務狀態Failed:', error);
      throw error;
    }
  }

  /**
   * CancelTask
   */
  async cancelJob(jobId) {
    try {
      const job = await this.batchQueue.getJob(jobId);

      if (!job) {
        throw new Error('任務不存在');
      }

      await job.remove();
      logger.info(`任務已取消: ${jobId}`);

      return {
        jobId,
        status: 'cancelled',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('取消任務Failed:', error);
      throw error;
    }
  }

  /**
   * GetQueueStatistics
   */
  async getQueueStats() {
    try {
      const waiting = await this.batchQueue.getWaiting();
      const active = await this.batchQueue.getActive();
      const completed = await this.batchQueue.getCompleted();
      const failed = await this.batchQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total:
          waiting.length + active.length + completed.length + failed.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Get隊列統計Failed:', error);
      throw error;
    }
  }

  /**
   * 聚合市場Data
   */
  async aggregateMarketData(cardId, date) {
    try {
// eslint-disable-next-line no-unused-vars
      const MarketData = require('../models/MarketData');

      const dailyData = await MarketData.findAll({
        where: {
          cardId,
          date: {
            [Op.gte]: moment(date).startOf('day').toDate(),
            [Op.lt]: moment(date).endOf('day').toDate(),
          },
        },
        order: [['date', 'ASC']],
      });

      if (dailyData.length === 0) {
        throw new Error('No market data found for the specified date');
      }

// eslint-disable-next-line no-unused-vars
      const prices = dailyData.map((data) => data.price);
// eslint-disable-next-line no-unused-vars
      const volumes = dailyData.map((data) => data.volume || 0);

      const aggregated = {
        cardId,
        date: moment(date).startOf('day').toDate(),
        openPrice: prices[0],
        closePrice: prices[prices.length - 1],
        highPrice: Math.max(...prices),
        lowPrice: Math.min(...prices),
        averagePrice:
          prices.reduce((sum, price) => sum + price, 0) / prices.length,
        totalVolume: volumes.reduce((sum, volume) => sum + volume, 0),
        priceChange: prices[prices.length - 1] - prices[0],
        priceChangePercent:
          ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100,
        dataPoints: dailyData.length,
        lastUpdated: new Date(),
      };

      // Save聚合Data
      await MarketData.create(aggregated);

      return aggregated;
    } catch (error) {
      logger.error('聚合市場數據Failed:', error);
      throw error;
    }
  }

  /**
   * 將Array分塊
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 清理過期Task
   */
  async cleanupExpiredJobs() {
    try {
      const completedJobs = await this.batchQueue.getCompleted();
      const failedJobs = await this.batchQueue.getFailed();

      // 清理超過7天的已CompleteTask
      const sevenDaysAgo = moment().subtract(7, 'days').toDate();

      for (const job of completedJobs) {
        if (job.finishedOn && new Date(job.finishedOn) < sevenDaysAgo) {
          await job.remove();
        }
      }

      // 清理超過30天的FailedTask
      const thirtyDaysAgo = moment().subtract(30, 'days').toDate();

      for (const job of failedJobs) {
        if (job.finishedOn && new Date(job.finishedOn) < thirtyDaysAgo) {
          await job.remove();
        }
      }

      logger.info('過期任務清理完成');
    } catch (error) {
      logger.error('清理過期任務Failed:', error);
    }
  }

  /**
   * Off閉Service
   */
  async close() {
    try {
      if (this.batchQueue) {
        await this.batchQueue.close();
      }

      if (this.redisClient) {
        await this.redisClient.quit();
      }

      logger.info('批量操作Service已關閉');
    } catch (error) {
      logger.error('關閉批量操作ServiceFailed:', error);
    }
  }
}

module.exports = new BatchOperationService();
