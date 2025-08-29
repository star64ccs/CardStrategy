const express = require('express');
const router = express.Router();
const { authenticateToken: protect } = require('../middleware/auth');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
const { validateInput } = require('../middleware/validation');

// AI?äÂ§©?©Ê??∏È?Ê®°Â?
const ChatSession = require('../models/ChatSession').getChatSessionModel();
const ChatMessage = require('../models/ChatMessage').getChatMessageModel();
const KnowledgeItem =
  require('../models/KnowledgeItem').getKnowledgeItemModel();
const Recommendation =
  require('../models/Recommendation').getRecommendationModel();
const UserPreference =
  require('../models/UserPreference').getUserPreferenceModel();

// ?ºÈÄÅÊ??Ø‰∏¶?≤Â??ûÊ?
router.post('/send-message', protect, async (req, res) => {
  try {
    const { content, sessionId, userId, context } = req.body;

    logger.info('?? ?ïÁ?AI?äÂ§©Ê∂àÊÅØ', {
      sessionId,
      userId,
      contentLength: content.length,
    });

    // ?üÊ?Ê∂àÊÅØID
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ?µÂª∫?®Êà∂Ê∂àÊÅØ
// eslint-disable-next-line no-unused-vars
    const userMessage = await ChatMessage.create({
      messageId,
      timestamp: new Date(),
      type: 'user',
      content,
      sessionId,
      userId,
      context,
    });

    // Ê®°Êì¨?èÂ?Ë≠òÂà•
    const intents = [
      'card_inquiry',
      'price_check',
      'investment_advice',
      'market_analysis',
      'general_question',
    ];
    const randomIntent = intents[Math.floor(Math.random() * intents.length)];
    const confidence = Math.random() * 0.3 + 0.7; // 70%-100%

    // ?üÊ?AI?ûÊ?
    let aiResponse = '';
    switch (randomIntent) {
      case 'card_inquiry':
        aiResponse =
          '?ëÂèØ‰ª•Âπ´?®Êü•Ë©¢Âç°?á‰ø°?Ø„ÄÇË??äË®¥?ëÊÇ®?≥‰?Ëß?ì™ÂºµÂç°?áÁ?Ë©≥Á¥∞‰ø°ÊÅØÔº?;
        break;
      case 'price_check':
        aiResponse =
          '?ëÂèØ‰ª•Âπ´?®Êü•Ë©¢Âç°?áÂÉπ?º„ÄÇË??ê‰??°Á??çÁ®±?ñÁ∑®?üÔ??ëÊ??∫ÊÇ®?≤Â??Ä?∞Á?Â∏ÇÂ†¥?πÊ†º‰ø°ÊÅØ??;
        break;
      case 'investment_advice':
        aiResponse =
          '?∫Êñº?∂Â??ÑÂ??¥Ë∂®?¢Ô??ëÂª∫Ë≠∞ÊÇ®?úÊ≥®‰ª•‰?ÂπæÂÄãÊ?Ë≥áÊñπ?ëÔ?1) ?±È??äÊà≤?°Á? 2) ?êÈ??àÊî∂?èÂç° 3) ?∞ÁôºË°åÁ??°Á?Á≥ªÂ??ÇÊÇ®?≥‰?Ëß?ì™?ãÊñπ?¢Á?Ë©≥Á¥∞Âª∫Ë≠∞Ôº?;
        break;
      case 'market_analysis':
        aiResponse =
          '?πÊ??Ä?∞Á?Â∏ÇÂ†¥?∏Ê??ÜÊ?ÔºåÂç°?åÂ??¥Êï¥È´îÂ??æ‰??áË∂®?¢„ÄÇÁÜ±?Ä?°Á??ÑÂÉπ?ºÂú®?éÂéª30Â§©ÂÖßÂπ≥Â?‰∏äÊº≤‰∫?5%?ÇÊÇ®?≥‰?Ëß?Ö∑È´îÁ?Â∏ÇÂ†¥?∏Ê??éÔ?';
        break;
      default:
        aiResponse =
          '?üË??®Á??êÂ?ÔºÅÊ??ØÊÇ®?ÑAI?©Ê?ÔºåÂèØ‰ª•Âπ´?©ÊÇ®?•Ë©¢?°Á?‰ø°ÊÅØ?ÅÂ??êÂ??¥Ë∂®?¢„ÄÅÊ?‰æõÊ?Ë≥áÂª∫Ë≠∞Á??ÇË??äË®¥?ëÊÇ®?ÄË¶Å‰?È∫ºÂπ´?©Ô?';
    }

    // ?µÂª∫AI?ûÊ?Ê∂àÊÅØ
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
        entities: [],
      },
    });

    // ?¥Êñ∞?ÉË©±
    await ChatSession.update(
      {
        lastActivity: new Date(),
        'context.currentTopic': randomIntent,
      },
      {
        where: { sessionId },
      }
    );

    logger.info('??AI?äÂ§©Ê∂àÊÅØ?ïÁ?ÂÆåÊ?', { messageId, aiMessageId });

    res.status(201).json(aiMessage);
  } catch (error) {
    logger.error('???ïÁ?AI?äÂ§©Ê∂àÊÅØÂ§±Ê?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: error.message,
    });
  }
});

// ?µÂª∫?∞Á??äÂ§©?ÉË©±
router.post('/sessions', protect, async (req, res) => {
  try {
    const { userId, initialContext } = req.body;

    logger.info('?? ?µÂª∫?∞Á??äÂ§©?ÉË©±', { userId });

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
        conversationHistory: [],
      },
      status: 'active',
    });

    logger.info('???äÂ§©?ÉË©±?µÂª∫?êÂ?', { sessionId });

    res.status(201).json(session);
  } catch (error) {
    logger.error('???µÂª∫?äÂ§©?ÉË©±Â§±Ê?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to create chat session',
      error: error.message,
    });
  }
});

// ?≤Â??äÂ§©?ÉË©±
router.get('/sessions/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findOne({
      where: { sessionId },
      include: [
        {
          model: ChatMessage,
          as: 'messages',
          order: [['timestamp', 'ASC']],
        },
      ],
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.json(session);
  } catch (error) {
    logger.error('???≤Â??äÂ§©?ÉË©±Â§±Ê?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get chat session',
      error: error.message,
    });
  }
});

// ?≤Â??®Êà∂?ÑÊ??âÊ?Ë©?router.get('/sessions', protect, async (req, res) => {
  try {
    const { userId } = req.query;

    const sessions = await ChatSession.findAll({
      where: { userId },
      order: [['lastActivity', 'DESC']],
      include: [
        {
          model: ChatMessage,
          as: 'messages',
          limit: 5,
          order: [['timestamp', 'DESC']],
        },
      ],
    });

    res.json(sessions);
  } catch (error) {
    logger.error('???≤Â??®Êà∂?ÉË©±Â§±Ê?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get user sessions',
      error: error.message,
    });
  }
});

// ÁµêÊ??äÂ§©?ÉË©±
router.put('/sessions/:sessionId/end', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findOne({
      where: { sessionId },
      include: [
        {
          model: ChatMessage,
          as: 'messages',
        },
      ],
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Ë®àÁ??ÉË©±Áµ±Ë?
    const totalMessages = session.messages.length;
    const duration = new Date() - new Date(session.startTime);
    const topics = [
      ...new Set(session.messages.map((msg) => msg.intent).filter(Boolean)),
    ];

    // ?¥Êñ∞?ÉË©±?Ä??    await session.update({
      status: 'ended',
      lastActivity: new Date(),
    });

    logger.info('???äÂ§©?ÉË©±ÁµêÊ?', { sessionId, totalMessages, duration });

    res.json({
      success: true,
      message: 'Session ended successfully',
      summary: {
        totalMessages,
        duration,
        topics,
      },
    });
  } catch (error) {
    logger.error('??ÁµêÊ??äÂ§©?ÉË©±Â§±Ê?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to end chat session',
      error: error.message,
    });
  }
});

// ?èÂ?Ë≠òÂà•
router.post('/recognize-intent', protect, async (req, res) => {
  try {
    const { text, context } = req.body;

    logger.info('?? ?≤Ë??èÂ?Ë≠òÂà•', { textLength: text.length });

    // Ê®°Êì¨?èÂ?Ë≠òÂà•
    const intents = [
      'card_inquiry',
      'price_check',
      'investment_advice',
      'market_analysis',
      'general_question',
    ];
    const randomIntent = intents[Math.floor(Math.random() * intents.length)];
    const confidence = Math.random() * 0.3 + 0.7; // 70%-100%

    // Ê®°Êì¨ÂØ¶È?Ë≠òÂà•
    const entities = [];
    if (text.includes('?πÊ†º') || text.includes('price')) {
      entities.push({
        type: 'price_query',
        value: 'price_inquiry',
        confidence: 0.9,
      });
    }
    if (text.includes('?ïË?') || text.includes('investment')) {
      entities.push({
        type: 'investment_query',
        value: 'investment_advice',
        confidence: 0.8,
      });
    }

// eslint-disable-next-line no-unused-vars
    const result = {
      intent: randomIntent,
      confidence,
      entities,
      context: context || {},
      suggestedActions: [
        'provide_card_info',
        'show_market_data',
        'give_investment_advice',
      ],
    };

    logger.info('???èÂ?Ë≠òÂà•ÂÆåÊ?', { intent: randomIntent, confidence });

    res.json(result);
  } catch (error) {
    logger.error('???èÂ?Ë≠òÂà•Â§±Ê?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to recognize intent',
      error: error.message,
    });
  }
});

// ?úÁ¥¢?•Ë?Â∫?router.get('/knowledge/search', protect, async (req, res) => {
  try {
    const { query, category, limit = 10 } = req.query;

    logger.info('?? ?úÁ¥¢?•Ë?Â∫?, { query, category });

    const whereClause = {};
    if (category) {
      whereClause.category = category;
    }

    // Ê®°Êì¨?•Ë?Â∫´Ê?Á¥?    const mockItems = [
      {
        itemId: 'kb_001',
        category: 'card_info',
        title: 'ÂØ∂ÂèØÂ§¢Âç°?åÂü∫Á§éÁü•Ë≠?,
        content:
          'ÂØ∂ÂèØÂ§¢Âç°?åÊòØ‰∏ÄÁ®ÆÈ??õÂ??°Á??äÊà≤ÔºåÂ??´ÂØ∂?ØÂ§¢?°„ÄÅË?Á∑¥ÂÆ∂?°Â??ΩÈ??°‰?Á®ÆÈ??ã„Ä?,
        keywords: ['ÂØ∂ÂèØÂ§?, '?°Á?', '?∫Á?', '?•Ë?'],
        confidence: 0.95,
        lastUpdated: new Date().toISOString(),
        source: 'official_guide',
        language: 'zh-TW',
      },
      {
        itemId: 'kb_002',
        category: 'market_data',
        title: '?°Á?Â∏ÇÂ†¥Ë∂®Âã¢?ÜÊ?',
        content: '2024Âπ¥Âç°?åÂ??¥Êï¥È´îÂ??æ‰??áË∂®?¢Ô??±È??°Á??πÊ†º?ÅÁ?‰∏äÊº≤??,
        keywords: ['Â∏ÇÂ†¥', 'Ë∂®Âã¢', '?ÜÊ?', '?πÊ†º'],
        confidence: 0.88,
        lastUpdated: new Date().toISOString(),
        source: 'market_analysis',
        language: 'zh-TW',
      },
      {
        itemId: 'kb_003',
        category: 'trading_tips',
        title: '?°Á??ïË?Á≠ñÁï•',
        content: 'Âª∫Ë≠∞?úÊ≥®?êÈ??àÂç°?å„ÄÅÊñ∞?ºË?Á≥ªÂ??åÁÜ±?Ä?äÊà≤?∏È??°Á???,
        keywords: ['?ïË?', 'Á≠ñÁï•', 'Âª∫Ë≠∞', '?°Á?'],
        confidence: 0.92,
        lastUpdated: new Date().toISOString(),
        source: 'expert_advice',
        language: 'zh-TW',
      },
    ];

    // Á∞°ÂñÆ?ÑÈ??µË??πÈ?
    const filteredItems = mockItems
      .filter((item) =>
        item.keywords.some((keyword) =>
          query.toLowerCase().includes(keyword.toLowerCase())
        )
      )
      .slice(0, parseInt(limit));

    logger.info('???•Ë?Â∫´Ê?Á¥¢Â???, { results: filteredItems.length });

    res.json(filteredItems);
  } catch (error) {
    logger.error('???úÁ¥¢?•Ë?Â∫´Â§±??, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to search knowledge base',
      error: error.message,
    });
  }
});

// Ê∑ªÂ??•Ë?Â∫´È???router.post('/knowledge/items', protect, async (req, res) => {
  try {
    const { category, title, content, keywords, source, language } = req.body;

    logger.info('?? Ê∑ªÂ??•Ë?Â∫´È???, { title, category });

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
      language,
    });

    logger.info('???•Ë?Â∫´È??ÆÊ∑ª?†Ê???, { itemId });

    res.status(201).json({
      success: true,
      itemId,
      message: 'Knowledge item added successfully',
    });
  } catch (error) {
    logger.error('??Ê∑ªÂ??•Ë?Â∫´È??ÆÂ§±??, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to add knowledge item',
      error: error.message,
    });
  }
});

// ?≤Â??∫ËÉΩ?®Ëñ¶
router.get('/recommendations', protect, async (req, res) => {
  try {
    const { userId, context } = req.query;

    logger.info('?? ?≤Â??∫ËÉΩ?®Ëñ¶', { userId });

    // Ê®°Êì¨?∫ËÉΩ?®Ëñ¶
// eslint-disable-next-line no-unused-vars
    const recommendations = [
      {
        recommendationId: 'rec_001',
        type: 'card_suggestion',
        title: '?®Ëñ¶?∂Ë??°Á?',
        description:
          '?∫Êñº?®Á??∂Ë??èÂ•ΩÔºåÊé®?¶‰ª•‰∏ãÈ??πÂÄºÂç°?åÔ??ÆÂç°‰∏òVMAX?ÅË?Â§¢GXÁ≠â„Ä?,
        confidence: 0.85,
        reasoning: '?πÊ??®Á??∂Ë?Ê≠∑Âè≤?åÂ??¥Ë∂®?¢Â???,
        actions: [
          {
            action: '?•Á??®Ëñ¶?°Á?',
            description: '?èË¶Ω?®Ëñ¶?ÑÂç°?åÂ?Ë°?,
            url: '/cards/recommended',
          },
        ],
        priority: 'high',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        recommendationId: 'rec_002',
        type: 'investment_advice',
        title: '?ïË?ÁµÑÂ??™Â?Âª∫Ë≠∞',
        description: 'Âª∫Ë≠∞Ë™øÊï¥?®Á??ïË?ÁµÑÂ?ÔºåÂ??†Êñ∞?ºË?Á≥ªÂ??ÑÊ??ç„Ä?,
        confidence: 0.78,
        reasoning: '?∫ÊñºÂ∏ÇÂ†¥?ÜÊ??åÊÇ®?ÑÊ?Ë≥áÂ?Â•?,
        actions: [
          {
            action: '?•Á??ïË?Âª∫Ë≠∞',
            description: 'Ë©≥Á¥∞?ÑÊ?Ë≥áÁ??àÂÑ™?ñÂª∫Ë≠?,
            url: '/investment/advice',
          },
        ],
        priority: 'medium',
        expiresAt: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        recommendationId: 'rec_003',
        type: 'market_analysis',
        title: 'Â∏ÇÂ†¥Ë∂®Âã¢?êÈ?',
        description: 'ÂØ∂ÂèØÂ§¢Âç°?åÂ??¥Ë??üÂá∫?æ‰?Êº≤Ë∂®?¢Ô?Âª∫Ë≠∞?úÊ≥®?∏È??ïË?Ê©üÊ???,
        confidence: 0.92,
        reasoning: '?∫Êñº?Ä?∞Á?Â∏ÇÂ†¥?∏Ê??ÜÊ?',
        actions: [
          {
            action: '?•Á?Â∏ÇÂ†¥?ÜÊ?',
            description: 'Ë©≥Á¥∞?ÑÂ??¥Ë∂®?¢Â†±??,
            url: '/market/analysis',
          },
        ],
        priority: 'high',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    logger.info('???∫ËÉΩ?®Ëñ¶?üÊ?ÂÆåÊ?', { count: recommendations.length });

    res.json(recommendations);
  } catch (error) {
    logger.error('???≤Â??∫ËÉΩ?®Ëñ¶Â§±Ê?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message,
    });
  }
});

// ?ê‰??®Ëñ¶?çÈ?
router.post(
  '/recommendations/:recommendationId/feedback',
  protect,
  async (req, res) => {
    try {
      const { recommendationId } = req.params;
      const { rating, helpful, comments, actionTaken } = req.body;

      logger.info('?? ?ïÁ??®Ëñ¶?çÈ?', { recommendationId, rating, helpful });

      // Ê®°Êì¨?çÈ??ïÁ?
      await new Promise((resolve) => setTimeout(resolve, 1000));

      logger.info('???®Ëñ¶?çÈ??ïÁ?ÂÆåÊ?', { recommendationId });

      res.json({
        success: true,
        message: 'Feedback processed successfully',
      });
    } catch (error) {
      logger.error('???ïÁ??®Ëñ¶?çÈ?Â§±Ê?', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to process feedback',
        error: error.message,
      });
    }
  }
);

// ?≤Â?Â∞çË©±?ÜÊ?
router.get('/analytics/sessions/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;

    logger.info('?? ?≤Â?Â∞çË©±?ÜÊ?', { sessionId });

    // Ê®°Êì¨Â∞çË©±?ÜÊ?
    const analytics = {
      sessionId,
      totalMessages: 15,
      averageResponseTime: 2.3,
      userSatisfaction: 4.2,
      topics: [
        {
          topic: 'card_inquiry',
          frequency: 8,
          sentiment: 'positive',
        },
        {
          topic: 'price_check',
          frequency: 5,
          sentiment: 'neutral',
        },
        {
          topic: 'investment_advice',
          frequency: 2,
          sentiment: 'positive',
        },
      ],
      intents: [
        {
          intent: 'card_inquiry',
          count: 8,
          successRate: 0.88,
        },
        {
          intent: 'price_check',
          count: 5,
          successRate: 0.92,
        },
        {
          intent: 'investment_advice',
          count: 2,
          successRate: 0.75,
        },
      ],
      recommendations: [
        {
          type: 'card_suggestion',
          count: 3,
          acceptanceRate: 0.67,
        },
        {
          type: 'investment_advice',
          count: 2,
          acceptanceRate: 0.5,
        },
      ],
    };

    logger.info('??Â∞çË©±?ÜÊ?ÂÆåÊ?', { sessionId });

    res.json(analytics);
  } catch (error) {
    logger.error('???≤Â?Â∞çË©±?ÜÊ?Â§±Ê?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation analytics',
      error: error.message,
    });
  }
});

// ?≤Â??®Êà∂?ÜÊ?
router.get('/analytics/users/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeRange = '30d' } = req.query;

    logger.info('?? ?≤Â??®Êà∂?ÜÊ?', { userId, timeRange });

    // Ê®°Êì¨?®Êà∂?ÜÊ?
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
        { date: '2024-01-22', satisfaction: 4.4 },
      ],
      recommendationPerformance: [
        {
          type: 'card_suggestion',
          shown: 45,
          accepted: 32,
          conversionRate: 0.71,
        },
        {
          type: 'investment_advice',
          shown: 28,
          accepted: 18,
          conversionRate: 0.64,
        },
        {
          type: 'market_analysis',
          shown: 35,
          accepted: 29,
          conversionRate: 0.83,
        },
      ],
    };

    logger.info('???®Êà∂?ÜÊ?ÂÆåÊ?', { userId });

    res.json(analytics);
  } catch (error) {
    logger.error('???≤Â??®Êà∂?ÜÊ?Â§±Ê?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get user analytics',
      error: error.message,
    });
  }
});

// Ë®≠ÁΩÆ?®Êà∂?èÂ•Ω
router.put('/users/:userId/preferences', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;

    logger.info('?? Ë®≠ÁΩÆ?®Êà∂?èÂ•Ω', { userId });

    // ?¥Êñ∞?ñÂâµÂª∫Áî®?∂Â?Â•?    await UserPreference.upsert({
      userId,
      ...preferences,
      updatedAt: new Date(),
    });

    logger.info('???®Êà∂?èÂ•ΩË®≠ÁΩÆ?êÂ?', { userId });

    res.json({
      success: true,
      message: 'User preferences updated successfully',
    });
  } catch (error) {
    logger.error('??Ë®≠ÁΩÆ?®Êà∂?èÂ•ΩÂ§±Ê?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to set user preferences',
      error: error.message,
    });
  }
});

// ?≤Â??®Êà∂?èÂ•Ω
router.get('/users/:userId/preferences', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    const preferences = await UserPreference.findOne({
      where: { userId },
    });

    if (!preferences) {
      // ËøîÂ?ÈªòË??èÂ•Ω
      return res.json({
        language: 'zh-TW',
        topics: ['card_info', 'market_data', 'investment_advice'],
        notificationSettings: {
          email: true,
          push: true,
          frequency: 'daily',
        },
        privacySettings: {
          dataCollection: true,
          personalization: true,
          analytics: true,
        },
      });
    }

    res.json(preferences);
  } catch (error) {
    logger.error('???≤Â??®Êà∂?èÂ•ΩÂ§±Ê?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get user preferences',
      error: error.message,
    });
  }
});

// ?≤Â?Á≥ªÁµ±?Ä??router.get('/system/status', protect, async (req, res) => {
  try {
    logger.info('?? ?≤Â?AI?äÂ§©Á≥ªÁµ±?Ä??);

    // Ê®°Êì¨Á≥ªÁµ±?Ä??// eslint-disable-next-line no-unused-vars
    const status = {
      nlpService: {
        status: 'online',
        responseTime: 1.2,
        accuracy: 0.89,
      },
      knowledgeBase: {
        status: 'online',
        totalItems: 1250,
        lastUpdated: new Date().toISOString(),
      },
      recommendationEngine: {
        status: 'online',
        activeUsers: 156,
        recommendationsGenerated: 892,
      },
      overallHealth: 'excellent',
    };

    logger.info('??Á≥ªÁµ±?Ä?ãÁç≤?ñÂ???);

    res.json(status);
  } catch (error) {
    logger.error('???≤Â?Á≥ªÁµ±?Ä?ãÂ§±??, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get system status',
      error: error.message,
    });
  }
});

// ?≤Â??±È??èÈ?
router.get('/faq', protect, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    logger.info('?? ?≤Â??±È??èÈ?', { limit });

    // Ê®°Êì¨FAQ?∏Ê?
    const faqs = [
      {
        question: 'Â¶Ç‰??§Êñ∑?°Á??ÑÂÉπ?ºÔ?',
        answer:
          '?°Á??πÂÄº‰∏ªË¶ÅÂ?Ê±∫ÊñºÁ®Ä?âÂ∫¶?ÅÁ??¨„ÄÅ‰?Â≠òÁ?Ê≥ÅÂ?Â∏ÇÂ†¥?ÄÊ±Ç„ÄÇÂª∫Ë≠∞Êü•?ãÂ?Ê•≠Ë?Á¥öÂ?Â∏ÇÂ†¥?πÊ†º??,
        frequency: 156,
        category: 'card_info',
      },
      {
        question: '‰ªÄÈ∫ºÊ??ôÊòØ?ïË??°Á??ÑÊ?‰Ω≥Ê?Ê©üÔ?',
        answer:
          '?öÂ∏∏?®Êñ∞Á≥ªÂ??ºË??ùÊ??ñÁÜ±?Ä?äÊà≤?¥Êñ∞?ÇÊòØËºÉÂ•Ω?ÑÊ?Ë≥áÊ?Ê©ü„ÄÇÂª∫Ë≠∞È?Ê≥®Â??¥Ë∂®?¢„Ä?,
        frequency: 89,
        category: 'investment_advice',
      },
      {
        question: 'Â¶Ç‰?‰øùË≠∑?°Á??ÑÊî∂?èÂÉπ?ºÔ?',
        answer:
          '‰ΩøÁî®Â∞àÊ•≠?ÑÂç°?å‰?Ë≠∑Â??åÂ??≤Á?ÔºåÈÅø?çÈôΩ?âÁõ¥Â∞ÑÂ?ÊΩÆÊ??∞Â?ÔºåÂ??üÊ™¢?•‰?Â≠òÁ?Ê≥Å„Ä?,
        frequency: 67,
        category: 'card_info',
      },
      {
        question: '?°Á?Â∏ÇÂ†¥?ÑÈ¢®?™Ê??™‰?Ôº?,
        answer:
          '‰∏ªË?È¢®Èö™?ÖÊã¨Â∏ÇÂ†¥Ê≥¢Â??ÅÂ?Ë≤®È¢®?™„ÄÅ‰?Â≠òÊ?Â£ûÁ??ÇÂª∫Ë≠∞Â????Ë≥á‰∏¶?öÂ•ΩÈ¢®Èö™ÁÆ°Á???,
        frequency: 45,
        category: 'investment_advice',
      },
    ];

    const limitedFaqs = faqs.slice(0, parseInt(limit));

    logger.info('???±È??èÈ??≤Â?ÂÆåÊ?', { count: limitedFaqs.length });

    res.json(limitedFaqs);
  } catch (error) {
    logger.error('???≤Â??±È??èÈ?Â§±Ê?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get FAQ',
      error: error.message,
    });
  }
});

// Ê∑ªÂ?FAQ
router.post('/faq', protect, async (req, res) => {
  try {
    const { question, answer, category, keywords } = req.body;

    logger.info('?? Ê∑ªÂ?FAQ', { question, category });

    const faqId = `faq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Ê®°Êì¨FAQÊ∑ªÂ?
    await new Promise((resolve) => setTimeout(resolve, 1000));

    logger.info('??FAQÊ∑ªÂ??êÂ?', { faqId });

    res.status(201).json({
      success: true,
      faqId,
      message: 'FAQ added successfully',
    });
  } catch (error) {
    logger.error('??Ê∑ªÂ?FAQÂ§±Ê?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to add FAQ',
      error: error.message,
    });
  }
});

module.exports = router;
