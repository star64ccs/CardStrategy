import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onTyping,
  placeholder = '輸入消息...',
  disabled = false,
  maxLength = 1000,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const _inputRef = useRef<TextInput>(null);

  const _handleTextChange = (text: string) => {
    setMessage(text);

    // Notification父Component打字Status
    if (onTyping) {
      const _typing = text.length > 0;
      if (typing !== isTyping) {
        setIsTyping(typing);
        onTyping(typing);
      }
    }
  };

  const _handleSend = () => {
    const _trimmedMessage = message.trim();

    if (!trimmedMessage) {
      Alert.alert('提示', '請輸入消息內容');
      return;
    }

    if (trimmedMessage.length > maxLength) {
      Alert.alert('提示', `消息長度不能超過 ${maxLength} 個字符`);
      return;
    }

    onSendMessage(trimmedMessage);
    setMessage('');
    setIsTyping(false);

    // Notification父ComponentStop打字
    if (onTyping) {
      onTyping(false);
    }

    // Re聚焦Input框
    inputRef.current?.focus();
  };

  const _handleKeyPress = (event: unknown) => {
    if (event.nativeEvent.key === 'Enter' && !event.nativeEvent.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const _canSend = message.trim().length > 0 && !disabled;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[styles.textInput, disabled && styles.disabledInput]}
          value={message}
          onChangeText={handleTextChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          placeholderTextColor='#8E8E93'
          multiline
          maxLength={maxLength}
          editable={!disabled}
          autoCapitalize='sentences'
          autoCorrect={true}
          returnKeyType='send'
          blurOnSubmit={false}
        />

        <View style={styles.buttonContainer}>
          {canSend && (
            <TouchableOpacity
              style={[styles.sendButton, disabled && styles.disabledButton]}
              onPress={handleSend}
              disabled={disabled}
            >
              <Ionicons name='send' size={20} color='#FFFFFF' />
            </TouchableOpacity>
          )}

          {!canSend && (
            <TouchableOpacity
              style={[styles.attachButton, disabled && styles.disabledButton]}
              onPress={() => Alert.alert('功能', '附件功能開發中')}
              disabled={disabled}
            >
              <Ionicons name='add-circle-outline' size={24} color='#007AFF' />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {message.length > 0 && (
        <View style={styles.characterCount}>
          <Text style={styles.characterCountText}>
            {message.length}/{maxLength}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const _styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    color: '#000000',
    paddingVertical: 4,
    paddingHorizontal: 0,
    textAlignVertical: 'top',
  },
  disabledInput: {
    color: '#8E8E93',
  },
  buttonContainer: {
    marginLeft: 8,
    justifyContent: 'flex-end',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  characterCountText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
