import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { useChat } from '../hooks/useChat';
import { ChatCategory, UserIntent } from '../types/chat';

import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';

interface ChatInterfaceProps {
  userId: string;
  initialCategory?: ChatCategory;
  onBack?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  userId,
  initialCategory = ChatCategory.GENERAL,
  onBack,
}) => {
  const {
    currentSession,
    messages,
    loading,
    error,
    isTyping,
    hasCurrentSession,
    hasMessages,
    initialize,
    createNewSession,
    sendChatMessage,
    loadSessionHistory,
    clearChatError,
    handleQuickReply,
    handleSuggestedAction,
  } = useChat();

  const [isInitialized, setIsInitialized] = useState(false);
  const _flatListRef = useRef<FlatList>(null);

  // 初始化聊天
  useEffect(() => {
    const _initChat = async () => {
      try {
        await initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('初始化聊天失敗:', error);
        Alert.alert('錯誤', '初始化聊天服務失敗');
      }
    };

    initChat();
  }, [initialize]);

  // 創建或載入會話
  useEffect(() => {
    if (isInitialized && !hasCurrentSession) {
      const _createSession = async () => {
        try {
          await createNewSession(userId, initialCategory);
        } catch (error) {
          console.error('創建會話失敗:', error);
          Alert.alert('錯誤', '創建聊天會話失敗');
        }
      };

      createSession();
    }
  }, [
    isInitialized,
    hasCurrentSession,
    createNewSession,
    userId,
    initialCategory,
  ]);

  // 自動滾動到底部
  useEffect(() => {
    if (hasMessages && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, hasMessages]);

  // 處理發送消息
  const _handleSendMessage = async (message: string) => {
    if (!currentSession) {
      Alert.alert('錯誤', '沒有活躍的聊天會話');
      return;
    }

    try {
      await sendChatMessage(
        currentSession.id,
        message,
        userId,
        currentSession.category
      );
    } catch (error) {
      console.error('發送消息失敗:', error);
      Alert.alert('錯誤', '發送消息失敗，請重試');
    }
  };

  // 處理快速回覆
  const _handleQuickReplyPress = async (reply: string) => {
    try {
      await handleQuickReply(reply);
    } catch (error) {
      console.error('快速回覆失敗:', error);
      Alert.alert('錯誤', '快速回覆失敗');
    }
  };

  // 處理建議操作
  const _handleSuggestedActionPress = async (action: string) => {
    try {
      await handleSuggestedAction(action);
    } catch (error) {
      console.error('建議操作失敗:', error);
      Alert.alert('錯誤', '建議操作失敗');
    }
  };

  // 渲染消息項目
  const _renderMessage = ({ item }: { item: unknown }) => (
    <ChatMessage
      message={item}
      onQuickReply={handleQuickReplyPress}
      onSuggestedAction={handleSuggestedActionPress}
    />
  );

  // 渲染空狀態
  const _renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name='chatbubbles-outline' size={64} color='#8E8E93' />
      <Text style={styles.emptyStateTitle}>開始聊天</Text>
      <Text style={styles.emptyStateSubtitle}>
        我是 CardStrategy 的 AI
        助手，可以幫助您進行卡牌投資諮詢、市場分析、卡牌鑑定等服務。
      </Text>
    </View>
  );

  // 渲染載入狀態
  const _renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size='large' color='#007AFF' />
      <Text style={styles.loadingText}>正在初始化聊天...</Text>
    </View>
  );

  // 渲染錯誤狀態
  const _renderErrorState = () => (
    <View style={styles.errorState}>
      <Ionicons name='alert-circle-outline' size={64} color='#FF3B30' />
      <Text style={styles.errorTitle}>連接錯誤</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => clearChatError()}
      >
        <Text style={styles.retryButtonText}>重試</Text>
      </TouchableOpacity>
    </View>
  );

  // 渲染打字指示器
  const _renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingIndicator}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>AI 正在輸入...</Text>
        </View>
      </View>
    );
  };

  if (!isInitialized) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 標題欄 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name='arrow-back' size={24} color='#007AFF' />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {currentSession?.title || 'AI 助手'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {currentSession?.category || '一般諮詢'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => Alert.alert('功能', '更多選項開發中')}
        >
          <Ionicons name='ellipsis-vertical' size={24} color='#007AFF' />
        </TouchableOpacity>
      </View>

      {/* 消息列表 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderTypingIndicator}
        onEndReachedThreshold={0.1}
      />

      {/* 輸入框 */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={loading || !hasCurrentSession}
        placeholder='輸入您的問題...'
      />
    </SafeAreaView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  menuButton: {
    padding: 4,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingBubble: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    maxWidth: '60%',
  },
  typingText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});
