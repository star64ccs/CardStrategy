const express = require('express');'
const router = express.Router();''
const { authenticateToken } = require('../middleware/auth');''
const { logger } = require('../utils/logger');''
const db = require('../models');

/**
 * 增�??�步 API
 * POST /api/sync/incremental'
 */''
router.post('/incremental', authenticateToken, async (req, res) => {
  try {
    const { batch, lastSyncTime, clientVersion } = req.body;
// eslint-disable-next-line no-unused-vars
    const userId = req.user.id;

    logger.info(`?��??��??�戶 ${userId} ?��??��?步�?求`);

    if (!batch || !batch.items || !Array.isArray(batch.items)) {
      return res.status(400).json({'
        success: false,''
        error: '?��??��?步批次格�?,
      });
    }
// eslint-disable-next-line no-unused-vars
    const results = {
      processed: 0,
      conflicts: 0,
      errors: 0,
      serverChanges: [],
    };

    // ?��?Client�???    for (const item of batch.items) {
      try {
// eslint-disable-next-line no-unused-vars
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
        logger.error(`?��??�步?�目失�?: ${item.id}`, error);
        results.errors++;
      }
    }
    // ?��??��??�端?��??��??��?上次?�步以�?�?    const serverChanges = await getServerChanges(userId, lastSyncTime);

    logger.info(
      `?�步完�? - ?��?: ${results.processed}, 衝�?: ${results.conflicts}, ?�誤: ${results.errors}`
    );

    res.json({
      success: true,
      results,
      serverChanges,
      serverVersion: Date.now(),
    });'
  } catch (error) {''
    logger.error('增�??�步?��?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?��??�內?�錯�?,
    });
  }
});

/**
 * ?��??�個�?步�??? */
async function processSyncItem(item, userId, lastSyncTime) {
  const { id, type, data, timestamp, version, isDeleted } = item;

  try {'
    switch (type) {''
      case 'card':
        return await processCardSync(
          id,
          data,
          userId,
          timestamp,
          version,
          isDeleted'
        );''
      case 'collection':
        return await processCollectionSync(
          id,
          data,
          userId,
          timestamp,
          version,
          isDeleted'
        );''
      case 'user':
        return await processUserSync(
          id,
          data,
          userId,
          timestamp,
          version,
          isDeleted'
        );''
      case 'annotation':
        return await processAnnotationSync(
          id,
          data,
          userId,
          timestamp,
          version,
          isDeleted
        );'
      default:''
        return { success: false, error: '?�知?��?步�??? };
    }
  } catch (error) {
    logger.error(`?��??�步?�目失�?: ${type} - ${id}`, error);
    return { success: false, error: error.message };
  }
}
/**
 * ?��??��??�步
 */
async function processCardSync(
  id,
  data,
  userId,
  timestamp,
  version,
  isDeleted
) {
  try {
    const existingCard = await db.Card.findOne({
      where: { id, userId },
    });

    if (isDeleted) {
      // ?�除?��?
      if (existingCard) {
        await existingCard.destroy();
        return { success: true };
      }
      return { success: true }; // 已�?不�???    }
    if (existingCard) {
      // ?�新?��??��?
      if (existingCard.updatedAt.getTime() > timestamp) {
        // ?��??��??�更?��?返�?衝�?
        return {
          success: false,
          conflict: true,
          serverData: existingCard.toJSON(),
        };
      }
      await existingCard.update({
        ...data,
        updatedAt: new Date(timestamp),
      });
    } else {
      // ?�建?�卡??      await db.Card.create({
        id,
        userId,
        ...data,
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp),
      });
    }
    return { success: true };
  } catch (error) {
    throw error;
  }
}
/**
 * ?��??��??�步
 */
async function processCollectionSync(
  id,
  data,
  userId,
  timestamp,
  version,
  isDeleted
) {
  try {
    const existingCollection = await db.Collection.findOne({
      where: { id, userId },
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
          serverData: existingCollection.toJSON(),
        };
      }
      await existingCollection.update({
        ...data,
        updatedAt: new Date(timestamp),
      });
    } else {
      await db.Collection.create({
        id,
        userId,
        ...data,
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp),
      });
    }
    return { success: true };
  } catch (error) {
    throw error;
  }
}
/**
 * ?��??�戶?��??�步
 */
async function processUserSync(
  id,
  data,
  userId,
  timestamp,
  version,
  isDeleted
) {
  try {
    const existingUser = await db.User.findByPk(userId);'
    if (!existingUser) {''
      return { success: false, error: '?�戶不�??? };'
    }
    // ?�更?��?許�?步�??�戶Field''
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
        updatedAt: new Date(timestamp),
      });
    }
    return { success: true };
  } catch (error) {
    throw error;
  }
}
/**
 * ?��?註�??�步
 */
async function processAnnotationSync(
  id,
  data,
  userId,
  timestamp,
  version,
  isDeleted
) {
  try {
    const existingAnnotation = await db.Annotation.findOne({
      where: { id, userId },
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
          serverData: existingAnnotation.toJSON(),
        };
      }
      await existingAnnotation.update({
        ...data,
        updatedAt: new Date(timestamp),
      });
    } else {
      await db.Annotation.create({
        id,
        userId,
        ...data,
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp),
      });
    }
    return { success: true };
  } catch (error) {
    throw error;
  }
}
/**
 * ?��??��??�端變更
 */
async function getServerChanges(userId, lastSyncTime) {
  const changes = [];
  const syncTime = new Date(lastSyncTime);

  try {
    // ?��??��?變更
    const cardChanges = await db.Card.findAll({
      where: {
        userId,
        updatedAt: {
          [db.Sequelize.Op.gt]: syncTime,
        },
      },
    });

    cardChanges.forEach((card) => {
      changes.push({'
        id: card.id,''
        type: 'card',
        data: card.toJSON(),
        timestamp: card.updatedAt.getTime(),
        version: card.updatedAt.getTime(),
      });
    });

    // ?��??��?變更
    const collectionChanges = await db.Collection.findAll({
      where: {
        userId,
        updatedAt: {
          [db.Sequelize.Op.gt]: syncTime,
        },
      },
    });

    collectionChanges.forEach((collection) => {
      changes.push({'
        id: collection.id,''
        type: 'collection',
        data: collection.toJSON(),
        timestamp: collection.updatedAt.getTime(),
        version: collection.updatedAt.getTime(),
      });
    });

    // ?��?註�?變更
    const annotationChanges = await db.Annotation.findAll({
      where: {
        userId,
        updatedAt: {
          [db.Sequelize.Op.gt]: syncTime,
        },
      },
    });

    annotationChanges.forEach((annotation) => {
      changes.push({'
        id: annotation.id,''
        type: 'annotation',
        data: annotation.toJSON(),
        timestamp: annotation.updatedAt.getTime(),
        version: annotation.updatedAt.getTime(),
      });
    });

    logger.info(`?��???${changes.length} ?��??�器變更`);
    return changes;'
  } catch (error) {''
    logger.error('?��??��??��??�失??', error);
    return [];
  }
}
/**
 * ?��??�步?�?? * GET /api/sync/status'
 */''
router.get('/status', authenticateToken, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const userId = req.user.id;

    // ?��??�戶?��?後�?步�???// eslint-disable-next-line no-unused-vars
    const user = await db.User.findByPk(userId);
// eslint-disable-next-line no-unused-vars
    const lastSyncTime = user.lastSyncTime || 0;

    // ?��?待�?步�??�數?��??�裡?�以實現?��??��??�輯�?    const pendingCount = 0; // ?��?設為0，可以Root?�實?��?求實??
    res.json({
      success: true,
      lastSyncTime,
      pendingCount,
      serverVersion: Date.now(),
    });'
  } catch (error) {''
    logger.error('?��??�步?�?�失??', error);
    res.status(500).json({'
      success: false,''
      error: '?��??�內?�錯�?,
    });
  }
});'
module.exports = router;''