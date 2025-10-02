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

  // Initialize聊天Service
  const _initialize = useCallback(async () => {
    try {
      await dispatch(initializeChat()).unwrap();
      return true;
    } catch (error) {
      console.error('Initialize聊天ServiceFailed:', error);
      return false;
    }
  }, [dispatch]);

  // Create新會話
  const _createNewSession = useCallback(
    async (userId: string, category?: ChatCategory) => {
      try {
        const _session = await dispatch(
          createSession({ userId, category })
        ).unwrap();
        return session;
      } catch (error) {
        console.error('Create會話Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // SendMessage
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
        console.error('發送消息Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // GetUser會話List
  const _loadUserSessions = useCallback(
    async (userId: string) => {
      try {
        await dispatch(getUserSessions(userId)).unwrap();
      } catch (error) {
        console.error('Get會話列表Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // Load會話歷史
  const _loadSessionHistory = useCallback(
    async (sessionId: string) => {
      try {
        await dispatch(getSessionHistory(sessionId)).unwrap();
      } catch (error) {
        console.error('載入會話歷史Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // Get聊天Statistics
  const _loadChatStats = useCallback(async () => {
    try {
      await dispatch(getChatStats()).unwrap();
    } catch (error) {
      console.error('Get聊天統計Failed:', error);
      throw error;
    }
  }, [dispatch]);

  // Off閉會話
  const _closeChatSession = useCallback(
    async (sessionId: string) => {
      try {
        await dispatch(closeSession(sessionId)).unwrap();
      } catch (error) {
        console.error('關閉會話Failed:', error);
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
        console.error('歸檔會話Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // Update會話優先級
  const _updateSessionPriorityLevel = useCallback(
    async (sessionId: string, priority: ChatPriority) => {
      try {
        await dispatch(updateSessionPriority({ sessionId, priority })).unwrap();
      } catch (error) {
        console.error('Update會話優先級Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // Add會話Tag
  const _addSessionTagLabel = useCallback(
    async (sessionId: string, tag: string) => {
      try {
        await dispatch(addSessionTag({ sessionId, tag })).unwrap();
      } catch (error) {
        console.error('添加會話標籤Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // Remove會話Tag
  const _removeSessionTagLabel = useCallback(
    async (sessionId: string, tag: string) => {
      try {
        await dispatch(removeSessionTag({ sessionId, tag })).unwrap();
      } catch (error) {
        console.error('移除會話標籤Failed:', error);
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

  // ClearMessage
  const _clearChatMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  // ClearError
  const _clearChatError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Reset聊天Status
  const _resetChat = useCallback(() => {
    dispatch(resetChatState());
  }, [dispatch]);

  // 計算統Count據
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

  // Get活躍會話
  const _activeSessions = useMemo(() => {
    return sessions.filter(session => session.status === 'active');
  }, [sessions]);

  // Get已Off閉會話
  const _closedSessions = useMemo(() => {
    return sessions.filter(session => session.status === 'closed');
  }, [sessions]);

  // Get已歸檔會話
  const _archivedSessions = useMemo(() => {
    return sessions.filter(session => session.status === 'archived');
  }, [sessions]);

  // 按優先級Group會話
  const _sessionsByPriority = useMemo(() => {
    const _grouped = {
      urgent: sessions.filter(s => s.priority === ChatPriority.URGENT),
      high: sessions.filter(s => s.priority === ChatPriority.HIGH),
      normal: sessions.filter(s => s.priority === ChatPriority.NORMAL),
      low: sessions.filter(s => s.priority === ChatPriority.LOW),
    };
    return grouped;
  }, [sessions]);

  // GetUserMessage
  const _userMessages = useMemo(() => {
    return messages.filter(msg => msg.type === 'user');
  }, [messages]);

  // Get AI 回應
  const _aiMessages = useMemo(() => {
    return messages.filter(msg => msg.type === 'assistant');
  }, [messages]);

  // CheckYesNo有Error
  const _hasError = useMemo(() => {
    return error !== null;
  }, [error]);

  // CheckYesNo正在Load
  const _isLoading = useMemo(() => {
    return loading;
  }, [loading]);

  // CheckYesNo有當前會話
  const _hasCurrentSession = useMemo(() => {
    return currentSession !== null;
  }, [currentSession]);

  // CheckYesNo有Message
  const _hasMessages = useMemo(() => {
    return messages.length > 0;
  }, [messages]);

  // Get最後一條Message
  const _lastMessage = useMemo(() => {
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }, [messages]);

  // GetMessage數量
  const _messageCount = useMemo(() => {
    return messages.length;
  }, [messages]);

  // FormatTime
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

  // CheckMessageYesNo為Today
  const _isMessageToday = useCallback((timestamp: string) => {
    const _messageDate = new Date(timestamp);
    const _today = new Date();
    return messageDate.toDateString() === today.toDateString();
  }, []);

  // CheckMessageYesNo為Yesterday
  const _isMessageYesterday = useCallback((timestamp: string) => {
    const _messageDate = new Date(timestamp);
    const _yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return messageDate.toDateString() === yesterday.toDateString();
  }, []);

  // GetMessageTimeShow
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

  // 快速回覆Handle
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
        console.error('快速回覆Failed:', error);
      }
    },
    [currentSession, sendChatMessage]
  );

  // 建議OperationHandle
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
        console.error('建議操作Failed:', error);
      }
    },
    [currentSession, sendChatMessage]
  );

  return {
    // Status
    currentSession,
    sessions,
    messages,
    stats: chatStatistics,
    loading: isLoading,
    error,
    isTyping,
    quickReplies,
    suggestedActions,

    // 計算Property
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

    // OperationMethod
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

    // ToolMethod
    formatMessageTime,
    getMessageTimeDisplay,
    handleQuickReply,
    handleSuggestedAction,
  };
};
