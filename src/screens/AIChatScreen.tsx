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
  Platform,
  Modal,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '@/config/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
  sendChatMessage, 
  clearChat, 
  addChatMessage,
  updateChatSettings 
} from '@/store/slices/aiSlice';
import { AIChatMessage } from '@/types';
import { EnhancedAIChatBot } from '@/components/ai/EnhancedAIChatBot';
import { ChatSettingsModal } from '@/components/ai/ChatSettingsModal';
import { QuickActionsPanel } from '@/components/ai/QuickActionsPanel';
import { ChatHistoryPanel } from '@/components/ai/ChatHistoryPanel';
import { VoiceInputButton } from '@/components/ai/VoiceInputButton';
import { ImagePickerButton } from '@/components/ai/ImagePickerButton';
import { TranslationToggle } from '@/components/ai/TranslationToggle';
import { EmotionIndicator } from '@/components/ai/EmotionIndicator';
import { logger } from '@/utils/logger';

const { width: screenWidth } = Dimensions.get('window');

export const AIChatScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    chatMessages, 
    isLoading, 
    error, 
    chatSettings,
    currentAnalysis,
    pricePrediction 
  } = useSelector((state: RootState) => state.ai);
  
  const [inputText, setInputText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // 添加歡迎消息
    if (chatMessages.length === 0) {
      const welcomeMessage: AIChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: '您好！我是卡策AI助手，您的智能卡片投資顧問。我可以幫助您：\n\n• 分析卡片價值和投資潛力\n• 提供市場趨勢和投資建議\n• 預測價格走勢\n• 回答卡片相關問題\n• 協助制定投資策略\n\n請告訴我您需要什麼幫助？',
        timestamp: new Date(),
        metadata: {
          analysisType: 'welcome',
          confidence: 1.0
        }
      };
      dispatch(addChatMessage(welcomeMessage));
    }
  }, []);

  useEffect(() => {
    // 自動滾動到底部
    if (chatMessages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const message = inputText.trim();
    setInputText('');

    try {
      await dispatch(sendChatMessage({
        content: message,
        imageUrl: selectedImage,
        translate: isTranslating,
        emotionAnalysis: true
      }));

      setSelectedImage(null);
    } catch (error) {
      logger.error('發送消息失敗:', error);
      Alert.alert('錯誤', '發送消息失敗，請重試');
    }
  };

  const handleVoiceInput = async (transcript: string) => {
    setInputText(transcript);
    inputRef.current?.focus();
  };

  const handleImageSelect = (imageUri: string) => {
    setSelectedImage(imageUri);
  };

  const handleQuickAction = (action: string) => {
    setInputText(action);
    setShowQuickActions(false);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    Alert.alert(
      '清除聊天記錄',
      '確定要清除所有聊天記錄嗎？此操作無法撤銷。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          style: 'destructive',
          onPress: () => dispatch(clearChat())
        }
      ]
    );
  };

  const handleSettingsUpdate = (settings: any) => {
    dispatch(updateChatSettings(settings));
    setShowSettings(false);
  };

  const renderMessage = (message: AIChatMessage) => {
    const isUser = message.type === 'user';

    return (
      <View key={message.id} style={[
        styles.messageContainer, 
        isUser ? styles.userMessage : styles.assistantMessage
      ]}>
        <View style={[
          styles.messageBubble, 
          isUser ? styles.userBubble : styles.assistantBubble
        ]}>
          {message.metadata?.imageUrl && (
            <Image 
              source={{ uri: message.metadata.imageUrl }} 
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}
          <Text style={[
            styles.messageText, 
            isUser ? styles.userText : styles.assistantText
          ]}>
            {message.content}
          </Text>
          {message.metadata?.confidence && (
            <View style={styles.confidenceIndicator}>
              <Text style={styles.confidenceText}>
                信心度: {Math.round(message.metadata.confidence * 100)}%
              </Text>
            </View>
          )}
        </View>
        <View style={styles.messageFooter}>
          <Text style={styles.timestamp}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </Text>
          {message.metadata?.emotion && (
            <EmotionIndicator emotion={message.metadata.emotion} />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 標題欄 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="robot" size={24} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>AI助手</Text>
          {isLoading && (
            <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loadingIndicator} />
          )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setShowHistory(true)}
          >
            <MaterialIcons name="history" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setShowQuickActions(true)}
          >
            <MaterialIcons name="flash-on" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setShowSettings(true)}
          >
            <MaterialIcons name="settings" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={handleClearChat}
          >
            <MaterialIcons name="clear" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 翻譯切換 */}
      <TranslationToggle 
        isEnabled={isTranslating}
        onToggle={setIsTranslating}
      />

      {/* 消息列表 */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {chatMessages.map(renderMessage)}
        {isLoading && (
          <View style={[styles.messageContainer, styles.assistantMessage]}>
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.loadingText}>正在思考...</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 選中的圖片預覽 */}
      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          <TouchableOpacity 
            style={styles.removeImageButton}
            onPress={() => setSelectedImage(null)}
          >
            <MaterialIcons name="close" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* 輸入區域 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <ImagePickerButton 
            onImageSelect={handleImageSelect}
            disabled={isLoading}
          />
          <VoiceInputButton 
            onTranscript={handleVoiceInput}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            disabled={isLoading}
          />
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="輸入您的問題..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            maxLength={2000}
            editable={!isLoading}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            style={[
              styles.sendButton, 
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
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

      {/* 模態框 */}
      <ChatSettingsModal
        visible={showSettings}
        settings={chatSettings}
        onClose={() => setShowSettings(false)}
        onUpdate={handleSettingsUpdate}
      />

      <QuickActionsPanel
        visible={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        onAction={handleQuickAction}
        currentAnalysis={currentAnalysis}
        pricePrediction={pricePrediction}
      />

      <ChatHistoryPanel
        visible={showHistory}
        messages={chatMessages}
        onClose={() => setShowHistory(false)}
        onLoadMessage={(message) => {
          setInputText(message.content);
          setShowHistory(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: theme.colors.textPrimary
  },
  loadingIndicator: {
    marginLeft: 8
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerButton: {
    padding: 8,
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
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4
  },
  assistantBubble: {
    backgroundColor: theme.colors.background,
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
    color: theme.colors.textPrimary
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8
  },
  confidenceIndicator: {
    marginTop: 4,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4
  },
  confidenceText: {
    fontSize: 10,
    color: theme.colors.textSecondary
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  timestamp: {
    fontSize: 10,
    color: theme.colors.textSecondary
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 8
  },
  imagePreviewContainer: {
    position: 'relative',
    margin: 16,
    marginBottom: 8
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputContainer: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: 16
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    fontSize: 14,
    maxHeight: 100,
    minHeight: 40,
    color: theme.colors.textPrimary
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.textSecondary
  }
});
