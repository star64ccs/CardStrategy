/**
 * WebSocket 示例組件
 * 展示 WebSocket 功能的使用方法
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useWebSocket,
  useWebSocketRoom,
  useWebSocketSubscription,
} from '../hooks/useWebSocket';
import type { WebSocketMessage } from '../types/websocket';

const WebSocketExample: React.FC = () => {
  const [messageText, setMessageText] = useState('');
  const [roomId, setRoomId] = useState('general');
  const [userId, setUserId] = useState('user123');

  const {
    isInitialized,
    status,
    isConnected,
    isConnecting,
    hasError,
    error,
    messages,
    lastMessage,
    unreadCount,
    notifications,
    stats,
    loading,
    initialize,
    connect,
    disconnect,
    sendMessage,
    broadcast,
    reconnect,
    clearMessages,
    clearNotifications,
    clearError,
  } = useWebSocket();

  // 訂閱特定類型的消息
  const { messages: cardMessages } = useWebSocketSubscription(
    'card-updates',
    {
      messageTypes: ['card_update'],
      priority: ['high', 'urgent'],
    },
    message => {
      console.log('收到卡片更新:', message);
    }
  );

  // 房間管理
  const { isInRoom, isJoining, isLeaving, join, leave } =
    useWebSocketRoom(roomId);

  useEffect(() => {
    // 組件掛載時初始化 WebSocket
    initialize({
      url: 'ws://localhost:8080/ws',
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
    });
  }, [initialize]);

  useEffect(() => {
    // 監聽連接狀態變化
    if (isConnected) {
      console.log('WebSocket 已連接');
    } else if (hasError) {
      console.log('WebSocket 錯誤:', error);
    }
  }, [isConnected, hasError, error]);

  const _handleConnect = async () => {
    try {
      await connect();
      Alert.alert('成功', 'WebSocket 連接成功');
    } catch (error: unknown) {
      Alert.alert('錯誤', `連接失敗: ${error.message}`);
    }
  };

  const _handleDisconnect = async () => {
    try {
      await disconnect();
      Alert.alert('成功', 'WebSocket 已斷開連接');
    } catch (error: unknown) {
      Alert.alert('錯誤', `斷開連接失敗: ${error.message}`);
    }
  };

  const _handleSendMessage = async () => {
    if (!messageText.trim()) {
      Alert.alert('錯誤', '請輸入消息內容');
      return;
    }

    try {
      const message: Partial<WebSocketMessage> = {
        type: 'system_message',
        data: {
          content: messageText,
          sender: userId,
          timestamp: new Date().toISOString(),
        },
        userId,
        priority: 'normal',
      };

      await sendMessage(message);
      setMessageText('');
      Alert.alert('成功', '消息發送成功');
    } catch (error: unknown) {
      Alert.alert('錯誤', `發送消息失敗: ${error.message}`);
    }
  };

  const _handleBroadcast = async () => {
    if (!messageText.trim()) {
      Alert.alert('錯誤', '請輸入廣播消息內容');
      return;
    }

    try {
      const message: Partial<WebSocketMessage> = {
        type: 'notification',
        data: {
          content: messageText,
          sender: userId,
          timestamp: new Date().toISOString(),
        },
        userId,
        priority: 'high',
      };

      await broadcast(message, {
        room: roomId,
        priority: 'high',
      });

      setMessageText('');
      Alert.alert('成功', '廣播消息發送成功');
    } catch (error: unknown) {
      Alert.alert('錯誤', `廣播消息失敗: ${error.message}`);
    }
  };

  const _handleJoinRoom = async () => {
    try {
      await join({
        userId,
        status: 'online',
        device: 'mobile',
      });
      Alert.alert('成功', `已加入房間: ${roomId}`);
    } catch (error: unknown) {
      Alert.alert('錯誤', `加入房間失敗: ${error.message}`);
    }
  };

  const _handleLeaveRoom = async () => {
    try {
      await leave();
      Alert.alert('成功', `已離開房間: ${roomId}`);
    } catch (error: unknown) {
      Alert.alert('錯誤', `離開房間失敗: ${error.message}`);
    }
  };

  const _handleReconnect = async () => {
    try {
      await reconnect();
      Alert.alert('成功', '重新連接成功');
    } catch (error: unknown) {
      Alert.alert('錯誤', `重新連接失敗: ${error.message}`);
    }
  };

  const _getStatusColor = () => {
    switch (status) {
      case 'connected':
        return '#4CAF50';
      case 'connecting':
      case 'reconnecting':
        return '#FF9800';
      case 'disconnected':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const _getStatusText = () => {
    switch (status) {
      case 'connected':
        return '已連接';
      case 'connecting':
        return '連接中...';
      case 'reconnecting':
        return '重新連接中...';
      case 'disconnected':
        return '已斷開';
      default:
        return '未知狀態';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WebSocket 示例</Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor() },
            ]}
          />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      {/* 連接控制 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>連接控制</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.connectButton]}
            onPress={handleConnect}
            disabled={isConnecting || isConnected}
          >
            {loading.connecting ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>連接</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.disconnectButton]}
            onPress={handleDisconnect}
            disabled={!isConnected || loading.disconnecting}
          >
            {loading.disconnecting ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>斷開</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.reconnectButton]}
            onPress={handleReconnect}
            disabled={isConnected || loading.reconnecting}
          >
            {loading.reconnecting ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>重連</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 房間管理 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>房間管理</Text>
        <TextInput
          style={styles.input}
          placeholder='房間ID'
          value={roomId}
          onChangeText={setRoomId}
        />
        <TextInput
          style={styles.input}
          placeholder='用戶ID'
          value={userId}
          onChangeText={setUserId}
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button,
              isInRoom ? styles.leaveButton : styles.joinButton,
            ]}
            onPress={isInRoom ? handleLeaveRoom : handleJoinRoom}
            disabled={isJoining || isLeaving}
          >
            {isJoining || isLeaving ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>
                {isInRoom ? '離開房間' : '加入房間'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 消息發送 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>消息發送</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder='輸入消息內容'
          value={messageText}
          onChangeText={setMessageText}
          multiline
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.sendButton]}
            onPress={handleSendMessage}
            disabled={!isConnected || loading.sendingMessage}
          >
            {loading.sendingMessage ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>發送</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.broadcastButton]}
            onPress={handleBroadcast}
            disabled={!isConnected || loading.broadcasting}
          >
            {loading.broadcasting ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>廣播</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 統計信息 */}
      {stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>統計信息</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              運行時間: {Math.floor(stats.uptime / 1000)}s
            </Text>
            <Text style={styles.statsText}>
              總連接數: {stats.totalConnections}
            </Text>
            <Text style={styles.statsText}>
              總消息數: {stats.totalMessagesSent}
            </Text>
            <Text style={styles.statsText}>
              錯誤率: {stats.errorRate.toFixed(2)}%
            </Text>
            <Text style={styles.statsText}>
              可靠性: {stats.reliability.toFixed(2)}%
            </Text>
            <Text style={styles.statsText}>
              平均延遲: {stats.averageLatency.toFixed(0)}ms
            </Text>
          </View>
        </View>
      )}

      {/* 消息列表 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>消息列表</Text>
          <View style={styles.messageControls}>
            <Text style={styles.messageCount}>共 {messages.length} 條</Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearMessages}
            >
              <Text style={styles.clearButtonText}>清空</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={styles.messageList} nestedScrollEnabled>
          {messages
            .slice(-10)
            .reverse()
            .map((message, index) => (
              <View key={`${message.id}-${index}`} style={styles.messageItem}>
                <View style={styles.messageHeader}>
                  <Text style={styles.messageType}>{message.type}</Text>
                  <Text style={styles.messageTime}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                <Text style={styles.messageContent}>
                  {JSON.stringify(message.data, null, 2)}
                </Text>
              </View>
            ))}
        </ScrollView>
      </View>

      {/* 通知列表 */}
      {notifications.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>通知</Text>
            <View style={styles.messageControls}>
              <Text style={styles.messageCount}>
                共 {notifications.length} 條
              </Text>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearNotifications}
              >
                <Text style={styles.clearButtonText}>清空</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView style={styles.messageList} nestedScrollEnabled>
            {notifications
              .slice(-5)
              .reverse()
              .map((notification, index) => (
                <View
                  key={`notification-${index}`}
                  style={styles.notificationItem}
                >
                  <Text style={styles.notificationPriority}>
                    {notification.priority}
                  </Text>
                  <Text style={styles.notificationContent}>
                    {JSON.stringify(notification.data, null, 2)}
                  </Text>
                </View>
              ))}
          </ScrollView>
        </View>
      )}

      {/* 錯誤信息 */}
      {hasError && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>錯誤信息</Text>
            <TouchableOpacity style={styles.clearButton} onPress={clearError}>
              <Text style={styles.clearButtonText}>清除</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  connectButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
  },
  reconnectButton: {
    backgroundColor: '#FF9800',
  },
  joinButton: {
    backgroundColor: '#2196F3',
  },
  leaveButton: {
    backgroundColor: '#9C27B0',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
  },
  broadcastButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  messageInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  statsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  messageControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  messageCount: {
    fontSize: 14,
    color: '#666',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#666',
  },
  messageList: {
    maxHeight: 200,
  },
  messageItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  messageType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  messageContent: {
    fontSize: 14,
    color: '#333',
  },
  notificationItem: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  notificationPriority: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  notificationContent: {
    fontSize: 14,
    color: '#856404',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  errorText: {
    fontSize: 14,
    color: '#721c24',
  },
});

export default WebSocketExample;
