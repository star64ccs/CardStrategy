const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const db = require('../models');

/**
 * 增量同步 API
 * POST /api/sync/incremental
 */
router.post('/incremental', authenticateToken, async (req, res) => {
  try {
    const { batch, lastSyncTime, clientVersion } = req.body;
    const userId = req.user.id;

    logger.info(`開始處理用戶 ${userId} 的增量同步請求`);

    if (!batch || !batch.items || !Array.isArray(batch.items)) {
      return res.status(400).json({
        success: false,
        error: '無效的同步批次格式'
      });
    }

    const results = {
      processed: 0,
      conflicts: 0,
      errors: 0,
      serverChanges: []
    };

    // 處理客戶端變更
    for (const item of batch.items) {
      try {
        const result = await processSyncItem(item, userId, lastSyncTime);

        if (result.success) {
          results.processed++;
        } else if (result.conflict) {
          results.conflicts++;
          results.serverChanges.push(result.serverData);
        } else {
          results.errors++;
        }
      } catch (error) {
        logger.error(`處理同步項目失敗: ${item.id}`, error);
        results.errors++;
      }
    }

    // 獲取服務器端的變更（自從上次同步以來）
    const serverChanges = await getServerChanges(userId, lastSyncTime);

    logger.info(`同步完成 - 處理: ${results.processed}, 衝突: ${results.conflicts}, 錯誤: ${results.errors}`);

    res.json({
      success: true,
      results,
      serverChanges,
      serverVersion: Date.now()
    });

  } catch (error) {
    logger.error('增量同步處理失敗:', error);
    res.status(500).json({
      success: false,
      error: '服務器內部錯誤'
    });
  }
});

/**
 * 處理單個同步項目
 */
async function processSyncItem(item, userId, lastSyncTime) {
  const { id, type, data, timestamp, version, isDeleted } = item;

  try {
    switch (type) {
      case 'card':
        return await processCardSync(id, data, userId, timestamp, version, isDeleted);
      case 'collection':
        return await processCollectionSync(id, data, userId, timestamp, version, isDeleted);
      case 'user':
        return await processUserSync(id, data, userId, timestamp, version, isDeleted);
      case 'annotation':
        return await processAnnotationSync(id, data, userId, timestamp, version, isDeleted);
      default:
        return { success: false, error: '未知的同步類型' };
    }
  } catch (error) {
    logger.error(`處理同步項目失敗: ${type} - ${id}`, error);
    return { success: false, error: error.message };
  }
}

/**
 * 處理卡片同步
 */
async function processCardSync(id, data, userId, timestamp, version, isDeleted) {
  try {
    const existingCard = await db.Card.findOne({
      where: { id, userId }
    });

    if (isDeleted) {
      // 刪除操作
      if (existingCard) {
        await existingCard.destroy();
        return { success: true };
      }
      return { success: true }; // 已經不存在
    }

    if (existingCard) {
      // 更新現有卡片
      if (existingCard.updatedAt.getTime() > timestamp) {
        // 服務器版本更新，返回衝突
        return {
          success: false,
          conflict: true,
          serverData: existingCard.toJSON()
        };
      }

      await existingCard.update({
        ...data,
        updatedAt: new Date(timestamp)
      });
    } else {
      // 創建新卡片
      await db.Card.create({
        id,
        userId,
        ...data,
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp)
      });
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
}

/**
 * 處理收藏同步
 */
async function processCollectionSync(id, data, userId, timestamp, version, isDeleted) {
  try {
    const existingCollection = await db.Collection.findOne({
      where: { id, userId }
    });

    if (isDeleted) {
      if (existingCollection) {
        await existingCollection.destroy();
        return { success: true };
      }
      return { success: true };
    }

    if (existingCollection) {
      if (existingCollection.updatedAt.getTime() > timestamp) {
        return {
          success: false,
          conflict: true,
          serverData: existingCollection.toJSON()
        };
      }

      await existingCollection.update({
        ...data,
        updatedAt: new Date(timestamp)
      });
    } else {
      await db.Collection.create({
        id,
        userId,
        ...data,
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp)
      });
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
}

/**
 * 處理用戶數據同步
 */
async function processUserSync(id, data, userId, timestamp, version, isDeleted) {
  try {
    const existingUser = await db.User.findByPk(userId);

    if (!existingUser) {
      return { success: false, error: '用戶不存在' };
    }

    // 只更新允許同步的用戶字段
    const allowedFields = ['preferences', 'settings', 'profile'];
    const updateData = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    if (Object.keys(updateData).length > 0) {
      await existingUser.update({
        ...updateData,
        updatedAt: new Date(timestamp)
      });
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
}

/**
 * 處理註釋同步
 */
async function processAnnotationSync(id, data, userId, timestamp, version, isDeleted) {
  try {
    const existingAnnotation = await db.Annotation.findOne({
      where: { id, userId }
    });

    if (isDeleted) {
      if (existingAnnotation) {
        await existingAnnotation.destroy();
        return { success: true };
      }
      return { success: true };
    }

    if (existingAnnotation) {
      if (existingAnnotation.updatedAt.getTime() > timestamp) {
        return {
          success: false,
          conflict: true,
          serverData: existingAnnotation.toJSON()
        };
      }

      await existingAnnotation.update({
        ...data,
        updatedAt: new Date(timestamp)
      });
    } else {
      await db.Annotation.create({
        id,
        userId,
        ...data,
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp)
      });
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
}

/**
 * 獲取服務器端變更
 */
async function getServerChanges(userId, lastSyncTime) {
  const changes = [];
  const syncTime = new Date(lastSyncTime);

  try {
    // 獲取卡片變更
    const cardChanges = await db.Card.findAll({
      where: {
        userId,
        updatedAt: {
          [db.Sequelize.Op.gt]: syncTime
        }
      }
    });

    cardChanges.forEach(card => {
      changes.push({
        id: card.id,
        type: 'card',
        data: card.toJSON(),
        timestamp: card.updatedAt.getTime(),
        version: card.updatedAt.getTime()
      });
    });

    // 獲取收藏變更
    const collectionChanges = await db.Collection.findAll({
      where: {
        userId,
        updatedAt: {
          [db.Sequelize.Op.gt]: syncTime
        }
      }
    });

    collectionChanges.forEach(collection => {
      changes.push({
        id: collection.id,
        type: 'collection',
        data: collection.toJSON(),
        timestamp: collection.updatedAt.getTime(),
        version: collection.updatedAt.getTime()
      });
    });

    // 獲取註釋變更
    const annotationChanges = await db.Annotation.findAll({
      where: {
        userId,
        updatedAt: {
          [db.Sequelize.Op.gt]: syncTime
        }
      }
    });

    annotationChanges.forEach(annotation => {
      changes.push({
        id: annotation.id,
        type: 'annotation',
        data: annotation.toJSON(),
        timestamp: annotation.updatedAt.getTime(),
        version: annotation.updatedAt.getTime()
      });
    });

    logger.info(`獲取到 ${changes.length} 個服務器變更`);
    return changes;

  } catch (error) {
    logger.error('獲取服務器變更失敗:', error);
    return [];
  }
}

/**
 * 獲取同步狀態
 * GET /api/sync/status
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 獲取用戶的最後同步時間
    const user = await db.User.findByPk(userId);
    const lastSyncTime = user.lastSyncTime || 0;

    // 獲取待同步項目數量（這裡可以實現更複雜的邏輯）
    const pendingCount = 0; // 暫時設為0，可以根據實際需求實現

    res.json({
      success: true,
      lastSyncTime,
      pendingCount,
      serverVersion: Date.now()
    });

  } catch (error) {
    logger.error('獲取同步狀態失敗:', error);
    res.status(500).json({
      success: false,
      error: '服務器內部錯誤'
    });
  }
});

module.exports = router;
