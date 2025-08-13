const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// 模擬投資數據
const mockInvestments = [
  {
    id: '1',
    userId: 'user1',
    cardId: '1',
    cardName: '青眼白龍',
    type: 'purchase',
    amount: 1500,
    quantity: 1,
    price: 1500,
    currentPrice: 1600,
    profitLoss: 100,
    profitLossPercent: 6.67,
    date: '2024-01-01T00:00:00Z',
    notes: '長期投資',
    status: 'active',
    riskLevel: 'medium'
  },
  {
    id: '2',
    userId: 'user1',
    cardId: '2',
    cardName: '黑魔導',
    type: 'purchase',
    amount: 800,
    quantity: 1,
    price: 800,
    currentPrice: 850,
    profitLoss: 50,
    profitLossPercent: 6.25,
    date: '2024-01-15T00:00:00Z',
    notes: '收藏投資',
    status: 'active',
    riskLevel: 'low'
  }
];

// @route   GET /api/investments
// @desc    獲取用戶投資列表
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userInvestments = mockInvestments.filter(inv => inv.userId === req.user.id);
    
    // 計算投資組合統計
    const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalValue = userInvestments.reduce((sum, inv) => sum + (inv.currentPrice * inv.quantity), 0);
    const totalProfitLoss = userInvestments.reduce((sum, inv) => sum + inv.profitLoss, 0);
    const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    const portfolioStats = {
      totalInvestments: userInvestments.length,
      totalInvested,
      totalValue,
      totalProfitLoss,
      totalProfitLossPercent: Math.round(totalProfitLossPercent * 100) / 100,
      profitableInvestments: userInvestments.filter(inv => inv.profitLoss > 0).length,
      avgReturn: userInvestments.length > 0 
        ? userInvestments.reduce((sum, inv) => sum + inv.profitLossPercent, 0) / userInvestments.length 
        : 0
    };

    logger.info(`獲取投資列表: ${req.user.username}`);

    res.json({
      success: true,
      data: {
        investments: userInvestments,
        portfolioStats
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

// @route   POST /api/investments
// @desc    添加新投資
// @access  Private
router.post('/', protect, [
  body('cardId').notEmpty().withMessage('卡牌ID為必填項'),
  body('cardName').notEmpty().withMessage('卡牌名稱為必填項'),
  body('type').isIn(['purchase', 'sale']).withMessage('投資類型必須是purchase或sale'),
  body('amount').isFloat({ min: 0 }).withMessage('金額必須大於0'),
  body('quantity').isInt({ min: 1 }).withMessage('數量必須大於0'),
  body('price').isFloat({ min: 0 }).withMessage('價格必須大於0'),
  body('notes').optional().isLength({ max: 500 }).withMessage('備註最多500個字符'),
  body('riskLevel').optional().isIn(['low', 'medium', 'high']).withMessage('風險等級必須是low、medium或high')
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

    const {
      cardId,
      cardName,
      type,
      amount,
      quantity,
      price,
      notes = '',
      riskLevel = 'medium'
    } = req.body;

    const newInvestment = {
      id: Date.now().toString(),
      userId: req.user.id,
      cardId,
      cardName,
      type,
      amount,
      quantity,
      price,
      currentPrice: price, // 初始價格
      profitLoss: 0,
      profitLossPercent: 0,
      date: new Date().toISOString(),
      notes,
      status: 'active',
      riskLevel
    };

    mockInvestments.push(newInvestment);

    logger.info(`添加投資: ${req.user.username} 添加了 ${cardName} 投資`);

    res.status(201).json({
      success: true,
      message: '投資添加成功',
      data: { investment: newInvestment }
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
    
    const investment = mockInvestments.find(inv => inv.id === id && inv.userId === req.user.id);
    
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: '投資不存在',
        code: 'INVESTMENT_NOT_FOUND'
      });
    }

    logger.info(`獲取投資詳情: ${req.user.username} 查看投資 ${investment.cardName}`);

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
  body('currentPrice').optional().isFloat({ min: 0 }).withMessage('當前價格必須大於0')
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
    const { notes, status, currentPrice } = req.body;

    const investmentIndex = mockInvestments.findIndex(inv => inv.id === id && inv.userId === req.user.id);
    
    if (investmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '投資不存在',
        code: 'INVESTMENT_NOT_FOUND'
      });
    }

    const investment = mockInvestments[investmentIndex];
    
    if (notes !== undefined) investment.notes = notes;
    if (status !== undefined) investment.status = status;
    
    if (currentPrice !== undefined) {
      investment.currentPrice = currentPrice;
      investment.profitLoss = (currentPrice - investment.price) * investment.quantity;
      investment.profitLossPercent = ((currentPrice - investment.price) / investment.price) * 100;
    }

    logger.info(`更新投資: ${req.user.username} 更新了 ${investment.cardName} 投資`);

    res.json({
      success: true,
      message: '投資更新成功',
      data: { investment }
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
// @desc    刪除投資
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const investmentIndex = mockInvestments.findIndex(inv => inv.id === id && inv.userId === req.user.id);
    
    if (investmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '投資不存在',
        code: 'INVESTMENT_NOT_FOUND'
      });
    }

    const deletedInvestment = mockInvestments.splice(investmentIndex, 1)[0];

    logger.info(`刪除投資: ${req.user.username} 刪除了 ${deletedInvestment.cardName} 投資`);

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

// @route   GET /api/investments/portfolio
// @desc    獲取投資組合概覽
// @access  Private
router.get('/portfolio', protect, async (req, res) => {
  try {
    const userInvestments = mockInvestments.filter(inv => inv.userId === req.user.id);
    
    // 計算詳細統計
    const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalValue = userInvestments.reduce((sum, inv) => sum + (inv.currentPrice * inv.quantity), 0);
    const totalProfitLoss = userInvestments.reduce((sum, inv) => sum + inv.profitLoss, 0);
    const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    // 風險評估
    const riskLevels = userInvestments.map(inv => inv.riskLevel);
    const lowRisk = riskLevels.filter(risk => risk === 'low').length;
    const mediumRisk = riskLevels.filter(risk => risk === 'medium').length;
    const highRisk = riskLevels.filter(risk => risk === 'high').length;

    let overallRiskLevel = 'low';
    if (highRisk > lowRisk + mediumRisk) overallRiskLevel = 'high';
    else if (mediumRisk > lowRisk) overallRiskLevel = 'medium';

    const portfolioOverview = {
      totalInvestments: userInvestments.length,
      totalInvested,
      totalValue,
      totalProfitLoss,
      totalProfitLossPercent: Math.round(totalProfitLossPercent * 100) / 100,
      profitableInvestments: userInvestments.filter(inv => inv.profitLoss > 0).length,
      avgReturn: userInvestments.length > 0 
        ? userInvestments.reduce((sum, inv) => sum + inv.profitLossPercent, 0) / userInvestments.length 
        : 0,
      riskAssessment: {
        lowRisk,
        mediumRisk,
        highRisk,
        riskLevel: overallRiskLevel
      }
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
    const userInvestments = mockInvestments.filter(inv => inv.userId === req.user.id);
    
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

    const analytics = {
      byType,
      byRisk,
      byStatus,
      performance: {
        bestInvestment: userInvestments.length > 0 
          ? userInvestments.reduce((best, inv) => inv.profitLossPercent > best.profitLossPercent ? inv : best)
          : null,
        worstInvestment: userInvestments.length > 0
          ? userInvestments.reduce((worst, inv) => inv.profitLossPercent < worst.profitLossPercent ? inv : worst)
          : null
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

module.exports = router;
