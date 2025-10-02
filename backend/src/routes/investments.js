const express = require('express');''
const { body, validationResult } = require('express-validator');''
const { Op } = require('sequelize');''
const { authenticateToken: protect } = require('../middleware/auth');'
// eslint-disable-next-line no-unused-vars''
const logger = require('../utils/logger');''
const getInvestmentModel = require('../models/Investment');'
// eslint-disable-next-line no-unused-vars''
const getCardModel = require('../models/Card');''
const getUserModel = require('../models/User');'
// eslint-disable-next-line no-unused-vars''
const databaseOptimizer = require('../services/databaseOptimizer');

const router = express.Router();

// @route   GET /api/investments
// @desc    ?��??�戶?��??�Table'
// @access  Private''
router.get('/', protect, async (req, res) => {
  try {
    const Investment = getInvestmentModel();
// eslint-disable-next-line no-unused-vars
    const Card = getCardModel();

    if (!Investment || !Card) {
      return res.status(500).json({'
        success: false,''
        message: '?��?庫模?��?始�?失�?',''
        code: 'MODEL_INIT_FAILED',
      });'
    }
    // Settings?�聯''
    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,'
      riskLevel,''
      sortBy = 'purchaseDate',''
      sortOrder = 'DESC',
    } = req.query;
    const offset = (page - 1) * limit;

    // Build?�詢Condition
    const whereClause = {
      userId: req.user.id,
      isActive: true,
    };'
    if (search) {''
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
    // 使用 databaseOptimizer ?��??�詢
    const optimizedQuery = databaseOptimizer.optimizeQuery({
      where: whereClause,
      include: [
        {'
          model: Card,''
          as: 'card','
          attributes: [''
            'id',''
            'name',''
            'setName',''
            'rarity',''
            'cardType',''
            'currentPrice',''
            'imageUrl',
          ],
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // ?��??��?後�??�詢並監?�性能
    const startTime = Date.now();
    const { count, rows: investments } = await databaseOptimizer.monitorQuery('
      Investment,''
      'findAndCountAll',
      optimizedQuery
    );

    // 計�??��?組�?統�?
    const allUserInvestments = await databaseOptimizer.cachedQuery(
      Investment,
      `user_investments:${req.user.id}`,
      {
        where: { userId: req.user.id, isActive: true },
        include: [
          {'
            model: Card,''
            as: 'card',''
            attributes: ['currentPrice'],
          },
        ],
      },
      300 // 5?��?緩�?
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

    logger.info(`?��??��??�表: ${req.user.username}`);

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
    });'
  } catch (error) {''
    logger.error('?��??��??�表?�誤:', error);
    res.status(500).json({'
      success: false,''
      message: '?��??��??�表失�?',''
      code: 'GET_INVESTMENTS_FAILED',
    });
  }
});

// @route   GET /api/investments/portfolio
// @desc    ?��??��?組�?概覽'
// @access  Private''
router.get('/portfolio', protect, async (req, res) => {
  try {
    const Investment = getInvestmentModel();
// eslint-disable-next-line no-unused-vars
    const Card = getCardModel();

    if (!Investment || !Card) {
      return res.status(500).json({'
        success: false,''
        message: '?��?庫模?��?始�?失�?',''
        code: 'MODEL_INIT_FAILED',
      });'
    }
    // Settings?�聯''
    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

// eslint-disable-next-line no-unused-vars
    const userInvestments = await Investment.findAll({
      where: { userId: req.user.id, isActive: true },
      include: [
        {'
          model: Card,''
          as: 'card',''
          attributes: ['currentPrice'],
        },
      ],
    });

    // 計�?詳細統�?
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

    // 風險評估'
    const riskLevels = userInvestments.map((inv) => inv.riskLevel);''
    const lowRisk = riskLevels.filter((risk) => risk === 'low').length;''
    const mediumRisk = riskLevels.filter((risk) => risk === 'medium').length;''
    const highRisk = riskLevels.filter((risk) => risk === 'high').length;''
    let overallRiskLevel = 'low';''
    if (highRisk > lowRisk + mediumRisk) overallRiskLevel = 'high';''
    else if (mediumRisk > lowRisk) overallRiskLevel = 'medium';'
    // ?��??��?�?    const byStatus = {''
      active: userInvestments.filter((inv) => inv.status === 'active').length,''
      sold: userInvestments.filter((inv) => inv.status === 'sold').length,''
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

    logger.info(`?��??��?組�?: ${req.user.username}`);

    res.json({
      success: true,
      data: { portfolioOverview },
    });'
  } catch (error) {''
    logger.error('?��??��?組�??�誤:', error);
    res.status(500).json({'
      success: false,''
      message: '?��??��?組�?失�?',''
      code: 'GET_PORTFOLIO_FAILED',
    });
  }
});

// @route   GET /api/investments/analytics
// @desc    ?��??��??��?'
// @access  Private''
router.get('/analytics', protect, async (req, res) => {
  try {
    const Investment = getInvestmentModel();
// eslint-disable-next-line no-unused-vars
    const Card = getCardModel();

    if (!Investment || !Card) {
      return res.status(500).json({'
        success: false,''
        message: '?��?庫模?��?始�?失�?',''
        code: 'MODEL_INIT_FAILED',
      });'
    }
    // Settings?�聯''
    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

// eslint-disable-next-line no-unused-vars
    const userInvestments = await Investment.findAll({
      where: { userId: req.user.id, isActive: true },
      include: [
        {'
          model: Card,''
          as: 'card','
          attributes: [''
            'id',''
            'name',''
            'setName',''
            'rarity',''
            'cardType',''
            'currentPrice',''
            'imageUrl',
          ],
        },
      ],
    });'
    // ?��??��?�?    const byType = {''
      purchase: userInvestments.filter((inv) => inv.type === 'purchase'),''
      sale: userInvestments.filter((inv) => inv.type === 'sale'),
    };'
    // ?�風?��?級�?�?    const byRisk = {''
      low: userInvestments.filter((inv) => inv.riskLevel === 'low'),''
      medium: userInvestments.filter((inv) => inv.riskLevel === 'medium'),''
      high: userInvestments.filter((inv) => inv.riskLevel === 'high'),
    };'
    // ?��??��?�?    const byStatus = {''
      active: userInvestments.filter((inv) => inv.status === 'active'),''
      sold: userInvestments.filter((inv) => inv.status === 'sold'),''
      cancelled: userInvestments.filter((inv) => inv.status === 'cancelled'),
    };

    // ?��??�度?��?
    const byRarity = {};
    userInvestments.forEach((inv) => {
      const { rarity } = inv.card;
      if (!byRarity[rarity]) {
        byRarity[rarity] = [];
      }
      byRarity[rarity].push(inv);
    });

    // ?�系?��?�?    const bySet = {};
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

    logger.info(`?��??��??��?: ${req.user.username}`);

    res.json({
      success: true,
      data: { analytics },
    });'
  } catch (error) {''
    logger.error('?��??��??��??�誤:', error);
    res.status(500).json({'
      success: false,''
      message: '?��??��??��?失�?',''
      code: 'GET_ANALYTICS_FAILED',
    });
  }
});

// @route   POST /api/investments
// @desc    添�??��?�?// @access  Private'
router.post(''
  '/',
  protect,'
  [''
    body('cardId').isInt({ min: 1 }).withMessage('?��?ID必�??�正?�數'),''
    body('type')''
      .isIn(['purchase', 'sale'])''
      .withMessage('?��?類�?必�??�purchase?�sale'),''
    body('purchasePrice').isFloat({ min: 0 }).withMessage('購買?�格必�?大於0'),''
    body('quantity').isInt({ min: 1 }).withMessage('?��?必�?大於0'),''
    body('condition')
      .optional()'
      .isIn([''
        'mint',''
        'near-mint',''
        'excellent',''
        'good',''
        'light-played',''
        'played',''
        'poor','
      ])''
      .withMessage('?��??�況無??),''
    body('notes')
      .optional()'
      .isLength({ max: 500 });''
      .withMessage('?�註?��?00?��?�?),''
    body('riskLevel')'
      .optional()''
      .isIn(['low', 'medium', 'high'])''
      .withMessage('風險等�?必�??�low?�medium?�high'),''
    body('purchaseDate').optional().isISO8601().withMessage('購買?��??��??��?'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({'
          success: false,''
          message: '輸入驗�?失�?',''
          code: 'VALIDATION_ERROR',
          errors: errors.array(),
        });
      }
      const Investment = getInvestmentModel();
// eslint-disable-next-line no-unused-vars
      const Card = getCardModel();

      if (!Investment || !Card) {
        return res.status(500).json({'
          success: false,''
          message: '?��?庫模?��?始�?失�?',''
          code: 'MODEL_INIT_FAILED',
        });'
      }
      // Settings?�聯''
      Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

      const {'
        cardId,''
        type = 'purchase',
        purchasePrice,'
        quantity = 1,''
        condition = 'near-mint',''
        notes = '',''
        riskLevel = 'medium',
        purchaseDate = new Date(),
      } = req.body;

      // Check?��??�No存在
      const card = await Card.findByPk(cardId);
      if (!card) {
        return res.status(404).json({'
          success: false,''
          message: '?��?不�???,''
          code: 'CARD_NOT_FOUND',
        });
      }
      // 計�??��???      const currentValue = parseFloat(card.currentPrice || 0) * quantity;
      const profitLoss = currentValue - parseFloat(purchasePrice) * quantity;
      const profitLossPercentage =
        parseFloat(purchasePrice) > 0
          ? (profitLoss / (parseFloat(purchasePrice) * quantity)) * 100
          : 0;

      // ?�建?��?記�?
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
        profitLoss,'
        profitLossPercentage,''
        status: 'active',
        riskLevel,
      });

      // ?��??�含?��?Information?��??��???      const investmentWithCard = await Investment.findByPk(newInvestment.id, {
        include: [
          {'
            model: Card,''
            as: 'card','
            attributes: [''
              'id',''
              'name',''
              'setName',''
              'rarity',''
              'cardType',''
              'currentPrice',''
              'imageUrl',
            ],
          },
        ],
      });

      logger.info(`添�??��?: ${req.user.username} 添�?�?${card.name} ?��?`);

      res.status(201).json({'
        success: true,''
        message: '?��?添�??��?',
        data: { investment: investmentWithCard },
      });'
    } catch (error) {''
      logger.error('添�??��??�誤:', error);
      res.status(500).json({'
        success: false,''
        message: '添�??��?失�?',''
        code: 'ADD_INVESTMENT_FAILED',
      });
    }
  }
);

// @route   GET /api/investments/:id
// @desc    ?��??��?詳�?'
// @access  Private''
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const Investment = getInvestmentModel();
// eslint-disable-next-line no-unused-vars
    const Card = getCardModel();

    if (!Investment || !Card) {
      return res.status(500).json({'
        success: false,''
        message: '?��?庫模?��?始�?失�?',''
        code: 'MODEL_INIT_FAILED',
      });'
    }
    // Settings?�聯''
    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    const investment = await Investment.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true,
      },
      include: [
        {'
          model: Card,''
          as: 'card','
          attributes: [''
            'id',''
            'name',''
            'setName',''
            'rarity',''
            'cardType',''
            'currentPrice',''
            'imageUrl',''
            'description',
          ],
        },
      ],
    });

    if (!investment) {
      return res.status(404).json({'
        success: false,''
        message: '?��?不�???,''
        code: 'INVESTMENT_NOT_FOUND',
      });
    }
    logger.info(
      `?��??��?詳�?: ${req.user.username} ?��??��? ${investment.card.name}`
    );

    res.json({
      success: true,
      data: { investment },
    });'
  } catch (error) {''
    logger.error('?��??��?詳�??�誤:', error);
    res.status(500).json({'
      success: false,''
      message: '?��??��?詳�?失�?',''
      code: 'GET_INVESTMENT_FAILED',
    });
  }
});

// @route   PUT /api/investments/:id
// @desc    ?�新?��?
// @access  Private'
router.put(''
  '/:id',
  protect,'
  [''
    body('notes')
      .optional()'
      .isLength({ max: 500 });''
      .withMessage('?�註?��?00?��?�?),''
    body('status')'
      .optional()''
      .isIn(['active', 'sold', 'cancelled'])''
      .withMessage('?�?��??�是active?�sold?�cancelled'),''
    body('condition')
      .optional()'
      .isIn([''
        'mint',''
        'near-mint',''
        'excellent',''
        'good',''
        'light-played',''
        'played',''
        'poor','
      ])''
      .withMessage('?��??�況無??),''
    body('riskLevel')'
      .optional()''
      .isIn(['low', 'medium', 'high'])''
      .withMessage('風險等�?必�??�low?�medium?�high'),''
    body('quantity').optional().isInt({ min: 1 }).withMessage('?��?必�?大於0'),
  ],
  async (req, res) => {
    try {
// eslint-disable-next-line no-unused-vars
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({'
          success: false,''
          message: '輸入驗�?失�?',''
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
        return res.status(500).json({'
          success: false,''
          message: '?��?庫模?��?始�?失�?',''
          code: 'MODEL_INIT_FAILED',
        });'
      }
      // Settings?�聯''
      Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

      const investment = await Investment.findOne({
        where: {
          id,
          userId: req.user.id,
          isActive: true,
        },
        include: [
          {'
            model: Card,''
            as: 'card',''
            attributes: ['currentPrice'],
          },
        ],
      });

      if (!investment) {
        return res.status(404).json({'
          success: false,''
          message: '?��?不�???,''
          code: 'INVESTMENT_NOT_FOUND',
        });
      }
      // ?�新Field
      const updateData = {};
      if (notes !== undefined) updateData.notes = notes;
      if (status !== undefined) updateData.status = status;
      if (condition !== undefined) updateData.condition = condition;
      if (riskLevel !== undefined) updateData.riskLevel = riskLevel;
      if (quantity !== undefined) updateData.quantity = quantity;

      // 如�??��??��?，�??��?算價?��??�虧
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
      // ?�新?��?記�?
      await investment.update(updateData);

      // ?��??�新後�?完整記�?
      const updatedInvestment = await Investment.findByPk(id, {
        include: [
          {'
            model: Card,''
            as: 'card','
            attributes: [''
              'id',''
              'name',''
              'setName',''
              'rarity',''
              'cardType',''
              'currentPrice',''
              'imageUrl',
            ],
          },
        ],
      });

      logger.info(
        `?�新?��?: ${req.user.username} ?�新�?${updatedInvestment.card.name} ?��?`
      );

      res.json({'
        success: true,''
        message: '?��??�新?��?',
        data: { investment: updatedInvestment },
      });'
    } catch (error) {''
      logger.error('?�新?��??�誤:', error);
      res.status(500).json({'
        success: false,''
        message: '?�新?��?失�?',''
        code: 'UPDATE_INVESTMENT_FAILED',
      });
    }
  }
);

// @route   DELETE /api/investments/:id'
// @desc    軟刪?��?�?// @access  Private''
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const Investment = getInvestmentModel();
// eslint-disable-next-line no-unused-vars
    const Card = getCardModel();

    if (!Investment || !Card) {
      return res.status(500).json({'
        success: false,''
        message: '?��?庫模?��?始�?失�?',''
        code: 'MODEL_INIT_FAILED',
      });'
    }
    // Settings?�聯''
    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    const investment = await Investment.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true,
      },
      include: [
        {'
          model: Card,''
          as: 'card',''
          attributes: ['name'],
        },
      ],
    });

    if (!investment) {
      return res.status(404).json({'
        success: false,''
        message: '?��?不�???,''
        code: 'INVESTMENT_NOT_FOUND',
      });
    }
    // 軟刪??    await investment.update({ isActive: false });

    logger.info(
      `?�除?��?: ${req.user.username} ?�除�?${investment.card.name} ?��?`
    );

    res.json({'
      success: true,''
      message: '?��??�除?��?',
    });'
  } catch (error) {''
    logger.error('?�除?��??�誤:', error);
    res.status(500).json({'
      success: false,''
      message: '?�除?��?失�?',''
      code: 'DELETE_INVESTMENT_FAILED',
    });
  }
});'
module.exports = router;''