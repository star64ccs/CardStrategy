const express = require('express');'
const router = express.Router();''
const { authenticateToken: protect } = require('../middleware/auth');'
// eslint-disable-next-line no-unused-vars''
const logger = require('../utils/logger');''
const { validateInput } = require('../middleware/validation');'
// AI?�天?��??��?模�?''
const ChatSession = require('../models/ChatSession').getChatSessionModel();''
const ChatMessage = require('../models/ChatMessage').getChatMessageModel();'
const KnowledgeItem =''
  require('../models/KnowledgeItem').getKnowledgeItemModel();'
const Recommendation =''
  require('../models/Recommendation').getRecommendationModel();'
const UserPreference =''
  require('../models/UserPreference').getUserPreferenceModel();'
// ?�送�??�並?��??��?''
router.post('/send-message', protect, async (req, res) => {
  try {'
    const { content, sessionId, userId, context } = req.body;''
    logger.info('?? ?��?AI?�天消息', {
      sessionId,
      userId,
      contentLength: content.length,
    });

    // ?��?MessageID
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ?�建?�戶Message
// eslint-disable-next-line no-unused-vars
    const userMessage = await ChatMessage.create({
      messageId,'
      timestamp: new Date(),''
      type: 'user',
      content,
      sessionId,
      userId,
      context,
    });

    // 模擬?��?識別'
    const intents = [''
      'card_inquiry',''
      'price_check',''
      'investment_advice',''
      'market_analysis',''
      'general_question',
    ];
    const randomIntent = intents[Math.floor(Math.random() * intents.length)];
    const confidence = Math.random() * 0.3 + 0.7; // 70%-100%'
    // ?��?AI?��?''
    let aiResponse = '';'
    switch (randomIntent) {''
      case 'card_inquiry':'
        aiResponse =''
          '?�可以幫?�查詢卡?�信?�。�??�訴?�您?��?�?��張卡?��?詳細信息�?;'
        break;''
      case 'price_check':'
        aiResponse =''
          '?�可以幫?�查詢卡?�價?�。�??��??��??�稱?�編?��??��??�您?��??�?��?市場?�格信息??;'
        break;''
      case 'investment_advice':'
        aiResponse =''
          '?�於?��??��??�趨?��??�建議您?�注以�?幾個�?資方?��?1) ?��??�戲?��? 2) ?��??�收?�卡 3) ?�發行�??��?系�??�您?��?�?��?�方?��?詳細建議�?;'
        break;''
      case 'market_analysis':'
        aiResponse =''
          '?��??�?��?市場?��??��?，卡?��??�整體�??��??�趨?�。熱?�?��??�價?�在?�去30天內平�?上漲�?5%?�您?��?�?��體�?市場?��??��?';
        break;
      default:'
        aiResponse =''
          '?��??��??��?！�??�您?�AI?��?，可以幫?�您?�詢?��?信息?��??��??�趨?�、�?供�?資建議�??��??�訴?�您?�要�?麼幫?��?';
    }
    // ?�建AI?��?Message
    const aiMessageId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const aiMessage = await ChatMessage.create({
      messageId: aiMessageId,'
      timestamp: new Date(),''
      type: 'assistant',
      content: aiResponse,
      intent: randomIntent,
      confidence,
      sessionId,
      userId,
      context: {
        recognizedIntent: randomIntent,
        confidence,
        entities: [],
      },
    });

    // ?�新?�話
    await ChatSession.update(
      {'
        lastActivity: new Date(),''
        'context.currentTopic': randomIntent,
      },
      {
        where: { sessionId },'
      }
    );''
    logger.info('??AI?�天消息?��?完�?', { messageId, aiMessageId });

    res.status(201).json(aiMessage);'
  } catch (error) {''
    logger.error('???��?AI?�天消息失�?', { error: error.message });
    res.status(500).json({'
      success: false,''
      message: 'Failed to process chat message',
      error: error.message,
    });
  }
});'
// ?�建?��??�天?�話''
router.post('/sessions', protect, async (req, res) => {
  try {'
    const { userId, initialContext } = req.body;''
    logger.info('?? ?�建?��??�天?�話', { userId });

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session = await ChatSession.create({
      sessionId,
      userId,
      startTime: new Date(),
      lastActivity: new Date(),
      messages: [],'
      context: {''
        currentTopic: 'general',
        userPreferences: {},
        conversationHistory: [],'
      },''
      status: 'active','
    });''
    logger.info('???�天?�話?�建?��?', { sessionId });

    res.status(201).json(session);'
  } catch (error) {''
    logger.error('???�建?�天?�話失�?', { error: error.message });
    res.status(500).json({'
      success: false,''
      message: 'Failed to create chat session',
      error: error.message,
    });
  }
});'
// ?��??�天?�話''
router.get('/sessions/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findOne({
      where: { sessionId },
      include: [
        {'
          model: ChatMessage,''
          as: 'messages',''
          order: [['timestamp', 'ASC']],
        },
      ],
    });

    if (!session) {
      return res.status(404).json({'
        success: false,''
        message: 'Session not found',
      });
    }
    res.json(session);'
  } catch (error) {''
    logger.error('???��??�天?�話失�?', { error: error.message });
    res.status(500).json({'
      success: false,''
      message: 'Failed to get chat session',
      error: error.message,
    });'
  }
});''
// ?��??�戶?��??��?�?router.get('/sessions', protect, async (req, res) => {
  try {
    const { userId } = req.query;

    const sessions = await ChatSession.findAll({'
      where: { userId },''
      order: [['lastActivity', 'DESC']],
      include: [
        {'
          model: ChatMessage,''
          as: 'messages','
          limit: 5,''
          order: [['timestamp', 'DESC']],
        },
      ],
    });

    res.json(sessions);'
  } catch (error) {''
    logger.error('???��??�戶?�話失�?', { error: error.message });
    res.status(500).json({'
      success: false,''
      message: 'Failed to get user sessions',
      error: error.message,
    });
  }
});'
// 結�??�天?�話''
router.put('/sessions/:sessionId/end', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findOne({
      where: { sessionId },
      include: [
        {'
          model: ChatMessage,''
          as: 'messages',
        },
      ],
    });

    if (!session) {
      return res.status(404).json({'
        success: false,''
        message: 'Session not found',
      });
    }
    // 計�??�話統�?
    const totalMessages = session.messages.length;
    const duration = new Date() - new Date(session.startTime);
    const topics = [
      ...new Set(session.messages.map((msg) => msg.intent).filter(Boolean)),
    ];'
    // ?�新?�話?�??    await session.update({''
      status: 'ended',
      lastActivity: new Date(),'
    });''
    logger.info('???�天?�話結�?', { sessionId, totalMessages, duration });

    res.json({'
      success: true,''
      message: 'Session ended successfully',
      summary: {
        totalMessages,
        duration,
        topics,
      },
    });'
  } catch (error) {''
    logger.error('??結�??�天?�話失�?', { error: error.message });
    res.status(500).json({'
      success: false,''
      message: 'Failed to end chat session',
      error: error.message,
    });
  }
});'
// ?��?識別''
router.post('/recognize-intent', protect, async (req, res) => {
  try {'
    const { text, context } = req.body;''
    logger.info('?? ?��??��?識別', { textLength: text.length });

    // 模擬?��?識別'
    const intents = [''
      'card_inquiry',''
      'price_check',''
      'investment_advice',''
      'market_analysis',''
      'general_question',
    ];
    const randomIntent = intents[Math.floor(Math.random() * intents.length)];
    const confidence = Math.random() * 0.3 + 0.7; // 70%-100%

    // 模擬實�?識別'
    const entities = [];''
    if (text.includes('?�格') || text.includes('price')) {'
      entities.push({''
        type: 'price_query',''
        value: 'price_inquiry',
        confidence: 0.9,
      });'
    }''
    if (text.includes('?��?') || text.includes('investment')) {'
      entities.push({''
        type: 'investment_query',''
        value: 'investment_advice',
        confidence: 0.8,
      });
    }
// eslint-disable-next-line no-unused-vars
    const result = {
      intent: randomIntent,
      confidence,
      entities,
      context: context || {},'
      suggestedActions: [''
        'provide_card_info',''
        'show_market_data',''
        'give_investment_advice',
      ],'
    };''
    logger.info('???��?識別完�?', { intent: randomIntent, confidence });

    res.json(result);'
  } catch (error) {''
    logger.error('???��?識別失�?', { error: error.message });
    res.status(500).json({'
      success: false,''
      message: 'Failed to recognize intent',
      error: error.message,
    });'
  }
});''
// ?�索?��?�?router.get('/knowledge/search', protect, async (req, res) => {
  try {'
    const { query, category, limit = 10 } = req.query;''
    logger.info('?? ?�索?��?�?, { query, category });

    const whereClause = {};
    if (category) {
      whereClause.category = category;
    }
    // 模擬?��?Library�?�?    const mockItems = ['
      {''
        itemId: 'kb_001',''
        category: 'card_info',''
        title: '寶可夢卡?�基礎知�?,'
        content:''
          '寶可夢卡?�是一種�??��??��??�戲，�??�寶?�夢?�、�?練家?��??��??��?種�??��?,''
        keywords: ['寶可�?, '?��?', '?��?', '?��?'],
        confidence: 0.95,'
        lastUpdated: new Date().toISOString(),''
        source: 'official_guide',''
        language: 'zh-TW',
      },'
      {''
        itemId: 'kb_002',''
        category: 'market_data',''
        title: '?��?市場趨勢?��?',''
        content: '2024年卡?��??�整體�??��??�趨?��??��??��??�格?��?上漲??,''
        keywords: ['市場', '趨勢', '?��?', '?�格'],
        confidence: 0.88,'
        lastUpdated: new Date().toISOString(),''
        source: 'market_analysis',''
        language: 'zh-TW',
      },'
      {''
        itemId: 'kb_003',''
        category: 'trading_tips',''
        title: '?��??��?策略',''
        content: '建議?�注?��??�卡?�、新?��?系�??�熱?�?�戲?��??��???,''
        keywords: ['?��?', '策略', '建議', '?��?'],
        confidence: 0.92,'
        lastUpdated: new Date().toISOString(),''
        source: 'expert_advice',''
        language: 'zh-TW',
      },
    ];

    // 簡單?��??��??��?
    const filteredItems = mockItems
      .filter((item) =>
        item.keywords.some((keyword) =>
          query.toLowerCase().includes(keyword.toLowerCase())
        )
      )'
      .slice(0, parseInt(limit));''
    logger.info('???��?庫�?索�???, { results: filteredItems.length });

    res.json(filteredItems);'
  } catch (error) {''
    logger.error('???�索?��?庫失??, { error: error.message });
    res.status(500).json({'
      success: false,''
      message: 'Failed to search knowledge base',
      error: error.message,
    });'
  }
});''
// 添�??��?Library�???router.post('/knowledge/items', protect, async (req, res) => {
  try {'
    const { category, title, content, keywords, source, language } = req.body;''
    logger.info('?? 添�??��?庫�???, { title, category });

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
      language,'
    });''
    logger.info('???��?庫�??�添?��???, { itemId });

    res.status(201).json({
      success: true,'
      itemId,''
      message: 'Knowledge item added successfully',
    });'
  } catch (error) {''
    logger.error('??添�??��?庫�??�失??, { error: error.message });
    res.status(500).json({'
      success: false,''
      message: 'Failed to add knowledge item',
      error: error.message,
    });
  }
});'
// ?��??�能?�薦''
router.get('/recommendations', protect, async (req, res) => {
  try {'
    const { userId, context } = req.query;''
    logger.info('?? ?��??�能?�薦', { userId });

    // 模擬?�能?�薦
// eslint-disable-next-line no-unused-vars
    const recommendations = ['
      {''
        recommendationId: 'rec_001',''
        type: 'card_suggestion',''
        title: '?�薦?��??��?','
        description:''
          '?�於?��??��??�好，推?�以下�??�值卡?��??�卡丘VMAX?��?夢GX等�?,'
        confidence: 0.85,''
        reasoning: '?��??��??��?歷史?��??�趨?��???,
        actions: ['
          {''
            action: '?��??�薦?��?',''
            description: '?�覽?�薦?�卡?��?�?,''
            url: '/cards/recommended',
          },'
        ],''
        priority: 'high',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },'
      {''
        recommendationId: 'rec_002',''
        type: 'investment_advice',''
        title: '?��?組�??��?建議',''
        description: '建議調整?��??��?組�?，�??�新?��?系�??��??��?,'
        confidence: 0.78,''
        reasoning: '?�於市場?��??�您?��?資�?�?,
        actions: ['
          {''
            action: '?��??��?建議',''
            description: '詳細?��?資�??�優?�建�?,''
            url: '/investment/advice',
          },'
        ],''
        priority: 'medium',
        expiresAt: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },'
      {''
        recommendationId: 'rec_003',''
        type: 'market_analysis',''
        title: '市場趨勢?��?',''
        description: '寶可夢卡?��??��??�出?��?漲趨?��?建議?�注?��??��?機�???,'
        confidence: 0.92,''
        reasoning: '?�於?�?��?市場?��??��?',
        actions: ['
          {''
            action: '?��?市場?��?',''
            description: '詳細?��??�趨?�報??,''
            url: '/market/analysis',
          },'
        ],''
        priority: 'high',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },'
    ];''
    logger.info('???�能?�薦?��?完�?', { count: recommendations.length });

    res.json(recommendations);'
  } catch (error) {''
    logger.error('???��??�能?�薦失�?', { error: error.message });
    res.status(500).json({'
      success: false,''
      message: 'Failed to get recommendations',
      error: error.message,
    });
  }
});

// ?��??�薦?��?'
router.post(''
  '/recommendations/:recommendationId/feedback',
  protect,
  async (req, res) => {
    try {
      const { recommendationId } = req.params;'
      const { rating, helpful, comments, actionTaken } = req.body;''
      logger.info('?? ?��??�薦?��?', { recommendationId, rating, helpful });

      // 模擬?��??��?'
      await new Promise((resolve) => setTimeout(resolve, 1000));''
      logger.info('???�薦?��??��?完�?', { recommendationId });

      res.json({'
        success: true,''
        message: 'Feedback processed successfully',
      });'
    } catch (error) {''
      logger.error('???��??�薦?��?失�?', { error: error.message });
      res.status(500).json({'
        success: false,''
        message: 'Failed to process feedback',
        error: error.message,
      });
    }
  }
);'
// ?��?對話?��?''
router.get('/analytics/sessions/:sessionId', protect, async (req, res) => {
  try {'
    const { sessionId } = req.params;''
    logger.info('?? ?��?對話?��?', { sessionId });

    // 模擬對話?��?
    const analytics = {
      sessionId,
      totalMessages: 15,
      averageResponseTime: 2.3,
      userSatisfaction: 4.2,
      topics: ['
        {''
          topic: 'card_inquiry','
          frequency: 8,''
          sentiment: 'positive',
        },'
        {''
          topic: 'price_check','
          frequency: 5,''
          sentiment: 'neutral',
        },'
        {''
          topic: 'investment_advice','
          frequency: 2,''
          sentiment: 'positive',
        },
      ],
      intents: ['
        {''
          intent: 'card_inquiry',
          count: 8,
          successRate: 0.88,
        },'
        {''
          intent: 'price_check',
          count: 5,
          successRate: 0.92,
        },'
        {''
          intent: 'investment_advice',
          count: 2,
          successRate: 0.75,
        },
      ],
      recommendations: ['
        {''
          type: 'card_suggestion',
          count: 3,
          acceptanceRate: 0.67,
        },'
        {''
          type: 'investment_advice',
          count: 2,
          acceptanceRate: 0.5,
        },
      ],'
    };''
    logger.info('??對話?��?完�?', { sessionId });

    res.json(analytics);'
  } catch (error) {''
    logger.error('???��?對話?��?失�?', { error: error.message });
    res.status(500).json({'
      success: false,''
      message: 'Failed to get conversation analytics',
      error: error.message,
    });
  }
});'
// ?��??�戶?��?''
router.get('/analytics/users/:userId', protect, async (req, res) => {
  try {'
    const { userId } = req.params;''
    const { timeRange = '30d' } = req.query;''
    logger.info('?? ?��??�戶?��?', { userId, timeRange });

    // 模擬?�戶?��?
    const analytics = {
      userId,
      totalSessions: 25,
      totalMessages: 156,'
      averageSessionDuration: 12.5,''
      favoriteTopics: ['card_inquiry', 'price_check', 'market_analysis'],'
      satisfactionTrend: [''
        { date: '2024-01-01', satisfaction: 4.1 },''
        { date: '2024-01-08', satisfaction: 4.3 },''
        { date: '2024-01-15', satisfaction: 4.2 },''
        { date: '2024-01-22', satisfaction: 4.4 },
      ],
      recommendationPerformance: ['
        {''
          type: 'card_suggestion',
          shown: 45,
          accepted: 32,
          conversionRate: 0.71,
        },'
        {''
          type: 'investment_advice',
          shown: 28,
          accepted: 18,
          conversionRate: 0.64,
        },'
        {''
          type: 'market_analysis',
          shown: 35,
          accepted: 29,
          conversionRate: 0.83,
        },
      ],'
    };''
    logger.info('???�戶?��?完�?', { userId });

    res.json(analytics);'
  } catch (error) {''
    logger.error('???��??�戶?��?失�?', { error: error.message });
    res.status(500).json({'
      success: false,''
      message: 'Failed to get user analytics',
      error: error.message,
    });
  }
});'
// Settings?�戶?�好''
router.put('/users/:userId/preferences', protect, async (req, res) => {
  try {
    const { userId } = req.params;'
    const preferences = req.body;''
    logger.info('?? 設置?�戶?�好', { userId });

    // ?�新?�Create用?��?�?    await UserPreference.upsert({
      userId,
      ...preferences,
      updatedAt: new Date(),'
    });''
    logger.info('???�戶?�好設置?��?', { userId });

    res.json({'
      success: true,''
      message: 'User preferences updated successfully',
    });'
  } catch (error) {''
    logger.error('??設置?�戶?�好失�?', { error: error.message });
    res.status(500).json({'
      success: false,''
      message: 'Failed to set user preferences',
      error: error.message,
    });
  }
});'
// ?��??�戶?�好''
router.get('/users/:userId/preferences', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    const preferences = await UserPreference.findOne({
      where: { userId },
    });

    if (!preferences) {
      // 返�?默�??�好'
      return res.json({''
        language: 'zh-TW',''
        topics: ['card_info', 'market_data', 'investment_advice'],
        notificationSettings: {
          email: true,'
          push: true,''
          frequency: 'daily',
        },
        privacySettings: {
          dataCollection: true,
          personalization: true,
          analytics: true,
        },
      });
    }
    res.json(preferences);'
  } catch (error) {''
    logger.error('???��??�戶?�好失�?', { error: error.message });
    res.status(500).json({'
      success: false,''
      message: 'Failed to get user preferences',
      error: error.message,
    });'
  }
});''
// ?��?系統?�??router.get('/system/status', protect, async (req, res) => {'
  try {''
    logger.info('?? ?��?AI?�天系統?�??);

    // 模擬系統?�??// eslint-disable-next-line no-unused-vars
    const status = {'
      nlpService: {''
        status: 'online',
        responseTime: 1.2,
        accuracy: 0.89,
      },'
      knowledgeBase: {''
        status: 'online',
        totalItems: 1250,
        lastUpdated: new Date().toISOString(),
      },'
      recommendationEngine: {''
        status: 'online',
        activeUsers: 156,
        recommendationsGenerated: 892,'
      },''
      overallHealth: 'excellent','
    };''
    logger.info('??系統?�?�獲?��???);

    res.json(status);'
  } catch (error) {''
    logger.error('???��?系統?�?�失??, { error: error.message });
    res.status(500).json({'
      success: false,''
      message: 'Failed to get system status',
      error: error.message,
    });
  }
});'
// ?��??��??��?''
router.get('/faq', protect, async (req, res) => {
  try {'
    const { limit = 10 } = req.query;''
    logger.info('?? ?��??��??��?', { limit });

    // 模擬FAQ?��?
    const faqs = ['
      {''
        question: '如�??�斷?��??�價?��?','
        answer:''
          '?��??�值主要�?決於稀?�度?��??�、�?存�?況�?市場?�求。建議查?��?業�?級�?市場?�格??,'
        frequency: 156,''
        category: 'card_info',
      },'
      {''
        question: '什麼�??�是?��??��??��?佳�?機�?','
        answer:''
          '?�常?�新系�??��??��??�熱?�?�戲?�新?�是較好?��?資�?機。建議�?注�??�趨?��?,'
        frequency: 89,''
        category: 'investment_advice',
      },'
      {''
        question: '如�?保護?��??�收?�價?��?','
        answer:''
          '使用專業?�卡?��?護�??��??��?，避?�陽?�直射�?潮�??��?，�??�檢?��?存�?況�?,'
        frequency: 67,''
        category: 'card_info',
      },'
      {''
        question: '?��?市場?�風?��??��?�?,'
        answer:''
          '主�?風險?�括市場波�??��?貨風?�、�?存�?壞�??�建議�????資並?�好風險管�???,'
        frequency: 45,''
        category: 'investment_advice',
      },
    ];'
    const limitedFaqs = faqs.slice(0, parseInt(limit));''
    logger.info('???��??��??��?完�?', { count: limitedFaqs.length });

    res.json(limitedFaqs);'
  } catch (error) {''
    logger.error('???��??��??��?失�?', { error: error.message });
    res.status(500).json({'
      success: false,''
      message: 'Failed to get FAQ',
      error: error.message,
    });
  }
});'
// 添�?FAQ''
router.post('/faq', protect, async (req, res) => {
  try {'
    const { question, answer, category, keywords } = req.body;''
    logger.info('?? 添�?FAQ', { question, category });

    const faqId = `faq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 模擬FAQ添�?'
    await new Promise((resolve) => setTimeout(resolve, 1000));''
    logger.info('??FAQ添�??��?', { faqId });

    res.status(201).json({
      success: true,'
      faqId,''
      message: 'FAQ added successfully',
    });'
  } catch (error) {''
    logger.error('??添�?FAQ失�?', { error: error.message });
    res.status(500).json({'
      success: false,''
      message: 'Failed to add FAQ',
      error: error.message,
    });
  }
});'
module.exports = router;''