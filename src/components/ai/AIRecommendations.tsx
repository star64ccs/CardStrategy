import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { aiService, CardRecommendation, PortfolioRecommendation } from '../../services/aiService';
import { logger } from '../../utils/logger';

interface AIRecommendationsProps {
  userId: string;
  onCardPress?: (cardId: string) => void;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ userId, onCardPress }) => {
  const [cardRecommendations, setCardRecommendations] = useState<CardRecommendation[]>([]);
  const [portfolioRecommendations, setPortfolioRecommendations] = useState<PortfolioRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'cards' | 'portfolio'>('cards');

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  const loadRecommendations = async (refresh = false) => {
    try {
      setLoading(true);

      const [cardRecs, portfolioRecs] = await Promise.all([
        aiService.recommendCards(userId, { limit: 10 }),
        aiService.optimizePortfolio(userId, { riskTolerance: 'medium' })
      ]);

      setCardRecommendations(cardRecs);
      setPortfolioRecommendations(portfolioRecs);
    } catch (error) {
      logger.error('加載推薦失敗:', error);
      Alert.alert('錯誤', '加載推薦失敗，請重試');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRecommendations(true);
  };

  const renderCardRecommendation = (recommendation: CardRecommendation) => (
    <TouchableOpacity
      key={recommendation.cardId}
      style={styles.recommendationCard}
      onPress={() => onCardPress?.(recommendation.cardId)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{recommendation.name}</Text>
        <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(recommendation.confidence) }]}>
          <Text style={styles.confidenceText}>{Math.round(recommendation.confidence * 100)}%</Text>
        </View>
      </View>

      <Text style={styles.reasonText}>{recommendation.reason}</Text>

      {recommendation.price && (
        <View style={styles.priceContainer}>
          <MaterialIcons name="attach-money" size={16} color="#4CAF50" />
          <Text style={styles.priceText}>${recommendation.price.toFixed(2)}</Text>
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="visibility" size={16} color="#2196F3" />
          <Text style={styles.actionText}>查看詳情</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="favorite-border" size={16} color="#FF5722" />
          <Text style={styles.actionText}>收藏</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderPortfolioRecommendation = (recommendation: PortfolioRecommendation) => (
    <View key={recommendation.cardId} style={styles.recommendationCard}>
      <View style={styles.cardHeader}>
        <View style={styles.actionTypeContainer}>
          <MaterialIcons
            name={getActionIcon(recommendation.type)}
            size={20}
            color={getActionColor(recommendation.type)}
          />
          <Text style={[styles.actionTypeText, { color: getActionColor(recommendation.type) }]}>
            {getActionText(recommendation.type)}
          </Text>
        </View>
        <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(recommendation.confidence) }]}>
          <Text style={styles.confidenceText}>{Math.round(recommendation.confidence * 100)}%</Text>
        </View>
      </View>

      <Text style={styles.cardName}>{recommendation.cardId}</Text>
      <Text style={styles.reasonText}>{recommendation.reason}</Text>

      {recommendation.expectedReturn && (
        <View style={styles.returnContainer}>
          <MaterialIcons name="trending-up" size={16} color="#4CAF50" />
          <Text style={styles.returnText}>預期收益: {recommendation.expectedReturn.toFixed(2)}%</Text>
        </View>
      )}

      {recommendation.risk && (
        <View style={styles.riskContainer}>
          <MaterialIcons name="warning" size={16} color="#FF9800" />
          <Text style={styles.riskText}>風險: {recommendation.risk}</Text>
        </View>
      )}
    </View>
  );

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FF9800';
    return '#F44336';
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'buy': return 'add-shopping-cart';
      case 'sell': return 'remove-shopping-cart';
      case 'hold': return 'pause';
      default: return 'help';
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'buy': return '#4CAF50';
      case 'sell': return '#F44336';
      case 'hold': return '#FF9800';
      default: return '#666';
    }
  };

  const getActionText = (type: string) => {
    switch (type) {
      case 'buy': return '買入';
      case 'sell': return '賣出';
      case 'hold': return '持有';
      default: return '未知';
    }
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'cards' && styles.activeTab]}
        onPress={() => setActiveTab('cards')}
      >
        <MaterialIcons name="card-giftcard" size={20} color={activeTab === 'cards' ? '#2196F3' : '#666'} />
        <Text style={[styles.tabText, activeTab === 'cards' && styles.activeTabText]}>
          卡片推薦 ({cardRecommendations.length})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'portfolio' && styles.activeTab]}
        onPress={() => setActiveTab('portfolio')}
      >
        <MaterialIcons name="account-balance-wallet" size={20} color={activeTab === 'portfolio' ? '#2196F3' : '#666'} />
        <Text style={[styles.tabText, activeTab === 'portfolio' && styles.activeTabText]}>
          投資組合 ({portfolioRecommendations.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>正在生成AI推薦...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 標題欄 */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="lightbulb" size={24} color="#FFC107" />
        <Text style={styles.headerTitle}>AI智能推薦</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <MaterialIcons name="refresh" size={20} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* 標籤頁 */}
      {renderTabs()}

      {/* 內容區域 */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'cards' ? (
          <View>
            {cardRecommendations.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="card-giftcard" size={48} color="#ccc" />
                <Text style={styles.emptyTitle}>暫無卡片推薦</Text>
                <Text style={styles.emptyMessage}>AI正在分析您的偏好，稍後會為您推薦合適的卡片</Text>
              </View>
            ) : (
              cardRecommendations.map(renderCardRecommendation)
            )}
          </View>
        ) : (
          <View>
            {portfolioRecommendations.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="account-balance-wallet" size={48} color="#ccc" />
                <Text style={styles.emptyTitle}>暫無投資組合建議</Text>
                <Text style={styles.emptyMessage}>AI正在分析您的投資組合，稍後會為您提供優化建議</Text>
              </View>
            ) : (
              portfolioRecommendations.map(renderPortfolioRecommendation)
            )}
          </View>
        )}
      </ScrollView>
    </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333'
  },
  refreshButton: {
    padding: 8
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3'
  },
  tabText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666'
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8
  },
  emptyMessage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff'
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 4
  },
  returnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  returnText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 4
  },
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  riskText: {
    fontSize: 14,
    color: '#FF9800',
    marginLeft: 4
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4
  },
  actionTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionTypeText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4
  }
});

export default AIRecommendations;
