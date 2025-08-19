import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { aiService, ChatBotResponse } from '../../services/aiService';
import { logger } from '../../utils/logger';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

interface AIChatBotProps {
  onClose?: () => void;
  initialMessage?: string;
}

const AIChatBot: React.FC<AIChatBotProps> = ({ onClose, initialMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<Record<string, any>>({});
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // 添加歡迎消息
    if (initialMessage) {
      setInputText(initialMessage);
    } else {
      addMessage('assistant', '您好！我是卡策AI助手，可以幫助您分析卡牌、投資建議和市場趨勢。請問有什麼我可以幫助您的嗎？');
    }
  }, [initialMessage]);

  const addMessage = (role: 'user' | 'assistant', content: string, loading = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      loading
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');

    // 添加用戶消息
    addMessage('user', userMessage);

    // 添加加載中的助手消息
    const loadingMessageId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: loadingMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true
    }]);

    setIsLoading(true);

    try {
      // 發送消息到AI服務
      const response: ChatBotResponse = await aiService.chatBot(userMessage, context);

      // 更新上下文
      setContext(response.context);

      // 移除加載消息並添加AI回應
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessageId);
        return [...filtered, {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.reply,
          timestamp: new Date()
        }];
      });

      // 滾動到底部
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      logger.error('發送消息失敗:', error);

      // 移除加載消息並添加錯誤消息
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessageId);
        return [...filtered, {
          id: Date.now().toString(),
          role: 'assistant',
          content: '抱歉，我遇到了一些問題。請稍後再試。',
          timestamp: new Date()
        }];
      });

      Alert.alert('錯誤', '發送消息失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    Alert.alert(
      '清除聊天記錄',
      '確定要清除所有聊天記錄嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          style: 'destructive',
          onPress: () => {
            setMessages([]);
            setContext({});
            addMessage('assistant', '聊天記錄已清除。有什麼我可以幫助您的嗎？');
          }
        }
      ]
    );
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';

    return (
      <View key={message.id} style={[styles.messageContainer, isUser ? styles.userMessage : styles.assistantMessage]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          {message.loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#666" />
              <Text style={styles.loadingText}>正在思考...</Text>
            </View>
          ) : (
            <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
              {message.content}
            </Text>
          )}
        </View>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  const renderQuickActions = () => {
    const quickActions = [
      { text: '分析卡牌', icon: 'analytics' },
      { text: '市場趨勢', icon: 'trending-up' },
      { text: '投資建議', icon: 'lightbulb' },
      { text: '價格預測', icon: 'show-chart' }
    ];

    return (
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>快速操作</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionButton}
              onPress={() => setInputText(action.text)}
            >
              <MaterialIcons name={action.icon as any} size={16} color="#2196F3" />
              <Text style={styles.quickActionText}>{action.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 標題欄 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="robot" size={24} color="#2196F3" />
          <Text style={styles.headerTitle}>AI助手</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={clearChat}>
            <MaterialIcons name="clear" size={20} color="#666" />
          </TouchableOpacity>
          {onClose && (
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <MaterialIcons name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 快速操作 */}
      {messages.length <= 1 && renderQuickActions()}

      {/* 消息列表 */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {/* 輸入區域 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="輸入您的問題..."
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialIcons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerButton: {
    padding: 8,
    marginLeft: 8
  },
  quickActionsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8
  },
  quickActionText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 4
  },
  messagesContainer: {
    flex: 1
  },
  messagesContent: {
    padding: 16
  },
  messageContainer: {
    marginBottom: 16
  },
  userMessage: {
    alignItems: 'flex-end'
  },
  assistantMessage: {
    alignItems: 'flex-start'
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16
  },
  userBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4
  },
  assistantBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20
  },
  userText: {
    color: '#fff'
  },
  assistantText: {
    color: '#333'
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'center'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 14,
    maxHeight: 100,
    minHeight: 40
  },
  sendButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc'
  }
});

export default AIChatBot;
