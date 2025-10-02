import { useCallback, useEffect, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  initializeChat,
  createSession,
  sendMessage,
  getUserSessions,
  getSessionHistory,
  getChatStats,
  closeSession,
  archiveSession,
  updateSessionPriority,
  addSessionTag,
  removeSessionTag,
  setCurrentSession,
  clearMessages,
  clearError,
  resetChatState,
  selectCurrentSession,
  selectSessions,
  selectMessages,
  selectChatStats,
  selectChatLoading,
  selectChatError,
  selectIsTyping,
  selectQuickReplies,
  selectSuggestedActions,
} from '../../../store/slices/chatSlice';
import type { ChatCategory, UserIntent } from '../types/chat';
import { ChatPriority } from '../types/chat';

export const useChat = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const currentSession = useAppSelector(selectCurrentSession);
  const sessions = useAppSelector(selectSessions);
  const messages = useAppSelector(selectMessages);
  const stats = useAppSelector(selectChatStats);
  const loading = useAppSelector(selectChatLoading);
  const error = useAppSelector(selectChatError);
  const isTyping = useAppSelector(selectIsTyping);
  const quickReplies = useAppSelector(selectQuickReplies);
  const suggestedActions = useAppSelector(selectSuggestedActions);

  // 初始化聊天服務
  const initialize = useCallback(async () => {
    try {
      await dispatch(initializeChat()).unwrap();
      return true;
    } catch (error) {
      console.error('初始化聊天服務失敗:', error);
      return false;
    }
  }, [dispatch]);

  // 創建新會話
  const createNewSession = useCallback(
    async (userId: string, category?: ChatCategory) => {
      try {
        const session = await dispatch(
          createSession({ userId, category })
        ).unwrap();
        return session;
      } catch (error) {
        console.error('創建會話失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 發送消息
  const sendChatMessage = useCallback(
    async (
      sessionId: string,
      message: string,
      userId: string,
      category?: ChatCategory,
      intent?: UserIntent
    ) => {
      try {
        const response = await dispatch(
          sendMessage({
            sessionId,
            message,
            userId,
            category,
            intent,
          })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('發送消息失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 獲取用戶會話列表
  const loadUserSessions = useCallback(
    async (userId: string) => {
      try {
        await dispatch(getUserSessions(userId)).unwrap();
      } catch (error) {
        console.error('獲取會話列表失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 載入會話歷史
  const loadSessionHistory = useCallback(
    async (sessionId: string) => {
      try {
        await dispatch(getSessionHistory(sessionId)).unwrap();
      } catch (error) {
        console.error('載入會話歷史失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 獲取聊天統計
  const loadChatStats = useCallback(async () => {
    try {
      await dispatch(getChatStats()).unwrap();
    } catch (error) {
      console.error('獲取聊天統計失敗:', error);
      throw error;
    }
  }, [dispatch]);

  // 關閉會話
  const closeChatSession = useCallback(
    async (sessionId: string) => {
      try {
        await dispatch(closeSession(sessionId)).unwrap();
      } catch (error) {
        console.error('關閉會話失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 歸檔會話
  const archiveChatSession = useCallback(
    async (sessionId: string) => {
      try {
        await dispatch(archiveSession(sessionId)).unwrap();
      } catch (error) {
        console.error('歸檔會話失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 更新會話優先級
  const updateSessionPriorityLevel = useCallback(
    async (sessionId: string, priority: ChatPriority) => {
      try {
        await dispatch(updateSessionPriority({ sessionId, priority })).unwrap();
      } catch (error) {
        console.error('更新會話優先級失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 添加會話標籤
  const addSessionTagLabel = useCallback(
    async (sessionId: string, tag: string) => {
      try {
        await dispatch(addSessionTag({ sessionId, tag })).unwrap();
      } catch (error) {
        console.error('添加會話標籤失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 移除會話標籤
  const removeSessionTagLabel = useCallback(
    async (sessionId: string, tag: string) => {
      try {
        await dispatch(removeSessionTag({ sessionId, tag })).unwrap();
      } catch (error) {
        console.error('移除會話標籤失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 設定當前會話
  const setCurrentChatSession = useCallback(
    (session: unknown) => {
      dispatch(setCurrentSession(session));
    },
    [dispatch]
  );

  // 清除消息
  const clearChatMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  // 清除錯誤
  const clearChatError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 重置聊天狀態
  const resetChat = useCallback(() => {
    dispatch(resetChatState());
  }, [dispatch]);

  // 計算統計數據
  const chatStatistics = useMemo(() => {
    if (!stats) return null;

    return {
      totalSessions: stats.totalSessions,
      activeSessions: stats.activeSessions,
      totalMessages: stats.totalMessages,
      averageResponseTime: stats.averageResponseTime,
      userSatisfaction: stats.userSatisfaction,
      responseTimeBreakdown: {
        under1s: stats.responseTimeDistribution.under1s,
        under2s: stats.responseTimeDistribution.under2s,
        under5s: stats.responseTimeDistribution.under5s,
        over5s: stats.responseTimeDistribution.over5s,
      },
      categoryBreakdown: stats.categoryDistribution,
      intentBreakdown: stats.intentDistribution,
    };
  }, [stats]);

  // 獲取活躍會話
  const activeSessions = useMemo(() => {
    return sessions.filter(session => session.status === 'active');
  }, [sessions]);

  // 獲取已關閉會話
  const closedSessions = useMemo(() => {
    return sessions.filter(session => session.status === 'closed');
  }, [sessions]);

  // 獲取已歸檔會話
  const archivedSessions = useMemo(() => {
    return sessions.filter(session => session.status === 'archived');
  }, [sessions]);

  // 按優先級分組會話
  const sessionsByPriority = useMemo(() => {
    const grouped = {
      urgent: sessions.filter(s => s.priority === ChatPriority.URGENT),
      high: sessions.filter(s => s.priority === ChatPriority.HIGH),
      normal: sessions.filter(s => s.priority === ChatPriority.NORMAL),
      low: sessions.filter(s => s.priority === ChatPriority.LOW),
    };
    return grouped;
  }, [sessions]);

  // 獲取用戶消息
  const userMessages = useMemo(() => {
    return messages.filter(msg => msg.type === 'user');
  }, [messages]);

  // 獲取 AI 回應
  const aiMessages = useMemo(() => {
    return messages.filter(msg => msg.type === 'assistant');
  }, [messages]);

  // 檢查是否有錯誤
  const hasError = useMemo(() => {
    return error !== null;
  }, [error]);

  // 檢查是否正在載入
  const isLoading = useMemo(() => {
    return loading;
  }, [loading]);

  // 檢查是否有當前會話
  const hasCurrentSession = useMemo(() => {
    return currentSession !== null;
  }, [currentSession]);

  // 檢查是否有消息
  const hasMessages = useMemo(() => {
    return messages.length > 0;
  }, [messages]);

  // 獲取最後一條消息
  const lastMessage = useMemo(() => {
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }, [messages]);

  // 獲取消息數量
  const messageCount = useMemo(() => {
    return messages.length;
  }, [messages]);

  // 格式化時間
  const formatMessageTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // 檢查消息是否為今天
  const isMessageToday = useCallback((timestamp: string) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    return messageDate.toDateString() === today.toDateString();
  }, []);

  // 檢查消息是否為昨天
  const isMessageYesterday = useCallback((timestamp: string) => {
    const messageDate = new Date(timestamp);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return messageDate.toDateString() === yesterday.toDateString();
  }, []);

  // 獲取消息時間顯示
  const getMessageTimeDisplay = useCallback(
    (timestamp: string) => {
      if (isMessageToday(timestamp)) {
        return new Date(timestamp).toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit',
        });
      } else if (isMessageYesterday(timestamp)) {
        return '昨天';
      } else {
        return new Date(timestamp).toLocaleDateString('zh-TW', {
          month: '2-digit',
          day: '2-digit',
        });
      }
    },
    [isMessageToday, isMessageYesterday]
  );

  // 快速回覆處理
  const handleQuickReply = useCallback(
    async (reply: string) => {
      if (!currentSession) return;

      try {
        await sendChatMessage(
          currentSession.id,
          reply,
          currentSession.userId,
          currentSession.category
        );
      } catch (error) {
        console.error('快速回覆失敗:', error);
      }
    },
    [currentSession, sendChatMessage]
  );

  // 建議操作處理
  const handleSuggestedAction = useCallback(
    async (action: string) => {
      if (!currentSession) return;

      try {
        await sendChatMessage(
          currentSession.id,
          `我想${action}`,
          currentSession.userId,
          currentSession.category
        );
      } catch (error) {
        console.error('建議操作失敗:', error);
      }
    },
    [currentSession, sendChatMessage]
  );

  return {
    // 狀態
    currentSession,
    sessions,
    messages,
    stats: chatStatistics,
    loading: isLoading,
    error,
    isTyping,
    quickReplies,
    suggestedActions,

    // 計算屬性
    activeSessions,
    closedSessions,
    archivedSessions,
    sessionsByPriority,
    userMessages,
    aiMessages,
    hasError,
    hasCurrentSession,
    hasMessages,
    lastMessage,
    messageCount,

    // 操作方法
    initialize,
    createNewSession,
    sendChatMessage,
    loadUserSessions,
    loadSessionHistory,
    loadChatStats,
    closeChatSession,
    archiveChatSession,
    updateSessionPriorityLevel,
    addSessionTagLabel,
    removeSessionTagLabel,
    setCurrentChatSession,
    clearChatMessages,
    clearChatError,
    resetChat,

    // 工具方法
    formatMessageTime,
    getMessageTimeDisplay,
    handleQuickReply,
    handleSuggestedAction,
  };
};
