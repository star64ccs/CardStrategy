import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { theme } from '@/config/theme';
import { Card } from '@/types';
import { aiRecognitionService } from '@/services/aiRecognitionService';
import { logger } from '@/utils/logger';

interface RecognitionHistoryItem {
  card: Card;
  confidence: number;
  timestamp: string;
  processingTime: number;
}

export const CardRecognitionHistoryScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recognitionStats, setRecognitionStats] = useState<any>(null);

  // 從 Redux store 獲取識別歷史
  const recognitionHistory = useSelector((state: any) => state.cards.recognitionHistory || []);

  useEffect(() => {
    loadRecognitionStats();
  }, []);

  const loadRecognitionStats = async () => {
    try {
      setIsLoading(true);
      const stats = await aiRecognitionService.getRecognitionStats();
      setRecognitionStats(stats);
    } catch (error) {
      logger.error('載入識別統計失敗:', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRecognitionStats();
    setIsRefreshing(false);
  };

  const handleCardPress = (item: RecognitionHistoryItem) => {
    // 導航到卡片詳情頁面
    logger.info('查看識別歷史卡片:', { cardName: item.card.name });
  };

  const handleClearHistory = () => {
    Alert.alert(
      '清除歷史記錄',
      '確定要清除所有識別歷史記錄嗎？此操作無法撤銷。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: async () => {
            try {
              // 清除本地歷史記錄
              setRecognitionHistory([]);

              // 清除本地存儲
              const AsyncStorage = require('@react-native-async-storage/async-storage');
              await AsyncStorage.removeItem('recognition_history');

              // 重置統計數據
              setRecognitionStats(null);
              await AsyncStorage.removeItem('recognition_stats');

              logger.info('識別歷史記錄已清除');

              // 顯示成功提示
              Alert.alert('成功', '歷史記錄已清除');
            } catch (error) {
              logger.error('清除歷史記錄失敗:', { error });
              Alert.alert('錯誤', '清除失敗，請重試');
            }
          }
        }
      ]
    );
  };

  const renderStats = () => {
    if (!recognitionStats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>識別統計</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{recognitionStats.totalRecognitions}</Text>
            <Text style={styles.statLabel}>總識別次數</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(recognitionStats.averageConfidence * 100)}%
            </Text>
            <Text style={styles.statLabel}>平均信心度</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(recognitionStats.successRate * 100)}%
            </Text>
            <Text style={styles.statLabel}>成功率</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(recognitionStats.processingTimes.average)}ms
            </Text>
            <Text style={styles.statLabel}>平均處理時間</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHistoryItem = ({ item }: { item: RecognitionHistoryItem }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleCardPress(item)}
    >
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.card.name}</Text>
        <Text style={styles.cardSet}>{item.card.setName}</Text>
        <Text style={styles.cardRarity}>{item.card.rarity}</Text>
      </View>

      <View style={styles.recognitionInfo}>
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>信心度</Text>
          <Text style={styles.confidenceValue}>
            {Math.round(item.confidence * 100)}%
          </Text>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>處理時間</Text>
          <Text style={styles.timeValue}>{item.processingTime}ms</Text>
        </View>

        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleString('zh-TW')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>尚無識別記錄</Text>
      <Text style={styles.emptyText}>
        開始掃描卡片來建立您的識別歷史記錄
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundLight }]}>
      <View style={styles.header}>
        <Text style={styles.title}>識別歷史</Text>
        {recognitionHistory.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory}>
            <Text style={styles.clearButtonText}>清除</Text>
          </TouchableOpacity>
        )}
      </View>

      {renderStats()}

      <FlatList
        data={recognitionHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item, index) => `${item.card.id}-${index}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary
  },
  clearButton: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.small
  },
  clearButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold'
  },
  statsContainer: {
    padding: theme.spacing.large,
    backgroundColor: theme.colors.backgroundPaper,
    margin: theme.spacing.large,
    borderRadius: theme.borderRadius.medium
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.medium
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: theme.spacing.medium
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.small
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center'
  },
  listContainer: {
    padding: theme.spacing.large
  },
  historyItem: {
    backgroundColor: theme.colors.backgroundPaper,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.large,
    marginBottom: theme.spacing.medium,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  cardInfo: {
    flex: 1
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.small
  },
  cardSet: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.small
  },
  cardRarity: {
    fontSize: 12,
    color: theme.colors.textSecondary
  },
  recognitionInfo: {
    alignItems: 'flex-end'
  },
  confidenceContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.small
  },
  confidenceLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.small
  },
  timeLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2
  },
  timeValue: {
    fontSize: 14,
    color: theme.colors.textSecondary
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.extraLarge
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.medium
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.large
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default CardRecognitionHistoryScreen;
