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

export const _useChat = () => {
  const _dispatch = useAppDispatch();

  // Selectors
  const _currentSession = useAppSelector(selectCurrentSession);
  const _sessions = useAppSelector(selectSessions);
  const _messages = useAppSelector(selectMessages);
  const _stats = useAppSelector(selectChatStats);
  const _loading = useAppSelector(selectChatLoading);
  const _error = useAppSelector(selectChatError);
  const _isTyping = useAppSelector(selectIsTyping);
  const _quickReplies = useAppSelector(selectQuickReplies);
  const _suggestedActions = useAppSelector(selectSuggestedActions);

  // 初始化聊天服務
  const _initialize = useCallback(async () => {
    try {
      await dispatch(initializeChat()).unwrap();
      return true;
    } catch (error) {
      console.error('初始化聊天服務失敗:', error);
      return false;
    }
  }, [dispatch]);

  // 創建新會話
  const _createNewSession = useCallback(
    async (userId: string, category?: ChatCategory) => {
      try {
        const _session = await dispatch(
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
  const _sendChatMessage = useCallback(
    async (
      sessionId: string,
      message: string,
      userId: string,
      category?: ChatCategory,
      intent?: UserIntent
    ) => {
      try {
        const _response = await dispatch(
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
  const _loadUserSessions = useCallback(
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
  const _loadSessionHistory = useCallback(
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
  const _loadChatStats = useCallback(async () => {
    try {
      await dispatch(getChatStats()).unwrap();
    } catch (error) {
      console.error('獲取聊天統計失敗:', error);
      throw error;
    }
  }, [dispatch]);

  // 關閉會話
  const _closeChatSession = useCallback(
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
  const _archiveChatSession = useCallback(
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
  const _updateSessionPriorityLevel = useCallback(
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
  const _addSessionTagLabel = useCallback(
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
  const _removeSessionTagLabel = useCallback(
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
  const _setCurrentChatSession = useCallback(
    (session: unknown) => {
      dispatch(setCurrentSession(session));
    },
    [dispatch]
  );

  // 清除消息
  const _clearChatMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  // 清除錯誤
  const _clearChatError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 重置聊天狀態
  const _resetChat = useCallback(() => {
    dispatch(resetChatState());
  }, [dispatch]);

  // 計算統計數據
  const _chatStatistics = useMemo(() => {
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
  const _activeSessions = useMemo(() => {
    return sessions.filter(session => session.status === 'active');
  }, [sessions]);

  // 獲取已關閉會話
  const _closedSessions = useMemo(() => {
    return sessions.filter(session => session.status === 'closed');
  }, [sessions]);

  // 獲取已歸檔會話
  const _archivedSessions = useMemo(() => {
    return sessions.filter(session => session.status === 'archived');
  }, [sessions]);

  // 按優先級分組會話
  const _sessionsByPriority = useMemo(() => {
    const _grouped = {
      urgent: sessions.filter(s => s.priority === ChatPriority.URGENT),
      high: sessions.filter(s => s.priority === ChatPriority.HIGH),
      normal: sessions.filter(s => s.priority === ChatPriority.NORMAL),
      low: sessions.filter(s => s.priority === ChatPriority.LOW),
    };
    return grouped;
  }, [sessions]);

  // 獲取用戶消息
  const _userMessages = useMemo(() => {
    return messages.filter(msg => msg.type === 'user');
  }, [messages]);

  // 獲取 AI 回應
  const _aiMessages = useMemo(() => {
    return messages.filter(msg => msg.type === 'assistant');
  }, [messages]);

  // 檢查是否有錯誤
  const _hasError = useMemo(() => {
    return error !== null;
  }, [error]);

  // 檢查是否正在載入
  const _isLoading = useMemo(() => {
    return loading;
  }, [loading]);

  // 檢查是否有當前會話
  const _hasCurrentSession = useMemo(() => {
    return currentSession !== null;
  }, [currentSession]);

  // 檢查是否有消息
  const _hasMessages = useMemo(() => {
    return messages.length > 0;
  }, [messages]);

  // 獲取最後一條消息
  const _lastMessage = useMemo(() => {
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }, [messages]);

  // 獲取消息數量
  const _messageCount = useMemo(() => {
    return messages.length;
  }, [messages]);

  // 格式化時間
  const _formatMessageTime = useCallback((timestamp: string) => {
    const _date = new Date(timestamp);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // 檢查消息是否為今天
  const _isMessageToday = useCallback((timestamp: string) => {
    const _messageDate = new Date(timestamp);
    const _today = new Date();
    return messageDate.toDateString() === today.toDateString();
  }, []);

  // 檢查消息是否為昨天
  const _isMessageYesterday = useCallback((timestamp: string) => {
    const _messageDate = new Date(timestamp);
    const _yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return messageDate.toDateString() === yesterday.toDateString();
  }, []);

  // 獲取消息時間顯示
  const _getMessageTimeDisplay = useCallback(
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
  const _handleQuickReply = useCallback(
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
  const _handleSuggestedAction = useCallback(
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
