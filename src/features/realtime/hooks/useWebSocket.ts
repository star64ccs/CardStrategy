/**
 * WebSocket Custom Hook
 * 提供 WebSocket ConnectManage和MessageHandle功能
 */

import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '../../../store';
import {
  addSubscription,
  broadcastMessage,
  clearError,
  clearMessages,
  clearNotifications,
  connectWebSocket,
  disconnectWebSocket,
  initializeWebSocket,
  joinRoom,
  leaveRoom,
  receiveMessage,
  reconnectWebSocket,
  removeSubscription,
  sendWebSocketMessage,
  setError,
  setVisibility,
  updateConnectionState,
  updateStats,
} from '../../../store/slices/websocketSlice';
import { websocketService } from '../services/websocketService';
import type {
  BroadcastOptions,
  ConnectionState,
  SubscriptionFilter,
  WebSocketConfig,
  WebSocketEventHandlers,
  WebSocketMessage,
  WebSocketStats,
} from '../types/websocket';

export const _useWebSocket = () => {
  const _dispatch = useDispatch<AppDispatch>();
  const _websocketState = useSelector((state: RootState) => state.websocket);
  const _eventHandlersRef = useRef<WebSocketEventHandlers>({});

  // Debug logging
  console.log('useWebSocket hook called, websocketState:', websocketState);

  // Initialize WebSocket
  const _initialize = useCallback(
    async (config?: Partial<WebSocketConfig>) => {
      try {
        await dispatch(initializeWebSocket(config)).unwrap();

        // SettingsEventHandle器
        websocketService.setEventHandlers({
          onConnect: event => {
            eventHandlersRef.current.onConnect?.(event);
            dispatch(
              updateConnectionState(websocketService.getConnectionState())
            );
          },
          onDisconnect: event => {
            eventHandlersRef.current.onDisconnect?.(event);
            dispatch(
              updateConnectionState(websocketService.getConnectionState())
            );
          },
          onMessage: message => {
            eventHandlersRef.current.onMessage?.(message);
            dispatch(receiveMessage(message));
          },
          onError: error => {
            eventHandlersRef.current.onError?.(error);
            dispatch(setError(error.message));
          },
          onReconnect: attempt => {
            eventHandlersRef.current.onReconnect?.(attempt);
          },
          onHeartbeat: latency => {
            eventHandlersRef.current.onHeartbeat?.(latency);
            dispatch(updateStats(websocketService.getStats()));
          },
          onStatusChange: status => {
            eventHandlersRef.current.onStatusChange?.(status);
          },
        });
      } catch (error: unknown) {
        dispatch(setError(error.message));
        throw error;
      }
    },
    [dispatch]
  );

  // Connect WebSocket
  const _connect = useCallback(async () => {
    try {
      await dispatch(connectWebSocket()).unwrap();
    } catch (error: unknown) {
      dispatch(setError(error.message));
      throw error;
    }
  }, [dispatch]);

  // Disconnect WebSocket Connect
  const _disconnect = useCallback(async () => {
    try {
      await dispatch(disconnectWebSocket()).unwrap();
    } catch (error: unknown) {
      dispatch(setError(error.message));
      throw error;
    }
  }, [dispatch]);

  // SendMessage
  const _sendMessage = useCallback(
    async (message: Partial<WebSocketMessage>) => {
      try {
        await dispatch(sendWebSocketMessage(message)).unwrap();
      } catch (error: unknown) {
        dispatch(setError(error.message));
        throw error;
      }
    },
    [dispatch]
  );

  // 廣播Message
  const _broadcast = useCallback(
    async (message: Partial<WebSocketMessage>, options?: BroadcastOptions) => {
      try {
        await dispatch(broadcastMessage({ message, options })).unwrap();
      } catch (error: unknown) {
        dispatch(setError(error.message));
        throw error;
      }
    },
    [dispatch]
  );

  // ReConnect
  const _reconnect = useCallback(async () => {
    try {
      await dispatch(reconnectWebSocket()).unwrap();
    } catch (error: unknown) {
      dispatch(setError(error.message));
      throw error;
    }
  }, [dispatch]);

  // 加入房間
  const _joinRoomHandler = useCallback(
    async (roomId: string, userInfo: unknown) => {
      try {
        await dispatch(joinRoom({ roomId, userInfo })).unwrap();
      } catch (error: unknown) {
        dispatch(setError(error.message));
        throw error;
      }
    },
    [dispatch]
  );

  // 離On房間
  const _leaveRoomHandler = useCallback(
    async (roomId: string) => {
      try {
        await dispatch(leaveRoom(roomId)).unwrap();
      } catch (error: unknown) {
        dispatch(setError(error.message));
        throw error;
      }
    },
    [dispatch]
  );

  // SettingsEventHandle器
  const _setEventHandlers = useCallback((handlers: WebSocketEventHandlers) => {
    eventHandlersRef.current = { ...eventHandlersRef.current, ...handlers };
  }, []);

  // Add訂閱
  const _subscribe = useCallback(
    (subscriptionId: string, filter: SubscriptionFilter) => {
      dispatch(addSubscription({ id: subscriptionId, filter }));
    },
    [dispatch]
  );

  // Cancel訂閱
  const _unsubscribe = useCallback(
    (subscriptionId: string) => {
      dispatch(removeSubscription(subscriptionId));
    },
    [dispatch]
  );

  // 清EmptyMessage
  const _clearMessagesHandler = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  // 清EmptyNotification
  const _clearNotificationsHandler = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  // Settings可見性
  const _setVisibilityHandler = useCallback(
    (isVisible: boolean) => {
      dispatch(setVisibility(isVisible));
    },
    [dispatch]
  );

  // 清EmptyError
  const _clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // GetStatisticsInformation
  const _getStats = useCallback((): WebSocketStats | null => {
    return websocketService.getStats();
  }, []);

  // GetConnectStatus
  const _getConnectionState = useCallback((): ConnectionState => {
    return websocketService.getConnectionState();
  }, []);

  // GetConfigure
  const _getConfig = useCallback((): WebSocketConfig => {
    return websocketService.getConfig();
  }, []);

  // UpdateConfigure
  const _updateConfig = useCallback((updates: Partial<WebSocketConfig>) => {
    websocketService.updateConfig(updates);
  }, []);

  // CheckYesNo已Connect
  const _isConnected = websocketState.status === 'connected';

  // CheckYesNo正在Connect
  const _isConnecting =
    websocketState.status === 'connecting' ||
    websocketState.status === 'reconnecting';

  // CheckYesNo有Error
  const _hasError = !!websocketState.error;

  // Get最新Message
  const { lastMessage } = websocketState;

  // Get未讀Message數量
  const { unreadCount } = websocketState;

  // GetNotification
  const { notifications } = websocketState;

  // Get當前房間
  const { currentRooms } = websocketState;

  // Get訂閱
  const { subscriptions } = websocketState;

  // GetLoadStatus
  const { loading } = websocketState;

  // GetStatisticsInformation
  const { stats } = websocketState;

  return {
    // Status
    isInitialized: websocketState.isInitialized,
    status: websocketState.status,
    connectionState: websocketState.connectionState,
    config: websocketState.config,
    isConnected,
    isConnecting,
    hasError,
    error: websocketState.error,
    lastError: websocketState.lastError,

    // Message
    messages: websocketState.messages,
    lastMessage,
    messageHistory: websocketState.messageHistory,
    unreadCount,
    notifications,

    // 房間和訂閱
    currentRooms,
    subscriptions,

    // Statistics
    stats,

    // LoadStatus
    loading,

    // Method
    initialize,
    connect,
    disconnect,
    sendMessage,
    broadcast,
    reconnect,
    joinRoom: joinRoomHandler,
    leaveRoom: leaveRoomHandler,
    setEventHandlers,
    subscribe,
    unsubscribe,
    clearMessages: clearMessagesHandler,
    clearNotifications: clearNotificationsHandler,
    setVisibility: setVisibilityHandler,
    clearError: clearErrorHandler,
    getStats,
    getConnectionState,
    getConfig,
    updateConfig,
  };
};

// 簡化的 WebSocket Hook，專注於基本功能
export const _useSimpleWebSocket = () => {
  const _dispatch = useDispatch<AppDispatch>();
  const { status, error, lastMessage, isInitialized } = useSelector(
    (state: RootState) => state.websocket
  );

  const _connect = useCallback(async () => {
    try {
      await dispatch(connectWebSocket()).unwrap();
    } catch (error: unknown) {
      throw error;
    }
  }, [dispatch]);

  const _disconnect = useCallback(async () => {
    try {
      await dispatch(disconnectWebSocket()).unwrap();
    } catch (error: unknown) {
      throw error;
    }
  }, [dispatch]);

  const _sendMessage = useCallback(
    async (message: Partial<WebSocketMessage>) => {
      try {
        await dispatch(sendWebSocketMessage(message)).unwrap();
      } catch (error: unknown) {
        throw error;
      }
    },
    [dispatch]
  );

  return {
    status,
    error,
    lastMessage,
    isInitialized,
    isConnected: status === 'connected',
    connect,
    disconnect,
    sendMessage,
  };
};

// 專門用於Message訂閱的 Hook
export const _useWebSocketSubscription = (
  subscriptionId: string,
  filter: SubscriptionFilter,
  onMessage?: (message: WebSocketMessage) => void
) => {
  const _dispatch = useDispatch<AppDispatch>();
  const { messages, subscriptions } = useSelector(
    (state: RootState) => state.websocket
  );

  useEffect(() => {
    // Add訂閱
    dispatch(addSubscription({ id: subscriptionId, filter }));

    // SettingsEventHandle器
    if (onMessage) {
      websocketService.subscribe(subscriptionId, filter, onMessage);
    }

    return () => {
      // 清理訂閱
      dispatch(removeSubscription(subscriptionId));
      websocketService.unsubscribe(subscriptionId);
    };
  }, [dispatch, subscriptionId, filter, onMessage]);

  // Filter符合訂閱Condition的Message
  const _filteredMessages = messages.filter(message => {
    if (filter.userId && message.userId !== filter.userId) {
      return false;
    }
    if (filter.messageTypes && !filter.messageTypes.includes(message.type)) {
      return false;
    }
    if (
      filter.priority &&
      message.priority &&
      !filter.priority.includes(message.priority)
    ) {
      return false;
    }
    return true;
  });

  return {
    messages: filteredMessages,
    subscription: subscriptions[subscriptionId as keyof typeof subscriptions],
  };
};

// 專門用於房間Manage的 Hook
export const _useWebSocketRoom = (roomId: string) => {
  const _dispatch = useDispatch<AppDispatch>();
  const { currentRooms, loading } = useSelector(
    (state: RootState) => state.websocket
  );

  const _isInRoom = currentRooms.includes(roomId);
  const _isJoining = loading.joiningRoom;
  const _isLeaving = loading.leavingRoom;

  const _join = useCallback(
    async (userInfo: unknown) => {
      try {
        await dispatch(joinRoom({ roomId, userInfo })).unwrap();
      } catch (error: unknown) {
        throw error;
      }
    },
    [dispatch, roomId]
  );

  const _leave = useCallback(async () => {
    try {
      await dispatch(leaveRoom(roomId)).unwrap();
    } catch (error: unknown) {
      throw error;
    }
  }, [dispatch, roomId]);

  return {
    roomId,
    isInRoom,
    isJoining,
    isLeaving,
    join,
    leave,
  };
};
