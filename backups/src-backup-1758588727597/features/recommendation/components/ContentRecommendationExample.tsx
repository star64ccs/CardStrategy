import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useContentRecommendation } from '../hooks/useContentRecommendation';
import type { UserPreference } from '../types/contentRecommendation';
import {
  ContentRecommendationAlgorithm,
  ContentType,
  SimilarityMethod,
} from '../types/contentRecommendation';

/**
 * 內容推薦示例組件
 * 展示內容推薦功能的使用方法
 */
const ContentRecommendationExample: React.FC = () => {
  const {
    // 狀態
    recommendations,
    similarContent,
    config,
    stats,
    loading,
    error,
    performanceMetrics,
    lastUpdated,
    isLoading,
    hasError,
    totalPages,
    recommendationCount,
    similarContentCount,

    // 計算屬性
    hasRecommendations,
    hasSimilarContent,
    averageScore,
    hasNextPage,
    hasPreviousPage,
    isFirstPage,
    isLastPage,
    hasPerformanceMetrics,
    accuracyScore,
    precisionScore,
    recallScore,
    f1Score,
    isStale,
    timeSinceLastUpdate,
    isConfigured,
    isEnabled,
    hasCache,
    hasStats,
    totalRecommendations,
    totalUsers,
    totalContent,

    // 操作方法
    initialize,
    fetchRecommendations,
    fetchSimilarContent,
    updatePreference,
    recordInteraction,
    fetchConfig,
    updateConfig,
    fetchStats,
    reset,
    setFilters,
    setOptions,
    setPagination,
    clearError,

    // 快速操作
    getRecommendationsForUser,
    getSimilarForContent,
    recordView,
    recordLike,
    recordShare,
    recordBookmark,
    recordRating,
    updateUserPreferences,
    goToPage,
    setPageSize,
    clearAllErrors,
    refresh,
  } = useContentRecommendation();

  // 本地狀態
  const [activeTab, setActiveTab] = useState<
    'recommendations' | 'similar' | 'config' | 'stats'
  >('recommendations');
  const [userId, setUserId] = useState('user_123');
  const [contentId, setContentId] = useState('content_1');
  const [limit, setLimit] = useState('10');
  const [algorithm, setAlgorithm] = useState<ContentRecommendationAlgorithm>(
    ContentRecommendationAlgorithm.CONTENT_BASED
  );
  const [similarityMethod, setSimilarityMethod] = useState<SimilarityMethod>(
    SimilarityMethod.COSINE
  );

  // 初始化
  useEffect(() => {
    initialize();
  }, []);

  // 處理錯誤
  useEffect(() => {
    if (hasError) {
      Alert.alert('錯誤', '內容推薦系統發生錯誤，請檢查控制台');
    }
  }, [hasError]);

  // 獲取推薦
  const _handleGetRecommendations = async () => {
    await getRecommendationsForUser(userId);
    Alert.alert('成功', '已獲取推薦');
  };

  // 獲取相似內容
  const _handleGetSimilarContent = async () => {
    await getSimilarForContent(contentId);
    Alert.alert('成功', '已獲取相似內容');
  };

  // 記錄互動
  const _handleRecordInteraction = async (type: string) => {
    try {
      switch (type) {
        case 'view':
          await recordView(userId, contentId);
          break;
        case 'like':
          await recordLike(userId, contentId);
          break;
        case 'share':
          await recordShare(userId, contentId);
          break;
        case 'bookmark':
          await recordBookmark(userId, contentId);
          break;
        case 'rating':
          await recordRating(userId, contentId, 4.5);
          break;
        default:
          return;
      }
      Alert.alert('成功', `記錄${type}互動成功`);
    } catch (error) {
      Alert.alert('失敗', `記錄${type}互動失敗`);
    }
  };

  // 更新用戶偏好
  const _handleUpdatePreference = async () => {
    const preference: Partial<UserPreference> = {
      contentTypes: [ContentType.CARD, ContentType.ARTICLE],
      categories: ['strategy', 'trading'],
      tags: ['pokemon', 'yugioh'],
      difficulty: 'intermediate',
      language: 'zh-TW',
      priceRange: { min: 0, max: 100 },
      durationRange: { min: 1, max: 60 },
      ratingThreshold: 4.0,
    };

    try {
      await updateUserPreferences(userId, preference);
      Alert.alert('成功', '更新用戶偏好成功');
    } catch (error) {
      Alert.alert('失敗', '更新用戶偏好失敗');
    }
  };

  // 渲染推薦列表
  const _renderRecommendations = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>推薦列表</Text>
      {loading.recommendations ? (
        <ActivityIndicator size='large' color='#007AFF' />
      ) : hasRecommendations ? (
        <ScrollView style={styles.list}>
          {recommendations.map((rec: unknown, index: number) => (
            <View key={rec.id} style={styles.recommendationItem}>
              <Text style={styles.itemTitle}>推薦 {index + 1}</Text>
              <Text>內容ID: {rec.contentId}</Text>
              <Text>分數: {rec.score.toFixed(3)}</Text>
              <Text>置信度: {rec.confidence.toFixed(3)}</Text>
              <Text>算法: {rec.algorithm}</Text>
              <Text>原因: {rec.reason.description}</Text>
              <Text>時間: {rec.timestamp.toLocaleString()}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>暫無推薦</Text>
      )}
    </View>
  );

  // 渲染相似內容列表
  const _renderSimilarContent = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>相似內容</Text>
      {loading.similarContent ? (
        <ActivityIndicator size='large' color='#007AFF' />
      ) : hasSimilarContent ? (
        <ScrollView style={styles.list}>
          {similarContent.map((similar: unknown, index: number) => (
            <View
              key={`${similar.sourceId}_${similar.targetId}`}
              style={styles.similarItem}
            >
              <Text style={styles.itemTitle}>相似內容 {index + 1}</Text>
              <Text>源內容: {similar.sourceId}</Text>
              <Text>目標內容: {similar.targetId}</Text>
              <Text>相似度: {similar.similarityScore.toFixed(3)}</Text>
              <Text>方法: {similar.similarityMethod}</Text>
              <Text>共同標籤: {similar.commonTags.join(', ')}</Text>
              <Text>共同類別: {similar.commonCategories.join(', ')}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>暫無相似內容</Text>
      )}
    </View>
  );

  // 渲染配置信息
  const _renderConfig = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>配置信息</Text>
      {loading.config ? (
        <ActivityIndicator size='large' color='#007AFF' />
      ) : config ? (
        <ScrollView style={styles.configList}>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>啟用狀態:</Text>
            <Text style={styles.configValue}>
              {config.enabled ? '啟用' : '禁用'}
            </Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>最大推薦數:</Text>
            <Text style={styles.configValue}>{config.maxRecommendations}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>相似度閾值:</Text>
            <Text style={styles.configValue}>{config.similarityThreshold}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>緩存啟用:</Text>
            <Text style={styles.configValue}>
              {config.cacheEnabled ? '是' : '否'}
            </Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>緩存過期時間:</Text>
            <Text style={styles.configValue}>{config.cacheExpiry}秒</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>更新間隔:</Text>
            <Text style={styles.configValue}>{config.updateInterval}秒</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>性能追蹤:</Text>
            <Text style={styles.configValue}>
              {config.performanceTracking ? '啟用' : '禁用'}
            </Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>支持算法:</Text>
            <Text style={styles.configValue}>
              {config.algorithms.join(', ')}
            </Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>相似度方法:</Text>
            <Text style={styles.configValue}>
              {config.similarityMethods.join(', ')}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>暫無配置信息</Text>
      )}
    </View>
  );

  // 渲染統計信息
  const _renderStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>統計信息</Text>
      {loading.stats ? (
        <ActivityIndicator size='large' color='#007AFF' />
      ) : stats ? (
        <ScrollView style={styles.statsList}>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>總推薦數:</Text>
            <Text style={styles.statsValue}>{stats.totalRecommendations}</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>總用戶數:</Text>
            <Text style={styles.statsValue}>{stats.totalUsers}</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>總內容數:</Text>
            <Text style={styles.statsValue}>{stats.totalContent}</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>平均分數:</Text>
            <Text style={styles.statsValue}>
              {stats.averageScore.toFixed(3)}
            </Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>最後更新:</Text>
            <Text style={styles.statsValue}>
              {stats.lastUpdated.toLocaleString()}
            </Text>
          </View>
          {hasPerformanceMetrics && (
            <>
              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>準確率:</Text>
                <Text style={styles.statsValue}>
                  {(performanceMetrics.accuracy * 100).toFixed(1)}%
                </Text>
              </View>
              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>精確率:</Text>
                <Text style={styles.statsValue}>
                  {(performanceMetrics.precision * 100).toFixed(1)}%
                </Text>
              </View>
              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>召回率:</Text>
                <Text style={styles.statsValue}>
                  {(performanceMetrics.recall * 100).toFixed(1)}%
                </Text>
              </View>
              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>F1分數:</Text>
                <Text style={styles.statsValue}>
                  {(performanceMetrics.f1Score * 100).toFixed(1)}%
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>暫無統計信息</Text>
      )}
    </View>
  );

  // 渲染控制面板
  const _renderControlPanel = () => (
    <View style={styles.controlPanel}>
      <Text style={styles.controlTitle}>控制面板</Text>

      {/* 用戶ID輸入 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>用戶ID:</Text>
        <TextInput
          style={styles.input}
          value={userId}
          onChangeText={setUserId}
          placeholder='輸入用戶ID'
        />
      </View>

      {/* 內容ID輸入 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>內容ID:</Text>
        <TextInput
          style={styles.input}
          value={contentId}
          onChangeText={setContentId}
          placeholder='輸入內容ID'
        />
      </View>

      {/* 數量限制輸入 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>數量限制:</Text>
        <TextInput
          style={styles.input}
          value={limit}
          onChangeText={setLimit}
          placeholder='輸入數量限制'
          keyboardType='numeric'
        />
      </View>

      {/* 操作按鈕 */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetRecommendations}
        >
          <Text style={styles.buttonText}>獲取推薦</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetSimilarContent}
        >
          <Text style={styles.buttonText}>獲取相似內容</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleRecordInteraction('view')}
        >
          <Text style={styles.buttonText}>記錄查看</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleRecordInteraction('like')}
        >
          <Text style={styles.buttonText}>記錄點讚</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleRecordInteraction('share')}
        >
          <Text style={styles.buttonText}>記錄分享</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleRecordInteraction('bookmark')}
        >
          <Text style={styles.buttonText}>記錄收藏</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleRecordInteraction('rating')}
        >
          <Text style={styles.buttonText}>記錄評分</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdatePreference}
        >
          <Text style={styles.buttonText}>更新偏好</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button} onPress={fetchConfig}>
          <Text style={styles.buttonText}>獲取配置</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={fetchStats}>
          <Text style={styles.buttonText}>獲取統計</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button} onPress={clearAllErrors}>
          <Text style={styles.buttonText}>清除錯誤</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={refresh}>
          <Text style={styles.buttonText}>刷新</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>內容推薦系統示例</Text>

      {/* 狀態信息 */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          狀態: {isConfigured ? '已配置' : '未配置'} | 啟用:{' '}
          {isEnabled ? '是' : '否'} | 緩存: {hasCache ? '啟用' : '禁用'}
        </Text>
        <Text style={styles.statusText}>
          推薦數: {recommendationCount} | 相似內容: {similarContentCount} |
          總頁數: {totalPages}
        </Text>
        <Text style={styles.statusText}>
          平均分數: {averageScore.toFixed(3)} | 數據過期:{' '}
          {isStale ? '是' : '否'}
        </Text>
        {lastUpdated && (
          <Text style={styles.statusText}>
            最後更新: {lastUpdated.toLocaleString()}
          </Text>
        )}
      </View>

      {/* 標籤頁 */}
      <View style={styles.tabBar}>
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
            推薦
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'similar' && styles.activeTab]}
          onPress={() => setActiveTab('similar')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'similar' && styles.activeTabText,
            ]}
          >
            相似內容
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
      </View>

      {/* 內容區域 */}
      <ScrollView style={styles.content}>
        {activeTab === 'recommendations' && renderRecommendations()}
        {activeTab === 'similar' && renderSimilarContent()}
        {activeTab === 'config' && renderConfig()}
        {activeTab === 'stats' && renderStats()}

        {/* 控制面板 */}
        {renderControlPanel()}
      </ScrollView>

      {/* 加載指示器 */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size='large' color='#007AFF' />
          <Text style={styles.loadingText}>處理中...</Text>
        </View>
      )}

      {/* 錯誤提示 */}
      {hasError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>發生錯誤，請檢查控制台</Text>
        </View>
      )}
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  statusBar: {
    backgroundColor: '#e8e8e8',
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  list: {
    maxHeight: 300,
  },
  recommendationItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  similarItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
  configList: {
    maxHeight: 400,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  configLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  configValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  statsList: {
    maxHeight: 400,
  },
  statsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statsValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  controlPanel: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  controlTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  errorOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ff3b30',
    padding: 15,
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ContentRecommendationExample;
