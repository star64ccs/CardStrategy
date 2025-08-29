import { ChatService } from '../services/chatService';
import { ChatCategory, UserIntent, ChatPriority } from '../types/chat';

// Mock logger
jest.mock('../../../core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('ChatService', () => {
  let chatService: ChatService;

  beforeEach(() => {
    chatService = ChatService.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const _instance1 = ChatService.getInstance();
      const _instance2 = ChatService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const _result = await chatService.initialize();
      expect(result).toBeUndefined();
    });
  });

  describe('createSession', () => {
    it('should create a new session successfully', async () => {
      const _userId = 'test-user-123';
      const _category = ChatCategory.INVESTMENT;

      const _session = await chatService.createSession(userId, category);

      expect(session).toBeDefined();
      expect(session.userId).toBe(userId);
      expect(session.category).toBe(category);
      expect(session.status).toBe('active');
      expect(session.messageCount).toBe(0);
      expect(session.priority).toBe(ChatPriority.NORMAL);
      expect(session.tags).toEqual([]);
      expect(session.metadata).toBeDefined();
    });

    it('should create session with default category', async () => {
      const _userId = 'test-user-456';
      const _session = await chatService.createSession(userId);

      expect(session.category).toBe(ChatCategory.GENERAL);
    });

    it('should generate unique session IDs', async () => {
      const _userId = 'test-user-789';
      const _session1 = await chatService.createSession(userId);
      const _session2 = await chatService.createSession(userId);

      expect(session1.id).not.toBe(session2.id);
    });
  });

  describe('sendMessage', () => {
    let sessionId: string;
    const _userId = 'test-user-send';

    beforeEach(async () => {
      const _session = await chatService.createSession(userId);
      sessionId = session.id;
    });

    it('should send message successfully', async () => {
      const _message = '你好，我想了解投資建議';
      const _response = await chatService.sendMessage({
        sessionId,
        message,
        userId,
      });

      expect(response).toBeDefined();
      expect(response.sessionId).toBe(sessionId);
      expect(response.content).toBeDefined();
      expect(response.responseType).toBeDefined();
      expect(response.timestamp).toBeDefined();
      expect(response.confidence).toBeGreaterThan(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle greeting intent', async () => {
      const _message = '你好';
      const _response = await chatService.sendMessage({
        sessionId,
        message,
        userId,
        intent: UserIntent.GREETING,
      });

      expect(response.content).toContain('您好');
      expect(response.quickReplies).toBeDefined();
      expect(response.quickReplies.length).toBeGreaterThan(0);
    });

    it('should handle investment advice intent', async () => {
      const _message = '我想投資卡牌';
      const _response = await chatService.sendMessage({
        sessionId,
        message,
        userId,
        intent: UserIntent.INVESTMENT_ADVICE,
      });

      expect(response.content).toContain('投資建議');
      expect(response.suggestedActions).toBeDefined();
      expect(response.suggestedActions.length).toBeGreaterThan(0);
    });

    it('should handle card appraisal intent', async () => {
      const _message = '我想鑑定卡牌';
      const _response = await chatService.sendMessage({
        sessionId,
        message,
        userId,
        intent: UserIntent.CARD_APPRAISAL,
      });

      expect(response.content).toContain('卡牌鑑定');
      expect(response.suggestedActions).toBeDefined();
    });

    it('should handle unknown intent', async () => {
      const _message = 'xyz123';
      const _response = await chatService.sendMessage({
        sessionId,
        message,
        userId,
        intent: UserIntent.UNKNOWN,
      });

      expect(response.content).toContain('抱歉');
      expect(response.confidence).toBeLessThan(0.8);
    });

    it('should throw error for non-existent session', async () => {
      const _message = 'test message';

      await expect(
        chatService.sendMessage({
          sessionId: 'non-existent-session',
          message,
          userId,
        })
      ).rejects.toThrow('會話 non-existent-session 不存在');
    });

    it('should update session statistics after sending message', async () => {
      const _message = 'test message';
      const _session = await chatService.getSession(sessionId);
      const _initialMessageCount = session.messageCount;

      await chatService.sendMessage({
        sessionId,
        message,
        userId,
      });

      const _updatedSession = await chatService.getSession(sessionId);
      expect(updatedSession.messageCount).toBe(initialMessageCount + 2); // +2 for user and AI messages
    });
  });

  describe('getSession', () => {
    it('should return session by ID', async () => {
      const _userId = 'test-user-get';
      const _createdSession = await chatService.createSession(userId);

      const _retrievedSession = await chatService.getSession(createdSession.id);

      expect(retrievedSession).toEqual(createdSession);
    });

    it('should return null for non-existent session', async () => {
      const _session = await chatService.getSession('non-existent');
      expect(session).toBeNull();
    });
  });

  describe('getUserSessions', () => {
    it('should return all sessions for a user', async () => {
      const _userId = 'test-user-multiple';

      await chatService.createSession(userId, ChatCategory.GENERAL);
      await chatService.createSession(userId, ChatCategory.INVESTMENT);
      await chatService.createSession('other-user', ChatCategory.GENERAL);

      const _userSessions = await chatService.getUserSessions(userId);

      expect(userSessions).toHaveLength(2);
      userSessions.forEach(session => {
        expect(session.userId).toBe(userId);
      });
    });

    it('should return empty array for user with no sessions', async () => {
      const _sessions = await chatService.getUserSessions(
        'user-with-no-sessions'
      );
      expect(sessions).toEqual([]);
    });
  });

  describe('getSessionHistory', () => {
    let sessionId: string;
    const _userId = 'test-user-history';

    beforeEach(async () => {
      const _session = await chatService.createSession(userId);
      sessionId = session.id;
    });

    it('should return session history with messages', async () => {
      await chatService.sendMessage({
        sessionId,
        message: 'test message',
        userId,
      });

      const _history = await chatService.getSessionHistory(sessionId);

      expect(history).toBeDefined();
      expect(history.sessionId).toBe(sessionId);
      expect(history.messages).toHaveLength(2); // user + AI message
      expect(history.stats).toBeDefined();
      expect(history.stats.totalMessages).toBe(2);
    });

    it('should return null for non-existent session', async () => {
      const _history = await chatService.getSessionHistory('non-existent');
      expect(history).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return chat statistics', async () => {
      const _userId = 'test-user-stats';
      await chatService.createSession(userId);
      await chatService.createSession(userId);

      const _stats = await chatService.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalSessions).toBeGreaterThanOrEqual(2);
      expect(stats.activeSessions).toBeGreaterThanOrEqual(2);
      expect(stats.categoryDistribution).toBeDefined();
      expect(stats.intentDistribution).toBeDefined();
      expect(stats.responseTimeDistribution).toBeDefined();
    });
  });

  describe('closeSession', () => {
    it('should close session successfully', async () => {
      const _userId = 'test-user-close';
      const _session = await chatService.createSession(userId);

      await chatService.closeSession(session.id);

      const _updatedSession = await chatService.getSession(session.id);
      expect(updatedSession.status).toBe('closed');
    });

    it('should not throw error for non-existent session', async () => {
      await expect(
        chatService.closeSession('non-existent')
      ).resolves.toBeUndefined();
    });
  });

  describe('archiveSession', () => {
    it('should archive session successfully', async () => {
      const _userId = 'test-user-archive';
      const _session = await chatService.createSession(userId);

      await chatService.archiveSession(session.id);

      const _updatedSession = await chatService.getSession(session.id);
      expect(updatedSession.status).toBe('archived');
    });
  });

  describe('updateSessionPriority', () => {
    it('should update session priority successfully', async () => {
      const _userId = 'test-user-priority';
      const _session = await chatService.createSession(userId);

      await chatService.updateSessionPriority(session.id, ChatPriority.HIGH);

      const _updatedSession = await chatService.getSession(session.id);
      expect(updatedSession.priority).toBe(ChatPriority.HIGH);
    });
  });

  describe('addSessionTag', () => {
    it('should add tag to session successfully', async () => {
      const _userId = 'test-user-tag';
      const _session = await chatService.createSession(userId);
      const _tag = 'important';

      await chatService.addSessionTag(session.id, tag);

      const _updatedSession = await chatService.getSession(session.id);
      expect(updatedSession.tags).toContain(tag);
    });

    it('should not add duplicate tags', async () => {
      const _userId = 'test-user-tag-duplicate';
      const _session = await chatService.createSession(userId);
      const _tag = 'duplicate';

      await chatService.addSessionTag(session.id, tag);
      await chatService.addSessionTag(session.id, tag);

      const _updatedSession = await chatService.getSession(session.id);
      const _tagCount = updatedSession.tags.filter(t => t === tag).length;
      expect(tagCount).toBe(1);
    });
  });

  describe('removeSessionTag', () => {
    it('should remove tag from session successfully', async () => {
      const _userId = 'test-user-remove-tag';
      const _session = await chatService.createSession(userId);
      const _tag = 'to-remove';

      await chatService.addSessionTag(session.id, tag);
      await chatService.removeSessionTag(session.id, tag);

      const _updatedSession = await chatService.getSession(session.id);
      expect(updatedSession.tags).not.toContain(tag);
    });
  });

  describe('updateConfig', () => {
    it('should update service configuration', async () => {
      const _newConfig = {
        modelName: 'gpt-4-turbo',
        maxTokens: 2000,
        temperature: 0.8,
      };

      await chatService.updateConfig(newConfig);

      const _config = await chatService.getConfig();
      expect(config.modelName).toBe('gpt-4-turbo');
      expect(config.maxTokens).toBe(2000);
      expect(config.temperature).toBe(0.8);
    });
  });

  describe('getConfig', () => {
    it('should return current configuration', async () => {
      const _config = await chatService.getConfig();

      expect(config).toBeDefined();
      expect(config.apiEndpoint).toBeDefined();
      expect(config.modelName).toBeDefined();
      expect(config.maxTokens).toBeDefined();
      expect(config.temperature).toBeDefined();
      expect(config.timeout).toBeDefined();
      expect(config.retryAttempts).toBeDefined();
      expect(config.enableLogging).toBeDefined();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty message gracefully', async () => {
      const _userId = 'test-user-empty';
      const _session = await chatService.createSession(userId);

      const _response = await chatService.sendMessage({
        sessionId: session.id,
        message: '',
        userId,
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should handle very long message', async () => {
      const _userId = 'test-user-long';
      const _session = await chatService.createSession(userId);
      const _longMessage = 'a'.repeat(1000);

      const _response = await chatService.sendMessage({
        sessionId: session.id,
        message: longMessage,
        userId,
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should handle special characters in message', async () => {
      const _userId = 'test-user-special';
      const _session = await chatService.createSession(userId);
      const _specialMessage = '測試中文 🎴 💰 📈 特殊符號!@#$%^&*()';

      const _response = await chatService.sendMessage({
        sessionId: session.id,
        message: specialMessage,
        userId,
      });

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('should maintain session state across multiple operations', async () => {
      const _userId = 'test-user-state';
      const _session = await chatService.createSession(userId);

      // Send multiple messages
      await chatService.sendMessage({
        sessionId: session.id,
        message: 'First message',
        userId,
      });

      await chatService.sendMessage({
        sessionId: session.id,
        message: 'Second message',
        userId,
      });

      const _updatedSession = await chatService.getSession(session.id);
      expect(updatedSession.messageCount).toBe(4); // 2 user + 2 AI messages

      const _history = await chatService.getSessionHistory(session.id);
      expect(history.messages).toHaveLength(4);
    });
  });
});
