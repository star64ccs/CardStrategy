const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { protect, optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// 模擬卡牌數據（實際項目中應該使用數據庫模型）
const mockCards = [
  {
    id: '1',
    name: '青眼白龍',
    nameEn: 'Blue-Eyes White Dragon',
    set: 'LEGEND OF BLUE EYES WHITE DRAGON',
    rarity: 'Ultra Rare',
    type: 'Monster',
    attribute: 'LIGHT',
    level: 8,
    attack: 3000,
    defense: 2500,
    description: '這隻傳說中的龍擁有強大的攻擊力。',
    imageUrl: 'https://example.com/blue-eyes.jpg',
    price: 1500,
    marketPrice: 1600,
    priceHistory: [
      { date: '2024-01-01', price: 1400 },
      { date: '2024-01-15', price: 1500 },
      { date: '2024-02-01', price: 1600 }
    ],
    condition: 'Near Mint',
    language: 'Chinese',
    isFoil: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '2',
    name: '黑魔導',
    nameEn: 'Dark Magician',
    set: 'LEGEND OF BLUE EYES WHITE DRAGON',
    rarity: 'Ultra Rare',
    type: 'Monster',
    attribute: 'DARK',
    level: 7,
    attack: 2500,
    defense: 2100,
    description: '最強的魔法師。',
    imageUrl: 'https://example.com/dark-magician.jpg',
    price: 800,
    marketPrice: 850,
    priceHistory: [
      { date: '2024-01-01', price: 750 },
      { date: '2024-01-15', price: 800 },
      { date: '2024-02-01', price: 850 }
    ],
    condition: 'Near Mint',
    language: 'Chinese',
    isFoil: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  }
];

// @route   GET /api/cards
// @desc    獲取卡牌列表
// @access  Public
router.get('/', [
  query('search').optional().isString(),
  query('set').optional().isString(),
  query('rarity').optional().isString(),
  query('type').optional().isString(),
  query('minPrice').optional().isNumeric(),
  query('maxPrice').optional().isNumeric(),
  query('sortBy').optional().isIn(['name', 'price', 'rarity', 'set', 'dateAdded']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '查詢參數驗證失敗',
        code: 'VALIDATION_ERROR',
        errors: errors.array()
      });
    }

    const {
      search,
      set,
      rarity,
      type,
      minPrice,
      maxPrice,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 20
    } = req.query;

    // 過濾卡牌
    let filteredCards = [...mockCards];

    if (search) {
      filteredCards = filteredCards.filter(card =>
        card.name.toLowerCase().includes(search.toLowerCase()) ||
        card.nameEn.toLowerCase().includes(search.toLowerCase()) ||
        card.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (set) {
      filteredCards = filteredCards.filter(card =>
        card.set.toLowerCase().includes(set.toLowerCase())
      );
    }

    if (rarity) {
      filteredCards = filteredCards.filter(card =>
        card.rarity.toLowerCase() === rarity.toLowerCase()
      );
    }

    if (type) {
      filteredCards = filteredCards.filter(card =>
        card.type.toLowerCase() === type.toLowerCase()
      );
    }

    if (minPrice) {
      filteredCards = filteredCards.filter(card => card.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      filteredCards = filteredCards.filter(card => card.price <= parseFloat(maxPrice));
    }

    // 排序
    filteredCards.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'rarity':
          aValue = a.rarity;
          bValue = b.rarity;
          break;
        case 'set':
          aValue = a.set;
          bValue = b.set;
          break;
        case 'dateAdded':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'desc') {
        [aValue, bValue] = [bValue, aValue];
      }

      if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue);
      }
      return aValue - bValue;
    });

    // 分頁
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCards = filteredCards.slice(startIndex, endIndex);

    // 計算統計信息
    const totalCards = filteredCards.length;
    const totalPages = Math.ceil(totalCards / limit);
    const averagePrice = totalCards > 0 
      ? filteredCards.reduce((sum, card) => sum + card.price, 0) / totalCards 
      : 0;

    logger.info(`卡牌查詢: ${totalCards} 張卡牌，第 ${page} 頁`);

    res.json({
      success: true,
      data: {
        cards: paginatedCards,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCards,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        statistics: {
          totalCards,
          averagePrice: Math.round(averagePrice * 100) / 100,
          priceRange: {
            min: totalCards > 0 ? Math.min(...filteredCards.map(c => c.price)) : 0,
            max: totalCards > 0 ? Math.max(...filteredCards.map(c => c.price)) : 0
          }
        }
      }
    });
  } catch (error) {
    logger.error('獲取卡牌列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取卡牌列表失敗',
      code: 'GET_CARDS_FAILED'
    });
  }
});

// @route   GET /api/cards/:id
// @desc    獲取單張卡牌詳情
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const card = mockCards.find(c => c.id === id);
    
    if (!card) {
      return res.status(404).json({
        success: false,
        message: '卡牌不存在',
        code: 'CARD_NOT_FOUND'
      });
    }

    logger.info(`獲取卡牌詳情: ${card.name}`);

    res.json({
      success: true,
      data: { card }
    });
  } catch (error) {
    logger.error('獲取卡牌詳情錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取卡牌詳情失敗',
      code: 'GET_CARD_FAILED'
    });
  }
});

// @route   POST /api/cards/recognize
// @desc    識別卡牌（AI功能）
// @access  Private
router.post('/recognize', protect, [
  body('imageUrl').isURL().withMessage('請提供有效的圖片URL'),
  body('confidence').optional().isFloat({ min: 0, max: 1 })
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

    const { imageUrl, confidence = 0.8 } = req.body;

    // 模擬AI識別結果
    const recognizedCard = {
      id: 'recognized-1',
      name: '識別出的卡牌',
      nameEn: 'Recognized Card',
      confidence: 0.95,
      imageUrl,
      possibleMatches: mockCards.slice(0, 3)
    };

    logger.info(`卡牌識別: ${req.user.username} 識別了圖片`);

    res.json({
      success: true,
      message: '卡牌識別成功',
      data: { card: recognizedCard }
    });
  } catch (error) {
    logger.error('卡牌識別錯誤:', error);
    res.status(500).json({
      success: false,
      message: '卡牌識別失敗',
      code: 'RECOGNIZE_CARD_FAILED'
    });
  }
});

// @route   GET /api/cards/sets
// @desc    獲取卡牌系列列表
// @access  Public
router.get('/sets', async (req, res) => {
  try {
    const sets = [...new Set(mockCards.map(card => card.set))];
    
    res.json({
      success: true,
      data: { sets }
    });
  } catch (error) {
    logger.error('獲取卡牌系列錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取卡牌系列失敗',
      code: 'GET_SETS_FAILED'
    });
  }
});

// @route   GET /api/cards/rarities
// @desc    獲取稀有度列表
// @access  Public
router.get('/rarities', async (req, res) => {
  try {
    const rarities = [...new Set(mockCards.map(card => card.rarity))];
    
    res.json({
      success: true,
      data: { rarities }
    });
  } catch (error) {
    logger.error('獲取稀有度列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取稀有度列表失敗',
      code: 'GET_RARITIES_FAILED'
    });
  }
});

module.exports = router;
