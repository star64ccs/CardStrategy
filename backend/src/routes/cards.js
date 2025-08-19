const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { protect, authorize } = require('../middleware/auth');
const getCardModel = require('../models/Card');
const logger = require('../utils/logger');
const getUserModel = require('../models/User');
const databaseOptimizer = require('../services/databaseOptimizer');
const {
  createPostHandler,
  createGetHandler,
  createPutHandler,
  createDeleteHandler,
  createPaginatedHandler,
  createSearchHandler,
  createBatchHandler,
  createCustomError
} = require('../middleware/routeHandler');

const router = express.Router();

// 驗證中間件
const validateCardCreation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('卡片名稱必須在1-100個字符之間'),
  body('setName')
    .isLength({ min: 1, max: 100 })
    .withMessage('系列名稱必須在1-100個字符之間'),
  body('cardNumber')
    .isLength({ min: 1, max: 20 })
    .withMessage('卡片編號必須在1-20個字符之間'),
  body('rarity')
    .isIn(['common', 'uncommon', 'rare', 'mythic', 'special'])
    .withMessage('無效的稀有度'),
  body('cardType')
    .isLength({ min: 1, max: 50 })
    .withMessage('卡片類型必須在1-50個字符之間'),
  body('currentPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('當前價格必須為正數'),
  body('marketPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('市場價格必須為正數'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('請提供有效的圖片URL'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('描述不能超過1000個字符')
];

const validateCardUpdate = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('卡片名稱必須在1-100個字符之間'),
  body('setName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('系列名稱必須在1-100個字符之間'),
  body('cardNumber')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('卡片編號必須在1-20個字符之間'),
  body('rarity')
    .optional()
    .isIn(['common', 'uncommon', 'rare', 'mythic', 'special'])
    .withMessage('無效的稀有度'),
  body('cardType')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('卡片類型必須在1-50個字符之間'),
  body('currentPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('當前價格必須為正數'),
  body('marketPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('市場價格必須為正數'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('請提供有效的圖片URL'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('描述不能超過1000個字符')
];

const validateCardFilters = [
  query('search').optional().isString(),
  query('setName').optional().isString(),
  query('rarity').optional().isIn(['common', 'uncommon', 'rare', 'mythic', 'special']),
  query('cardType').optional().isString(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('sortBy').optional().isIn(['name', 'currentPrice', 'marketPrice', 'rarity', 'setName', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('isActive').optional().isBoolean()
];

// @route   POST /api/cards
// @desc    創建新卡片
// @access  Private (Admin only)
router.post('/', createPostHandler(
  async (req, res) => {
    const Card = getCardModel();
    if (!Card) {
      throw createCustomError('數據庫連接失敗', 500, 'DATABASE_ERROR');
    }

    const {
      name,
      setName,
      cardNumber,
      rarity,
      cardType,
      currentPrice = 0,
      marketPrice = 0,
      imageUrl,
      description,
      metadata = {}
    } = req.body;

    // 檢查卡片是否已存在
    const existingCard = await Card.findOne({
      where: {
        setName,
        cardNumber
      }
    });

    if (existingCard) {
      throw createCustomError('該卡片已存在', 400, 'CARD_EXISTS');
    }

    // 創建新卡片
    const card = await Card.create({
      name,
      setName,
      cardNumber,
      rarity,
      cardType,
      currentPrice,
      marketPrice,
      imageUrl,
      description,
      metadata,
      createdBy: req.user.id,
      isActive: true
    });

    logger.info(`卡片創建成功: ${req.user.username} 創建了卡片 ${card.name}`);

    return {
      success: true,
      message: '卡片創建成功',
      data: { card }
    };
  },
  {
    auth: true,
    validation: validateCardCreation,
    permissions: ['admin']
  }
));

// @route   GET /api/cards
// @desc    獲取卡片列表（支持搜索、過濾、排序、分頁）
// @access  Public
router.get('/', createPaginatedHandler(
  async (filters, pagination, req, res) => {
    const Card = getCardModel();
    if (!Card) {
      throw createCustomError('數據庫連接失敗', 500, 'DATABASE_ERROR');
    }

    const {
      search,
      setName,
      rarity,
      cardType,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      isActive = true
    } = filters;

    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    // 構建查詢條件
    const whereClause = {
      isActive: isActive !== undefined ? isActive : true
    };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { setName: { [Op.iLike]: `%${search}%` } },
        { cardNumber: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (setName) {
      whereClause.setName = { [Op.iLike]: `%${setName}%` };
    }

    if (rarity) {
      whereClause.rarity = rarity;
    }

    if (cardType) {
      whereClause.cardType = { [Op.iLike]: `%${cardType}%` };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.currentPrice = {};
      if (minPrice !== undefined) {
        whereClause.currentPrice[Op.gte] = minPrice;
      }
      if (maxPrice !== undefined) {
        whereClause.currentPrice[Op.lte] = maxPrice;
      }
    }

    // 使用 databaseOptimizer 優化查詢
    const optimizedQuery = databaseOptimizer.optimizeQuery({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // 執行查詢
    const { count, rows: cards } = await Card.findAndCountAll(optimizedQuery);

    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      message: '卡片列表獲取成功',
      data: {
        cards,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages
        }
      }
    };
  },
  { validation: validateCardFilters }
));

// @route   GET /api/cards/:id
// @desc    獲取單張卡片詳情
// @access  Public
router.get('/:id', createGetHandler(
  async (req, res) => {
    const Card = getCardModel();
    if (!Card) {
      throw createCustomError('數據庫連接失敗', 500, 'DATABASE_ERROR');
    }

    const { id } = req.params;

    const card = await Card.findByPk(id);
    if (!card) {
      throw createCustomError('卡片不存在', 404, 'CARD_NOT_FOUND');
    }

    return {
      success: true,
      message: '卡片詳情獲取成功',
      data: { card }
    };
  }
));

// @route   PUT /api/cards/:id
// @desc    更新卡片信息
// @access  Private (Admin only)
router.put('/:id', createPutHandler(
  async (req, res) => {
    const Card = getCardModel();
    if (!Card) {
      throw createCustomError('數據庫連接失敗', 500, 'DATABASE_ERROR');
    }

    const { id } = req.params;
    const updateData = req.body;

    const card = await Card.findByPk(id);
    if (!card) {
      throw createCustomError('卡片不存在', 404, 'CARD_NOT_FOUND');
    }

    // 更新卡片
    await card.update({
      ...updateData,
      updatedBy: req.user.id,
      updatedAt: new Date()
    });

    logger.info(`卡片更新成功: ${req.user.username} 更新了卡片 ${card.name}`);

    return {
      success: true,
      message: '卡片更新成功',
      data: { card }
    };
  },
  {
    auth: true,
    validation: validateCardUpdate,
    permissions: ['admin']
  }
));

// @route   DELETE /api/cards/:id
// @desc    刪除卡片（軟刪除）
// @access  Private (Admin only)
router.delete('/:id', createDeleteHandler(
  async (req, res) => {
    const Card = getCardModel();
    if (!Card) {
      throw createCustomError('數據庫連接失敗', 500, 'DATABASE_ERROR');
    }

    const { id } = req.params;

    const card = await Card.findByPk(id);
    if (!card) {
      throw createCustomError('卡片不存在', 404, 'CARD_NOT_FOUND');
    }

    // 軟刪除
    await card.update({
      isActive: false,
      deletedBy: req.user.id,
      deletedAt: new Date()
    });

    logger.info(`卡片刪除成功: ${req.user.username} 刪除了卡片 ${card.name}`);

    return {
      success: true,
      message: '卡片刪除成功'
    };
  },
  { auth: true, permissions: ['admin'] }
));

// @route   POST /api/cards/batch
// @desc    批量創建卡片
// @access  Private (Admin only)
router.post('/batch', createBatchHandler(
  async (req, res) => {
    const Card = getCardModel();
    if (!Card) {
      throw createCustomError('數據庫連接失敗', 500, 'DATABASE_ERROR');
    }

    const { cards } = req.body;

    if (!Array.isArray(cards) || cards.length === 0) {
      throw createCustomError('卡片數據不能為空', 400, 'INVALID_INPUT');
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < cards.length; i++) {
      try {
        const cardData = cards[i];

        // 檢查卡片是否已存在
        const existingCard = await Card.findOne({
          where: {
            setName: cardData.setName,
            cardNumber: cardData.cardNumber
          }
        });

        if (existingCard) {
          errors.push({
            index: i,
            error: '該卡片已存在',
            data: cardData
          });
          continue;
        }

        // 創建卡片
        const card = await Card.create({
          ...cardData,
          createdBy: req.user.id,
          isActive: true
        });

        results.push(card);
      } catch (error) {
        errors.push({
          index: i,
          error: error.message,
          data: cards[i]
        });
      }
    }

    logger.info(`批量創建卡片: ${req.user.username} 創建了 ${results.length} 張卡片，失敗 ${errors.length} 張`);

    return {
      success: true,
      message: `批量創建完成: ${results.length} 成功，${errors.length} 失敗`,
      data: {
        created: results,
        errors
      }
    };
  },
  {
    auth: true,
    permissions: ['admin'],
    validation: [
      body('cards').isArray({ min: 1 }).withMessage('卡片數據必須是數組且不能為空'),
      body('cards.*.name').isLength({ min: 1, max: 100 }).withMessage('卡片名稱必須在1-100個字符之間'),
      body('cards.*.setName').isLength({ min: 1, max: 100 }).withMessage('系列名稱必須在1-100個字符之間'),
      body('cards.*.cardNumber').isLength({ min: 1, max: 20 }).withMessage('卡片編號必須在1-20個字符之間'),
      body('cards.*.rarity').isIn(['common', 'uncommon', 'rare', 'mythic', 'special']).withMessage('無效的稀有度'),
      body('cards.*.cardType').isLength({ min: 1, max: 50 }).withMessage('卡片類型必須在1-50個字符之間')
    ]
  }
));

// @route   GET /api/cards/search
// @desc    搜索卡片
// @access  Public
router.get('/search', createSearchHandler(
  async (req, res) => {
    const Card = getCardModel();
    if (!Card) {
      throw createCustomError('數據庫連接失敗', 500, 'DATABASE_ERROR');
    }

    const { q: query, limit = 10 } = req.query;

    if (!query || query.trim().length === 0) {
      throw createCustomError('搜索查詢不能為空', 400, 'INVALID_INPUT');
    }

    const cards = await Card.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { setName: { [Op.iLike]: `%${query}%` } },
          { cardNumber: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } }
        ],
        isActive: true
      },
      limit: parseInt(limit),
      order: [['name', 'ASC']]
    });

    return {
      success: true,
      message: '搜索完成',
      data: { cards }
    };
  },
  { validation: [query('q').notEmpty().withMessage('搜索查詢不能為空')] }
));

module.exports = router;
