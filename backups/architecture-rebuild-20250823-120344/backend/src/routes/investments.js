const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { authenticateToken: protect } = require('../middleware/auth');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
const getInvestmentModel = require('../models/Investment');
// eslint-disable-next-line no-unused-vars
const getCardModel = require('../models/Card');
const getUserModel = require('../models/User');
// eslint-disable-next-line no-unused-vars
const databaseOptimizer = require('../services/databaseOptimizer');

const router = express.Router();

// @route   GET /api/investments
// @desc    ?²å??¨æˆ¶?•è??—è¡¨
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const Investment = getInvestmentModel();
// eslint-disable-next-line no-unused-vars
    const Card = getCardModel();

    if (!Investment || !Card) {
      return res.status(500).json({
        success: false,
        message: '?¸æ?åº«æ¨¡?‹å?å§‹å?å¤±æ?',
        code: 'MODEL_INIT_FAILED',
      });
    }

    // è¨­ç½®?œè¯
    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      riskLevel,
      sortBy = 'purchaseDate',
      sortOrder = 'DESC',
    } = req.query;
    const offset = (page - 1) * limit;

    // æ§‹å»º?¥è©¢æ¢ä»¶
    const whereClause = {
      userId: req.user.id,
      isActive: true,
    };

    if (search) {
      whereClause['$card.name$'] = { [Op.iLike]: `%${search}%` };
    }

    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    if (riskLevel) {
      whereClause.riskLevel = riskLevel;
    }

    // ä½¿ç”¨ databaseOptimizer ?ªå??¥è©¢
    const optimizedQuery = databaseOptimizer.optimizeQuery({
      where: whereClause,
      include: [
        {
          model: Card,
          as: 'card',
          attributes: [
            'id',
            'name',
            'setName',
            'rarity',
            'cardType',
            'currentPrice',
            'imageUrl',
          ],
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // ?·è??ªå?å¾Œç??¥è©¢ä¸¦ç›£?§æ€§èƒ½
    const startTime = Date.now();
    const { count, rows: investments } = await databaseOptimizer.monitorQuery(
      Investment,
      'findAndCountAll',
      optimizedQuery
    );

    // è¨ˆç??•è?çµ„å?çµ±è?
    const allUserInvestments = await databaseOptimizer.cachedQuery(
      Investment,
      `user_investments:${req.user.id}`,
      {
        where: { userId: req.user.id, isActive: true },
        include: [
          {
            model: Card,
            as: 'card',
            attributes: ['currentPrice'],
          },
        ],
      },
      300 // 5?†é?ç·©å?
    );

    const totalInvested = allUserInvestments.reduce(
      (sum, inv) => sum + parseFloat(inv.purchasePrice) * inv.quantity,
      0
    );
    const totalValue = allUserInvestments.reduce(
      (sum, inv) => sum + parseFloat(inv.card.currentPrice || 0) * inv.quantity,
      0
    );
    const totalProfitLoss = allUserInvestments.reduce(
      (sum, inv) => sum + parseFloat(inv.profitLoss),
      0
    );
    const totalProfitLossPercent =
      totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    const portfolioStats = {
      totalInvestments: allUserInvestments.length,
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      totalValue: parseFloat(totalValue.toFixed(2)),
      totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
      totalProfitLossPercent: parseFloat(totalProfitLossPercent.toFixed(2)),
      profitableInvestments: allUserInvestments.filter(
        (inv) => parseFloat(inv.profitLoss) > 0
      ).length,
      avgReturn:
        allUserInvestments.length > 0
          ? parseFloat(
              (
                allUserInvestments.reduce(
                  (sum, inv) => sum + parseFloat(inv.profitLossPercentage),
                  0
                ) / allUserInvestments.length
              ).toFixed(2)
            )
          : 0,
    };

    logger.info(`?²å??•è??—è¡¨: ${req.user.username}`);

    res.json({
      success: true,
      data: {
        investments,
        portfolioStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    logger.error('?²å??•è??—è¡¨?¯èª¤:', error);
    res.status(500).json({
      success: false,
      message: '?²å??•è??—è¡¨å¤±æ?',
      code: 'GET_INVESTMENTS_FAILED',
    });
  }
});

// @route   GET /api/investments/portfolio
// @desc    ?²å??•è?çµ„å?æ¦‚è¦½
// @access  Private
router.get('/portfolio', protect, async (req, res) => {
  try {
    const Investment = getInvestmentModel();
// eslint-disable-next-line no-unused-vars
    const Card = getCardModel();

    if (!Investment || !Card) {
      return res.status(500).json({
        success: false,
        message: '?¸æ?åº«æ¨¡?‹å?å§‹å?å¤±æ?',
        code: 'MODEL_INIT_FAILED',
      });
    }

    // è¨­ç½®?œè¯
    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

// eslint-disable-next-line no-unused-vars
    const userInvestments = await Investment.findAll({
      where: { userId: req.user.id, isActive: true },
      include: [
        {
          model: Card,
          as: 'card',
          attributes: ['currentPrice'],
        },
      ],
    });

    // è¨ˆç?è©³ç´°çµ±è?
    const totalInvested = userInvestments.reduce(
      (sum, inv) => sum + parseFloat(inv.purchasePrice) * inv.quantity,
      0
    );
    const totalValue = userInvestments.reduce(
      (sum, inv) => sum + parseFloat(inv.card.currentPrice || 0) * inv.quantity,
      0
    );
    const totalProfitLoss = userInvestments.reduce(
      (sum, inv) => sum + parseFloat(inv.profitLoss),
      0
    );
    const totalProfitLossPercent =
      totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    // é¢¨éšªè©•ä¼°
    const riskLevels = userInvestments.map((inv) => inv.riskLevel);
    const lowRisk = riskLevels.filter((risk) => risk === 'low').length;
    const mediumRisk = riskLevels.filter((risk) => risk === 'medium').length;
    const highRisk = riskLevels.filter((risk) => risk === 'high').length;

    let overallRiskLevel = 'low';
    if (highRisk > lowRisk + mediumRisk) overallRiskLevel = 'high';
    else if (mediumRisk > lowRisk) overallRiskLevel = 'medium';

    // ?‰ç??‹å?çµ?    const byStatus = {
      active: userInvestments.filter((inv) => inv.status === 'active').length,
      sold: userInvestments.filter((inv) => inv.status === 'sold').length,
      cancelled: userInvestments.filter((inv) => inv.status === 'cancelled')
        .length,
    };

    const portfolioOverview = {
      totalInvestments: userInvestments.length,
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      totalValue: parseFloat(totalValue.toFixed(2)),
      totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
      totalProfitLossPercent: parseFloat(totalProfitLossPercent.toFixed(2)),
      profitableInvestments: userInvestments.filter(
        (inv) => parseFloat(inv.profitLoss) > 0
      ).length,
      avgReturn:
        userInvestments.length > 0
          ? parseFloat(
              (
                userInvestments.reduce(
                  (sum, inv) => sum + parseFloat(inv.profitLossPercentage),
                  0
                ) / userInvestments.length
              ).toFixed(2)
            )
          : 0,
      riskAssessment: {
        lowRisk,
        mediumRisk,
        highRisk,
        riskLevel: overallRiskLevel,
      },
      statusBreakdown: byStatus,
    };

    logger.info(`?²å??•è?çµ„å?: ${req.user.username}`);

    res.json({
      success: true,
      data: { portfolioOverview },
    });
  } catch (error) {
    logger.error('?²å??•è?çµ„å??¯èª¤:', error);
    res.status(500).json({
      success: false,
      message: '?²å??•è?çµ„å?å¤±æ?',
      code: 'GET_PORTFOLIO_FAILED',
    });
  }
});

// @route   GET /api/investments/analytics
// @desc    ?²å??•è??†æ?
// @access  Private
router.get('/analytics', protect, async (req, res) => {
  try {
    const Investment = getInvestmentModel();
// eslint-disable-next-line no-unused-vars
    const Card = getCardModel();

    if (!Investment || !Card) {
      return res.status(500).json({
        success: false,
        message: '?¸æ?åº«æ¨¡?‹å?å§‹å?å¤±æ?',
        code: 'MODEL_INIT_FAILED',
      });
    }

    // è¨­ç½®?œè¯
    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

// eslint-disable-next-line no-unused-vars
    const userInvestments = await Investment.findAll({
      where: { userId: req.user.id, isActive: true },
      include: [
        {
          model: Card,
          as: 'card',
          attributes: [
            'id',
            'name',
            'setName',
            'rarity',
            'cardType',
            'currentPrice',
            'imageUrl',
          ],
        },
      ],
    });

    // ?‰é??‹å?çµ?    const byType = {
      purchase: userInvestments.filter((inv) => inv.type === 'purchase'),
      sale: userInvestments.filter((inv) => inv.type === 'sale'),
    };

    // ?‰é¢¨?ªç?ç´šå?çµ?    const byRisk = {
      low: userInvestments.filter((inv) => inv.riskLevel === 'low'),
      medium: userInvestments.filter((inv) => inv.riskLevel === 'medium'),
      high: userInvestments.filter((inv) => inv.riskLevel === 'high'),
    };

    // ?‰ç??‹å?çµ?    const byStatus = {
      active: userInvestments.filter((inv) => inv.status === 'active'),
      sold: userInvestments.filter((inv) => inv.status === 'sold'),
      cancelled: userInvestments.filter((inv) => inv.status === 'cancelled'),
    };

    // ?‰ç??‰åº¦?†ç?
    const byRarity = {};
    userInvestments.forEach((inv) => {
      const { rarity } = inv.card;
      if (!byRarity[rarity]) {
        byRarity[rarity] = [];
      }
      byRarity[rarity].push(inv);
    });

    // ?‰ç³»?—å?çµ?    const bySet = {};
    userInvestments.forEach((inv) => {
      const set = inv.card.setName;
      if (!bySet[set]) {
        bySet[set] = [];
      }
      bySet[set].push(inv);
    });

    const analytics = {
      byType,
      byRisk,
      byStatus,
      byRarity,
      bySet,
      performance: {
        bestInvestment:
          userInvestments.length > 0
            ? userInvestments.reduce((best, inv) =>
                parseFloat(inv.profitLossPercentage) >
                parseFloat(best.profitLossPercentage)
                  ? inv
                  : best
              )
            : null,
        worstInvestment:
          userInvestments.length > 0
            ? userInvestments.reduce((worst, inv) =>
                parseFloat(inv.profitLossPercentage) <
                parseFloat(worst.profitLossPercentage)
                  ? inv
                  : worst
              )
            : null,
        totalInvested: parseFloat(
          userInvestments
            .reduce(
              (sum, inv) => sum + parseFloat(inv.purchasePrice) * inv.quantity,
              0
            )
            .toFixed(2)
        ),
        totalValue: parseFloat(
          userInvestments
            .reduce(
              (sum, inv) =>
                sum + parseFloat(inv.card.currentPrice || 0) * inv.quantity,
              0
            )
            .toFixed(2)
        ),
        totalProfitLoss: parseFloat(
          userInvestments
            .reduce((sum, inv) => sum + parseFloat(inv.profitLoss), 0)
            .toFixed(2)
        ),
      },
    };

    logger.info(`?²å??•è??†æ?: ${req.user.username}`);

    res.json({
      success: true,
      data: { analytics },
    });
  } catch (error) {
    logger.error('?²å??•è??†æ??¯èª¤:', error);
    res.status(500).json({
      success: false,
      message: '?²å??•è??†æ?å¤±æ?',
      code: 'GET_ANALYTICS_FAILED',
    });
  }
});

// @route   POST /api/investments
// @desc    æ·»å??°æ?è³?// @access  Private
router.post(
  '/',
  protect,
  [
    body('cardId').isInt({ min: 1 }).withMessage('?¡ç?IDå¿…é??¯æ­£?´æ•¸'),
    body('type')
      .isIn(['purchase', 'sale'])
      .withMessage('?•è?é¡å?å¿…é??¯purchase?–sale'),
    body('purchasePrice').isFloat({ min: 0 }).withMessage('è³¼è²·?¹æ ¼å¿…é?å¤§æ–¼0'),
    body('quantity').isInt({ min: 1 }).withMessage('?¸é?å¿…é?å¤§æ–¼0'),
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
      ])
      .withMessage('?¡ç??€æ³ç„¡??),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('?™è¨»?€å¤?00?‹å?ç¬?),
    body('riskLevel')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('é¢¨éšªç­‰ç?å¿…é??¯low?medium?–high'),
    body('purchaseDate').optional().isISO8601().withMessage('è³¼è²·?¥æ??¼å??¡æ?'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'è¼¸å…¥é©—è?å¤±æ?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const Investment = getInvestmentModel();
// eslint-disable-next-line no-unused-vars
      const Card = getCardModel();

      if (!Investment || !Card) {
        return res.status(500).json({
          success: false,
          message: '?¸æ?åº«æ¨¡?‹å?å§‹å?å¤±æ?',
          code: 'MODEL_INIT_FAILED',
        });
      }

      // è¨­ç½®?œè¯
      Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

      const {
        cardId,
        type = 'purchase',
        purchasePrice,
        quantity = 1,
        condition = 'near-mint',
        notes = '',
        riskLevel = 'medium',
        purchaseDate = new Date(),
      } = req.body;

      // æª¢æŸ¥?¡ç??¯å¦å­˜åœ¨
      const card = await Card.findByPk(cardId);
      if (!card) {
        return res.status(404).json({
          success: false,
          message: '?¡ç?ä¸å???,
          code: 'CARD_NOT_FOUND',
        });
      }

      // è¨ˆç??å???      const currentValue = parseFloat(card.currentPrice || 0) * quantity;
      const profitLoss = currentValue - parseFloat(purchasePrice) * quantity;
      const profitLossPercentage =
        parseFloat(purchasePrice) > 0
          ? (profitLoss / (parseFloat(purchasePrice) * quantity)) * 100
          : 0;

      // ?µå»º?•è?è¨˜é?
// eslint-disable-next-line no-unused-vars
      const newInvestment = await Investment.create({
        userId: req.user.id,
        cardId,
        type,
        purchasePrice,
        purchaseDate,
        quantity,
        condition,
        notes,
        currentValue,
        profitLoss,
        profitLossPercentage,
        status: 'active',
        riskLevel,
      });

      // ?²å??…å«?¡ç?ä¿¡æ¯?„å??´è???      const investmentWithCard = await Investment.findByPk(newInvestment.id, {
        include: [
          {
            model: Card,
            as: 'card',
            attributes: [
              'id',
              'name',
              'setName',
              'rarity',
              'cardType',
              'currentPrice',
              'imageUrl',
            ],
          },
        ],
      });

      logger.info(`æ·»å??•è?: ${req.user.username} æ·»å?äº?${card.name} ?•è?`);

      res.status(201).json({
        success: true,
        message: '?•è?æ·»å??å?',
        data: { investment: investmentWithCard },
      });
    } catch (error) {
      logger.error('æ·»å??•è??¯èª¤:', error);
      res.status(500).json({
        success: false,
        message: 'æ·»å??•è?å¤±æ?',
        code: 'ADD_INVESTMENT_FAILED',
      });
    }
  }
);

// @route   GET /api/investments/:id
// @desc    ?²å??•è?è©³æ?
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const Investment = getInvestmentModel();
// eslint-disable-next-line no-unused-vars
    const Card = getCardModel();

    if (!Investment || !Card) {
      return res.status(500).json({
        success: false,
        message: '?¸æ?åº«æ¨¡?‹å?å§‹å?å¤±æ?',
        code: 'MODEL_INIT_FAILED',
      });
    }

    // è¨­ç½®?œè¯
    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    const investment = await Investment.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true,
      },
      include: [
        {
          model: Card,
          as: 'card',
          attributes: [
            'id',
            'name',
            'setName',
            'rarity',
            'cardType',
            'currentPrice',
            'imageUrl',
            'description',
          ],
        },
      ],
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: '?•è?ä¸å???,
        code: 'INVESTMENT_NOT_FOUND',
      });
    }

    logger.info(
      `?²å??•è?è©³æ?: ${req.user.username} ?¥ç??•è? ${investment.card.name}`
    );

    res.json({
      success: true,
      data: { investment },
    });
  } catch (error) {
    logger.error('?²å??•è?è©³æ??¯èª¤:', error);
    res.status(500).json({
      success: false,
      message: '?²å??•è?è©³æ?å¤±æ?',
      code: 'GET_INVESTMENT_FAILED',
    });
  }
});

// @route   PUT /api/investments/:id
// @desc    ?´æ–°?•è?
// @access  Private
router.put(
  '/:id',
  protect,
  [
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('?™è¨»?€å¤?00?‹å?ç¬?),
    body('status')
      .optional()
      .isIn(['active', 'sold', 'cancelled'])
      .withMessage('?€?‹å??ˆæ˜¯active?sold?–cancelled'),
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
      ])
      .withMessage('?¡ç??€æ³ç„¡??),
    body('riskLevel')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('é¢¨éšªç­‰ç?å¿…é??¯low?medium?–high'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('?¸é?å¿…é?å¤§æ–¼0'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'è¼¸å…¥é©—è?å¤±æ?',
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { notes, status, condition, riskLevel, quantity } = req.body;

      const Investment = getInvestmentModel();
// eslint-disable-next-line no-unused-vars
      const Card = getCardModel();

      if (!Investment || !Card) {
        return res.status(500).json({
          success: false,
          message: '?¸æ?åº«æ¨¡?‹å?å§‹å?å¤±æ?',
          code: 'MODEL_INIT_FAILED',
        });
      }

      // è¨­ç½®?œè¯
      Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

      const investment = await Investment.findOne({
        where: {
          id,
          userId: req.user.id,
          isActive: true,
        },
        include: [
          {
            model: Card,
            as: 'card',
            attributes: ['currentPrice'],
          },
        ],
      });

      if (!investment) {
        return res.status(404).json({
          success: false,
          message: '?•è?ä¸å???,
          code: 'INVESTMENT_NOT_FOUND',
        });
      }

      // ?´æ–°å­—æ®µ
      const updateData = {};
      if (notes !== undefined) updateData.notes = notes;
      if (status !== undefined) updateData.status = status;
      if (condition !== undefined) updateData.condition = condition;
      if (riskLevel !== undefined) updateData.riskLevel = riskLevel;
      if (quantity !== undefined) updateData.quantity = quantity;

      // å¦‚æ??¸é??¹è?ï¼Œé??°è?ç®—åƒ¹?¼å??ˆè™§
      if (quantity !== undefined) {
// eslint-disable-next-line no-unused-vars
        const newCurrentValue =
          parseFloat(investment.card.currentPrice || 0) * quantity;
// eslint-disable-next-line no-unused-vars
        const newProfitLoss =
          newCurrentValue - parseFloat(investment.purchasePrice) * quantity;
// eslint-disable-next-line no-unused-vars
        const newProfitLossPercentage =
          parseFloat(investment.purchasePrice) > 0
            ? (newProfitLoss /
                (parseFloat(investment.purchasePrice) * quantity)) *
              100
            : 0;

        updateData.currentValue = newCurrentValue;
        updateData.profitLoss = newProfitLoss;
        updateData.profitLossPercentage = newProfitLossPercentage;
      }

      // ?´æ–°?•è?è¨˜é?
      await investment.update(updateData);

      // ?²å??´æ–°å¾Œç?å®Œæ•´è¨˜é?
      const updatedInvestment = await Investment.findByPk(id, {
        include: [
          {
            model: Card,
            as: 'card',
            attributes: [
              'id',
              'name',
              'setName',
              'rarity',
              'cardType',
              'currentPrice',
              'imageUrl',
            ],
          },
        ],
      });

      logger.info(
        `?´æ–°?•è?: ${req.user.username} ?´æ–°äº?${updatedInvestment.card.name} ?•è?`
      );

      res.json({
        success: true,
        message: '?•è??´æ–°?å?',
        data: { investment: updatedInvestment },
      });
    } catch (error) {
      logger.error('?´æ–°?•è??¯èª¤:', error);
      res.status(500).json({
        success: false,
        message: '?´æ–°?•è?å¤±æ?',
        code: 'UPDATE_INVESTMENT_FAILED',
      });
    }
  }
);

// @route   DELETE /api/investments/:id
// @desc    è»Ÿåˆª?¤æ?è³?// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const Investment = getInvestmentModel();
// eslint-disable-next-line no-unused-vars
    const Card = getCardModel();

    if (!Investment || !Card) {
      return res.status(500).json({
        success: false,
        message: '?¸æ?åº«æ¨¡?‹å?å§‹å?å¤±æ?',
        code: 'MODEL_INIT_FAILED',
      });
    }

    // è¨­ç½®?œè¯
    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    const investment = await Investment.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true,
      },
      include: [
        {
          model: Card,
          as: 'card',
          attributes: ['name'],
        },
      ],
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: '?•è?ä¸å???,
        code: 'INVESTMENT_NOT_FOUND',
      });
    }

    // è»Ÿåˆª??    await investment.update({ isActive: false });

    logger.info(
      `?ªé™¤?•è?: ${req.user.username} ?ªé™¤äº?${investment.card.name} ?•è?`
    );

    res.json({
      success: true,
      message: '?•è??ªé™¤?å?',
    });
  } catch (error) {
    logger.error('?ªé™¤?•è??¯èª¤:', error);
    res.status(500).json({
      success: false,
      message: '?ªé™¤?•è?å¤±æ?',
      code: 'DELETE_INVESTMENT_FAILED',
    });
  }
});

module.exports = router;
