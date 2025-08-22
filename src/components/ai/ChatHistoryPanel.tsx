import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/config/theme';
import { AIChatMessage } from '@/types';

interface ChatHistoryPanelProps {
  visible: boolean;
  messages: AIChatMessage[];
  onClose: () => void;
  onLoadMessage: (message: AIChatMessage) => void;
  onClearHistory?: () => void;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
  messages: AIChatMessage[];
}

export const ChatHistoryPanel: React.FC<ChatHistoryPanelProps> = ({
  visible,
  messages,
  onClose,
  onLoadMessage,
  onClearHistory,
}) => {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // 將消息分組為會話
  const groupMessagesIntoSessions = (): ChatSession[] => {
    const sessions: ChatSession[] = [];
    let currentSession: ChatSession | null = null;
    let sessionMessages: AIChatMessage[] = [];

    messages.forEach((message, index) => {
      // 如果是第一條消息或者是用戶消息，開始新會話
      if (index === 0 || message.type === 'user') {
        if (currentSession) {
          sessions.push(currentSession);
        }

        const sessionId = `session_${index}`;
        const sessionTitle =
          message.type === 'user'
            ? message.content.substring(0, 30) +
              (message.content.length > 30 ? '...' : '')
            : `會話 ${sessions.length + 1}`;

        currentSession = {
          id: sessionId,
          title: sessionTitle,
          timestamp: message.timestamp,
          messageCount: 1,
          messages: [message],
        };
        sessionMessages = [message];
      } else {
        if (currentSession) {
          currentSession.messageCount++;
          currentSession.messages.push(message);
          sessionMessages.push(message);
        }
      }
    });

    if (currentSession) {
      sessions.push(currentSession);
    }

    return sessions.reverse(); // 最新的會話在前面
  };

  const sessions = groupMessagesIntoSessions();

  const handleSessionPress = (session: ChatSession) => {
    setSelectedSession(selectedSession === session.id ? null : session.id);
  };

  const handleLoadMessage = (message: AIChatMessage) => {
    onLoadMessage(message);
    setSelectedSession(null);
  };

  const handleClearHistory = () => {
    Alert.alert('清除聊天歷史', '確定要清除所有聊天歷史嗎？此操作無法撤銷。', [
      { text: '取消', style: 'cancel' },
      {
        text: '確定',
        style: 'destructive',
        onPress: () => {
          onClearHistory?.();
          setSelectedSession(null);
        },
      },
    ]);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) {
      return `${days}天前`;
    } else if (hours > 0) {
      return `${hours}小時前`;
    } else if (minutes > 0) {
      return `${minutes}分鐘前`;
    } else {
      return '剛剛';
    }
  };

  const renderSessionItem = (session: ChatSession) => (
    <View key={session.id} style={styles.sessionItem}>
      <TouchableOpacity
        style={styles.sessionHeader}
        onPress={() => handleSessionPress(session)}
        activeOpacity={0.7}
      >
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>{session.title}</Text>
          <Text style={styles.sessionMeta}>
            {session.messageCount} 條消息 • {formatTimestamp(session.timestamp)}
          </Text>
        </View>
        <MaterialIcons
          name={selectedSession === session.id ? 'expand-less' : 'expand-more'}
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      {selectedSession === session.id && (
        <View style={styles.sessionMessages}>
          {session.messages.map((message, index) => (
            <TouchableOpacity
              key={index}
              style={styles.messageItem}
              onPress={() => handleLoadMessage(message)}
              activeOpacity={0.7}
            >
              <View style={styles.messageHeader}>
                <MaterialIcons
                  name={message.type === 'user' ? 'person' : 'smart-toy'}
                  size={16}
                  color={
                    message.type === 'user'
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                  }
                />
                <Text style={styles.messageType}>
                  {message.type === 'user' ? '用戶' : 'AI助手'}
                </Text>
                <Text style={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString()}
                </Text>
              </View>
              <Text style={styles.messageContent} numberOfLines={2}>
                {message.content}
              </Text>
              {message.metadata?.analysisType && (
                <View style={styles.messageTag}>
                  <Text style={styles.messageTagText}>
                    {message.metadata.analysisType}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons
        name="history"
        size={48}
        color={theme.colors.textSecondary}
      />
      <Text style={styles.emptyStateTitle}>沒有聊天記錄</Text>
      <Text style={styles.emptyStateDescription}>
        開始與AI助手對話，您的聊天記錄將顯示在這裡
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialIcons
                name="history"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.headerTitle}>聊天歷史</Text>
            </View>
            <View style={styles.headerRight}>
              {sessions.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearHistory}
                >
                  <MaterialIcons
                    name="clear-all"
                    size={20}
                    color={theme.colors.error}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {sessions.length > 0
              ? sessions.map(renderSessionItem)
              : renderEmptyState()}
          </ScrollView>

          {sessions.length > 0 && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                共 {sessions.length} 個會話，{messages.length} 條消息
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    padding: 8,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sessionItem: {
    marginBottom: 16,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  sessionMeta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  sessionMessages: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: 16,
  },
  messageItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageType: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 6,
    marginRight: 'auto',
  },
  messageTime: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  messageContent: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },
  messageTag: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: 12,
  },
  messageTagText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
