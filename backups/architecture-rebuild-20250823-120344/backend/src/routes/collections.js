const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { authenticateToken: protect, authorize } = require('../middleware/auth');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

// 導入模�?
const getCollectionModel = require('../models/Collection');
const getCollectionCardModel = require('../models/CollectionCard');
// eslint-disable-next-line no-unused-vars
const getCardModel = require('../models/Card');
const getUserModel = require('../models/User');

// 設置模�??�聯
const setupAssociations = () => {
  const Collection = getCollectionModel();
  const CollectionCard = getCollectionCardModel();
// eslint-disable-next-line no-unused-vars
  const Card = getCardModel();
  const User = getUserModel();

  if (Collection && CollectionCard && Card && User) {
    // Collection ?�聯
    Collection.hasMany(CollectionCard, {
      foreignKey: 'collectionId',
      as: 'collectionCards',
    });
    Collection.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // CollectionCard ?�聯
    CollectionCard.belongsTo(Collection, {
      foreignKey: 'collectionId',
      as: 'collection',
    });
    CollectionCard.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    // Card ?�聯
    Card.hasMany(CollectionCard, {
      foreignKey: 'cardId',
      as: 'collectionCards',
    });
  }
};

const router = express.Router();

// @route   GET /api/collections
// @desc    ?��??�戶?�收?��?�?// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const Collection = getCollectionModel();
    const CollectionCard = getCollectionCardModel();
// eslint-disable-next-line no-unused-vars
    const Card = getCardModel();
    const User = getUserModel();

    if (!Collection || !CollectionCard || !Card || !User) {
      throw new Error('?��??��?模�?');
    }

    // 設置?�聯
    Collection.hasMany(CollectionCard, {
      foreignKey: 'collectionId',
      as: 'collectionCards',
    });
    Collection.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    CollectionCard.belongsTo(Collection, {
      foreignKey: 'collectionId',
      as: 'collection',
    });
    CollectionCard.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });
    Card.hasMany(CollectionCard, {
      foreignKey: 'cardId',
      as: 'collectionCards',
    });

    const { page = 1, limit = 10, search, isPublic } = req.query;
    const offset = (page - 1) * limit;

    // 構建?�詢條件
    const whereClause = {
      userId: req.user.id,
      isActive: true,
    };

    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`,
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
              attributes: ['id', 'name', 'imageUrl', 'currentPrice', 'rarity'],
            },
          ],
        },
      ],
    });

    // 計�?統�?信息
    const collectionsWithStats = collections.map((collection) => {
      const totalCards = collection.collectionCards.reduce(
        (sum, cc) => sum + cc.quantity,
        0
      );
      const totalValue = collection.collectionCards.reduce((sum, cc) => {
        return sum + cc.quantity * (cc.card?.currentPrice || 0);
      }, 0);
      const averagePrice = totalCards > 0 ? totalValue / totalCards : 0;

      return {
        ...collection.toJSON(),
        statistics: {
          totalCards,
          totalValue,
          averagePrice,
          mostExpensiveCard:
            collection.collectionCards.length > 0
              ? collection.collectionCards.reduce((max, cc) =>
                  (cc.card?.currentPrice || 0) > (max.card?.currentPrice || 0)
                    ? cc
                    : max
                ).card
              : null,
          rarestCard:
            collection.collectionCards.length > 0
              ? collection.collectionCards.reduce((rarest, cc) => {
                  const rarityOrder = {
                    common: 1,
                    uncommon: 2,
                    rare: 3,
                    mythic: 4,
                    special: 5,
                  };
                  const currentRarity = rarityOrder[cc.card?.rarity] || 0;
                  const rarestRarity = rarityOrder[rarest.card?.rarity] || 0;
                  return currentRarity > rarestRarity ? cc : rarest;
                }).card
              : null,
        },
      };
    });

    logger.info(`?��??��??�表: ${req.user.username} - ??${count} ?�收?�`);

    res.json({
      success: true,
      data: {
        collections: collectionsWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    logger.error('?��??��??�表?�誤:', error);
    res.status(500).json({
      success: false,
      message: '?��??��??�表失�?',
      code: 'GET_COLLECTIONS_FAILED',
    });
  }
});

// @route   POST /api/collections
// @desc    ?�建?�收??// @access  Private
router.post(
  '/',
  protect,
  [
    body('name')
      .isLength({ min: 1, max: 100 })
      .withMessage('?��??�稱必�???-100?��?符�???),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('?�述?��?00?��?�?),
    body('isPublic').optional().isBoolean(),
    body('coverImage')
      .optional()
      .isURL()
      .withMessage('封面?��?必�??��??��?URL'),
    body('tags').optional().isArray().withMessage('標籤必�??�數組格�?),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗�?失�?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const Collection = getCollectionModel();
      if (!Collection) {
        throw new Error('?��??��??��?模�?');
      }

      const {
        name,
        description,
        isPublic = false,
        coverImage,
        tags = [],
      } = req.body;

      // 檢查?��??�稱?�否已�???      const existingCollection = await Collection.findOne({
        where: {
          userId: req.user.id,
          name,
          isActive: true,
        },
      });

      if (existingCollection) {
        return res.status(400).json({
          success: false,
          message: '?��??�稱已�???,
          code: 'COLLECTION_NAME_EXISTS',
        });
      }

// eslint-disable-next-line no-unused-vars
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
          rarestCard: null,
        },
      });

      logger.info(`?�建?��?: ${req.user.username} ?�建�?"${name}"`);

      res.status(201).json({
        success: true,
        message: '?��??�建?��?',
        data: { collection: newCollection },
      });
    } catch (error) {
      logger.error('?�建?��??�誤:', error);
      res.status(500).json({
        success: false,
        message: '?�建?��?失�?',
        code: 'CREATE_COLLECTION_FAILED',
      });
    }
  }
);

// @route   GET /api/collections/public/list
// @desc    ?��??��??��??�表
// @access  Public
router.get('/public/list', async (req, res) => {
  try {
    const Collection = getCollectionModel();
    const CollectionCard = getCollectionCardModel();
// eslint-disable-next-line no-unused-vars
    const Card = getCardModel();
    const User = getUserModel();

    if (!Collection || !CollectionCard || !Card || !User) {
      throw new Error('?��??��?模�?');
    }

    // 設置?�聯
    Collection.hasMany(CollectionCard, {
      foreignKey: 'collectionId',
      as: 'collectionCards',
    });
    Collection.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    CollectionCard.belongsTo(Collection, {
      foreignKey: 'collectionId',
      as: 'collection',
    });
    CollectionCard.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });
    Card.hasMany(CollectionCard, {
      foreignKey: 'cardId',
      as: 'collectionCards',
    });

    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    // 構建?�詢條件
    const whereClause = {
      isPublic: true,
      isActive: true,
    };

    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`,
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
          attributes: ['id', 'username', 'displayName'],
        },
        {
          model: getCollectionCardModel(),
          as: 'collectionCards',
          include: [
            {
              model: getCardModel(),
              as: 'card',
              attributes: ['id', 'name', 'imageUrl', 'currentPrice', 'rarity'],
            },
          ],
        },
      ],
    });

    // 計�?統�?信息
    const collectionsWithStats = collections.map((collection) => {
      const totalCards = collection.collectionCards.reduce(
        (sum, cc) => sum + cc.quantity,
        0
      );
      const totalValue = collection.collectionCards.reduce((sum, cc) => {
        return sum + cc.quantity * (cc.card?.currentPrice || 0);
      }, 0);
      const averagePrice = totalCards > 0 ? totalValue / totalCards : 0;

      return {
        ...collection.toJSON(),
        statistics: {
          totalCards,
          totalValue,
          averagePrice,
        },
      };
    });

    logger.info(`?��??��??��??�表: ??${count} ?�收?�`);

    res.json({
      success: true,
      data: {
        collections: collectionsWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    logger.error('?��??��??��??�表?�誤:', error);
    res.status(500).json({
      success: false,
      message: '?��??��??��??�表失�?',
      code: 'GET_PUBLIC_COLLECTIONS_FAILED',
    });
  }
});

// @route   GET /api/collections/:id
// @desc    ?��??��?詳�?
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const Collection = getCollectionModel();
    if (!Collection) {
      throw new Error('?��??��??��?模�?');
    }

    const { id } = req.params;

    const collection = await Collection.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true,
      },
      include: [
        {
          model: getCollectionCardModel(),
          as: 'collectionCards',
          include: [
            {
              model: getCardModel(),
              as: 'card',
              attributes: [
                'id',
                'name',
                'imageUrl',
                'currentPrice',
                'rarity',
                'cardType',
                'setName',
              ],
            },
          ],
        },
      ],
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '?��?不�???,
        code: 'COLLECTION_NOT_FOUND',
      });
    }

    // 計�?統�?信息
    const totalCards = collection.collectionCards.reduce(
      (sum, cc) => sum + cc.quantity,
      0
    );
    const totalValue = collection.collectionCards.reduce((sum, cc) => {
      return sum + cc.quantity * (cc.card?.currentPrice || 0);
    }, 0);
    const averagePrice = totalCards > 0 ? totalValue / totalCards : 0;

    const collectionData = {
      ...collection.toJSON(),
      statistics: {
        totalCards,
        totalValue,
        averagePrice,
        mostExpensiveCard:
          collection.collectionCards.length > 0
            ? collection.collectionCards.reduce((max, cc) =>
                (cc.card?.currentPrice || 0) > (max.card?.currentPrice || 0)
                  ? cc
                  : max
              ).card
            : null,
        rarestCard:
          collection.collectionCards.length > 0
            ? collection.collectionCards.reduce((rarest, cc) => {
                const rarityOrder = {
                  common: 1,
                  uncommon: 2,
                  rare: 3,
                  mythic: 4,
                  special: 5,
                };
                const currentRarity = rarityOrder[cc.card?.rarity] || 0;
                const rarestRarity = rarityOrder[rarest.card?.rarity] || 0;
                return currentRarity > rarestRarity ? cc : rarest;
              }).card
            : null,
      },
    };

    logger.info(`?��??��?詳�?: ${req.user.username} ?��? "${collection.name}"`);

    res.json({
      success: true,
      data: { collection: collectionData },
    });
  } catch (error) {
    logger.error('?��??��?詳�??�誤:', error);
    res.status(500).json({
      success: false,
      message: '?��??��?詳�?失�?',
      code: 'GET_COLLECTION_FAILED',
    });
  }
});

// @route   PUT /api/collections/:id
// @desc    ?�新?��?
// @access  Private
router.put(
  '/:id',
  protect,
  [
    body('name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('?��??�稱必�???-100?��?符�???),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('?�述?��?00?��?�?),
    body('isPublic').optional().isBoolean(),
    body('coverImage')
      .optional()
      .isURL()
      .withMessage('封面?��?必�??��??��?URL'),
    body('tags').optional().isArray().withMessage('標籤必�??�數組格�?),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗�?失�?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const Collection = getCollectionModel();
      if (!Collection) {
        throw new Error('?��??��??��?模�?');
      }

      const { id } = req.params;
      const { name, description, isPublic, coverImage, tags } = req.body;

      const collection = await Collection.findOne({
        where: {
          id,
          userId: req.user.id,
          isActive: true,
        },
      });

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: '?��?不�???,
          code: 'COLLECTION_NOT_FOUND',
        });
      }

      // 如�??�新?�稱，檢?�是?��??��??��??��?
      if (name && name !== collection.name) {
        const existingCollection = await Collection.findOne({
          where: {
            userId: req.user.id,
            name,
            isActive: true,
            id: { [Op.ne]: id },
          },
        });

        if (existingCollection) {
          return res.status(400).json({
            success: false,
            message: '?��??�稱已�???,
            code: 'COLLECTION_NAME_EXISTS',
          });
        }
      }

      // ?�新?��?
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (isPublic !== undefined) updateData.isPublic = isPublic;
      if (coverImage !== undefined) updateData.coverImage = coverImage;
      if (tags !== undefined) updateData.tags = tags;

      await collection.update(updateData);

      logger.info(`?�新?��?: ${req.user.username} ?�新�?"${collection.name}"`);

      res.json({
        success: true,
        message: '?��??�新?��?',
        data: { collection },
      });
    } catch (error) {
      logger.error('?�新?��??�誤:', error);
      res.status(500).json({
        success: false,
        message: '?�新?��?失�?',
        code: 'UPDATE_COLLECTION_FAILED',
      });
    }
  }
);

// @route   DELETE /api/collections/:id
// @desc    ?�除?��?（�??�除�?// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const Collection = getCollectionModel();
    if (!Collection) {
      throw new Error('?��??��??��?模�?');
    }

    const { id } = req.params;

    const collection = await Collection.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true,
      },
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '?��?不�???,
        code: 'COLLECTION_NOT_FOUND',
      });
    }

    // 軟刪?�收??    await collection.update({ isActive: false });

    logger.info(`?�除?��?: ${req.user.username} ?�除�?"${collection.name}"`);

    res.json({
      success: true,
      message: '?��??�除?��?',
    });
  } catch (error) {
    logger.error('?�除?��??�誤:', error);
    res.status(500).json({
      success: false,
      message: '?�除?��?失�?',
      code: 'DELETE_COLLECTION_FAILED',
    });
  }
});

// @route   POST /api/collections/:id/cards
// @desc    添�??��??�收??// @access  Private
router.post(
  '/:id/cards',
  protect,
  [
    body('cardId').isInt().withMessage('?��?ID必�??�整??),
    body('quantity').isInt({ min: 1 }).withMessage('?��?必�?大於0'),
    body('condition')
      .optional()
      .isIn([
        'mint',
        'near-mint',
        'excellent',
        'good',
        'light-played',
        'played',
        'poor',
      ]),
    body('notes')
      .optional()
      .isLength({ max: 200 })
      .withMessage('?�註?��?00?��?�?),
    body('isFoil').optional().isBoolean(),
    body('isSigned').optional().isBoolean(),
    body('isGraded').optional().isBoolean(),
    body('grade')
      .optional()
      .isLength({ max: 10 })
      .withMessage('評�??��?0?��?�?),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗�?失�?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const Collection = getCollectionModel();
      const CollectionCard = getCollectionCardModel();
// eslint-disable-next-line no-unused-vars
      const Card = getCardModel();

      if (!Collection || !CollectionCard || !Card) {
        throw new Error('?��??��?模�?');
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
        grade = null,
      } = req.body;

      // 檢查?��??�否存在
      const collection = await Collection.findOne({
        where: {
          id,
          userId: req.user.id,
          isActive: true,
        },
      });

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: '?��?不�???,
          code: 'COLLECTION_NOT_FOUND',
        });
      }

      // 檢查?��??�否存在
      const card = await Card.findByPk(cardId);
      if (!card) {
        return res.status(404).json({
          success: false,
          message: '?��?不�???,
          code: 'CARD_NOT_FOUND',
        });
      }

      // 檢查?��??�否已�??�於?��?�?      const existingCollectionCard = await CollectionCard.findOne({
        where: {
          collectionId: id,
          cardId,
        },
      });

      if (existingCollectionCard) {
        // ?�新?��??��?
        await existingCollectionCard.update({
          quantity: existingCollectionCard.quantity + quantity,
          notes: notes || existingCollectionCard.notes,
          condition: condition || existingCollectionCard.condition,
          isFoil: isFoil !== undefined ? isFoil : existingCollectionCard.isFoil,
          isSigned:
            isSigned !== undefined ? isSigned : existingCollectionCard.isSigned,
          isGraded:
            isGraded !== undefined ? isGraded : existingCollectionCard.isGraded,
          grade: grade || existingCollectionCard.grade,
        });

        logger.info(
          `?�新?��??��?: ${req.user.username} ??"${collection.name}" 中更?��??��? ${card.name}`
        );
      } else {
        // 添�??�卡??        await CollectionCard.create({
          collectionId: id,
          cardId,
          quantity,
          condition,
          notes,
          isFoil,
          isSigned,
          isGraded,
          grade,
          estimatedValue: card.currentPrice * quantity,
        });

        logger.info(
          `添�??��??�收?? ${req.user.username} ??"${collection.name}" 中添?��??��? ${card.name}`
        );
      }

      // ?��??�新後�??��?詳�?
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
                attributes: [
                  'id',
                  'name',
                  'imageUrl',
                  'currentPrice',
                  'rarity',
                ],
              },
            ],
          },
        ],
      });

      res.json({
        success: true,
        message: '?��?添�??��?',
        data: { collection: updatedCollection },
      });
    } catch (error) {
      logger.error('添�??��??�收?�錯�?', error);
      res.status(500).json({
        success: false,
        message: '添�??��?失�?',
        code: 'ADD_CARD_FAILED',
      });
    }
  }
);

// @route   PUT /api/collections/:id/cards/:cardId
// @desc    ?�新?��?中�??��?
// @access  Private
router.put(
  '/:id/cards/:cardId',
  protect,
  [
    body('quantity').optional().isInt({ min: 1 }).withMessage('?��?必�?大於0'),
    body('condition')
      .optional()
      .isIn([
        'mint',
        'near-mint',
        'excellent',
        'good',
        'light-played',
        'played',
        'poor',
      ]),
    body('notes')
      .optional()
      .isLength({ max: 200 })
      .withMessage('?�註?��?00?��?�?),
    body('isFoil').optional().isBoolean(),
    body('isSigned').optional().isBoolean(),
    body('isGraded').optional().isBoolean(),
    body('grade')
      .optional()
      .isLength({ max: 10 })
      .withMessage('評�??��?0?��?�?),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '輸入驗�?失�?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const Collection = getCollectionModel();
      const CollectionCard = getCollectionCardModel();
// eslint-disable-next-line no-unused-vars
      const Card = getCardModel();

      if (!Collection || !CollectionCard || !Card) {
        throw new Error('?��??��?模�?');
      }

      const { id, cardId } = req.params;
      const { quantity, condition, notes, isFoil, isSigned, isGraded, grade } =
        req.body;

      // 檢查?��??�否存在
      const collection = await Collection.findOne({
        where: {
          id,
          userId: req.user.id,
          isActive: true,
        },
      });

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: '?��?不�???,
          code: 'COLLECTION_NOT_FOUND',
        });
      }

      // 檢查?��??�否?�收?�中
      const collectionCard = await CollectionCard.findOne({
        where: {
          collectionId: id,
          cardId,
        },
        include: [
          {
            model: Card,
            as: 'card',
          },
        ],
      });

      if (!collectionCard) {
        return res.status(404).json({
          success: false,
          message: '?��?不�??�於此收?�中',
          code: 'CARD_NOT_IN_COLLECTION',
        });
      }

      // ?�新?��?信息
      const updateData = {};
      if (quantity !== undefined) updateData.quantity = quantity;
      if (condition !== undefined) updateData.condition = condition;
      if (notes !== undefined) updateData.notes = notes;
      if (isFoil !== undefined) updateData.isFoil = isFoil;
      if (isSigned !== undefined) updateData.isSigned = isSigned;
      if (isGraded !== undefined) updateData.isGraded = isGraded;
      if (grade !== undefined) updateData.grade = grade;

      // 如�??��??��?，更?�估算價??      if (quantity !== undefined) {
        updateData.estimatedValue = collectionCard.card.currentPrice * quantity;
      }

      await collectionCard.update(updateData);

      logger.info(
        `?�新?��??��?: ${req.user.username} ??"${collection.name}" 中更?��??��? ${collectionCard.card.name}`
      );

      res.json({
        success: true,
        message: '?��??�新?��?',
        data: { collectionCard },
      });
    } catch (error) {
      logger.error('?�新?��??��??�誤:', error);
      res.status(500).json({
        success: false,
        message: '?�新?��?失�?',
        code: 'UPDATE_CARD_FAILED',
      });
    }
  }
);

// @route   DELETE /api/collections/:id/cards/:cardId
// @desc    從收?�中移除?��?
// @access  Private
router.delete('/:id/cards/:cardId', protect, async (req, res) => {
  try {
    const Collection = getCollectionModel();
    const CollectionCard = getCollectionCardModel();
// eslint-disable-next-line no-unused-vars
    const Card = getCardModel();

    if (!Collection || !CollectionCard || !Card) {
      throw new Error('?��??��?模�?');
    }

    const { id, cardId } = req.params;

    // 檢查?��??�否存在
    const collection = await Collection.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true,
      },
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '?��?不�???,
        code: 'COLLECTION_NOT_FOUND',
      });
    }

    // 檢查?��??�否?�收?�中
    const collectionCard = await CollectionCard.findOne({
      where: {
        collectionId: id,
        cardId,
      },
      include: [
        {
          model: Card,
          as: 'card',
        },
      ],
    });

    if (!collectionCard) {
      return res.status(404).json({
        success: false,
        message: '?��?不�??�於此收?�中',
        code: 'CARD_NOT_IN_COLLECTION',
      });
    }

    // ?�除?��?
    await collectionCard.destroy();

    logger.info(
      `從收?�移?�卡?? ${req.user.username} �?"${collection.name}" 中移?��??��? ${collectionCard.card.name}`
    );

    res.json({
      success: true,
      message: '?��?移除?��?',
    });
  } catch (error) {
    logger.error('從收?�移?�卡?�錯�?', error);
    res.status(500).json({
      success: false,
      message: '移除?��?失�?',
      code: 'REMOVE_CARD_FAILED',
    });
  }
});

module.exports = router;
