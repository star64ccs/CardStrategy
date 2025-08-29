import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { ChatService } from '../../features/ai/services/chatService';
import type {
  ChatSession,
  ChatMessage,
  ChatStats,
  ChatCategory,
  ChatPriority,
  UserIntent,
} from '../../features/ai/types/chat';
import {
  ChatResponse,
  ChatHistory,
  MessageType,
  MessageStatus,
} from '../../features/ai/types/chat';

interface ChatState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  messages: ChatMessage[];
  stats: ChatStats | null;
  loading: boolean;
  error: string | null;
  isTyping: boolean;
  quickReplies: string[];
  suggestedActions: string[];
}

const initialState: ChatState = {
  currentSession: null,
  sessions: [],
  messages: [],
  stats: null,
  loading: false,
  error: null,
  isTyping: false,
  quickReplies: [],
  suggestedActions: [],
};

// Async thunks
export const _initializeChat = createAsyncThunk(
  'chat/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const _chatService = ChatService.getInstance();
      await chatService.initialize();
      return true;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '初始化失敗'
      );
    }
  }
);

export const _createSession = createAsyncThunk(
  'chat/createSession',
  async (
    { userId, category }: { userId: string; category?: ChatCategory },
    { rejectWithValue }
  ) => {
    try {
      const _chatService = ChatService.getInstance();
      const _session = await chatService.createSession(userId, category);
      return session;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '創建會話失敗'
      );
    }
  }
);

export const _sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    {
      sessionId,
      message,
      userId,
      category,
      intent,
    }: {
      sessionId: string;
      message: string;
      userId: string;
      category?: ChatCategory;
      intent?: UserIntent;
    },
    { rejectWithValue }
  ) => {
    try {
      const _chatService = ChatService.getInstance();
      const _response = await chatService.sendMessage({
        sessionId,
        message,
        userId,
        category,
        intent,
      });
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '發送消息失敗'
      );
    }
  }
);

export const _getUserSessions = createAsyncThunk(
  'chat/getUserSessions',
  async (userId: string, { rejectWithValue }) => {
    try {
      const _chatService = ChatService.getInstance();
      const _sessions = await chatService.getUserSessions(userId);
      return sessions;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '獲取會話列表失敗'
      );
    }
  }
);

export const _getSessionHistory = createAsyncThunk(
  'chat/getSessionHistory',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const _chatService = ChatService.getInstance();
      const _history = await chatService.getSessionHistory(sessionId);
      return history;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '獲取會話歷史失敗'
      );
    }
  }
);

export const _getChatStats = createAsyncThunk(
  'chat/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const _chatService = ChatService.getInstance();
      const _stats = await chatService.getStats();
      return stats;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '獲取統計數據失敗'
      );
    }
  }
);

export const _closeSession = createAsyncThunk(
  'chat/closeSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const _chatService = ChatService.getInstance();
      await chatService.closeSession(sessionId);
      return sessionId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '關閉會話失敗'
      );
    }
  }
);

export const _archiveSession = createAsyncThunk(
  'chat/archiveSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const _chatService = ChatService.getInstance();
      await chatService.archiveSession(sessionId);
      return sessionId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '歸檔會話失敗'
      );
    }
  }
);

export const _updateSessionPriority = createAsyncThunk(
  'chat/updateSessionPriority',
  async (
    { sessionId, priority }: { sessionId: string; priority: ChatPriority },
    { rejectWithValue }
  ) => {
    try {
      const _chatService = ChatService.getInstance();
      await chatService.updateSessionPriority(sessionId, priority);
      return { sessionId, priority };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '更新優先級失敗'
      );
    }
  }
);

export const _addSessionTag = createAsyncThunk(
  'chat/addSessionTag',
  async (
    { sessionId, tag }: { sessionId: string; tag: string },
    { rejectWithValue }
  ) => {
    try {
      const _chatService = ChatService.getInstance();
      await chatService.addSessionTag(sessionId, tag);
      return { sessionId, tag };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '添加標籤失敗'
      );
    }
  }
);

export const _removeSessionTag = createAsyncThunk(
  'chat/removeSessionTag',
  async (
    { sessionId, tag }: { sessionId: string; tag: string },
    { rejectWithValue }
  ) => {
    try {
      const _chatService = ChatService.getInstance();
      await chatService.removeSessionTag(sessionId, tag);
      return { sessionId, tag };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '移除標籤失敗'
      );
    }
  }
);

const _chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentSession: (state, action: PayloadAction<ChatSession | null>) => {
      state.currentSession = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{ messageId: string; status: MessageStatus }>
    ) => {
      const _message = state.messages.find(
        msg => msg.id === action.payload.messageId
      );
      if (message) {
        message.status = action.payload.status;
      }
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    setQuickReplies: (state, action: PayloadAction<string[]>) => {
      state.quickReplies = action.payload;
    },
    setSuggestedActions: (state, action: PayloadAction<string[]>) => {
      state.suggestedActions = action.payload;
    },
    clearMessages: state => {
      state.messages = [];
    },
    clearError: state => {
      state.error = null;
    },
    resetChatState: state => {
      state.currentSession = null;
      state.messages = [];
      state.quickReplies = [];
      state.suggestedActions = [];
      state.error = null;
      state.isTyping = false;
    },
  },
  extraReducers: builder => {
    builder
      // Initialize Chat
      .addCase(initializeChat.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeChat.fulfilled, state => {
        state.loading = false;
      })
      .addCase(initializeChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Session
      .addCase(createSession.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        state.sessions.push(action.payload);
        state.messages = [];
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Send Message
      .addCase(sendMessage.pending, state => {
        state.isTyping = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isTyping = false;
        // 添加用戶消息
        const userMessage: ChatMessage = {
          id: `user_${Date.now()}`,
          sessionId: action.payload.sessionId,
          type: MessageType.USER,
          content: action.meta.arg.message,
          timestamp: new Date().toISOString(),
          status: MessageStatus.SENT,
          userId: action.meta.arg.userId,
        };
        state.messages.push(userMessage);

        // 添加 AI 回應
        const aiMessage: ChatMessage = {
          id: action.payload.messageId,
          sessionId: action.payload.sessionId,
          type: MessageType.ASSISTANT,
          content: action.payload.content,
          timestamp: action.payload.timestamp,
          status: MessageStatus.SENT,
          responseType: action.payload.responseType,
          assistantId: 'ai-assistant-001',
        };
        state.messages.push(aiMessage);

        // 更新快速回覆和建議操作
        if (action.payload.quickReplies) {
          state.quickReplies = action.payload.quickReplies;
        }
        if (action.payload.suggestedActions) {
          state.suggestedActions = action.payload.suggestedActions;
        }

        // 更新當前會話
        if (state.currentSession) {
          state.currentSession.messageCount += 2;
          state.currentSession.lastMessageAt = new Date().toISOString();
          state.currentSession.updatedAt = new Date().toISOString();
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isTyping = false;
        state.error = action.payload as string;
      })

      // Get User Sessions
      .addCase(getUserSessions.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(getUserSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get Session History
      .addCase(getSessionHistory.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSessionHistory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.messages = action.payload.messages;
        }
      })
      .addCase(getSessionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get Chat Stats
      .addCase(getChatStats.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChatStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getChatStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Close Session
      .addCase(closeSession.fulfilled, (state, action) => {
        const _session = state.sessions.find(s => s.id === action.payload);
        if (session) {
          session.status = 'closed';
          session.updatedAt = new Date().toISOString();
        }
        if (state.currentSession?.id === action.payload) {
          state.currentSession.status = 'closed';
          state.currentSession.updatedAt = new Date().toISOString();
        }
      })

      // Archive Session
      .addCase(archiveSession.fulfilled, (state, action) => {
        const _session = state.sessions.find(s => s.id === action.payload);
        if (session) {
          session.status = 'archived';
          session.updatedAt = new Date().toISOString();
        }
        if (state.currentSession?.id === action.payload) {
          state.currentSession.status = 'archived';
          state.currentSession.updatedAt = new Date().toISOString();
        }
      })

      // Update Session Priority
      .addCase(updateSessionPriority.fulfilled, (state, action) => {
        const _session = state.sessions.find(
          s => s.id === action.payload.sessionId
        );
        if (session) {
          session.priority = action.payload.priority;
          session.updatedAt = new Date().toISOString();
        }
        if (state.currentSession?.id === action.payload.sessionId) {
          state.currentSession.priority = action.payload.priority;
          state.currentSession.updatedAt = new Date().toISOString();
        }
      })

      // Add Session Tag
      .addCase(addSessionTag.fulfilled, (state, action) => {
        const _session = state.sessions.find(
          s => s.id === action.payload.sessionId
        );
        if (session && !session.tags.includes(action.payload.tag)) {
          session.tags.push(action.payload.tag);
          session.updatedAt = new Date().toISOString();
        }
        if (
          state.currentSession?.id === action.payload.sessionId &&
          !state.currentSession.tags.includes(action.payload.tag)
        ) {
          state.currentSession.tags.push(action.payload.tag);
          state.currentSession.updatedAt = new Date().toISOString();
        }
      })

      // Remove Session Tag
      .addCase(removeSessionTag.fulfilled, (state, action) => {
        const _session = state.sessions.find(
          s => s.id === action.payload.sessionId
        );
        if (session) {
          session.tags = session.tags.filter(t => t !== action.payload.tag);
          session.updatedAt = new Date().toISOString();
        }
        if (state.currentSession?.id === action.payload.sessionId) {
          state.currentSession.tags = state.currentSession.tags.filter(
            t => t !== action.payload.tag
          );
          state.currentSession.updatedAt = new Date().toISOString();
        }
      });
  },
});

export const {
  setCurrentSession,
  addMessage,
  updateMessageStatus,
  setTyping,
  setQuickReplies,
  setSuggestedActions,
  clearMessages,
  clearError,
  resetChatState,
} = chatSlice.actions;

// Selectors
export const _selectCurrentSession = (state: { chat: ChatState }) =>
  state.chat.currentSession;
export const _selectSessions = (state: { chat: ChatState }) =>
  state.chat.sessions;
export const _selectMessages = (state: { chat: ChatState }) =>
  state.chat.messages;
export const _selectChatStats = (state: { chat: ChatState }) =>
  state.chat.stats;
export const _selectChatLoading = (state: { chat: ChatState }) =>
  state.chat.loading;
export const _selectChatError = (state: { chat: ChatState }) =>
  state.chat.error;
export const _selectIsTyping = (state: { chat: ChatState }) =>
  state.chat.isTyping;
export const _selectQuickReplies = (state: { chat: ChatState }) =>
  state.chat.quickReplies;
export const _selectSuggestedActions = (state: { chat: ChatState }) =>
  state.chat.suggestedActions;

export default chatSlice.reducer;
