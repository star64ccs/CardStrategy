import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import type { ChatMessage as ChatMessageType } from '../types/chat';
import { MessageType, ResponseType } from '../types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
  onQuickReply?: (reply: string) => void;
  onSuggestedAction?: (action: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onQuickReply,
  onSuggestedAction,
}) => {
  const _isUser = message.type === MessageType.USER;
  const _isAI = message.type === MessageType.ASSISTANT;

  const _formatTime = (timestamp: string) => {
    const _date = new Date(timestamp);
    return date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const _renderContent = () => {
    switch (message.responseType) {
      case ResponseType.RICH_TEXT:
        return (
          <View style={styles.richContent}>
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userText : styles.aiText,
              ]}
            >
              {message.content}
            </Text>
            {message.metadata?.suggestedActions && (
              <View style={styles.suggestedActions}>
                {message.metadata.suggestedActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.actionButton}
                    onPress={() => onSuggestedAction?.(action)}
                  >
                    <Text style={styles.actionText}>{action}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );

      case ResponseType.CARD:
        return (
          <View style={styles.cardContent}>
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userText : styles.aiText,
              ]}
            >
              {message.content}
            </Text>
            {message.metadata?.cardId && (
              <View style={styles.cardInfo}>
                <Text style={styles.cardId}>
                  卡牌 ID: {message.metadata.cardId}
                </Text>
                {message.metadata.price && (
                  <Text style={styles.cardPrice}>
                    價格: ${message.metadata.price}
                  </Text>
                )}
              </View>
            )}
          </View>
        );

      case ResponseType.LIST:
        return (
          <View style={styles.listContent}>
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userText : styles.aiText,
              ]}
            >
              {message.content}
            </Text>
            {message.metadata?.suggestedActions && (
              <View style={styles.listItems}>
                {message.metadata.suggestedActions.map((item, index) => (
                  <Text key={index} style={styles.listItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            )}
          </View>
        );

      default:
        return (
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.aiText,
            ]}
          >
            {message.content}
          </Text>
        );
    }
  };

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.aiContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        {renderContent()}
        <Text
          style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.aiTimestamp,
          ]}
        >
          {formatTime(message.timestamp)}
        </Text>
      </View>

      {isAI && message.metadata?.quickReplies && (
        <View style={styles.quickReplies}>
          {message.metadata.quickReplies.map((reply: string, index: number) => (
            <TouchableOpacity
              key={index}
              style={styles.quickReplyButton}
              onPress={() => onQuickReply?.(reply)}
            >
              <Text style={styles.quickReplyText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#F2F2F7',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#000000',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  userTimestamp: {
    color: '#FFFFFF',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#8E8E93',
  },
  richContent: {
    gap: 8,
  },
  suggestedActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  cardContent: {
    gap: 8,
  },
  cardInfo: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cardId: {
    fontSize: 14,
    color: '#8E8E93',
  },
  cardPrice: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  listContent: {
    gap: 8,
  },
  listItems: {
    marginTop: 8,
  },
  listItem: {
    fontSize: 14,
    color: '#8E8E93',
    marginVertical: 2,
  },
  quickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  quickReplyButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  quickReplyText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
