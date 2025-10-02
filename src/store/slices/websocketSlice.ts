/**
 * WebSocket Redux Slice
 * Manage WebSocket ConnectStatus和Message
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { websocketService } from '../../features/realtime/services/websocketService';
import type {
  WebSocketMessage,
  WebSocketConfig,
  WebSocketStatus,
  ConnectionState,
  WebSocketStats,
  BroadcastOptions,
  SubscriptionFilter,
} from '../../features/realtime/types/websocket';

// AsyncOperation
export const _initializeWebSocket = createAsyncThunk(
  'websocket/initialize',
  async (config?: Partial<WebSocketConfig>) => {
    await websocketService.initialize(config);
    return websocketService.getConfig();
  }
);

export const _connectWebSocket = createAsyncThunk(
  'websocket/connect',
  async () => {
    await websocketService.connect();
    return websocketService.getConnectionState();
  }
);

export const _disconnectWebSocket = createAsyncThunk(
  'websocket/disconnect',
  async () => {
    websocketService.disconnect();
    return websocketService.getConnectionState();
  }
);

export const _sendWebSocketMessage = createAsyncThunk(
  'websocket/sendMessage',
  async (message: Partial<WebSocketMessage>) => {
    await websocketService.sendMessage(message);
    return message;
  }
);

export const _broadcastMessage = createAsyncThunk(
  'websocket/broadcast',
  async ({
    message,
    options,
  }: {
    message: Partial<WebSocketMessage>;
    options?: BroadcastOptions;
  }) => {
    await websocketService.broadcast(message, options);
    return { message, options };
  }
);

export const _reconnectWebSocket = createAsyncThunk(
  'websocket/reconnect',
  async () => {
    await websocketService.reconnect();
    return websocketService.getConnectionState();
  }
);

export const _joinRoom = createAsyncThunk(
  'websocket/joinRoom',
  async ({ roomId, userInfo }: { roomId: string; userInfo: unknown }) => {
    await websocketService.joinRoom(roomId, userInfo);
    return { roomId, userInfo };
  }
);

export const _leaveRoom = createAsyncThunk(
  'websocket/leaveRoom',
  async (roomId: string) => {
    await websocketService.leaveRoom(roomId);
    return roomId;
  }
);

// Status介面
export interface WebSocketState {
  // 基本Status
  isInitialized: boolean;
  status: WebSocketStatus;
  connectionState: ConnectionState | null;
  config: WebSocketConfig | null;

  // Message
  messages: WebSocketMessage[];
  lastMessage: WebSocketMessage | null;
  messageHistory: WebSocketMessage[];

  // Statistics
  stats: WebSocketStats | null;

  // 房間和訂閱
  currentRooms: string[];
  subscriptions: { id: string; filter: SubscriptionFilter }[];

  // LoadStatus
  loading: {
    initializing: boolean;
    connecting: boolean;
    disconnecting: boolean;
    sendingMessage: boolean;
    broadcasting: boolean;
    reconnecting: boolean;
    joiningRoom: boolean;
    leavingRoom: boolean;
  };

  // Error
  error: string | null;
  lastError: string | null;

  // UI Status
  isVisible: boolean;
  unreadCount: number;
  notifications: WebSocketMessage[];
}

const initialState: WebSocketState = {
  isInitialized: false,
  status: 'disconnected',
  connectionState: {
    status: 'disconnected',
    reconnectAttempts: 0,
    bytesReceived: 0,
    bytesSent: 0,
    messagesReceived: 0,
    messagesSent: 0,
  },
  config: {
    url: 'ws://localhost:8080/ws',
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000,
    autoConnect: true,
    enableLogging: true,
    messageHistoryLimit: 100,
    notificationLimit: 50,
  } as WebSocketConfig,
  messages: [],
  lastMessage: null,
  messageHistory: [],
  stats: {
    uptime: 0,
    totalConnections: 0,
    successfulConnections: 0,
    failedConnections: 0,
    totalMessagesSent: 0,
    totalMessagesReceived: 0,
    errorCount: 0,
    errorRate: 0,
    reliability: 100,
    averageLatency: 0,
    lastHeartbeat: null,
  } as WebSocketStats,
  currentRooms: [],
  subscriptions: [],
  loading: {
    initializing: false,
    connecting: false,
    disconnecting: false,
    sendingMessage: false,
    broadcasting: false,
    reconnecting: false,
    joiningRoom: false,
    leavingRoom: false,
  },
  error: null,
  lastError: null,
  isVisible: true,
  unreadCount: 0,
  notifications: [],
};

const _websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    // ReceiveMessage
    receiveMessage: (state, action: PayloadAction<WebSocketMessage>) => {
      const _message = action.payload;
      state.messages.push(message);
      state.lastMessage = message;
      state.messageHistory.push(message);

      // LimitMessage歷史長度
      if (
        state.messageHistory.length > (state.config?.messageHistoryLimit || 100)
      ) {
        state.messageHistory = state.messageHistory.slice(
          -(state.config?.messageHistoryLimit || 100)
        );
      }

      // Update未讀Count
      if (!state.isVisible) {
        state.unreadCount++;
      }

      // Add到Notification（如果Yes重要Message）
      if (message.priority === 'high' || message.priority === 'urgent') {
        state.notifications.push(message);
        if (
          state.notifications.length > (state.config?.notificationLimit || 50)
        ) {
          state.notifications = state.notifications.slice(
            -(state.config?.notificationLimit || 50)
          );
        }
      }
    },

    // UpdateConnectStatus
    updateConnectionState: (state, action: PayloadAction<ConnectionState>) => {
      state.connectionState = action.payload;
      state.status = action.payload.status;
    },

    // UpdateStatisticsInformation
    updateStats: (state, action: PayloadAction<WebSocketStats>) => {
      state.stats = action.payload;
    },

    // 清EmptyMessage
    clearMessages: state => {
      state.messages = [];
      state.lastMessage = null;
      state.unreadCount = 0;
    },

    // 清EmptyNotification
    clearNotifications: state => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    // Settings可見性
    setVisibility: (state, action: PayloadAction<boolean>) => {
      state.isVisible = action.payload;
      if (action.payload) {
        state.unreadCount = 0;
      }
    },

    // Add訂閱
    addSubscription: (
      state,
      action: PayloadAction<{ id: string; filter: SubscriptionFilter }>
    ) => {
      const { id, filter } = action.payload;
      state.subscriptions.push({ id, filter });
    },

    // Remove訂閱
    removeSubscription: (state, action: PayloadAction<string>) => {
      state.subscriptions = state.subscriptions.filter(
        sub => sub.id !== action.payload
      );
    },

    // 清EmptyError
    clearError: state => {
      state.error = null;
    },

    // SettingsError
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.lastError = action.payload;
    },

    // ResetStatus
    resetState: state => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: builder => {
    // Initialize
    builder
      .addCase(initializeWebSocket.pending, state => {
        state.loading.initializing = true;
        state.error = null;
      })
      .addCase(initializeWebSocket.fulfilled, (state, action) => {
        state.loading.initializing = false;
        state.isInitialized = true;
        state.config = action.payload;
      })
      .addCase(initializeWebSocket.rejected, (state, action) => {
        state.loading.initializing = false;
        state.error = action.error.message || 'WebSocket InitializeFailed';
      });

    // Connect
    builder
      .addCase(connectWebSocket.pending, state => {
        state.loading.connecting = true;
        state.error = null;
      })
      .addCase(connectWebSocket.fulfilled, (state, action) => {
        state.loading.connecting = false;
        state.connectionState = action.payload;
        state.status = action.payload?.status || 'disconnected';
      })
      .addCase(connectWebSocket.rejected, (state, action) => {
        state.loading.connecting = false;
        state.error = action.error.message || 'WebSocket ConnectFailed';
      });

    // DisconnectConnect
    builder
      .addCase(disconnectWebSocket.pending, state => {
        state.loading.disconnecting = true;
      })
      .addCase(disconnectWebSocket.fulfilled, (state, action) => {
        state.loading.disconnecting = false;
        state.connectionState = action.payload;
        state.status = action.payload?.status || 'disconnected';
      })
      .addCase(disconnectWebSocket.rejected, (state, action) => {
        state.loading.disconnecting = false;
        state.error = action.error.message || 'WebSocket DisconnectConnectFailed';
      });

    // SendMessage
    builder
      .addCase(sendWebSocketMessage.pending, state => {
        state.loading.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendWebSocketMessage.fulfilled, state => {
        state.loading.sendingMessage = false;
      })
      .addCase(sendWebSocketMessage.rejected, (state, action) => {
        state.loading.sendingMessage = false;
        state.error = action.error.message || '發送消息Failed';
      });

    // 廣播Message
    builder
      .addCase(broadcastMessage.pending, state => {
        state.loading.broadcasting = true;
        state.error = null;
      })
      .addCase(broadcastMessage.fulfilled, state => {
        state.loading.broadcasting = false;
      })
      .addCase(broadcastMessage.rejected, (state, action) => {
        state.loading.broadcasting = false;
        state.error = action.error.message || '廣播消息Failed';
      });

    // ReConnect
    builder
      .addCase(reconnectWebSocket.pending, state => {
        state.loading.reconnecting = true;
        state.error = null;
      })
      .addCase(reconnectWebSocket.fulfilled, (state, action) => {
        state.loading.reconnecting = false;
        state.connectionState = action.payload;
        state.status = action.payload?.status || 'disconnected';
      })
      .addCase(reconnectWebSocket.rejected, (state, action) => {
        state.loading.reconnecting = false;
        state.error = action.error.message || '重新ConnectFailed';
      });

    // 加入房間
    builder
      .addCase(joinRoom.pending, state => {
        state.loading.joiningRoom = true;
        state.error = null;
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.loading.joiningRoom = false;
        const { roomId } = action.payload;
        if (!state.currentRooms.includes(roomId)) {
          state.currentRooms.push(roomId);
        }
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.loading.joiningRoom = false;
        state.error = action.error.message || '加入房間Failed';
      });

    // 離On房間
    builder
      .addCase(leaveRoom.pending, state => {
        state.loading.leavingRoom = true;
        state.error = null;
      })
      .addCase(leaveRoom.fulfilled, (state, action) => {
        state.loading.leavingRoom = false;
        const _roomId = action.payload;
        state.currentRooms = state.currentRooms.filter(id => id !== roomId);
      })
      .addCase(leaveRoom.rejected, (state, action) => {
        state.loading.leavingRoom = false;
        state.error = action.error.message || '離開房間Failed';
      });
  },
});

export const {
  receiveMessage,
  updateConnectionState,
  updateStats,
  clearMessages,
  clearNotifications,
  setVisibility,
  addSubscription,
  removeSubscription,
  clearError,
  setError,
  resetState,
} = websocketSlice.actions;

// Selectors
export const _selectStatus = (state: { websocket: WebSocketState }) =>
  state.websocket.status;
export const _selectIsConnected = (state: { websocket: WebSocketState }) =>
  state.websocket.status === 'connected';
export const _selectIsConnecting = (state: { websocket: WebSocketState }) =>
  state.websocket.status === 'connecting' ||
  state.websocket.status === 'reconnecting';
export const _selectHasError = (state: { websocket: WebSocketState }) =>
  !!state.websocket.error;

export default websocketSlice.reducer;
