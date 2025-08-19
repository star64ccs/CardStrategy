const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');
const { validateInput } = require('../middleware/validation');

// AI聊天助手相關模型
const ChatSession = require('../models/ChatSession').getChatSessionModel();
const ChatMessage = require('../models/ChatMessage').getChatMessageModel();
const KnowledgeItem = require('../models/KnowledgeItem').getKnowledgeItemModel();
const Recommendation = require('../models/Recommendation').getRecommendationModel();
const UserPreference = require('../models/UserPreference').getUserPreferenceModel();

// 發送消息並獲取回應
router.post('/send-message', protect, async (req, res) => {
  try {
    const { content, sessionId, userId, context } = req.body;
    
    logger.info('🔄 處理AI聊天消息', { sessionId, userId, contentLength: content.length });

    // 生成消息ID
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 創建用戶消息
    const userMessage = await ChatMessage.create({
      messageId,
      timestamp: new Date(),
      type: 'user',
      content,
      sessionId,
      userId,
      context
    });

    // 模擬意圖識別
    const intents = ['card_inquiry', 'price_check', 'investment_advice', 'market_analysis', 'general_question'];
    const randomIntent = intents[Math.floor(Math.random() * intents.length)];
    const confidence = Math.random() * 0.3 + 0.7; // 70%-100%

    // 生成AI回應
    let aiResponse = '';
    switch (randomIntent) {
      case 'card_inquiry':
        aiResponse = '我可以幫您查詢卡片信息。請告訴我您想了解哪張卡片的詳細信息？';
        break;
      case 'price_check':
        aiResponse = '我可以幫您查詢卡片價格。請提供卡片名稱或編號，我會為您獲取最新的市場價格信息。';
        break;
      case 'investment_advice':
        aiResponse = '基於當前的市場趨勢，我建議您關注以下幾個投資方向：1) 熱門遊戲卡牌 2) 限量版收藏卡 3) 新發行的卡牌系列。您想了解哪個方面的詳細建議？';
        break;
      case 'market_analysis':
        aiResponse = '根據最新的市場數據分析，卡牌市場整體呈現上升趨勢。熱門卡牌的價格在過去30天內平均上漲了15%。您想了解具體的市場數據嗎？';
        break;
      default:
        aiResponse = '感謝您的提問！我是您的AI助手，可以幫助您查詢卡片信息、分析市場趨勢、提供投資建議等。請告訴我您需要什麼幫助？';
    }

    // 創建AI回應消息
    const aiMessageId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const aiMessage = await ChatMessage.create({
      messageId: aiMessageId,
      timestamp: new Date(),
      type: 'assistant',
      content: aiResponse,
      intent: randomIntent,
      confidence,
      sessionId,
      userId,
      context: {
        recognizedIntent: randomIntent,
        confidence,
        entities: []
      }
    });

    // 更新會話
    await ChatSession.update(
      {
        lastActivity: new Date(),
        'context.currentTopic': randomIntent
      },
      {
        where: { sessionId }
      }
    );

    logger.info('✅ AI聊天消息處理完成', { messageId, aiMessageId });

    res.status(201).json(aiMessage);
  } catch (error) {
    logger.error('❌ 處理AI聊天消息失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: error.message
    });
  }
});

// 創建新的聊天會話
router.post('/sessions', protect, async (req, res) => {
  try {
    const { userId, initialContext } = req.body;
    
    logger.info('🔄 創建新的聊天會話', { userId });

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session = await ChatSession.create({
      sessionId,
      userId,
      startTime: new Date(),
      lastActivity: new Date(),
      messages: [],
      context: {
        currentTopic: 'general',
        userPreferences: {},
        conversationHistory: []
      },
      status: 'active'
    });

    logger.info('✅ 聊天會話創建成功', { sessionId });

    res.status(201).json(session);
  } catch (error) {
    logger.error('❌ 創建聊天會話失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to create chat session',
      error: error.message
    });
  }
});

// 獲取聊天會話
router.get('/sessions/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await ChatSession.findOne({
      where: { sessionId },
      include: [{
        model: ChatMessage,
        as: 'messages',
        order: [['timestamp', 'ASC']]
      }]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json(session);
  } catch (error) {
    logger.error('❌ 獲取聊天會話失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get chat session',
      error: error.message
    });
  }
});

// 獲取用戶的所有會話
router.get('/sessions', protect, async (req, res) => {
  try {
    const { userId } = req.query;
    
    const sessions = await ChatSession.findAll({
      where: { userId },
      order: [['lastActivity', 'DESC']],
      include: [{
        model: ChatMessage,
        as: 'messages',
        limit: 5,
        order: [['timestamp', 'DESC']]
      }]
    });

    res.json(sessions);
  } catch (error) {
    logger.error('❌ 獲取用戶會話失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get user sessions',
      error: error.message
    });
  }
});

// 結束聊天會話
router.put('/sessions/:sessionId/end', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await ChatSession.findOne({
      where: { sessionId },
      include: [{
        model: ChatMessage,
        as: 'messages'
      }]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // 計算會話統計
    const totalMessages = session.messages.length;
    const duration = new Date() - new Date(session.startTime);
    const topics = [...new Set(session.messages.map(msg => msg.intent).filter(Boolean))];

    // 更新會話狀態
    await session.update({
      status: 'ended',
      lastActivity: new Date()
    });

    logger.info('✅ 聊天會話結束', { sessionId, totalMessages, duration });

    res.json({
      success: true,
      message: 'Session ended successfully',
      summary: {
        totalMessages,
        duration,
        topics
      }
    });
  } catch (error) {
    logger.error('❌ 結束聊天會話失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to end chat session',
      error: error.message
    });
  }
});

// 意圖識別
router.post('/recognize-intent', protect, async (req, res) => {
  try {
    const { text, context } = req.body;
    
    logger.info('🔄 進行意圖識別', { textLength: text.length });

    // 模擬意圖識別
    const intents = ['card_inquiry', 'price_check', 'investment_advice', 'market_analysis', 'general_question'];
    const randomIntent = intents[Math.floor(Math.random() * intents.length)];
    const confidence = Math.random() * 0.3 + 0.7; // 70%-100%

    // 模擬實體識別
    const entities = [];
    if (text.includes('價格') || text.includes('price')) {
      entities.push({
        type: 'price_query',
        value: 'price_inquiry',
        confidence: 0.9
      });
    }
    if (text.includes('投資') || text.includes('investment')) {
      entities.push({
        type: 'investment_query',
        value: 'investment_advice',
        confidence: 0.8
      });
    }

    const result = {
      intent: randomIntent,
      confidence,
      entities,
      context: context || {},
      suggestedActions: [
        'provide_card_info',
        'show_market_data',
        'give_investment_advice'
      ]
    };

    logger.info('✅ 意圖識別完成', { intent: randomIntent, confidence });

    res.json(result);
  } catch (error) {
    logger.error('❌ 意圖識別失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to recognize intent',
      error: error.message
    });
  }
});

// 搜索知識庫
router.get('/knowledge/search', protect, async (req, res) => {
  try {
    const { query, category, limit = 10 } = req.query;
    
    logger.info('🔄 搜索知識庫', { query, category });

    const whereClause = {};
    if (category) {
      whereClause.category = category;
    }

    // 模擬知識庫搜索
    const mockItems = [
      {
        itemId: 'kb_001',
        category: 'card_info',
        title: '寶可夢卡牌基礎知識',
        content: '寶可夢卡牌是一種集換式卡牌遊戲，包含寶可夢卡、訓練家卡和能量卡三種類型。',
        keywords: ['寶可夢', '卡牌', '基礎', '知識'],
        confidence: 0.95,
        lastUpdated: new Date().toISOString(),
        source: 'official_guide',
        language: 'zh-TW'
      },
      {
        itemId: 'kb_002',
        category: 'market_data',
        title: '卡牌市場趨勢分析',
        content: '2024年卡牌市場整體呈現上升趨勢，熱門卡牌價格持續上漲。',
        keywords: ['市場', '趨勢', '分析', '價格'],
        confidence: 0.88,
        lastUpdated: new Date().toISOString(),
        source: 'market_analysis',
        language: 'zh-TW'
      },
      {
        itemId: 'kb_003',
        category: 'trading_tips',
        title: '卡牌投資策略',
        content: '建議關注限量版卡牌、新發行系列和熱門遊戲相關卡牌。',
        keywords: ['投資', '策略', '建議', '卡牌'],
        confidence: 0.92,
        lastUpdated: new Date().toISOString(),
        source: 'expert_advice',
        language: 'zh-TW'
      }
    ];

    // 簡單的關鍵詞匹配
    const filteredItems = mockItems.filter(item => 
      item.keywords.some(keyword => 
        query.toLowerCase().includes(keyword.toLowerCase())
      )
    ).slice(0, parseInt(limit));

    logger.info('✅ 知識庫搜索完成', { results: filteredItems.length });

    res.json(filteredItems);
  } catch (error) {
    logger.error('❌ 搜索知識庫失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to search knowledge base',
      error: error.message
    });
  }
});

// 添加知識庫項目
router.post('/knowledge/items', protect, async (req, res) => {
  try {
    const { category, title, content, keywords, source, language } = req.body;
    
    logger.info('🔄 添加知識庫項目', { title, category });

    const itemId = `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const item = await KnowledgeItem.create({
      itemId,
      category,
      title,
      content,
      keywords,
      confidence: 0.9,
      lastUpdated: new Date(),
      source,
      language
    });

    logger.info('✅ 知識庫項目添加成功', { itemId });

    res.status(201).json({
      success: true,
      itemId,
      message: 'Knowledge item added successfully'
    });
  } catch (error) {
    logger.error('❌ 添加知識庫項目失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to add knowledge item',
      error: error.message
    });
  }
});

// 獲取智能推薦
router.get('/recommendations', protect, async (req, res) => {
  try {
    const { userId, context } = req.query;
    
    logger.info('🔄 獲取智能推薦', { userId });

    // 模擬智能推薦
    const recommendations = [
      {
        recommendationId: 'rec_001',
        type: 'card_suggestion',
        title: '推薦收藏卡牌',
        description: '基於您的收藏偏好，推薦以下高價值卡牌：皮卡丘VMAX、超夢GX等。',
        confidence: 0.85,
        reasoning: '根據您的收藏歷史和市場趨勢分析',
        actions: [
          {
            action: '查看推薦卡牌',
            description: '瀏覽推薦的卡牌列表',
            url: '/cards/recommended'
          }
        ],
        priority: 'high',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        recommendationId: 'rec_002',
        type: 'investment_advice',
        title: '投資組合優化建議',
        description: '建議調整您的投資組合，增加新發行系列的比重。',
        confidence: 0.78,
        reasoning: '基於市場分析和您的投資偏好',
        actions: [
          {
            action: '查看投資建議',
            description: '詳細的投資組合優化建議',
            url: '/investment/advice'
          }
        ],
        priority: 'medium',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        recommendationId: 'rec_003',
        type: 'market_analysis',
        title: '市場趨勢提醒',
        description: '寶可夢卡牌市場近期出現上漲趨勢，建議關注相關投資機會。',
        confidence: 0.92,
        reasoning: '基於最新的市場數據分析',
        actions: [
          {
            action: '查看市場分析',
            description: '詳細的市場趨勢報告',
            url: '/market/analysis'
          }
        ],
        priority: 'high',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    logger.info('✅ 智能推薦生成完成', { count: recommendations.length });

    res.json(recommendations);
  } catch (error) {
    logger.error('❌ 獲取智能推薦失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

// 提供推薦反饋
router.post('/recommendations/:recommendationId/feedback', protect, async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const { rating, helpful, comments, actionTaken } = req.body;
    
    logger.info('🔄 處理推薦反饋', { recommendationId, rating, helpful });

    // 模擬反饋處理
    await new Promise(resolve => setTimeout(resolve, 1000));

    logger.info('✅ 推薦反饋處理完成', { recommendationId });

    res.json({
      success: true,
      message: 'Feedback processed successfully'
    });
  } catch (error) {
    logger.error('❌ 處理推薦反饋失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to process feedback',
      error: error.message
    });
  }
});

// 獲取對話分析
router.get('/analytics/sessions/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    logger.info('🔄 獲取對話分析', { sessionId });

    // 模擬對話分析
    const analytics = {
      sessionId,
      totalMessages: 15,
      averageResponseTime: 2.3,
      userSatisfaction: 4.2,
      topics: [
        {
          topic: 'card_inquiry',
          frequency: 8,
          sentiment: 'positive'
        },
        {
          topic: 'price_check',
          frequency: 5,
          sentiment: 'neutral'
        },
        {
          topic: 'investment_advice',
          frequency: 2,
          sentiment: 'positive'
        }
      ],
      intents: [
        {
          intent: 'card_inquiry',
          count: 8,
          successRate: 0.88
        },
        {
          intent: 'price_check',
          count: 5,
          successRate: 0.92
        },
        {
          intent: 'investment_advice',
          count: 2,
          successRate: 0.75
        }
      ],
      recommendations: [
        {
          type: 'card_suggestion',
          count: 3,
          acceptanceRate: 0.67
        },
        {
          type: 'investment_advice',
          count: 2,
          acceptanceRate: 0.5
        }
      ]
    };

    logger.info('✅ 對話分析完成', { sessionId });

    res.json(analytics);
  } catch (error) {
    logger.error('❌ 獲取對話分析失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation analytics',
      error: error.message
    });
  }
});

// 獲取用戶分析
router.get('/analytics/users/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeRange = '30d' } = req.query;
    
    logger.info('🔄 獲取用戶分析', { userId, timeRange });

    // 模擬用戶分析
    const analytics = {
      userId,
      totalSessions: 25,
      totalMessages: 156,
      averageSessionDuration: 12.5,
      favoriteTopics: ['card_inquiry', 'price_check', 'market_analysis'],
      satisfactionTrend: [
        { date: '2024-01-01', satisfaction: 4.1 },
        { date: '2024-01-08', satisfaction: 4.3 },
        { date: '2024-01-15', satisfaction: 4.2 },
        { date: '2024-01-22', satisfaction: 4.4 }
      ],
      recommendationPerformance: [
        {
          type: 'card_suggestion',
          shown: 45,
          accepted: 32,
          conversionRate: 0.71
        },
        {
          type: 'investment_advice',
          shown: 28,
          accepted: 18,
          conversionRate: 0.64
        },
        {
          type: 'market_analysis',
          shown: 35,
          accepted: 29,
          conversionRate: 0.83
        }
      ]
    };

    logger.info('✅ 用戶分析完成', { userId });

    res.json(analytics);
  } catch (error) {
    logger.error('❌ 獲取用戶分析失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get user analytics',
      error: error.message
    });
  }
});

// 設置用戶偏好
router.put('/users/:userId/preferences', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;
    
    logger.info('🔄 設置用戶偏好', { userId });

    // 更新或創建用戶偏好
    await UserPreference.upsert({
      userId,
      ...preferences,
      updatedAt: new Date()
    });

    logger.info('✅ 用戶偏好設置成功', { userId });

    res.json({
      success: true,
      message: 'User preferences updated successfully'
    });
  } catch (error) {
    logger.error('❌ 設置用戶偏好失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to set user preferences',
      error: error.message
    });
  }
});

// 獲取用戶偏好
router.get('/users/:userId/preferences', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const preferences = await UserPreference.findOne({
      where: { userId }
    });

    if (!preferences) {
      // 返回默認偏好
      return res.json({
        language: 'zh-TW',
        topics: ['card_info', 'market_data', 'investment_advice'],
        notificationSettings: {
          email: true,
          push: true,
          frequency: 'daily'
        },
        privacySettings: {
          dataCollection: true,
          personalization: true,
          analytics: true
        }
      });
    }

    res.json(preferences);
  } catch (error) {
    logger.error('❌ 獲取用戶偏好失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get user preferences',
      error: error.message
    });
  }
});

// 獲取系統狀態
router.get('/system/status', protect, async (req, res) => {
  try {
    logger.info('🔄 獲取AI聊天系統狀態');

    // 模擬系統狀態
    const status = {
      nlpService: {
        status: 'online',
        responseTime: 1.2,
        accuracy: 0.89
      },
      knowledgeBase: {
        status: 'online',
        totalItems: 1250,
        lastUpdated: new Date().toISOString()
      },
      recommendationEngine: {
        status: 'online',
        activeUsers: 156,
        recommendationsGenerated: 892
      },
      overallHealth: 'excellent'
    };

    logger.info('✅ 系統狀態獲取完成');

    res.json(status);
  } catch (error) {
    logger.error('❌ 獲取系統狀態失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get system status',
      error: error.message
    });
  }
});

// 獲取熱門問題
router.get('/faq', protect, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    logger.info('🔄 獲取熱門問題', { limit });

    // 模擬FAQ數據
    const faqs = [
      {
        question: '如何判斷卡牌的價值？',
        answer: '卡牌價值主要取決於稀有度、版本、保存狀況和市場需求。建議查看專業評級和市場價格。',
        frequency: 156,
        category: 'card_info'
      },
      {
        question: '什麼時候是投資卡牌的最佳時機？',
        answer: '通常在新系列發行初期或熱門遊戲更新時是較好的投資時機。建議關注市場趨勢。',
        frequency: 89,
        category: 'investment_advice'
      },
      {
        question: '如何保護卡牌的收藏價值？',
        answer: '使用專業的卡牌保護套和存儲盒，避免陽光直射和潮濕環境，定期檢查保存狀況。',
        frequency: 67,
        category: 'card_info'
      },
      {
        question: '卡牌市場的風險有哪些？',
        answer: '主要風險包括市場波動、假貨風險、保存損壞等。建議分散投資並做好風險管理。',
        frequency: 45,
        category: 'investment_advice'
      }
    ];

    const limitedFaqs = faqs.slice(0, parseInt(limit));

    logger.info('✅ 熱門問題獲取完成', { count: limitedFaqs.length });

    res.json(limitedFaqs);
  } catch (error) {
    logger.error('❌ 獲取熱門問題失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get FAQ',
      error: error.message
    });
  }
});

// 添加FAQ
router.post('/faq', protect, async (req, res) => {
  try {
    const { question, answer, category, keywords } = req.body;
    
    logger.info('🔄 添加FAQ', { question, category });

    const faqId = `faq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 模擬FAQ添加
    await new Promise(resolve => setTimeout(resolve, 1000));

    logger.info('✅ FAQ添加成功', { faqId });

    res.status(201).json({
      success: true,
      faqId,
      message: 'FAQ added successfully'
    });
  } catch (error) {
    logger.error('❌ 添加FAQ失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to add FAQ',
      error: error.message
    });
  }
});

module.exports = router;
