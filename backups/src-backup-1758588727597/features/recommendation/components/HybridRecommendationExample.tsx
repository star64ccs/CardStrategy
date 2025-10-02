import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useHybridRecommendation } from '../hooks/useHybridRecommendation';
import type {
  HybridRecommendation,
  HybridWeights,
} from '../types/hybridRecommendation';
import { HybridAlgorithm } from '../types/hybridRecommendation';

/**
 * 混合推薦示例組件
 * 展示混合推薦功能的使用
 */
export const HybridRecommendationExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'recommendations' | 'config' | 'stats' | 'interactions'
  >('recommendations');
  const [userId, setUserId] = useState('user123');
  const [limit, setLimit] = useState('20');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<HybridAlgorithm>(
    HybridAlgorithm.WEIGHTED_AVERAGE
  );
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<HybridRecommendation | null>(null);
  const [rating, setRating] = useState('5');

  const {
    // 狀態
    recommendations,
    config,
    stats,
    error,
    performance,
    loading,

    // 計算屬性
    hasRecommendations,
    averageScore,
    total,
    hasNextPage,
    hasPrevPage,
    totalPages,
    isReady,
    isLoading,

    // 操作方法
    recordClick,
    recordRating,
    fetchConfig,
    updateConfig,
    fetchStats,
    setFilters,
    setOptions,
    clearError,

    // 快速操作
    getRecommendationsForUser,
    clickRecommendation,
    rateRecommendation,
    setAlgorithm,
    setWeights,
    filterByCategory,
    sortByScore,
    enableDiversity,
    enableNovelty,
    nextPage,
    prevPage,
    refresh,
    clearFilters,
    clearOptions,
    reset,
  } = useHybridRecommendation();

  // 初始化
  useEffect(() => {
    fetchConfig();
    fetchStats();
  }, [fetchConfig, fetchStats]);

  // 處理獲取推薦
  const _handleGetRecommendations = () => {
    if (!userId.trim()) {
      Alert.alert('錯誤', '請輸入用戶ID');
      return;
    }

    const _limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      Alert.alert('錯誤', '數量限制必須在1-100之間');
      return;
    }

    getRecommendationsForUser(userId, limitNum);
  };

  // 處理記錄點擊
  const _handleRecordClick = (recommendation: HybridRecommendation) => {
    clickRecommendation(userId, recommendation);
    Alert.alert('成功', `已記錄點擊: ${recommendation.itemId}`);
  };

  // 處理記錄評分
  const _handleRecordRating = () => {
    if (!selectedRecommendation) {
      Alert.alert('錯誤', '請先選擇一個推薦');
      return;
    }

    const _ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      Alert.alert('錯誤', '評分必須在1-5之間');
      return;
    }

    rateRecommendation(userId, selectedRecommendation, ratingNum);
    Alert.alert('成功', `已記錄評分: ${ratingNum}星`);
    setSelectedRecommendation(null);
  };

  // 處理更新權重
  const _handleUpdateWeights = () => {
    const newWeights: Partial<HybridWeights> = {
      collaborative: 0.4,
      content: 0.3,
      popularity: 0.1,
      trending: 0.1,
      personalization: 0.05,
      contextual: 0.03,
      diversity: 0.01,
      novelty: 0.01,
    };

    setWeights(newWeights as HybridWeights);
    Alert.alert('成功', '已更新權重配置');
  };

  // 渲染推薦項目
  const _renderRecommendationItem = ({
    item,
  }: {
    item: HybridRecommendation;
  }) => (
    <View style={styles.recommendationItem}>
      <View style={styles.recommendationHeader}>
        <Text style={styles.itemId}>項目ID: {item.itemId}</Text>
        <Text style={styles.score}>分數: {item.score.toFixed(3)}</Text>
      </View>

      <View style={styles.recommendationDetails}>
        <Text style={styles.confidence}>
          置信度: {item.confidence.toFixed(3)}
        </Text>
        <Text style={styles.reason}>原因: {item.reason}</Text>
      </View>

      <View style={styles.factorsContainer}>
        <Text style={styles.factorsTitle}>因素:</Text>
        {item.factors.map((factor, index) => (
          <Text key={index} style={styles.factor}>
            {factor.type}: {factor.score.toFixed(3)} (權重:{' '}
            {factor.weight.toFixed(3)})
          </Text>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRecordClick(item)}
        >
          <Text style={styles.actionButtonText}>記錄點擊</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setSelectedRecommendation(item)}
        >
          <Text style={styles.actionButtonText}>選擇評分</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 渲染配置面板
  const _renderConfigPanel = () => (
    <ScrollView style={styles.panel}>
      <Text style={styles.panelTitle}>配置管理</Text>

      {config && (
        <View style={styles.configSection}>
          <Text style={styles.sectionTitle}>當前配置</Text>
          <Text>算法: {config.algorithm}</Text>
          <Text>最小分數: {config.thresholds.minScore}</Text>
          <Text>最小置信度: {config.thresholds.minConfidence}</Text>
          <Text>最大推薦數: {config.thresholds.maxRecommendations}</Text>
          <Text>緩存啟用: {config.caching.enabled ? '是' : '否'}</Text>
          <Text>緩存大小: {config.caching.maxSize}</Text>
        </View>
      )}

      <View style={styles.configSection}>
        <Text style={styles.sectionTitle}>算法選擇</Text>
        {Object.values(HybridAlgorithm).map(algorithm => (
          <TouchableOpacity
            key={algorithm}
            style={[
              styles.algorithmButton,
              selectedAlgorithm === algorithm && styles.selectedAlgorithm,
            ]}
            onPress={() => setSelectedAlgorithm(algorithm)}
          >
            <Text style={styles.algorithmButtonText}>{algorithm}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.configSection}>
        <Text style={styles.sectionTitle}>快速操作</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleUpdateWeights}
        >
          <Text style={styles.actionButtonText}>更新權重</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => sortByScore()}
        >
          <Text style={styles.actionButtonText}>按分數排序</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => enableDiversity()}
        >
          <Text style={styles.actionButtonText}>啟用多樣性</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => enableNovelty()}
        >
          <Text style={styles.actionButtonText}>啟用新穎性</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // 渲染統計面板
  const _renderStatsPanel = () => (
    <ScrollView style={styles.panel}>
      <Text style={styles.panelTitle}>統計信息</Text>

      {stats && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>基本統計</Text>
          <Text>總推薦數: {stats.totalRecommendations}</Text>
          <Text>平均分數: {stats.averageScore.toFixed(3)}</Text>
          <Text>平均置信度: {stats.averageConfidence.toFixed(3)}</Text>
        </View>
      )}

      {performance && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>性能指標</Text>
          <Text>響應時間: {performance.responseTime}ms</Text>
          <Text>準確率: {(performance.accuracy * 100).toFixed(1)}%</Text>
          <Text>精確率: {(performance.precision * 100).toFixed(1)}%</Text>
          <Text>召回率: {(performance.recall * 100).toFixed(1)}%</Text>
          <Text>F1分數: {(performance.f1Score * 100).toFixed(1)}%</Text>
          <Text>多樣性: {(performance.diversity * 100).toFixed(1)}%</Text>
          <Text>新穎性: {(performance.novelty * 100).toFixed(1)}%</Text>
          <Text>覆蓋率: {(performance.coverage * 100).toFixed(1)}%</Text>
        </View>
      )}

      {stats?.userEngagement && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>用戶參與度</Text>
          <Text>
            點擊率: {(stats.userEngagement.clickThroughRate * 100).toFixed(1)}%
          </Text>
          <Text>
            轉化率: {(stats.userEngagement.conversionRate * 100).toFixed(1)}%
          </Text>
          <Text>
            滿意度: {stats.userEngagement.satisfactionScore.toFixed(1)}/5
          </Text>
        </View>
      )}

      {stats?.cacheStats && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>緩存統計</Text>
          <Text>命中率: {(stats.cacheStats.hitRate * 100).toFixed(1)}%</Text>
          <Text>
            緩存大小: {stats.cacheStats.size}/{stats.cacheStats.maxSize}
          </Text>
          <Text>驅逐次數: {stats.cacheStats.evictions}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.actionButton} onPress={fetchStats}>
        <Text style={styles.actionButtonText}>刷新統計</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // 渲染互動面板
  const _renderInteractionsPanel = () => (
    <ScrollView style={styles.panel}>
      <Text style={styles.panelTitle}>用戶互動</Text>

      <View style={styles.interactionSection}>
        <Text style={styles.sectionTitle}>記錄評分</Text>

        {selectedRecommendation && (
          <View style={styles.selectedItem}>
            <Text>已選擇: {selectedRecommendation.itemId}</Text>
            <Text>分數: {selectedRecommendation.score.toFixed(3)}</Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder='評分 (1-5)'
          value={rating}
          onChangeText={setRating}
          keyboardType='numeric'
        />

        <TouchableOpacity
          style={[
            styles.actionButton,
            !selectedRecommendation && styles.disabledButton,
          ]}
          onPress={handleRecordRating}
          disabled={!selectedRecommendation}
        >
          <Text style={styles.actionButtonText}>記錄評分</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.interactionSection}>
        <Text style={styles.sectionTitle}>快速操作</Text>

        <TouchableOpacity style={styles.actionButton} onPress={refresh}>
          <Text style={styles.actionButtonText}>刷新推薦</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={clearFilters}>
          <Text style={styles.actionButtonText}>清除過濾器</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={clearOptions}>
          <Text style={styles.actionButtonText}>清除選項</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={reset}>
          <Text style={styles.actionButtonText}>重置所有</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.interactionSection}>
        <Text style={styles.sectionTitle}>分頁控制</Text>

        <View style={styles.paginationControls}>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              !hasPrevPage && styles.disabledButton,
            ]}
            onPress={prevPage}
            disabled={!hasPrevPage}
          >
            <Text style={styles.paginationButtonText}>上一頁</Text>
          </TouchableOpacity>

          <Text style={styles.paginationInfo}>
            第 {1} 頁，共 {totalPages} 頁
          </Text>

          <TouchableOpacity
            style={[
              styles.paginationButton,
              !hasNextPage && styles.disabledButton,
            ]}
            onPress={nextPage}
            disabled={!hasNextPage}
          >
            <Text style={styles.paginationButtonText}>下一頁</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>正在初始化混合推薦系統...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>混合推薦系統示例</Text>

      {/* 輸入區域 */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder='用戶ID'
          value={userId}
          onChangeText={setUserId}
        />

        <TextInput
          style={styles.input}
          placeholder='數量限制 (1-100)'
          value={limit}
          onChangeText={setLimit}
          keyboardType='numeric'
        />

        <TouchableOpacity
          style={styles.getButton}
          onPress={handleGetRecommendations}
          disabled={loading.recommendations}
        >
          {loading.recommendations ? (
            <ActivityIndicator size='small' color='white' />
          ) : (
            <Text style={styles.getButtonText}>獲取推薦</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 錯誤顯示 */}
      {error.recommendations && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>錯誤: {error.recommendations}</Text>
          <TouchableOpacity onPress={() => clearError()}>
            <Text style={styles.clearErrorText}>清除</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 標籤頁 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'recommendations' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('recommendations')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'recommendations' && styles.activeTabText,
            ]}
          >
            推薦 ({recommendations.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'config' && styles.activeTab]}
          onPress={() => setActiveTab('config')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'config' && styles.activeTabText,
            ]}
          >
            配置
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'stats' && styles.activeTabText,
            ]}
          >
            統計
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'interactions' && styles.activeTab]}
          onPress={() => setActiveTab('interactions')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'interactions' && styles.activeTabText,
            ]}
          >
            互動
          </Text>
        </TouchableOpacity>
      </View>

      {/* 內容區域 */}
      <View style={styles.contentContainer}>
        {activeTab === 'recommendations' && (
          <View style={styles.recommendationsContainer}>
            <View style={styles.summary}>
              <Text style={styles.summaryText}>
                總計: {total} | 平均分數: {averageScore.toFixed(3)} |
                平均置信度: {stats?.averageConfidence?.toFixed(3) || '0.000'}
              </Text>
            </View>

            {hasRecommendations ? (
              <FlatList
                data={recommendations}
                renderItem={renderRecommendationItem}
                keyExtractor={item => item.id}
                style={styles.recommendationsList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暫無推薦數據</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'config' && renderConfigPanel()}
        {activeTab === 'stats' && renderStatsPanel()}
        {activeTab === 'interactions' && renderInteractionsPanel()}
      </View>
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  inputSection: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    fontSize: 16,
  },
  getButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  getButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    flex: 1,
  },
  clearErrorText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  recommendationsContainer: {
    flex: 1,
  },
  summary: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  recommendationsList: {
    flex: 1,
  },
  recommendationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  score: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  recommendationDetails: {
    marginBottom: 8,
  },
  confidence: {
    fontSize: 14,
    color: '#666',
  },
  reason: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  factorsContainer: {
    marginBottom: 12,
  },
  factorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  factor: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  panel: {
    flex: 1,
    padding: 16,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  configSection: {
    marginBottom: 24,
  },
  statsSection: {
    marginBottom: 24,
  },
  interactionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  algorithmButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  selectedAlgorithm: {
    backgroundColor: '#007AFF',
  },
  algorithmButtonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedItem: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paginationButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  paginationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationInfo: {
    fontSize: 14,
    color: '#666',
  },
});
