const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const db = require('../models');

/**
 * å¢é??Œæ­¥ API
 * POST /api/sync/incremental
 */
router.post('/incremental', authenticateToken, async (req, res) => {
  try {
    const { batch, lastSyncTime, clientVersion } = req.body;
// eslint-disable-next-line no-unused-vars
    const userId = req.user.id;

    logger.info(`?‹å??•ç??¨æˆ¶ ${userId} ?„å??å?æ­¥è?æ±‚`);

    if (!batch || !batch.items || !Array.isArray(batch.items)) {
      return res.status(400).json({
        success: false,
        error: '?¡æ??„å?æ­¥æ‰¹æ¬¡æ ¼å¼?,
      });
    }

// eslint-disable-next-line no-unused-vars
    const results = {
      processed: 0,
      conflicts: 0,
      errors: 0,
      serverChanges: [],
    };

    // ?•ç?å®¢æˆ¶ç«¯è???    for (const item of batch.items) {
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
        logger.error(`?•ç??Œæ­¥?…ç›®å¤±æ?: ${item.id}`, error);
        results.errors++;
      }
    }

    // ?²å??å??¨ç«¯?„è??´ï??ªå?ä¸Šæ¬¡?Œæ­¥ä»¥ä?ï¼?    const serverChanges = await getServerChanges(userId, lastSyncTime);

    logger.info(
      `?Œæ­¥å®Œæ? - ?•ç?: ${results.processed}, è¡ç?: ${results.conflicts}, ?¯èª¤: ${results.errors}`
    );

    res.json({
      success: true,
      results,
      serverChanges,
      serverVersion: Date.now(),
    });
  } catch (error) {
    logger.error('å¢é??Œæ­¥?•ç?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?å??¨å…§?¨éŒ¯èª?,
    });
  }
});

/**
 * ?•ç??®å€‹å?æ­¥é??? */
async function processSyncItem(item, userId, lastSyncTime) {
  const { id, type, data, timestamp, version, isDeleted } = item;

  try {
    switch (type) {
      case 'card':
        return await processCardSync(
          id,
          data,
          userId,
          timestamp,
          version,
          isDeleted
        );
      case 'collection':
        return await processCollectionSync(
          id,
          data,
          userId,
          timestamp,
          version,
          isDeleted
        );
      case 'user':
        return await processUserSync(
          id,
          data,
          userId,
          timestamp,
          version,
          isDeleted
        );
      case 'annotation':
        return await processAnnotationSync(
          id,
          data,
          userId,
          timestamp,
          version,
          isDeleted
        );
      default:
        return { success: false, error: '?ªçŸ¥?„å?æ­¥é??? };
    }
  } catch (error) {
    logger.error(`?•ç??Œæ­¥?…ç›®å¤±æ?: ${type} - ${id}`, error);
    return { success: false, error: error.message };
  }
}

/**
 * ?•ç??¡ç??Œæ­¥
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
      // ?ªé™¤?ä?
      if (existingCard) {
        await existingCard.destroy();
        return { success: true };
      }
      return { success: true }; // å·²ç?ä¸å???    }

    if (existingCard) {
      // ?´æ–°?¾æ??¡ç?
      if (existingCard.updatedAt.getTime() > timestamp) {
        // ?å??¨ç??¬æ›´?°ï?è¿”å?è¡ç?
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
      // ?µå»º?°å¡??      await db.Card.create({
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
 * ?•ç??¶è??Œæ­¥
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
 * ?•ç??¨æˆ¶?¸æ??Œæ­¥
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
    const existingUser = await db.User.findByPk(userId);

    if (!existingUser) {
      return { success: false, error: '?¨æˆ¶ä¸å??? };
    }

    // ?ªæ›´?°å?è¨±å?æ­¥ç??¨æˆ¶å­—æ®µ
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
 * ?•ç?è¨»é??Œæ­¥
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
 * ?²å??å??¨ç«¯è®Šæ›´
 */
async function getServerChanges(userId, lastSyncTime) {
  const changes = [];
  const syncTime = new Date(lastSyncTime);

  try {
    // ?²å??¡ç?è®Šæ›´
    const cardChanges = await db.Card.findAll({
      where: {
        userId,
        updatedAt: {
          [db.Sequelize.Op.gt]: syncTime,
        },
      },
    });

    cardChanges.forEach((card) => {
      changes.push({
        id: card.id,
        type: 'card',
        data: card.toJSON(),
        timestamp: card.updatedAt.getTime(),
        version: card.updatedAt.getTime(),
      });
    });

    // ?²å??¶è?è®Šæ›´
    const collectionChanges = await db.Collection.findAll({
      where: {
        userId,
        updatedAt: {
          [db.Sequelize.Op.gt]: syncTime,
        },
      },
    });

    collectionChanges.forEach((collection) => {
      changes.push({
        id: collection.id,
        type: 'collection',
        data: collection.toJSON(),
        timestamp: collection.updatedAt.getTime(),
        version: collection.updatedAt.getTime(),
      });
    });

    // ?²å?è¨»é?è®Šæ›´
    const annotationChanges = await db.Annotation.findAll({
      where: {
        userId,
        updatedAt: {
          [db.Sequelize.Op.gt]: syncTime,
        },
      },
    });

    annotationChanges.forEach((annotation) => {
      changes.push({
        id: annotation.id,
        type: 'annotation',
        data: annotation.toJSON(),
        timestamp: annotation.updatedAt.getTime(),
        version: annotation.updatedAt.getTime(),
      });
    });

    logger.info(`?²å???${changes.length} ?‹æ??™å™¨è®Šæ›´`);
    return changes;
  } catch (error) {
    logger.error('?²å??å??¨è??´å¤±??', error);
    return [];
  }
}

/**
 * ?²å??Œæ­¥?€?? * GET /api/sync/status
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const userId = req.user.id;

    // ?²å??¨æˆ¶?„æ?å¾Œå?æ­¥æ???// eslint-disable-next-line no-unused-vars
    const user = await db.User.findByPk(userId);
// eslint-disable-next-line no-unused-vars
    const lastSyncTime = user.lastSyncTime || 0;

    // ?²å?å¾…å?æ­¥é??®æ•¸?ï??™è£¡?¯ä»¥å¯¦ç¾?´è??œç??è¼¯ï¼?    const pendingCount = 0; // ?«æ?è¨­ç‚º0ï¼Œå¯ä»¥æ ¹?šå¯¦?›é?æ±‚å¯¦??
    res.json({
      success: true,
      lastSyncTime,
      pendingCount,
      serverVersion: Date.now(),
    });
  } catch (error) {
    logger.error('?²å??Œæ­¥?€?‹å¤±??', error);
    res.status(500).json({
      success: false,
      error: '?å??¨å…§?¨éŒ¯èª?,
    });
  }
});

module.exports = router;
