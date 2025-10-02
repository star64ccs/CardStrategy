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

import { useIntelligentSearch } from '../hooks/useIntelligentSearch';
import type {
  AutoCompleteOption,
  PopularSearchItem,
  RelatedSearchItem,
  UserSearchPreferences,
} from '../types/intelligentSearch';

const IntelligentSearchExample: React.FC = () => {
  const {
    isLoading,
    error,
    currentQuery,
    results,
    suggestions,
    searchHistory,
    popularSearches,
    relatedSearches,
    queryAnalysis,
    config,
    search,
    getSuggestions,
    getSearchHistory,
    saveSearchHistory,
    getPopularSearches,
    getRelatedSearches,
    analyzeQuery,
    updateUserPreferences,
    getUserPreferences,
    clearSearchHistory,
    clearResults,
    clearQuery,
    clearError,
    updateConfig,
  } = useIntelligentSearch();

  const [query, setQuery] = useState('');
  const [userId, setUserId] = useState('user123');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<AutoCompleteOption | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // Initialize時Get熱門Search
    getPopularSearches();
  }, []);

  const _handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert('Error', '請輸入搜索查詢');
      return;
    }

    try {
      await search({
        query: query.trim(),
        userId,
        context: {
          category: 'Pokemon',
          sessionId: 'session123',
        },
        preferences: {
          preferredCategories: ['Pokemon'],
          personalizationEnabled: true,
        },
        filters: {
          excludeOutOfStock: false,
          relevanceThreshold: 0.3,
        },
        limit: 20,
        includeSuggestions: true,
        includeSemantic: true,
      });

      setShowSuggestions(false);
    } catch (error) {
      Alert.alert(
        '搜索Failed',
        error instanceof Error ? error.message : '未知Error'
      );
    }
  };

  const _handleSuggestionSelect = (suggestion: AutoCompleteOption) => {
    setQuery(suggestion.text);
    setSelectedSuggestion(suggestion);
    setShowSuggestions(false);
    handleSearch();
  };

  const _handleQueryChange = (text: string) => {
    setQuery(text);
    if (text.length >= 2) {
      setShowSuggestions(true);
      getSuggestions(text, { category: 'Pokemon' });
    } else {
      setShowSuggestions(false);
    }
  };

  const _handleAnalyzeQuery = async () => {
    if (!query.trim()) {
      Alert.alert('Error', '請輸入要分析的查詢');
      return;
    }

    try {
      const _analysis = await analyzeQuery(query.trim());
      Alert.alert(
        '查詢分析結果',
        `原始查詢: ${analysis?.originalQuery}\n` +
          `標準化查詢: ${analysis?.normalizedQuery}\n` +
          `搜索意圖: ${analysis?.intent.primary}\n` +
          `置信度: ${analysis?.confidence}\n` +
          `複雜度: ${analysis?.complexity}\n` +
          `語言: ${analysis?.language}\n` +
          `實體數量: ${analysis?.entities.length}\n` +
          `建議數量: ${analysis?.suggestions.length}\n` +
          `糾正數量: ${analysis?.corrections.length}`
      );
    } catch (error) {
      Alert.alert(
        '分析Failed',
        error instanceof Error ? error.message : '未知Error'
      );
    }
  };

  const _handleUpdatePreferences = async () => {
    const preferences: UserSearchPreferences = {
      preferredCategories: ['Pokemon', 'Yu-Gi-Oh'],
      preferredRarity: ['Rare', 'Ultra Rare'],
      preferredSets: ['Base Set', 'Legend of Blue Eyes White Dragon'],
      preferredArtists: ['Ken Sugimori', 'Takahiro Kagami'],
      personalizationEnabled: true,
      searchHistoryWeight: 0.3,
      popularityWeight: 0.2,
      recencyWeight: 0.1,
    };

    try {
      await updateUserPreferences(userId, preferences);
      Alert.alert('Success', '用戶偏好已更新');
    } catch (error) {
      Alert.alert(
        'UpdateFailed',
        error instanceof Error ? error.message : '未知Error'
      );
    }
  };

  const _handleClearHistory = async () => {
    try {
      await clearSearchHistory(userId);
      Alert.alert('Success', '搜索歷史已清除');
    } catch (error) {
      Alert.alert(
        '清除Failed',
        error instanceof Error ? error.message : '未知Error'
      );
    }
  };

  const _renderSearchResult = ({ item }: { item: unknown }) => (
    <View style={styles.resultItem}>
      <Text style={styles.resultTitle}>{item.title}</Text>
      <Text style={styles.resultDescription}>{item.description}</Text>
      <View style={styles.resultMeta}>
        <Text style={styles.resultPrice}>NT$ {item.price}</Text>
        <Text style={styles.resultCategory}>{item.category}</Text>
        <Text style={styles.resultCondition}>{item.condition}</Text>
      </View>
      <View style={styles.resultScores}>
        <Text style={styles.scoreText}>
          相關性: {(item.relevanceScore * 100).toFixed(1)}%
        </Text>
        <Text style={styles.scoreText}>
          語義: {(item.semanticScore * 100).toFixed(1)}%
        </Text>
        <Text style={styles.scoreText}>
          個性化: {(item.personalizationScore * 100).toFixed(1)}%
        </Text>
        <Text style={styles.scoreText}>
          最終: {(item.finalScore * 100).toFixed(1)}%
        </Text>
      </View>
    </View>
  );

  const _renderSuggestion = ({ item }: { item: AutoCompleteOption }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
    >
      <Text style={styles.suggestionIcon}>{item.icon}</Text>
      <Text style={styles.suggestionText}>{item.text}</Text>
      <Text style={styles.suggestionType}>{item.type}</Text>
    </TouchableOpacity>
  );

  const _renderPopularSearch = ({ item }: { item: PopularSearchItem }) => (
    <TouchableOpacity
      style={styles.popularItem}
      onPress={() => {
        setQuery(item.query);
        handleSearch();
      }}
    >
      <Text style={styles.popularQuery}>{item.query}</Text>
      <Text style={styles.popularCount}>{item.count} 次搜索</Text>
      <Text style={styles.popularTrend}>{item.trend}</Text>
    </TouchableOpacity>
  );

  const _renderRelatedSearch = ({ item }: { item: RelatedSearchItem }) => (
    <TouchableOpacity
      style={styles.relatedItem}
      onPress={() => {
        setQuery(item.query);
        handleSearch();
      }}
    >
      <Text style={styles.relatedQuery}>{item.query}</Text>
      <Text style={styles.relatedReason}>{item.reason}</Text>
      <Text style={styles.relatedRelevance}>
        相關度: {(item.relevance * 100).toFixed(1)}%
      </Text>
    </TouchableOpacity>
  );

  if (!isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>正在初始化智能搜索服務...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>智能搜索示例</Text>

      {/* SearchInput */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder='輸入搜索查詢...'
          value={query}
          onChangeText={handleQueryChange}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>搜索</Text>
        </TouchableOpacity>
      </View>

      {/* Search建議 */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.sectionTitle}>搜索建議</Text>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item, index) => `suggestion-${index}`}
            style={styles.suggestionsList}
          />
        </View>
      )}

      {/* ErrorShow */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>錯誤: {error}</Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearError}>
            <Text style={styles.clearButtonText}>清除錯誤</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search結果 */}
      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.sectionTitle}>搜索結果 ({results.length})</Text>
          </View>

          <FlatList
            data={results}
            renderItem={renderSearchResult}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* 熱門Search */}
      {popularSearches.length > 0 && (
        <View style={styles.popularContainer}>
          <Text style={styles.sectionTitle}>熱門搜索</Text>
          <FlatList
            data={popularSearches}
            renderItem={renderPopularSearch}
            keyExtractor={(item, index) => `popular-${index}`}
            horizontal
            style={styles.popularList}
          />
        </View>
      )}

      {/* 相OffSearch */}
      {relatedSearches.length > 0 && (
        <View style={styles.relatedContainer}>
          <Text style={styles.sectionTitle}>相關搜索</Text>
          <FlatList
            data={relatedSearches}
            renderItem={renderRelatedSearch}
            keyExtractor={(item, index) => `related-${index}`}
            horizontal
            style={styles.relatedList}
          />
        </View>
      )}

      {/* 功能按鈕 */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleAnalyzeQuery}
        >
          <Text style={styles.actionButtonText}>分析查詢</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleUpdatePreferences}
        >
          <Text style={styles.actionButtonText}>更新偏好</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleClearHistory}
        >
          <Text style={styles.actionButtonText}>清除歷史</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={clearResults}>
          <Text style={styles.actionButtonText}>清除結果</Text>
        </TouchableOpacity>
      </View>

      {/* SearchStatistics */}
      {/* Statistics功能暫時不可用 */}

      {/* 加載指示器 */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#007AFF' />
          <Text style={styles.loadingText}>搜索中...</Text>
        </View>
      )}
    </ScrollView>
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
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
  },
  suggestionType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    marginBottom: 8,
  },
  clearButton: {
    backgroundColor: '#c62828',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  resultsHeader: {
    marginBottom: 12,
  },
  resultsMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultsList: {
    maxHeight: 400,
  },
  resultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  resultCategory: {
    fontSize: 12,
    color: '#666',
  },
  resultCondition: {
    fontSize: 12,
    color: '#666',
  },
  resultScores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scoreText: {
    fontSize: 10,
    color: '#666',
    marginRight: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  paginationButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationButtonDisabled: {
    backgroundColor: '#ccc',
  },
  paginationButtonText: {
    color: 'white',
    fontSize: 12,
  },
  paginationText: {
    fontSize: 14,
    marginHorizontal: 8,
  },
  popularContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  popularList: {
    maxHeight: 100,
  },
  popularItem: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    marginRight: 8,
    borderRadius: 6,
    minWidth: 120,
  },
  popularQuery: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  popularCount: {
    fontSize: 12,
    color: '#666',
  },
  popularTrend: {
    fontSize: 12,
    color: '#007AFF',
  },
  relatedContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  relatedList: {
    maxHeight: 100,
  },
  relatedItem: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    marginRight: 8,
    borderRadius: 6,
    minWidth: 150,
  },
  relatedQuery: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  relatedReason: {
    fontSize: 12,
    color: '#666',
  },
  relatedRelevance: {
    fontSize: 12,
    color: '#007AFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
    minWidth: '48%',
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
});

export default IntelligentSearchExample;
