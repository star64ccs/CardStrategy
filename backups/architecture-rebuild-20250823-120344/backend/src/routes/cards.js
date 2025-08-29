const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { authenticateToken: protect, authorize } = require('../middleware/auth');
// eslint-disable-next-line no-unused-vars
const getCardModel = require('../models/Card');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
const getUserModel = require('../models/User');
// eslint-disable-next-line no-unused-vars
const databaseOptimizer = require('../services/databaseOptimizer');
const {
  createPostHandler,
  createGetHandler,
  createPutHandler,
  createDeleteHandler,
  createPaginatedHandler,
  createSearchHandler,
  createBatchHandler,
  createCustomError,
} = require('../middleware/routeHandler');

const router = express.Router();

// 驗�?中�?�?const validateCardCreation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('?��??�稱必�???-100?��?符�???),
  body('setName')
    .isLength({ min: 1, max: 100 })
    .withMessage('系�??�稱必�???-100?��?符�???),
  body('cardNumber')
    .isLength({ min: 1, max: 20 })
    .withMessage('?��?編�?必�???-20?��?符�???),
  body('rarity')
    .isIn(['common', 'uncommon', 'rare', 'mythic', 'special'])
    .withMessage('?��??��??�度'),
  body('cardType')
    .isLength({ min: 1, max: 50 })
    .withMessage('?��?類�?必�???-50?��?符�???),
  body('currentPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('?��??�格必�??�正??),
  body('marketPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('市場?�格必�??�正??),
  body('imageUrl').optional().isURL().withMessage('請�?供�??��??��?URL'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('?�述不能超�?1000?��?�?),
];

const validateCardUpdate = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('?��??�稱必�???-100?��?符�???),
  body('setName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('系�??�稱必�???-100?��?符�???),
  body('cardNumber')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('?��?編�?必�???-20?��?符�???),
  body('rarity')
    .optional()
    .isIn(['common', 'uncommon', 'rare', 'mythic', 'special'])
    .withMessage('?��??��??�度'),
  body('cardType')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('?��?類�?必�???-50?��?符�???),
  body('currentPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('?��??�格必�??�正??),
  body('marketPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('市場?�格必�??�正??),
  body('imageUrl').optional().isURL().withMessage('請�?供�??��??��?URL'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('?�述不能超�?1000?��?�?),
];

const validateCardFilters = [
  query('search').optional().isString(),
  query('setName').optional().isString(),
  query('rarity')
    .optional()
    .isIn(['common', 'uncommon', 'rare', 'mythic', 'special']),
  query('cardType').optional().isString(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('sortBy')
    .optional()
    .isIn([
      'name',
      'currentPrice',
      'marketPrice',
      'rarity',
      'setName',
      'createdAt',
    ]),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('isActive').optional().isBoolean(),
];

// @route   POST /api/cards
// @desc    ?�建?�卡??// @access  Private (Admin only)
router.post(
  '/',
  createPostHandler(
    async (req, res) => {
// eslint-disable-next-line no-unused-vars
      const Card = getCardModel();
      if (!Card) {
        throw createCustomError('?��?庫�?��失�?', 500, 'DATABASE_ERROR');
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
        metadata = {},
      } = req.body;

      // 檢查?��??�否已�???      const existingCard = await Card.findOne({
        where: {
          setName,
          cardNumber,
        },
      });

      if (existingCard) {
        throw createCustomError('該卡?�已存在', 400, 'CARD_EXISTS');
      }

      // ?�建?�卡??      const card = await Card.create({
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
        isActive: true,
      });

      logger.info(`?��??�建?��?: ${req.user.username} ?�建了卡??${card.name}`);

      return {
        success: true,
        message: '?��??�建?��?',
        data: { card },
      };
    },
    {
      auth: true,
      validation: validateCardCreation,
      permissions: ['admin'],
    }
  )
);

// @route   GET /api/cards
// @desc    ?��??��??�表（支?��?索、�?濾、�?序、�??��?
// @access  Public
router.get(
  '/',
  createPaginatedHandler(
    async (filters, pagination, req, res) => {
// eslint-disable-next-line no-unused-vars
      const Card = getCardModel();
      if (!Card) {
        throw createCustomError('?��?庫�?��失�?', 500, 'DATABASE_ERROR');
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
        isActive = true,
      } = filters;

      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      // 構建?�詢條件
      const whereClause = {
        isActive: isActive !== undefined ? isActive : true,
      };

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { setName: { [Op.iLike]: `%${search}%` } },
          { cardNumber: { [Op.iLike]: `%${search}%` } },
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

      // 使用 databaseOptimizer ?��??�詢
      const optimizedQuery = databaseOptimizer.optimizeQuery({
        where: whereClause,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      // ?��??�詢
      const { count, rows: cards } = await Card.findAndCountAll(optimizedQuery);

      const totalPages = Math.ceil(count / limit);

      return {
        success: true,
        message: '?��??�表?��??��?',
        data: {
          cards,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            totalPages,
          },
        },
      };
    },
    { validation: validateCardFilters }
  )
);

// @route   GET /api/cards/:id
// @desc    ?��??�張?��?詳�?
// @access  Public
router.get(
  '/:id',
  createGetHandler(async (req, res) => {
// eslint-disable-next-line no-unused-vars
    const Card = getCardModel();
    if (!Card) {
      throw createCustomError('?��?庫�?��失�?', 500, 'DATABASE_ERROR');
    }

    const { id } = req.params;

    const card = await Card.findByPk(id);
    if (!card) {
      throw createCustomError('?��?不�???, 404, 'CARD_NOT_FOUND');
    }

    return {
      success: true,
      message: '?��?詳�??��??��?',
      data: { card },
    };
  })
);

// @route   PUT /api/cards/:id
// @desc    ?�新?��?信息
// @access  Private (Admin only)
router.put(
  '/:id',
  createPutHandler(
    async (req, res) => {
// eslint-disable-next-line no-unused-vars
      const Card = getCardModel();
      if (!Card) {
        throw createCustomError('?��?庫�?��失�?', 500, 'DATABASE_ERROR');
      }

      const { id } = req.params;
      const updateData = req.body;

      const card = await Card.findByPk(id);
      if (!card) {
        throw createCustomError('?��?不�???, 404, 'CARD_NOT_FOUND');
      }

      // ?�新?��?
      await card.update({
        ...updateData,
        updatedBy: req.user.id,
        updatedAt: new Date(),
      });

      logger.info(`?��??�新?��?: ${req.user.username} ?�新了卡??${card.name}`);

      return {
        success: true,
        message: '?��??�新?��?',
        data: { card },
      };
    },
    {
      auth: true,
      validation: validateCardUpdate,
      permissions: ['admin'],
    }
  )
);

// @route   DELETE /api/cards/:id
// @desc    ?�除?��?（�??�除�?// @access  Private (Admin only)
router.delete(
  '/:id',
  createDeleteHandler(
    async (req, res) => {
// eslint-disable-next-line no-unused-vars
      const Card = getCardModel();
      if (!Card) {
        throw createCustomError('?��?庫�?��失�?', 500, 'DATABASE_ERROR');
      }

      const { id } = req.params;

      const card = await Card.findByPk(id);
      if (!card) {
        throw createCustomError('?��?不�???, 404, 'CARD_NOT_FOUND');
      }

      // 軟刪??      await card.update({
        isActive: false,
        deletedBy: req.user.id,
        deletedAt: new Date(),
      });

      logger.info(`?��??�除?��?: ${req.user.username} ?�除了卡??${card.name}`);

      return {
        success: true,
        message: '?��??�除?��?',
      };
    },
    { auth: true, permissions: ['admin'] }
  )
);

// @route   POST /api/cards/batch
// @desc    ?��??�建?��?
// @access  Private (Admin only)
router.post(
  '/batch',
  createBatchHandler(
    async (req, res) => {
// eslint-disable-next-line no-unused-vars
      const Card = getCardModel();
      if (!Card) {
        throw createCustomError('?��?庫�?��失�?', 500, 'DATABASE_ERROR');
      }

      const { cards } = req.body;

      if (!Array.isArray(cards) || cards.length === 0) {
        throw createCustomError('?��??��?不能?�空', 400, 'INVALID_INPUT');
      }

// eslint-disable-next-line no-unused-vars
      const results = [];
// eslint-disable-next-line no-unused-vars
      const errors = [];

      for (let i = 0; i < cards.length; i++) {
        try {
          const cardData = cards[i];

          // 檢查?��??�否已�???          const existingCard = await Card.findOne({
            where: {
              setName: cardData.setName,
              cardNumber: cardData.cardNumber,
            },
          });

          if (existingCard) {
            errors.push({
              index: i,
              error: '該卡?�已存在',
              data: cardData,
            });
            continue;
          }

          // ?�建?��?
          const card = await Card.create({
            ...cardData,
            createdBy: req.user.id,
            isActive: true,
          });

          results.push(card);
        } catch (error) {
          errors.push({
            index: i,
            error: error.message,
            data: cards[i],
          });
        }
      }

      logger.info(
        `?��??�建?��?: ${req.user.username} ?�建�?${results.length} 張卡?��?失�? ${errors.length} 張`
      );

      return {
        success: true,
        message: `?��??�建完�?: ${results.length} ?��?�?{errors.length} 失�?`,
        data: {
          created: results,
          errors,
        },
      };
    },
    {
      auth: true,
      permissions: ['admin'],
      validation: [
        body('cards')
          .isArray({ min: 1 })
          .withMessage('?��??��?必�??�數組�?不能?�空'),
        body('cards.*.name')
          .isLength({ min: 1, max: 100 })
          .withMessage('?��??�稱必�???-100?��?符�???),
        body('cards.*.setName')
          .isLength({ min: 1, max: 100 })
          .withMessage('系�??�稱必�???-100?��?符�???),
        body('cards.*.cardNumber')
          .isLength({ min: 1, max: 20 })
          .withMessage('?��?編�?必�???-20?��?符�???),
        body('cards.*.rarity')
          .isIn(['common', 'uncommon', 'rare', 'mythic', 'special'])
          .withMessage('?��??��??�度'),
        body('cards.*.cardType')
          .isLength({ min: 1, max: 50 })
          .withMessage('?��?類�?必�???-50?��?符�???),
      ],
    }
  )
);

// @route   GET /api/cards/search
// @desc    ?�索?��?
// @access  Public
router.get(
  '/search',
  createSearchHandler(
    async (req, res) => {
// eslint-disable-next-line no-unused-vars
      const Card = getCardModel();
      if (!Card) {
        throw createCustomError('?��?庫�?��失�?', 500, 'DATABASE_ERROR');
      }

      const { q: query, limit = 10 } = req.query;

      if (!query || query.trim().length === 0) {
        throw createCustomError('?�索?�詢不能?�空', 400, 'INVALID_INPUT');
      }

      const cards = await Card.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${query}%` } },
            { setName: { [Op.iLike]: `%${query}%` } },
            { cardNumber: { [Op.iLike]: `%${query}%` } },
            { description: { [Op.iLike]: `%${query}%` } },
          ],
          isActive: true,
        },
        limit: parseInt(limit),
        order: [['name', 'ASC']],
      });

      return {
        success: true,
        message: '?�索完�?',
        data: { cards },
      };
    },
    { validation: [query('q').notEmpty().withMessage('?�索?�詢不能?�空')] }
  )
);

module.exports = router;
