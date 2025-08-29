/**
 * WebSocket 自定義 Hook
 * 提供 WebSocket 連接管理和消息處理功能
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

  // 初始化 WebSocket
  const _initialize = useCallback(
    async (config?: Partial<WebSocketConfig>) => {
      try {
        await dispatch(initializeWebSocket(config)).unwrap();

        // 設置事件處理器
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

  // 連接 WebSocket
  const _connect = useCallback(async () => {
    try {
      await dispatch(connectWebSocket()).unwrap();
    } catch (error: unknown) {
      dispatch(setError(error.message));
      throw error;
    }
  }, [dispatch]);

  // 斷開 WebSocket 連接
  const _disconnect = useCallback(async () => {
    try {
      await dispatch(disconnectWebSocket()).unwrap();
    } catch (error: unknown) {
      dispatch(setError(error.message));
      throw error;
    }
  }, [dispatch]);

  // 發送消息
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

  // 廣播消息
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

  // 重新連接
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

  // 離開房間
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

  // 設置事件處理器
  const _setEventHandlers = useCallback((handlers: WebSocketEventHandlers) => {
    eventHandlersRef.current = { ...eventHandlersRef.current, ...handlers };
  }, []);

  // 添加訂閱
  const _subscribe = useCallback(
    (subscriptionId: string, filter: SubscriptionFilter) => {
      dispatch(addSubscription({ id: subscriptionId, filter }));
    },
    [dispatch]
  );

  // 取消訂閱
  const _unsubscribe = useCallback(
    (subscriptionId: string) => {
      dispatch(removeSubscription(subscriptionId));
    },
    [dispatch]
  );

  // 清空消息
  const _clearMessagesHandler = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  // 清空通知
  const _clearNotificationsHandler = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  // 設置可見性
  const _setVisibilityHandler = useCallback(
    (isVisible: boolean) => {
      dispatch(setVisibility(isVisible));
    },
    [dispatch]
  );

  // 清空錯誤
  const _clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 獲取統計信息
  const _getStats = useCallback((): WebSocketStats | null => {
    return websocketService.getStats();
  }, []);

  // 獲取連接狀態
  const _getConnectionState = useCallback((): ConnectionState => {
    return websocketService.getConnectionState();
  }, []);

  // 獲取配置
  const _getConfig = useCallback((): WebSocketConfig => {
    return websocketService.getConfig();
  }, []);

  // 更新配置
  const _updateConfig = useCallback((updates: Partial<WebSocketConfig>) => {
    websocketService.updateConfig(updates);
  }, []);

  // 檢查是否已連接
  const _isConnected = websocketState.status === 'connected';

  // 檢查是否正在連接
  const _isConnecting =
    websocketState.status === 'connecting' ||
    websocketState.status === 'reconnecting';

  // 檢查是否有錯誤
  const _hasError = !!websocketState.error;

  // 獲取最新消息
  const { lastMessage } = websocketState;

  // 獲取未讀消息數量
  const { unreadCount } = websocketState;

  // 獲取通知
  const { notifications } = websocketState;

  // 獲取當前房間
  const { currentRooms } = websocketState;

  // 獲取訂閱
  const { subscriptions } = websocketState;

  // 獲取載入狀態
  const { loading } = websocketState;

  // 獲取統計信息
  const { stats } = websocketState;

  return {
    // 狀態
    isInitialized: websocketState.isInitialized,
    status: websocketState.status,
    connectionState: websocketState.connectionState,
    config: websocketState.config,
    isConnected,
    isConnecting,
    hasError,
    error: websocketState.error,
    lastError: websocketState.lastError,

    // 消息
    messages: websocketState.messages,
    lastMessage,
    messageHistory: websocketState.messageHistory,
    unreadCount,
    notifications,

    // 房間和訂閱
    currentRooms,
    subscriptions,

    // 統計
    stats,

    // 載入狀態
    loading,

    // 方法
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

// 專門用於消息訂閱的 Hook
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
    // 添加訂閱
    dispatch(addSubscription({ id: subscriptionId, filter }));

    // 設置事件處理器
    if (onMessage) {
      websocketService.subscribe(subscriptionId, filter, onMessage);
    }

    return () => {
      // 清理訂閱
      dispatch(removeSubscription(subscriptionId));
      websocketService.unsubscribe(subscriptionId);
    };
  }, [dispatch, subscriptionId, filter, onMessage]);

  // 過濾符合訂閱條件的消息
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

// 專門用於房間管理的 Hook
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
