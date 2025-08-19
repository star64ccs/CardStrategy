const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// 導入模型
const getCollectionModel = require('../models/Collection');
const getCollectionCardModel = require('../models/CollectionCard');
const getCardModel = require('../models/Card');
const getUserModel = require('../models/User');

// 設置模型關聯
const setupAssociations = () => {
  const Collection = getCollectionModel();
  const CollectionCard = getCollectionCardModel();
  const Card = getCardModel();
  const User = getUserModel();

  if (Collection && CollectionCard && Card && User) {
    // Collection 關聯
    Collection.hasMany(CollectionCard, { foreignKey: 'collectionId', as: 'collectionCards' });
    Collection.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // CollectionCard 關聯
    CollectionCard.belongsTo(Collection, { foreignKey: 'collectionId', as: 'collection' });
    CollectionCard.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    // Card 關聯
    Card.hasMany(CollectionCard, { foreignKey: 'cardId', as: 'collectionCards' });
  }
};

const router = express.Router();

// @route   GET /api/collections
// @desc    獲取用戶的收藏列表
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const Collection = getCollectionModel();
    const CollectionCard = getCollectionCardModel();
    const Card = getCardModel();
    const User = getUserModel();

    if (!Collection || !CollectionCard || !Card || !User) {
      throw new Error('無法獲取模型');
    }

    // 設置關聯
    Collection.hasMany(CollectionCard, { foreignKey: 'collectionId', as: 'collectionCards' });
    Collection.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    CollectionCard.belongsTo(Collection, { foreignKey: 'collectionId', as: 'collection' });
    CollectionCard.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });
    Card.hasMany(CollectionCard, { foreignKey: 'cardId', as: 'collectionCards' });

    const { page = 1, limit = 10, search, isPublic } = req.query;
    const offset = (page - 1) * limit;

    // 構建查詢條件
    const whereClause = {
      userId: req.user.id,
      isActive: true
    };

    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    if (isPublic !== undefined) {
      whereClause.isPublic = isPublic === 'true';
    }

    const { count, rows: collections } = await Collection.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: getCollectionCardModel(),
          as: 'collectionCards',
          include: [
            {
              model: getCardModel(),
              as: 'card',
              attributes: ['id', 'name', 'imageUrl', 'currentPrice', 'rarity']
            }
          ]
        }
      ]
    });

    // 計算統計信息
    const collectionsWithStats = collections.map(collection => {
      const totalCards = collection.collectionCards.reduce((sum, cc) => sum + cc.quantity, 0);
      const totalValue = collection.collectionCards.reduce((sum, cc) => {
        return sum + (cc.quantity * (cc.card?.currentPrice || 0));
      }, 0);
      const averagePrice = totalCards > 0 ? totalValue / totalCards : 0;

      return {
        ...collection.toJSON(),
        statistics: {
          totalCards,
          totalValue,
          averagePrice,
          mostExpensiveCard: collection.collectionCards.length > 0 ?
            collection.collectionCards.reduce((max, cc) =>
              ((cc.card?.currentPrice || 0) > (max.card?.currentPrice || 0) ? cc : max)
            ).card : null,
          rarestCard: collection.collectionCards.length > 0 ?
            collection.collectionCards.reduce((rarest, cc) => {
              const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3, 'mythic': 4, 'special': 5 };
              const currentRarity = rarityOrder[cc.card?.rarity] || 0;
              const rarestRarity = rarityOrder[rarest.card?.rarity] || 0;
              return currentRarity > rarestRarity ? cc : rarest;
            }).card : null
        }
      };
    });

    logger.info(`獲取收藏列表: ${req.user.username} - 共 ${count} 個收藏`);

    res.json({
      success: true,
      data: {
        collections: collectionsWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('獲取收藏列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取收藏列表失敗',
      code: 'GET_COLLECTIONS_FAILED'
    });
  }
});

// @route   POST /api/collections
// @desc    創建新收藏
// @access  Private
router.post('/', protect, [
  body('name').isLength({ min: 1, max: 100 }).withMessage('收藏名稱必須在1-100個字符之間'),
  body('description').optional().isLength({ max: 500 }).withMessage('描述最多500個字符'),
  body('isPublic').optional().isBoolean(),
  body('coverImage').optional().isURL().withMessage('封面圖片必須是有效的URL'),
  body('tags').optional().isArray().withMessage('標籤必須是數組格式')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入驗證失敗',
        code: 'VALIDATION_ERROR',
        errors: errors.array()
      });
    }

    const Collection = getCollectionModel();
    if (!Collection) {
      throw new Error('無法獲取收藏模型');
    }

    const { name, description, isPublic = false, coverImage, tags = [] } = req.body;

    // 檢查收藏名稱是否已存在
    const existingCollection = await Collection.findOne({
      where: {
        userId: req.user.id,
        name,
        isActive: true
      }
    });

    if (existingCollection) {
      return res.status(400).json({
        success: false,
        message: '收藏名稱已存在',
        code: 'COLLECTION_NAME_EXISTS'
      });
    }

    const newCollection = await Collection.create({
      userId: req.user.id,
      name,
      description: description || '',
      isPublic,
      coverImage,
      tags,
      statistics: {
        totalCards: 0,
        totalValue: 0,
        averagePrice: 0,
        mostExpensiveCard: null,
        rarestCard: null
      }
    });

    logger.info(`創建收藏: ${req.user.username} 創建了 "${name}"`);

    res.status(201).json({
      success: true,
      message: '收藏創建成功',
      data: { collection: newCollection }
    });
  } catch (error) {
    logger.error('創建收藏錯誤:', error);
    res.status(500).json({
      success: false,
      message: '創建收藏失敗',
      code: 'CREATE_COLLECTION_FAILED'
    });
  }
});

// @route   GET /api/collections/public/list
// @desc    獲取公開收藏列表
// @access  Public
router.get('/public/list', async (req, res) => {
  try {
    const Collection = getCollectionModel();
    const CollectionCard = getCollectionCardModel();
    const Card = getCardModel();
    const User = getUserModel();

    if (!Collection || !CollectionCard || !Card || !User) {
      throw new Error('無法獲取模型');
    }

    // 設置關聯
    Collection.hasMany(CollectionCard, { foreignKey: 'collectionId', as: 'collectionCards' });
    Collection.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    CollectionCard.belongsTo(Collection, { foreignKey: 'collectionId', as: 'collection' });
    CollectionCard.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });
    Card.hasMany(CollectionCard, { foreignKey: 'cardId', as: 'collectionCards' });

    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    // 構建查詢條件
    const whereClause = {
      isPublic: true,
      isActive: true
    };

    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    const { count, rows: collections } = await Collection.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: getUserModel(),
          as: 'user',
          attributes: ['id', 'username', 'displayName']
        },
        {
          model: getCollectionCardModel(),
          as: 'collectionCards',
          include: [
            {
              model: getCardModel(),
              as: 'card',
              attributes: ['id', 'name', 'imageUrl', 'currentPrice', 'rarity']
            }
          ]
        }
      ]
    });

    // 計算統計信息
    const collectionsWithStats = collections.map(collection => {
      const totalCards = collection.collectionCards.reduce((sum, cc) => sum + cc.quantity, 0);
      const totalValue = collection.collectionCards.reduce((sum, cc) => {
        return sum + (cc.quantity * (cc.card?.currentPrice || 0));
      }, 0);
      const averagePrice = totalCards > 0 ? totalValue / totalCards : 0;

      return {
        ...collection.toJSON(),
        statistics: {
          totalCards,
          totalValue,
          averagePrice
        }
      };
    });

    logger.info(`獲取公開收藏列表: 共 ${count} 個收藏`);

    res.json({
      success: true,
      data: {
        collections: collectionsWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('獲取公開收藏列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取公開收藏列表失敗',
      code: 'GET_PUBLIC_COLLECTIONS_FAILED'
    });
  }
});

// @route   GET /api/collections/:id
// @desc    獲取收藏詳情
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const Collection = getCollectionModel();
    if (!Collection) {
      throw new Error('無法獲取收藏模型');
    }

    const { id } = req.params;

    const collection = await Collection.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true
      },
      include: [
        {
          model: getCollectionCardModel(),
          as: 'collectionCards',
          include: [
            {
              model: getCardModel(),
              as: 'card',
              attributes: ['id', 'name', 'imageUrl', 'currentPrice', 'rarity', 'cardType', 'setName']
            }
          ]
        }
      ]
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '收藏不存在',
        code: 'COLLECTION_NOT_FOUND'
      });
    }

    // 計算統計信息
    const totalCards = collection.collectionCards.reduce((sum, cc) => sum + cc.quantity, 0);
    const totalValue = collection.collectionCards.reduce((sum, cc) => {
      return sum + (cc.quantity * (cc.card?.currentPrice || 0));
    }, 0);
    const averagePrice = totalCards > 0 ? totalValue / totalCards : 0;

    const collectionData = {
      ...collection.toJSON(),
      statistics: {
        totalCards,
        totalValue,
        averagePrice,
        mostExpensiveCard: collection.collectionCards.length > 0 ?
          collection.collectionCards.reduce((max, cc) =>
            ((cc.card?.currentPrice || 0) > (max.card?.currentPrice || 0) ? cc : max)
          ).card : null,
        rarestCard: collection.collectionCards.length > 0 ?
          collection.collectionCards.reduce((rarest, cc) => {
            const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3, 'mythic': 4, 'special': 5 };
            const currentRarity = rarityOrder[cc.card?.rarity] || 0;
            const rarestRarity = rarityOrder[rarest.card?.rarity] || 0;
            return currentRarity > rarestRarity ? cc : rarest;
          }).card : null
      }
    };

    logger.info(`獲取收藏詳情: ${req.user.username} 查看 "${collection.name}"`);

    res.json({
      success: true,
      data: { collection: collectionData }
    });
  } catch (error) {
    logger.error('獲取收藏詳情錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取收藏詳情失敗',
      code: 'GET_COLLECTION_FAILED'
    });
  }
});

// @route   PUT /api/collections/:id
// @desc    更新收藏
// @access  Private
router.put('/:id', protect, [
  body('name').optional().isLength({ min: 1, max: 100 }).withMessage('收藏名稱必須在1-100個字符之間'),
  body('description').optional().isLength({ max: 500 }).withMessage('描述最多500個字符'),
  body('isPublic').optional().isBoolean(),
  body('coverImage').optional().isURL().withMessage('封面圖片必須是有效的URL'),
  body('tags').optional().isArray().withMessage('標籤必須是數組格式')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入驗證失敗',
        code: 'VALIDATION_ERROR',
        errors: errors.array()
      });
    }

    const Collection = getCollectionModel();
    if (!Collection) {
      throw new Error('無法獲取收藏模型');
    }

    const { id } = req.params;
    const { name, description, isPublic, coverImage, tags } = req.body;

    const collection = await Collection.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true
      }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '收藏不存在',
        code: 'COLLECTION_NOT_FOUND'
      });
    }

    // 如果更新名稱，檢查是否與其他收藏重複
    if (name && name !== collection.name) {
      const existingCollection = await Collection.findOne({
        where: {
          userId: req.user.id,
          name,
          isActive: true,
          id: { [Op.ne]: id }
        }
      });

      if (existingCollection) {
        return res.status(400).json({
          success: false,
          message: '收藏名稱已存在',
          code: 'COLLECTION_NAME_EXISTS'
        });
      }
    }

    // 更新收藏
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (tags !== undefined) updateData.tags = tags;

    await collection.update(updateData);

    logger.info(`更新收藏: ${req.user.username} 更新了 "${collection.name}"`);

    res.json({
      success: true,
      message: '收藏更新成功',
      data: { collection }
    });
  } catch (error) {
    logger.error('更新收藏錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新收藏失敗',
      code: 'UPDATE_COLLECTION_FAILED'
    });
  }
});

// @route   DELETE /api/collections/:id
// @desc    刪除收藏（軟刪除）
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const Collection = getCollectionModel();
    if (!Collection) {
      throw new Error('無法獲取收藏模型');
    }

    const { id } = req.params;

    const collection = await Collection.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true
      }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '收藏不存在',
        code: 'COLLECTION_NOT_FOUND'
      });
    }

    // 軟刪除收藏
    await collection.update({ isActive: false });

    logger.info(`刪除收藏: ${req.user.username} 刪除了 "${collection.name}"`);

    res.json({
      success: true,
      message: '收藏刪除成功'
    });
  } catch (error) {
    logger.error('刪除收藏錯誤:', error);
    res.status(500).json({
      success: false,
      message: '刪除收藏失敗',
      code: 'DELETE_COLLECTION_FAILED'
    });
  }
});

// @route   POST /api/collections/:id/cards
// @desc    添加卡牌到收藏
// @access  Private
router.post('/:id/cards', protect, [
  body('cardId').isInt().withMessage('卡牌ID必須是整數'),
  body('quantity').isInt({ min: 1 }).withMessage('數量必須大於0'),
  body('condition').optional().isIn(['mint', 'near-mint', 'excellent', 'good', 'light-played', 'played', 'poor']),
  body('notes').optional().isLength({ max: 200 }).withMessage('備註最多200個字符'),
  body('isFoil').optional().isBoolean(),
  body('isSigned').optional().isBoolean(),
  body('isGraded').optional().isBoolean(),
  body('grade').optional().isLength({ max: 10 }).withMessage('評級最多10個字符')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入驗證失敗',
        code: 'VALIDATION_ERROR',
        errors: errors.array()
      });
    }

    const Collection = getCollectionModel();
    const CollectionCard = getCollectionCardModel();
    const Card = getCardModel();

    if (!Collection || !CollectionCard || !Card) {
      throw new Error('無法獲取模型');
    }

    const { id } = req.params;
    const {
      cardId,
      quantity,
      condition = 'near-mint',
      notes = '',
      isFoil = false,
      isSigned = false,
      isGraded = false,
      grade = null
    } = req.body;

    // 檢查收藏是否存在
    const collection = await Collection.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true
      }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '收藏不存在',
        code: 'COLLECTION_NOT_FOUND'
      });
    }

    // 檢查卡牌是否存在
    const card = await Card.findByPk(cardId);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: '卡牌不存在',
        code: 'CARD_NOT_FOUND'
      });
    }

    // 檢查卡牌是否已存在於收藏中
    const existingCollectionCard = await CollectionCard.findOne({
      where: {
        collectionId: id,
        cardId
      }
    });

    if (existingCollectionCard) {
      // 更新現有卡牌
      await existingCollectionCard.update({
        quantity: existingCollectionCard.quantity + quantity,
        notes: notes || existingCollectionCard.notes,
        condition: condition || existingCollectionCard.condition,
        isFoil: isFoil !== undefined ? isFoil : existingCollectionCard.isFoil,
        isSigned: isSigned !== undefined ? isSigned : existingCollectionCard.isSigned,
        isGraded: isGraded !== undefined ? isGraded : existingCollectionCard.isGraded,
        grade: grade || existingCollectionCard.grade
      });

      logger.info(`更新收藏卡牌: ${req.user.username} 在 "${collection.name}" 中更新了卡牌 ${card.name}`);
    } else {
      // 添加新卡牌
      await CollectionCard.create({
        collectionId: id,
        cardId,
        quantity,
        condition,
        notes,
        isFoil,
        isSigned,
        isGraded,
        grade,
        estimatedValue: card.currentPrice * quantity
      });

      logger.info(`添加卡牌到收藏: ${req.user.username} 在 "${collection.name}" 中添加了卡牌 ${card.name}`);
    }

    // 獲取更新後的收藏詳情
    const updatedCollection = await Collection.findOne({
      where: { id },
      include: [
        {
          model: CollectionCard,
          as: 'collectionCards',
          include: [
            {
              model: Card,
              as: 'card',
              attributes: ['id', 'name', 'imageUrl', 'currentPrice', 'rarity']
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: '卡牌添加成功',
      data: { collection: updatedCollection }
    });
  } catch (error) {
    logger.error('添加卡牌到收藏錯誤:', error);
    res.status(500).json({
      success: false,
      message: '添加卡牌失敗',
      code: 'ADD_CARD_FAILED'
    });
  }
});

// @route   PUT /api/collections/:id/cards/:cardId
// @desc    更新收藏中的卡牌
// @access  Private
router.put('/:id/cards/:cardId', protect, [
  body('quantity').optional().isInt({ min: 1 }).withMessage('數量必須大於0'),
  body('condition').optional().isIn(['mint', 'near-mint', 'excellent', 'good', 'light-played', 'played', 'poor']),
  body('notes').optional().isLength({ max: 200 }).withMessage('備註最多200個字符'),
  body('isFoil').optional().isBoolean(),
  body('isSigned').optional().isBoolean(),
  body('isGraded').optional().isBoolean(),
  body('grade').optional().isLength({ max: 10 }).withMessage('評級最多10個字符')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入驗證失敗',
        code: 'VALIDATION_ERROR',
        errors: errors.array()
      });
    }

    const Collection = getCollectionModel();
    const CollectionCard = getCollectionCardModel();
    const Card = getCardModel();

    if (!Collection || !CollectionCard || !Card) {
      throw new Error('無法獲取模型');
    }

    const { id, cardId } = req.params;
    const {
      quantity,
      condition,
      notes,
      isFoil,
      isSigned,
      isGraded,
      grade
    } = req.body;

    // 檢查收藏是否存在
    const collection = await Collection.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true
      }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '收藏不存在',
        code: 'COLLECTION_NOT_FOUND'
      });
    }

    // 檢查卡牌是否在收藏中
    const collectionCard = await CollectionCard.findOne({
      where: {
        collectionId: id,
        cardId
      },
      include: [
        {
          model: Card,
          as: 'card'
        }
      ]
    });

    if (!collectionCard) {
      return res.status(404).json({
        success: false,
        message: '卡牌不存在於此收藏中',
        code: 'CARD_NOT_IN_COLLECTION'
      });
    }

    // 更新卡牌信息
    const updateData = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (condition !== undefined) updateData.condition = condition;
    if (notes !== undefined) updateData.notes = notes;
    if (isFoil !== undefined) updateData.isFoil = isFoil;
    if (isSigned !== undefined) updateData.isSigned = isSigned;
    if (isGraded !== undefined) updateData.isGraded = isGraded;
    if (grade !== undefined) updateData.grade = grade;

    // 如果數量改變，更新估算價值
    if (quantity !== undefined) {
      updateData.estimatedValue = collectionCard.card.currentPrice * quantity;
    }

    await collectionCard.update(updateData);

    logger.info(`更新收藏卡牌: ${req.user.username} 在 "${collection.name}" 中更新了卡牌 ${collectionCard.card.name}`);

    res.json({
      success: true,
      message: '卡牌更新成功',
      data: { collectionCard }
    });
  } catch (error) {
    logger.error('更新收藏卡牌錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新卡牌失敗',
      code: 'UPDATE_CARD_FAILED'
    });
  }
});

// @route   DELETE /api/collections/:id/cards/:cardId
// @desc    從收藏中移除卡牌
// @access  Private
router.delete('/:id/cards/:cardId', protect, async (req, res) => {
  try {
    const Collection = getCollectionModel();
    const CollectionCard = getCollectionCardModel();
    const Card = getCardModel();

    if (!Collection || !CollectionCard || !Card) {
      throw new Error('無法獲取模型');
    }

    const { id, cardId } = req.params;

    // 檢查收藏是否存在
    const collection = await Collection.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true
      }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '收藏不存在',
        code: 'COLLECTION_NOT_FOUND'
      });
    }

    // 檢查卡牌是否在收藏中
    const collectionCard = await CollectionCard.findOne({
      where: {
        collectionId: id,
        cardId
      },
      include: [
        {
          model: Card,
          as: 'card'
        }
      ]
    });

    if (!collectionCard) {
      return res.status(404).json({
        success: false,
        message: '卡牌不存在於此收藏中',
        code: 'CARD_NOT_IN_COLLECTION'
      });
    }

    // 刪除卡牌
    await collectionCard.destroy();

    logger.info(`從收藏移除卡牌: ${req.user.username} 從 "${collection.name}" 中移除了卡牌 ${collectionCard.card.name}`);

    res.json({
      success: true,
      message: '卡牌移除成功'
    });
  } catch (error) {
    logger.error('從收藏移除卡牌錯誤:', error);
    res.status(500).json({
      success: false,
      message: '移除卡牌失敗',
      code: 'REMOVE_CARD_FAILED'
    });
  }
});

module.exports = router;
