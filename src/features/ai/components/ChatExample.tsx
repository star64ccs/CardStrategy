import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';

import { useChat } from '../hooks/useChat';
import { ChatCategory } from '../types/chat';

import { ChatInterface } from './ChatInterface';

export const ChatExample: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ChatCategory>(
    ChatCategory.GENERAL
  );
  const { stats, loadChatStats, clearChatError } = useChat();

  const _categories = [
    {
      key: ChatCategory.GENERAL,
      title: '一般諮詢',
      icon: 'chatbubbles-outline',
      color: '#007AFF',
    },
    {
      key: ChatCategory.INVESTMENT,
      title: '投資建議',
      icon: 'trending-up-outline',
      color: '#34C759',
    },
    {
      key: ChatCategory.CARD_APPRAISAL,
      title: '卡牌鑑定',
      icon: 'card-outline',
      color: '#FF9500',
    },
    {
      key: ChatCategory.MARKET_ANALYSIS,
      title: '市場分析',
      icon: 'analytics-outline',
      color: '#AF52DE',
    },
    {
      key: ChatCategory.TECHNICAL_SUPPORT,
      title: '技術支援',
      icon: 'help-circle-outline',
      color: '#FF3B30',
    },
    {
      key: ChatCategory.TRADING,
      title: '交易指導',
      icon: 'swap-horizontal-outline',
      color: '#5856D6',
    },
    {
      key: ChatCategory.COLLECTION,
      title: '收藏管理',
      icon: 'folder-outline',
      color: '#FF2D92',
    },
    {
      key: ChatCategory.SECURITY,
      title: '安全問題',
      icon: 'shield-checkmark-outline',
      color: '#30D158',
    },
  ];

  const _handleCategorySelect = (category: ChatCategory) => {
    setSelectedCategory(category);
    setShowChat(true);
  };

  const _handleBackFromChat = () => {
    setShowChat(false);
    loadChatStats(); // 重新載入統計數據
  };

  const _handleLoadStats = async () => {
    try {
      await loadChatStats();
      Alert.alert('成功', '統計數據已更新');
    } catch (error) {
      Alert.alert('錯誤', '載入統計數據失敗');
    }
  };

  if (showChat) {
    return (
      <ChatInterface
        userId='demo-user-001'
        initialCategory={selectedCategory}
        onBack={handleBackFromChat}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 標題 */}
        <View style={styles.header}>
          <Text style={styles.title}>AI 聊天助手</Text>
          <Text style={styles.subtitle}>智能客服與投資諮詢系統</Text>
        </View>

        {/* 統計概覽 */}
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>系統統計</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalSessions}</Text>
                <Text style={styles.statLabel}>總會話數</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.activeSessions}</Text>
                <Text style={styles.statLabel}>活躍會話</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalMessages}</Text>
                <Text style={styles.statLabel}>總消息數</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {Math.round(stats.averageResponseTime)}ms
                </Text>
                <Text style={styles.statLabel}>平均響應</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleLoadStats}
            >
              <Ionicons name='refresh-outline' size={20} color='#007AFF' />
              <Text style={styles.refreshButtonText}>刷新統計</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 聊天類別選擇 */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>選擇聊天類別</Text>
          <View style={styles.categoriesGrid}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.key}
                style={styles.categoryCard}
                onPress={() => handleCategorySelect(category.key)}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: category.color },
                  ]}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color='#FFFFFF'
                  />
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 功能說明 */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>功能特色</Text>

          <View style={styles.featureItem}>
            <Ionicons name='flash-outline' size={20} color='#007AFF' />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>快速響應</Text>
              <Text style={styles.featureDescription}>
                平均響應時間少於 2 秒
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name='bulb-outline' size={20} color='#007AFF' />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>智能理解</Text>
              <Text style={styles.featureDescription}>
                自動分析用戶意圖，提供精準回應
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name='options-outline' size={20} color='#007AFF' />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>多種回應</Text>
              <Text style={styles.featureDescription}>
                支持文字、卡片、列表等多種回應格式
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons
              name='shield-checkmark-outline'
              size={20}
              color='#007AFF'
            />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>安全可靠</Text>
              <Text style={styles.featureDescription}>
                企業級安全標準，保護用戶隱私
              </Text>
            </View>
          </View>
        </View>

        {/* 使用說明 */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.sectionTitle}>使用說明</Text>

          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1</Text>
            <Text style={styles.instructionText}>選擇您需要的聊天類別</Text>
          </View>

          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2</Text>
            <Text style={styles.instructionText}>輸入您的問題或需求</Text>
          </View>

          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3</Text>
            <Text style={styles.instructionText}>
              AI 助手會智能分析並提供專業建議
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>4</Text>
            <Text style={styles.instructionText}>
              使用快速回覆或建議操作快速互動
            </Text>
          </View>
        </View>

        {/* 開始聊天按鈕 */}
        <TouchableOpacity
          style={styles.startChatButton}
          onPress={() => handleCategorySelect(ChatCategory.GENERAL)}
        >
          <Ionicons name='chatbubbles' size={24} color='#FFFFFF' />
          <Text style={styles.startChatButtonText}>開始聊天</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
  },
  featuresContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  startChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startChatButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
