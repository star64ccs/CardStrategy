const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// 模擬收藏數據
const mockCollections = [
  {
    id: '1',
    userId: 'user1',
    name: '我的龍族收藏',
    description: '收集各種龍族卡牌',
    isPublic: true,
    cards: [
      { cardId: '1', quantity: 2, condition: 'Near Mint', notes: '收藏用' },
      { cardId: '2', quantity: 1, condition: 'Light Played', notes: '遊戲用' }
    ],
    totalCards: 3,
    totalValue: 3800,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  }
];

// @route   GET /api/collections
// @desc    獲取用戶的收藏列表
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userCollections = mockCollections.filter(c => c.userId === req.user.id);
    
    logger.info(`獲取收藏列表: ${req.user.username}`);

    res.json({
      success: true,
      data: { collections: userCollections }
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
  body('isPublic').optional().isBoolean()
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

    const { name, description, isPublic = false } = req.body;

    const newCollection = {
      id: Date.now().toString(),
      userId: req.user.id,
      name,
      description: description || '',
      isPublic,
      cards: [],
      totalCards: 0,
      totalValue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockCollections.push(newCollection);

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

// @route   GET /api/collections/:id
// @desc    獲取收藏詳情
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const collection = mockCollections.find(c => c.id === id && c.userId === req.user.id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '收藏不存在',
        code: 'COLLECTION_NOT_FOUND'
      });
    }

    logger.info(`獲取收藏詳情: ${req.user.username} 查看 "${collection.name}"`);

    res.json({
      success: true,
      data: { collection }
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
  body('isPublic').optional().isBoolean()
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
    const { name, description, isPublic } = req.body;

    const collectionIndex = mockCollections.findIndex(c => c.id === id && c.userId === req.user.id);
    
    if (collectionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '收藏不存在',
        code: 'COLLECTION_NOT_FOUND'
      });
    }

    const collection = mockCollections[collectionIndex];
    
    if (name) collection.name = name;
    if (description !== undefined) collection.description = description;
    if (isPublic !== undefined) collection.isPublic = isPublic;
    collection.updatedAt = new Date().toISOString();

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
// @desc    刪除收藏
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const collectionIndex = mockCollections.findIndex(c => c.id === id && c.userId === req.user.id);
    
    if (collectionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '收藏不存在',
        code: 'COLLECTION_NOT_FOUND'
      });
    }

    const deletedCollection = mockCollections.splice(collectionIndex, 1)[0];

    logger.info(`刪除收藏: ${req.user.username} 刪除了 "${deletedCollection.name}"`);

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
  body('cardId').notEmpty().withMessage('卡牌ID為必填項'),
  body('quantity').isInt({ min: 1 }).withMessage('數量必須大於0'),
  body('condition').optional().isIn(['Near Mint', 'Light Played', 'Played', 'Poor']),
  body('notes').optional().isLength({ max: 200 }).withMessage('備註最多200個字符')
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
    const { cardId, quantity, condition = 'Near Mint', notes = '' } = req.body;

    const collection = mockCollections.find(c => c.id === id && c.userId === req.user.id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '收藏不存在',
        code: 'COLLECTION_NOT_FOUND'
      });
    }

    // 檢查卡牌是否已存在
    const existingCardIndex = collection.cards.findIndex(c => c.cardId === cardId);
    
    if (existingCardIndex !== -1) {
      // 更新現有卡牌
      collection.cards[existingCardIndex].quantity += quantity;
      collection.cards[existingCardIndex].notes = notes;
    } else {
      // 添加新卡牌
      collection.cards.push({ cardId, quantity, condition, notes });
    }

    // 更新統計信息
    collection.totalCards = collection.cards.reduce((sum, card) => sum + card.quantity, 0);
    collection.totalValue = collection.cards.reduce((sum, card) => sum + (card.quantity * 1000), 0); // 模擬價格
    collection.updatedAt = new Date().toISOString();

    logger.info(`添加卡牌到收藏: ${req.user.username} 在 "${collection.name}" 中添加了卡牌`);

    res.json({
      success: true,
      message: '卡牌添加成功',
      data: { collection }
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

// @route   DELETE /api/collections/:id/cards/:cardId
// @desc    從收藏中移除卡牌
// @access  Private
router.delete('/:id/cards/:cardId', protect, async (req, res) => {
  try {
    const { id, cardId } = req.params;

    const collection = mockCollections.find(c => c.id === id && c.userId === req.user.id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '收藏不存在',
        code: 'COLLECTION_NOT_FOUND'
      });
    }

    const cardIndex = collection.cards.findIndex(c => c.cardId === cardId);
    
    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '卡牌不存在於此收藏中',
        code: 'CARD_NOT_IN_COLLECTION'
      });
    }

    collection.cards.splice(cardIndex, 1);
    
    // 更新統計信息
    collection.totalCards = collection.cards.reduce((sum, card) => sum + card.quantity, 0);
    collection.totalValue = collection.cards.reduce((sum, card) => sum + (card.quantity * 1000), 0);
    collection.updatedAt = new Date().toISOString();

    logger.info(`從收藏移除卡牌: ${req.user.username} 從 "${collection.name}" 中移除了卡牌`);

    res.json({
      success: true,
      message: '卡牌移除成功',
      data: { collection }
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
