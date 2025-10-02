// 協同Filter推薦系統示例Component
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useCollaborativeFiltering } from '../hooks/useCollaborativeFiltering';
import {
  RecommendationAlgorithm,
  SimilarityMethod,
} from '../types/collaborativeFiltering';

const CollaborativeFilteringExample: React.FC = () => {
  const {
    // Status
    isInitialized,
    isLoading,
    hasError,
    recommendations,
    similarUsers,
    similarItems,
    performance,
    statistics,
    currentAlgorithm,
    currentSimilarityMethod,
    filterOptions,
    pagination,
    loading,
    error,

    // Operation
    fetchRecommendations,
    fetchSimilarUsers,
    fetchSimilarItems,
    rateItem,
    trackBehavior,
    fetchModelPerformance,
    selectRecommendation,
    selectSimilarUser,
    selectSimilarItem,
    setAlgorithm,
    setSimilarityMethod,
    setFilters,
    quickGetRecommendations,
    quickGetSimilarUsers,
    quickGetSimilarItems,
    quickRate,
    quickTrackView,
    quickTrackLike,
    quickTrackPurchase,
  } = useCollaborativeFiltering();

  // LocalStatus
  const [activeTab, setActiveTab] = useState<
    'recommendations' | 'similarUsers' | 'similarItems' | 'performance'
  >('recommendations');
  const [userId, setUserId] = useState('user_1');
  const [itemId, setItemId] = useState('item_1');
  const [rating, setRating] = useState('5');
  const [limit, setLimit] = useState('10');

  // Initialize
  useEffect(() => {
    if (isInitialized) {
      // AutoGet一些初始Data
      quickGetRecommendations(userId, 5);
      quickGetSimilarUsers(userId, 5);
      quickGetSimilarItems(itemId, 5);
      fetchModelPerformance();
    }
  }, [isInitialized, userId, itemId]);

  // 渲染推薦List
  const _renderRecommendations = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>推薦項目</Text>

      <View style={styles.controls}>
        <TextInput
          style={styles.input}
          placeholder='用戶ID'
          value={userId}
          onChangeText={setUserId}
        />
        <TextInput
          style={styles.input}
          placeholder='數量限制'
          value={limit}
          onChangeText={setLimit}
          keyboardType='numeric'
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => quickGetRecommendations(userId, parseInt(limit) || 10)}
          disabled={loading.recommendations}
        >
          {loading.recommendations ? (
            <ActivityIndicator size='small' color='#fff' />
          ) : (
            <Text style={styles.buttonText}>獲取推薦</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.algorithmSelector}>
        <Text style={styles.label}>算法:</Text>
        <TouchableOpacity
          style={[
            styles.algorithmButton,
            currentAlgorithm === RecommendationAlgorithm.USER_BASED &&
              styles.activeButton,
          ]}
          onPress={() => setAlgorithm(RecommendationAlgorithm.USER_BASED)}
        >
          <Text style={styles.algorithmButtonText}>用戶基於</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.algorithmButton,
            currentAlgorithm === RecommendationAlgorithm.ITEM_BASED &&
              styles.activeButton,
          ]}
          onPress={() => setAlgorithm(RecommendationAlgorithm.ITEM_BASED)}
        >
          <Text style={styles.algorithmButtonText}>項目基於</Text>
        </TouchableOpacity>
      </View>

      {recommendations.length > 0 ? (
        <ScrollView style={styles.list}>
          {recommendations.map((rec, index) => (
            <TouchableOpacity
              key={rec.itemId}
              style={styles.item}
              onPress={() => selectRecommendation(rec.itemId)}
            >
              <Text style={styles.itemTitle}>項目 {rec.itemId}</Text>
              <Text style={styles.itemSubtitle}>
                評分: {rec.score.toFixed(2)}
              </Text>
              <Text style={styles.itemSubtitle}>
                置信度: {(rec.confidence * 100).toFixed(1)}%
              </Text>
              <Text style={styles.itemDescription}>
                {rec.reason.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>暫無推薦項目</Text>
      )}
    </View>
  );

  // 渲染相似UserList
  const _renderSimilarUsers = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>相似用戶</Text>

      <View style={styles.controls}>
        <TextInput
          style={styles.input}
          placeholder='用戶ID'
          value={userId}
          onChangeText={setUserId}
        />
        <TextInput
          style={styles.input}
          placeholder='數量限制'
          value={limit}
          onChangeText={setLimit}
          keyboardType='numeric'
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => quickGetSimilarUsers(userId, parseInt(limit) || 10)}
          disabled={loading.similarUsers}
        >
          {loading.similarUsers ? (
            <ActivityIndicator size='small' color='#fff' />
          ) : (
            <Text style={styles.buttonText}>獲取相似用戶</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.methodSelector}>
        <Text style={styles.label}>相似度方法:</Text>
        <TouchableOpacity
          style={[
            styles.methodButton,
            currentSimilarityMethod === SimilarityMethod.PEARSON &&
              styles.activeButton,
          ]}
          onPress={() => setSimilarityMethod(SimilarityMethod.PEARSON)}
        >
          <Text style={styles.methodButtonText}>皮爾遜</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.methodButton,
            currentSimilarityMethod === SimilarityMethod.COSINE &&
              styles.activeButton,
          ]}
          onPress={() => setSimilarityMethod(SimilarityMethod.COSINE)}
        >
          <Text style={styles.methodButtonText}>餘弦</Text>
        </TouchableOpacity>
      </View>

      {similarUsers.length > 0 ? (
        <ScrollView style={styles.list}>
          {similarUsers.map((user, index) => (
            <TouchableOpacity
              key={user.targetUserId}
              style={styles.item}
              onPress={() => selectSimilarUser(user.targetUserId)}
            >
              <Text style={styles.itemTitle}>用戶 {user.targetUserId}</Text>
              <Text style={styles.itemSubtitle}>
                相似度: {(user.score * 100).toFixed(1)}%
              </Text>
              <Text style={styles.itemSubtitle}>
                共同項目: {user.commonItems}
              </Text>
              <Text style={styles.itemDescription}>方法: {user.method}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>暫無相似用戶</Text>
      )}
    </View>
  );

  // 渲染相似項目List
  const _renderSimilarItems = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>相似項目</Text>

      <View style={styles.controls}>
        <TextInput
          style={styles.input}
          placeholder='項目ID'
          value={itemId}
          onChangeText={setItemId}
        />
        <TextInput
          style={styles.input}
          placeholder='數量限制'
          value={limit}
          onChangeText={setLimit}
          keyboardType='numeric'
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => quickGetSimilarItems(itemId, parseInt(limit) || 10)}
          disabled={loading.similarItems}
        >
          {loading.similarItems ? (
            <ActivityIndicator size='small' color='#fff' />
          ) : (
            <Text style={styles.buttonText}>獲取相似項目</Text>
          )}
        </TouchableOpacity>
      </View>

      {similarItems.length > 0 ? (
        <ScrollView style={styles.list}>
          {similarItems.map((item, index) => (
            <TouchableOpacity
              key={item.itemId}
              style={styles.item}
              onPress={() => selectSimilarItem(item.itemId)}
            >
              <Text style={styles.itemTitle}>項目 {item.itemId}</Text>
              <Text style={styles.itemSubtitle}>
                相似度: {(item.similarityScore * 100).toFixed(1)}%
              </Text>
              <Text style={styles.itemSubtitle}>
                共同評分: {item.commonRatings}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>暫無相似項目</Text>
      )}
    </View>
  );

  // 渲染性能指標
  const _renderPerformance = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>模型性能</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={fetchModelPerformance}
        disabled={loading.performance}
      >
        {loading.performance ? (
          <ActivityIndicator size='small' color='#fff' />
        ) : (
          <Text style={styles.buttonText}>刷新性能指標</Text>
        )}
      </TouchableOpacity>

      {performance && (
        <View style={styles.performanceContainer}>
          <Text style={styles.performanceTitle}>算法性能</Text>
          <Text style={styles.performanceText}>
            準確率: {((performance as any).accuracy * 100).toFixed(1)}%
          </Text>
          <Text style={styles.performanceText}>
            精確率: {((performance as any).precision * 100).toFixed(1)}%
          </Text>
          <Text style={styles.performanceText}>
            召回率: {((performance as any).recall * 100).toFixed(1)}%
          </Text>
          <Text style={styles.performanceText}>
            F1分數: {((performance as any).f1Score * 100).toFixed(1)}%
          </Text>
          <Text style={styles.performanceText}>
            MAE: {(performance as any).mae?.toFixed(3) || 'N/A'}
          </Text>
          <Text style={styles.performanceText}>
            RMSE: {(performance as any).rmse?.toFixed(3) || 'N/A'}
          </Text>
          <Text style={styles.performanceText}>
            覆蓋率: {((performance as any).coverage * 100).toFixed(1)}%
          </Text>
          <Text style={styles.performanceText}>
            多樣性: {((performance as any).diversity * 100).toFixed(1)}%
          </Text>
          <Text style={styles.performanceText}>
            新穎性: {((performance as any).novelty * 100).toFixed(1)}%
          </Text>
        </View>
      )}

      {statistics && (
        <View style={styles.performanceContainer}>
          <Text style={styles.performanceTitle}>數據統計</Text>
          <Text style={styles.performanceText}>
            總用戶數: {(statistics as any).totalUsers || 0}
          </Text>
          <Text style={styles.performanceText}>
            總項目數: {(statistics as any).totalItems || 0}
          </Text>
          <Text style={styles.performanceText}>
            總評分數: {(statistics as any).totalRatings || 0}
          </Text>
          <Text style={styles.performanceText}>
            平均評分: {(statistics as any).averageRating?.toFixed(2) || '0.00'}
          </Text>
          <Text style={styles.performanceText}>
            稀疏度: {((statistics as any).sparsity * 100).toFixed(1)}%
          </Text>
          <Text style={styles.performanceText}>
            活躍用戶: {(statistics as any).activeUsers || 0}
          </Text>
          <Text style={styles.performanceText}>
            活躍項目: {(statistics as any).activeItems || 0}
          </Text>
        </View>
      )}
    </View>
  );

  // 渲染評分和Row為Trace
  const _renderRatingAndBehavior = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>評分與行為追蹤</Text>

      <View style={styles.controls}>
        <TextInput
          style={styles.input}
          placeholder='用戶ID'
          value={userId}
          onChangeText={setUserId}
        />
        <TextInput
          style={styles.input}
          placeholder='項目ID'
          value={itemId}
          onChangeText={setItemId}
        />
        <TextInput
          style={styles.input}
          placeholder='評分 (1-5)'
          value={rating}
          onChangeText={setRating}
          keyboardType='numeric'
        />
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => quickRate(userId, itemId, parseInt(rating) || 5)}
          disabled={(loading as any).rating}
        >
          <Text style={styles.actionButtonText}>評分</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => quickTrackView(userId, itemId)}
          disabled={(loading as any).behavior}
        >
          <Text style={styles.actionButtonText}>查看</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => quickTrackLike(userId, itemId)}
          disabled={(loading as any).behavior}
        >
          <Text style={styles.actionButtonText}>點讚</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => quickTrackPurchase(userId, itemId)}
          disabled={(loading as any).behavior}
        >
          <Text style={styles.actionButtonText}>購買</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>初始化協同過濾系統...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>系統錯誤</Text>
        <Text style={styles.errorSubtext}>請檢查網絡連接或稍後重試</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>協同過濾推薦系統</Text>

      {/* Tag欄 */}
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
          style={[styles.tab, activeTab === 'similarUsers' && styles.activeTab]}
          onPress={() => setActiveTab('similarUsers')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'similarUsers' && styles.activeTabText,
            ]}
          >
            相似用戶
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'similarItems' && styles.activeTab]}
          onPress={() => setActiveTab('similarItems')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'similarItems' && styles.activeTabText,
            ]}
          >
            相似項目
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'performance' && styles.activeTab]}
          onPress={() => setActiveTab('performance')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'performance' && styles.activeTabText,
            ]}
          >
            性能
          </Text>
        </TouchableOpacity>
      </View>

      {/* ContentDistrict域 */}
      <ScrollView style={styles.content}>
        {activeTab === 'recommendations' && renderRecommendations()}
        {activeTab === 'similarUsers' && renderSimilarUsers()}
        {activeTab === 'similarItems' && renderSimilarItems()}
        {activeTab === 'performance' && renderPerformance()}

        {/* 評分與Row為Trace始終Show */}
        {renderRatingAndBehavior()}
      </ScrollView>
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
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff3b30',
  },
  errorSubtext: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#007AFF',
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
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  algorithmSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  methodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  algorithmButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  methodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  activeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  algorithmButtonText: {
    fontSize: 12,
    color: '#333',
  },
  methodButtonText: {
    fontSize: 12,
    color: '#333',
  },
  list: {
    maxHeight: 300,
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 20,
  },
  performanceContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  performanceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CollaborativeFilteringExample;
