import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { useSearch } from '../hooks/useSearch';
import type { SearchQuery } from '../types/search';
import { SearchFilters, SortOption } from '../types/search';

const FullTextSearchExample: React.FC = () => {
  const {
    // 狀態
    results,
    total,
    page,
    limit,
    totalPages,
    currentQuery,
    currentFilters,
    currentSortBy,
    searchTime,
    suggestions,
    facets,
    isLoading,
    isInitializing,
    error,
    searchHistory,
    searchStats,
    searchIndexes,
    searchConfig,
    recentSearches,
    popularSearches,
    searchPreferences,
    isInitialized,

    // 計算屬性
    paginationInfo,
    searchSummary,
    hasActiveFilters,
    hasResults,
    isSearching,
    resultsStats,

    // 操作方法
    initialize,
    search,
    simpleSearch,
    setQuery,
    setFilters,
    updateFilters,
    setSort,
    setPageNumber,
    setLimitCount,
    clearResults,
    clearQuery,
    clearHistory,
    clearRecent,
    setSearchSuggestions,
    clearSearchSuggestions,
    setSearchError,
    clearSearchError,
    reset,
    getStats,
    updateIndex,
  } = useSearch();

  const [queryInput, setQueryInput] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    initializeSearch();
  }, []);

  const _initializeSearch = async () => {
    try {
      await initialize();
      Alert.alert('成功', '搜索服務初始化成功');
    } catch (error) {
      Alert.alert('錯誤', `初始化失敗: ${error}`);
    }
  };

  const _handleSearch = async () => {
    if (!queryInput.trim()) {
      Alert.alert('錯誤', '請輸入搜索查詢');
      return;
    }

    try {
      setQuery(queryInput);
      await simpleSearch(queryInput);
      setTestResults(prev => [
        ...prev,
        {
          test: '基本搜索',
          result: '成功',
          details: `搜索 "${queryInput}" 找到 ${total} 個結果，耗時 ${searchTime}ms`,
        },
      ]);
    } catch (error) {
      setTestResults(prev => [
        ...prev,
        {
          test: '基本搜索',
          result: '錯誤',
          details: `搜索失敗: ${error}`,
        },
      ]);
    }
  };

  const _testAdvancedSearch = async () => {
    try {
      const advancedQuery: SearchQuery = {
        query: 'pokemon',
        filters: {
          priceRange: { min: 100, max: 2000 },
          condition: ['near_mint', 'excellent'],
          rarity: ['Holo Rare', 'Ultra Rare'],
        },
        sortBy: { field: 'price', direction: 'desc' },
        page: 1,
        limit: 5,
      };

      await search(advancedQuery);
      setTestResults(prev => [
        ...prev,
        {
          test: '高級搜索',
          result: '成功',
          details: `高級搜索找到 ${total} 個結果，應用價格、條件、稀有度過濾器`,
        },
      ]);
    } catch (error) {
      setTestResults(prev => [
        ...prev,
        {
          test: '高級搜索',
          result: '錯誤',
          details: `高級搜索失敗: ${error}`,
        },
      ]);
    }
  };

  const _testSearchStats = async () => {
    try {
      const _stats = await getStats();
      setTestResults(prev => [
        ...prev,
        {
          test: '搜索統計',
          result: '成功',
          details: `總搜索次數: ${stats.totalSearches}, 平均響應時間: ${stats.averageResponseTime.toFixed(2)}ms`,
        },
      ]);
    } catch (error) {
      setTestResults(prev => [
        ...prev,
        {
          test: '搜索統計',
          result: '錯誤',
          details: `獲取統計失敗: ${error}`,
        },
      ]);
    }
  };

  const _testIndexUpdate = async () => {
    try {
      const _result = await updateIndex('cards');
      setTestResults(prev => [
        ...prev,
        {
          test: '索引更新',
          result: result ? '成功' : '失敗',
          details: `索引更新${result ? '成功' : '失敗'}`,
        },
      ]);
    } catch (error) {
      setTestResults(prev => [
        ...prev,
        {
          test: '索引更新',
          result: '錯誤',
          details: `索引更新失敗: ${error}`,
        },
      ]);
    }
  };

  const _testAllFeatures = async () => {
    setTestResults([]);
    await handleSearch();
    await testAdvancedSearch();
    await testSearchStats();
    await testIndexUpdate();

    setTestResults(prev => [
      ...prev,
      {
        test: '完整功能測試',
        result: '完成',
        details: '所有功能測試已完成',
      },
    ]);
  };

  const _clearTestResults = () => {
    setTestResults([]);
  };

  const _renderStatusIndicator = (status: boolean) => (
    <View
      style={[
        styles.statusIndicator,
        { backgroundColor: status ? '#4CAF50' : '#F44336' },
      ]}
    >
      <Text style={styles.statusText}>{status ? '✓' : '✗'}</Text>
    </View>
  );

  const _renderTestResult = (result: unknown, index: number) => (
    <View key={index} style={styles.testResult}>
      <View style={styles.testHeader}>
        <Text style={styles.testName}>{result.test}</Text>
        <Text
          style={[
            styles.testStatus,
            {
              color:
                result.result === '成功'
                  ? '#4CAF50'
                  : result.result === '錯誤'
                    ? '#F44336'
                    : '#FF9800',
            },
          ]}
        >
          {result.result}
        </Text>
      </View>
      <Text style={styles.testDetails}>{result.details}</Text>
    </View>
  );

  const _renderSearchResult = (result: unknown, index: number) => (
    <View key={index} style={styles.searchResult}>
      <Text style={styles.resultTitle}>{result.title}</Text>
      <Text style={styles.resultDescription}>{result.description}</Text>
      <View style={styles.resultMeta}>
        <Text style={styles.resultPrice}>${result.price}</Text>
        <Text style={styles.resultCondition}>{result.condition}</Text>
        <Text style={styles.resultRarity}>{result.rarity}</Text>
      </View>
      <Text style={styles.resultScore}>
        相關性: {(result.score * 100).toFixed(1)}%
      </Text>
    </View>
  );

  const _renderSearchSummary = () => {
    if (!searchSummary) return null;

    return (
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>📊 搜索摘要</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>總結果數</Text>
            <Text style={styles.summaryValue}>
              {searchSummary.totalResults}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>搜索時間</Text>
            <Text style={styles.summaryValue}>
              {searchSummary.searchTime}ms
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>當前頁面</Text>
            <Text style={styles.summaryValue}>
              {searchSummary.pagination.startIndex}-
              {searchSummary.pagination.endIndex}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>總頁數</Text>
            <Text style={styles.summaryValue}>{totalPages}</Text>
          </View>
        </View>
      </View>
    );
  };

  const _renderFacets = () => {
    if (!facets) return null;

    return (
      <View style={styles.facetsSection}>
        <Text style={styles.sectionTitle}>🔍 搜索分面</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.facetsContainer}>
            {facets.conditions
              ?.slice(0, 5)
              .map((facet: unknown, index: number) => (
                <View key={index} style={styles.facetItem}>
                  <Text style={styles.facetValue}>{facet.value}</Text>
                  <Text style={styles.facetCount}>({facet.count})</Text>
                </View>
              ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 全文搜索示例</Text>

      {/* 初始化控制 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 初始化控制</Text>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={initializeSearch}
            disabled={isInitializing}
          >
            {isInitializing ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>初始化</Text>
            )}
          </TouchableOpacity>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>狀態:</Text>
            {renderStatusIndicator(isInitialized)}
          </View>
        </View>
      </View>

      {/* 搜索控制 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔍 搜索控制</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder='輸入搜索查詢...'
            value={queryInput}
            onChangeText={setQueryInput}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={[styles.button, styles.searchButton]}
            onPress={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>搜索</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testAdvancedSearch}
            disabled={isSearching}
          >
            <Text style={styles.buttonText}>高級搜索</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testSearchStats}
            disabled={isSearching}
          >
            <Text style={styles.buttonText}>搜索統計</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testIndexUpdate}
            disabled={isSearching}
          >
            <Text style={styles.buttonText}>更新索引</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testAllFeatures}
            disabled={isSearching}
          >
            <Text style={styles.buttonText}>完整測試</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={clearResults}
          >
            <Text style={styles.buttonText}>清除結果</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={clearTestResults}
          >
            <Text style={styles.buttonText}>清除測試</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 搜索摘要 */}
      {renderSearchSummary()}

      {/* 搜索分面 */}
      {renderFacets()}

      {/* 搜索結果 */}
      {hasResults && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📋 搜索結果 ({results.length})
          </Text>
          {results.map(renderSearchResult)}
        </View>
      )}

      {/* 測試結果 */}
      {testResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 測試結果</Text>
          {testResults.map(renderTestResult)}
        </View>
      )}

      {/* 搜索統計 */}
      {searchStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 搜索統計</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>總搜索次數</Text>
              <Text style={styles.statValue}>{searchStats.totalSearches}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>平均響應時間</Text>
              <Text style={styles.statValue}>
                {searchStats.averageResponseTime.toFixed(2)}ms
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>轉化率</Text>
              <Text style={styles.statValue}>
                {(searchStats.userBehavior.conversionRate * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>跳出率</Text>
              <Text style={styles.statValue}>
                {(searchStats.userBehavior.bounceRate * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 最近搜索 */}
      {recentSearches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕒 最近搜索</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.recentContainer}>
              {recentSearches.map((query, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentItem}
                  onPress={() => {
                    setQueryInput(query);
                    handleSearch();
                  }}
                >
                  <Text style={styles.recentText}>{query}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* 熱門搜索 */}
      {popularSearches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 熱門搜索</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.popularContainer}>
              {popularSearches.slice(0, 5).map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.popularItem}
                  onPress={() => {
                    setQueryInput(item.query);
                    handleSearch();
                  }}
                >
                  <Text style={styles.popularText}>{item.query}</Text>
                  <Text style={styles.popularCount}>({item.count})</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* 錯誤顯示 */}
      {error && (
        <View style={styles.errorSection}>
          <Text style={styles.errorTitle}>❌ 錯誤</Text>
          <Text style={styles.errorMessage}>{error}</Text>
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    marginRight: 8,
    color: '#666',
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 8,
    minWidth: '48%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: '#757575',
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    minWidth: 'auto',
    paddingHorizontal: 20,
  },
  testButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  testResult: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  testStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  testDetails: {
    fontSize: 12,
    color: '#666',
  },
  searchResult: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
    marginBottom: 4,
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  resultCondition: {
    fontSize: 12,
    color: '#666',
  },
  resultRarity: {
    fontSize: 12,
    color: '#666',
  },
  resultScore: {
    fontSize: 12,
    color: '#2196F3',
  },
  summarySection: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  facetsSection: {
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  facetsContainer: {
    flexDirection: 'row',
  },
  facetItem: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  facetValue: {
    fontSize: 12,
    color: '#333',
    marginRight: 4,
  },
  facetCount: {
    fontSize: 12,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  recentContainer: {
    flexDirection: 'row',
  },
  recentItem: {
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
  },
  recentText: {
    fontSize: 12,
    color: '#1976d2',
  },
  popularContainer: {
    flexDirection: 'row',
  },
  popularItem: {
    backgroundColor: '#fff3e0',
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularText: {
    fontSize: 12,
    color: '#f57c00',
    marginRight: 4,
  },
  popularCount: {
    fontSize: 12,
    color: '#666',
  },
  errorSection: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#d32f2f',
  },
});

export default FullTextSearchExample;
