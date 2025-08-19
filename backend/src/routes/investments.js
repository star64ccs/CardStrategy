const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');
const getInvestmentModel = require('../models/Investment');
const getCardModel = require('../models/Card');
const getUserModel = require('../models/User');
const databaseOptimizer = require('../services/databaseOptimizer');

const router = express.Router();

// @route   GET /api/investments
// @desc    獲取用戶投資列表
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const Investment = getInvestmentModel();
    const Card = getCardModel();

    if (!Investment || !Card) {
      return res.status(500).json({
        success: false,
        message: '數據庫模型初始化失敗',
        code: 'MODEL_INIT_FAILED'
      });
    }

    // 設置關聯
    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    const { page = 1, limit = 10, search, type, status, riskLevel, sortBy = 'purchaseDate', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    // 構建查詢條件
    const whereClause = {
      userId: req.user.id,
      isActive: true
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

    // 使用 databaseOptimizer 優化查詢
    const optimizedQuery = databaseOptimizer.optimizeQuery({
      where: whereClause,
      include: [{
        model: Card,
        as: 'card',
        attributes: ['id', 'name', 'setName', 'rarity', 'cardType', 'currentPrice', 'imageUrl']
      }],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // 執行優化後的查詢並監控性能
    const startTime = Date.now();
    const { count, rows: investments } = await databaseOptimizer.monitorQuery(
      Investment,
      'findAndCountAll',
      optimizedQuery
    );

    // 計算投資組合統計
    const allUserInvestments = await databaseOptimizer.cachedQuery(
      Investment,
      `user_investments:${req.user.id}`,
      {
        where: { userId: req.user.id, isActive: true },
        include: [{
          model: Card,
          as: 'card',
          attributes: ['currentPrice']
        }]
      },
      300 // 5分鐘緩存
    );

    const totalInvested = allUserInvestments.reduce((sum, inv) =>
      sum + parseFloat(inv.purchasePrice) * inv.quantity, 0
    );
    const totalValue = allUserInvestments.reduce((sum, inv) =>
      sum + parseFloat(inv.card.currentPrice || 0) * inv.quantity, 0
    );
    const totalProfitLoss = allUserInvestments.reduce((sum, inv) =>
      sum + parseFloat(inv.profitLoss), 0
    );
    const totalProfitLossPercent = totalInvested > 0
      ? (totalProfitLoss / totalInvested) * 100
      : 0;

    const portfolioStats = {
      totalInvestments: allUserInvestments.length,
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      totalValue: parseFloat(totalValue.toFixed(2)),
      totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
      totalProfitLossPercent: parseFloat(totalProfitLossPercent.toFixed(2)),
      profitableInvestments: allUserInvestments.filter(inv => parseFloat(inv.profitLoss) > 0).length,
      avgReturn: allUserInvestments.length > 0
        ? parseFloat((allUserInvestments.reduce((sum, inv) =>
          sum + parseFloat(inv.profitLossPercentage), 0) / allUserInvestments.length).toFixed(2))
        : 0
    };

    logger.info(`獲取投資列表: ${req.user.username}`);

    res.json({
      success: true,
      data: {
        investments,
        portfolioStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('獲取投資列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取投資列表失敗',
      code: 'GET_INVESTMENTS_FAILED'
    });
  }
});

// @route   GET /api/investments/portfolio
// @desc    獲取投資組合概覽
// @access  Private
router.get('/portfolio', protect, async (req, res) => {
  try {
    const Investment = getInvestmentModel();
    const Card = getCardModel();

    if (!Investment || !Card) {
      return res.status(500).json({
        success: false,
        message: '數據庫模型初始化失敗',
        code: 'MODEL_INIT_FAILED'
      });
    }

    // 設置關聯
    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    const userInvestments = await Investment.findAll({
      where: { userId: req.user.id, isActive: true },
      include: [{
        model: Card,
        as: 'card',
        attributes: ['currentPrice']
      }]
    });

    // 計算詳細統計
    const totalInvested = userInvestments.reduce((sum, inv) =>
      sum + parseFloat(inv.purchasePrice) * inv.quantity, 0
    );
    const totalValue = userInvestments.reduce((sum, inv) =>
      sum + parseFloat(inv.card.currentPrice || 0) * inv.quantity, 0
    );
    const totalProfitLoss = userInvestments.reduce((sum, inv) =>
      sum + parseFloat(inv.profitLoss), 0
    );
    const totalProfitLossPercent = totalInvested > 0
      ? (totalProfitLoss / totalInvested) * 100
      : 0;

    // 風險評估
    const riskLevels = userInvestments.map(inv => inv.riskLevel);
    const lowRisk = riskLevels.filter(risk => risk === 'low').length;
    const mediumRisk = riskLevels.filter(risk => risk === 'medium').length;
    const highRisk = riskLevels.filter(risk => risk === 'high').length;

    let overallRiskLevel = 'low';
    if (highRisk > lowRisk + mediumRisk) overallRiskLevel = 'high';
    else if (mediumRisk > lowRisk) overallRiskLevel = 'medium';

    // 按狀態分組
    const byStatus = {
      active: userInvestments.filter(inv => inv.status === 'active').length,
      sold: userInvestments.filter(inv => inv.status === 'sold').length,
      cancelled: userInvestments.filter(inv => inv.status === 'cancelled').length
    };

    const portfolioOverview = {
      totalInvestments: userInvestments.length,
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      totalValue: parseFloat(totalValue.toFixed(2)),
      totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
      totalProfitLossPercent: parseFloat(totalProfitLossPercent.toFixed(2)),
      profitableInvestments: userInvestments.filter(inv => parseFloat(inv.profitLoss) > 0).length,
      avgReturn: userInvestments.length > 0
        ? parseFloat((userInvestments.reduce((sum, inv) =>
          sum + parseFloat(inv.profitLossPercentage), 0) / userInvestments.length).toFixed(2))
        : 0,
      riskAssessment: {
        lowRisk,
        mediumRisk,
        highRisk,
        riskLevel: overallRiskLevel
      },
      statusBreakdown: byStatus
    };

    logger.info(`獲取投資組合: ${req.user.username}`);

    res.json({
      success: true,
      data: { portfolioOverview }
    });
  } catch (error) {
    logger.error('獲取投資組合錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取投資組合失敗',
      code: 'GET_PORTFOLIO_FAILED'
    });
  }
});

// @route   GET /api/investments/analytics
// @desc    獲取投資分析
// @access  Private
router.get('/analytics', protect, async (req, res) => {
  try {
    const Investment = getInvestmentModel();
    const Card = getCardModel();

    if (!Investment || !Card) {
      return res.status(500).json({
        success: false,
        message: '數據庫模型初始化失敗',
        code: 'MODEL_INIT_FAILED'
      });
    }

    // 設置關聯
    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    const userInvestments = await Investment.findAll({
      where: { userId: req.user.id, isActive: true },
      include: [{
        model: Card,
        as: 'card',
        attributes: ['id', 'name', 'setName', 'rarity', 'cardType', 'currentPrice', 'imageUrl']
      }]
    });

    // 按類型分組
    const byType = {
      purchase: userInvestments.filter(inv => inv.type === 'purchase'),
      sale: userInvestments.filter(inv => inv.type === 'sale')
    };

    // 按風險等級分組
    const byRisk = {
      low: userInvestments.filter(inv => inv.riskLevel === 'low'),
      medium: userInvestments.filter(inv => inv.riskLevel === 'medium'),
      high: userInvestments.filter(inv => inv.riskLevel === 'high')
    };

    // 按狀態分組
    const byStatus = {
      active: userInvestments.filter(inv => inv.status === 'active'),
      sold: userInvestments.filter(inv => inv.status === 'sold'),
      cancelled: userInvestments.filter(inv => inv.status === 'cancelled')
    };

    // 按稀有度分組
    const byRarity = {};
    userInvestments.forEach(inv => {
      const {rarity} = inv.card;
      if (!byRarity[rarity]) {
        byRarity[rarity] = [];
      }
      byRarity[rarity].push(inv);
    });

    // 按系列分組
    const bySet = {};
    userInvestments.forEach(inv => {
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
        bestInvestment: userInvestments.length > 0
          ? userInvestments.reduce((best, inv) =>
            (parseFloat(inv.profitLossPercentage) > parseFloat(best.profitLossPercentage) ? inv : best))
          : null,
        worstInvestment: userInvestments.length > 0
          ? userInvestments.reduce((worst, inv) =>
            (parseFloat(inv.profitLossPercentage) < parseFloat(worst.profitLossPercentage) ? inv : worst))
          : null,
        totalInvested: parseFloat(userInvestments.reduce((sum, inv) =>
          sum + parseFloat(inv.purchasePrice) * inv.quantity, 0).toFixed(2)),
        totalValue: parseFloat(userInvestments.reduce((sum, inv) =>
          sum + parseFloat(inv.card.currentPrice || 0) * inv.quantity, 0).toFixed(2)),
        totalProfitLoss: parseFloat(userInvestments.reduce((sum, inv) =>
          sum + parseFloat(inv.profitLoss), 0).toFixed(2))
      }
    };

    logger.info(`獲取投資分析: ${req.user.username}`);

    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    logger.error('獲取投資分析錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取投資分析失敗',
      code: 'GET_ANALYTICS_FAILED'
    });
  }
});

// @route   POST /api/investments
// @desc    添加新投資
// @access  Private
router.post('/', protect, [
  body('cardId').isInt({ min: 1 }).withMessage('卡牌ID必須是正整數'),
  body('type').isIn(['purchase', 'sale']).withMessage('投資類型必須是purchase或sale'),
  body('purchasePrice').isFloat({ min: 0 }).withMessage('購買價格必須大於0'),
  body('quantity').isInt({ min: 1 }).withMessage('數量必須大於0'),
  body('condition').optional().isIn(['mint', 'near-mint', 'excellent', 'good', 'light-played', 'played', 'poor']).withMessage('卡片狀況無效'),
  body('notes').optional().isLength({ max: 500 }).withMessage('備註最多500個字符'),
  body('riskLevel').optional().isIn(['low', 'medium', 'high']).withMessage('風險等級必須是low、medium或high'),
  body('purchaseDate').optional().isISO8601().withMessage('購買日期格式無效')
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

    const Investment = getInvestmentModel();
    const Card = getCardModel();

    if (!Investment || !Card) {
      return res.status(500).json({
        success: false,
        message: '數據庫模型初始化失敗',
        code: 'MODEL_INIT_FAILED'
      });
    }

    // 設置關聯
    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    const {
      cardId,
      type = 'purchase',
      purchasePrice,
      quantity = 1,
      condition = 'near-mint',
      notes = '',
      riskLevel = 'medium',
      purchaseDate = new Date()
    } = req.body;

    // 檢查卡牌是否存在
    const card = await Card.findByPk(cardId);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: '卡牌不存在',
        code: 'CARD_NOT_FOUND'
      });
    }

    // 計算初始值
    const currentValue = parseFloat(card.currentPrice || 0) * quantity;
    const profitLoss = currentValue - (parseFloat(purchasePrice) * quantity);
    const profitLossPercentage = parseFloat(purchasePrice) > 0
      ? (profitLoss / (parseFloat(purchasePrice) * quantity)) * 100
      : 0;

    // 創建投資記錄
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
      riskLevel
    });

    // 獲取包含卡牌信息的完整記錄
    const investmentWithCard = await Investment.findByPk(newInvestment.id, {
      include: [{
        model: Card,
        as: 'card',
        attributes: ['id', 'name', 'setName', 'rarity', 'cardType', 'currentPrice', 'imageUrl']
      }]
    });

    logger.info(`添加投資: ${req.user.username} 添加了 ${card.name} 投資`);

    res.status(201).json({
      success: true,
      message: '投資添加成功',
      data: { investment: investmentWithCard }
    });
  } catch (error) {
    logger.error('添加投資錯誤:', error);
    res.status(500).json({
      success: false,
      message: '添加投資失敗',
      code: 'ADD_INVESTMENT_FAILED'
    });
  }
});

// @route   GET /api/investments/:id
// @desc    獲取投資詳情
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const Investment = getInvestmentModel();
    const Card = getCardModel();

    if (!Investment || !Card) {
      return res.status(500).json({
        success: false,
        message: '數據庫模型初始化失敗',
        code: 'MODEL_INIT_FAILED'
      });
    }

    // 設置關聯
    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    const investment = await Investment.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true
      },
      include: [{
        model: Card,
        as: 'card',
        attributes: ['id', 'name', 'setName', 'rarity', 'cardType', 'currentPrice', 'imageUrl', 'description']
      }]
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: '投資不存在',
        code: 'INVESTMENT_NOT_FOUND'
      });
    }

    logger.info(`獲取投資詳情: ${req.user.username} 查看投資 ${investment.card.name}`);

    res.json({
      success: true,
      data: { investment }
    });
  } catch (error) {
    logger.error('獲取投資詳情錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取投資詳情失敗',
      code: 'GET_INVESTMENT_FAILED'
    });
  }
});

// @route   PUT /api/investments/:id
// @desc    更新投資
// @access  Private
router.put('/:id', protect, [
  body('notes').optional().isLength({ max: 500 }).withMessage('備註最多500個字符'),
  body('status').optional().isIn(['active', 'sold', 'cancelled']).withMessage('狀態必須是active、sold或cancelled'),
  body('condition').optional().isIn(['mint', 'near-mint', 'excellent', 'good', 'light-played', 'played', 'poor']).withMessage('卡片狀況無效'),
  body('riskLevel').optional().isIn(['low', 'medium', 'high']).withMessage('風險等級必須是low、medium或high'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('數量必須大於0')
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

    const { id } = req.params;
    const { notes, status, condition, riskLevel, quantity } = req.body;

    const Investment = getInvestmentModel();
    const Card = getCardModel();

    if (!Investment || !Card) {
      return res.status(500).json({
        success: false,
        message: '數據庫模型初始化失敗',
        code: 'MODEL_INIT_FAILED'
      });
    }

    // 設置關聯
    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    const investment = await Investment.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true
      },
      include: [{
        model: Card,
        as: 'card',
        attributes: ['currentPrice']
      }]
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: '投資不存在',
        code: 'INVESTMENT_NOT_FOUND'
      });
    }

    // 更新字段
    const updateData = {};
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;
    if (condition !== undefined) updateData.condition = condition;
    if (riskLevel !== undefined) updateData.riskLevel = riskLevel;
    if (quantity !== undefined) updateData.quantity = quantity;

    // 如果數量改變，重新計算價值和盈虧
    if (quantity !== undefined) {
      const newCurrentValue = parseFloat(investment.card.currentPrice || 0) * quantity;
      const newProfitLoss = newCurrentValue - (parseFloat(investment.purchasePrice) * quantity);
      const newProfitLossPercentage = parseFloat(investment.purchasePrice) > 0
        ? (newProfitLoss / (parseFloat(investment.purchasePrice) * quantity)) * 100
        : 0;

      updateData.currentValue = newCurrentValue;
      updateData.profitLoss = newProfitLoss;
      updateData.profitLossPercentage = newProfitLossPercentage;
    }

    // 更新投資記錄
    await investment.update(updateData);

    // 獲取更新後的完整記錄
    const updatedInvestment = await Investment.findByPk(id, {
      include: [{
        model: Card,
        as: 'card',
        attributes: ['id', 'name', 'setName', 'rarity', 'cardType', 'currentPrice', 'imageUrl']
      }]
    });

    logger.info(`更新投資: ${req.user.username} 更新了 ${updatedInvestment.card.name} 投資`);

    res.json({
      success: true,
      message: '投資更新成功',
      data: { investment: updatedInvestment }
    });
  } catch (error) {
    logger.error('更新投資錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新投資失敗',
      code: 'UPDATE_INVESTMENT_FAILED'
    });
  }
});

// @route   DELETE /api/investments/:id
// @desc    軟刪除投資
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const Investment = getInvestmentModel();
    const Card = getCardModel();

    if (!Investment || !Card) {
      return res.status(500).json({
        success: false,
        message: '數據庫模型初始化失敗',
        code: 'MODEL_INIT_FAILED'
      });
    }

    // 設置關聯
    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    const investment = await Investment.findOne({
      where: {
        id,
        userId: req.user.id,
        isActive: true
      },
      include: [{
        model: Card,
        as: 'card',
        attributes: ['name']
      }]
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: '投資不存在',
        code: 'INVESTMENT_NOT_FOUND'
      });
    }

    // 軟刪除
    await investment.update({ isActive: false });

    logger.info(`刪除投資: ${req.user.username} 刪除了 ${investment.card.name} 投資`);

    res.json({
      success: true,
      message: '投資刪除成功'
    });
  } catch (error) {
    logger.error('刪除投資錯誤:', error);
    res.status(500).json({
      success: false,
      message: '刪除投資失敗',
      code: 'DELETE_INVESTMENT_FAILED'
    });
  }
});

module.exports = router;
