/**
 * DataHandle示例Component
 * 展示DataHandleService的功能和性能Monitor
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useDataProcessing } from '../hooks/useDataProcessing';
import {
  CacheStrategy,
  DataPriority,
  ProcessingStrategy,
} from '../types/processing';

/**
 * 示例DataHandle器
 */
class ExampleProcessor {
  name = 'ExampleProcessor';

  async process(data: unknown, config: unknown) {
    // 模擬Handle延遲
    await new Promise(resolve =>
      setTimeout(resolve, Math.random() * 1000 + 500)
    );

    return {
      success: true,
      data: {
        processed: data,
        timestamp: Date.now(),
        processor: 'ExampleProcessor',
      },
      processingTime: Math.random() * 500 + 200,
      memoryUsage: Math.random() * 20 + 10,
      cacheHit: false,
      compressionRatio: 0.8,
      metadata: {
        processor: 'ExampleProcessor',
        version: '1.0.0',
        timestamp: Date.now(),
      },
    };
  }
}

/**
 * DataHandle示例Component
 */
export const DataProcessingExample: React.FC = () => {
  const {
    isInitialized,
    isProcessing,
    error,
    metrics,
    cacheStats,
    queueStats,
    successRate,
    averageTaskTime,
    isHealthy,
    performanceScore,
    processData,
    processBatch,
    registerProcessor,
    setStrategy,
    setPriority,
    setCacheStrategy,
    setCompression,
    setBatchSize,
    setMaxConcurrency,
    clearCache,
    resetService,
    clearError,
  } = useDataProcessing();

  const [testData, setTestData] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<ProcessingStrategy>(
    ProcessingStrategy.PARALLEL
  );
  const [selectedPriority, setSelectedPriority] = useState<DataPriority>(
    DataPriority.NORMAL
  );
  const [selectedCacheStrategy, setSelectedCacheStrategy] =
    useState<CacheStrategy>(CacheStrategy.HYBRID);

  useEffect(() => {
    // Register示例Handle器
    if (isInitialized) {
      registerProcessor('example-processor', new ExampleProcessor());
    }
  }, [isInitialized, registerProcessor]);

  const _generateTestData = (count: number) => {
    const _data = Array.from({ length: count }, (_, i) => ({
      id: i,
      name: `測試數據 ${i}`,
      value: Math.random() * 1000,
      timestamp: Date.now(),
    }));
    setTestData(data);
  };

  const _handleSingleProcess = async () => {
    if (!testData.length) {
      Alert.alert('Error', '請先生成測試數據');
      return;
    }

    try {
      const _result = await processData(testData[0], 'example-processor', {
        strategy: selectedStrategy,
        priority: selectedPriority,
        cacheStrategy: selectedCacheStrategy,
      });

      setResults([result]);
      Alert.alert('Success', '單個數據處理完成');
    } catch (error) {
      Alert.alert('Error', `HandleFailed: ${error}`);
    }
  };

  const _handleBatchProcess = async () => {
    if (!testData.length) {
      Alert.alert('Error', '請先生成測試數據');
      return;
    }

    try {
      const _results = await processBatch(testData, 'example-processor', {
        strategy: selectedStrategy,
        priority: selectedPriority,
        cacheStrategy: selectedCacheStrategy,
      });

      setResults(results);
      Alert.alert('Success', `批量處理完成: ${results.length} 個項目`);
    } catch (error) {
      Alert.alert('Error', `批量HandleFailed: ${error}`);
    }
  };

  const _handleClearCache = async () => {
    try {
      await clearCache();
      Alert.alert('Success', '緩存已清理');
    } catch (error) {
      Alert.alert('Error', `清理緩存Failed: ${error}`);
    }
  };

  const _handleResetService = async () => {
    try {
      await resetService();
      Alert.alert('Success', 'Service已重置');
    } catch (error) {
      Alert.alert('Error', `重置ServiceFailed: ${error}`);
    }
  };

  const _formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const _k = 1024;
    const _sizes = ['B', 'KB', 'MB', 'GB'];
    const _i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const _formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>初始化數據處理服務...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>數據處理服務示例</Text>

      {/* Status指示器 */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: isHealthy ? '#4CAF50' : '#F44336' },
          ]}
        >
          <Text style={styles.statusText}>{isHealthy ? '健康' : '異常'}</Text>
        </View>
        <Text style={styles.performanceScore}>
          性能評分: {performanceScore.toFixed(1)}/100
        </Text>
      </View>

      {/* ErrorShow */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>錯誤: {error}</Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearError}>
            <Text style={styles.clearButtonText}>清除</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 性能指標 */}
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>性能指標</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>總任務數</Text>
            <Text style={styles.metricValue}>{metrics.totalTasks}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>成功率</Text>
            <Text style={styles.metricValue}>{successRate.toFixed(1)}%</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>平均處理時間</Text>
            <Text style={styles.metricValue}>
              {formatTime(averageTaskTime)}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>吞吐量</Text>
            <Text style={styles.metricValue}>
              {metrics.throughput.toFixed(2)}/s
            </Text>
          </View>
        </View>
      </View>

      {/* CacheStatistics */}
      <View style={styles.cacheContainer}>
        <Text style={styles.sectionTitle}>緩存統計</Text>
        <View style={styles.cacheStats}>
          <Text style={styles.cacheText}>
            命中率: {(cacheStats.hitRate * 100).toFixed(1)}%
          </Text>
          <Text style={styles.cacheText}>
            大小: {formatBytes(cacheStats.size)} /{' '}
            {formatBytes(cacheStats.maxSize)}
          </Text>
          <Text style={styles.cacheText}>項目數: {cacheStats.items}</Text>
        </View>
      </View>

      {/* QueueStatistics */}
      <View style={styles.queueContainer}>
        <Text style={styles.sectionTitle}>隊列統計</Text>
        <View style={styles.queueStats}>
          <Text style={styles.queueText}>
            活動任務: {queueStats.activeTasks}
          </Text>
          <Text style={styles.queueText}>
            等待任務: {queueStats.pendingTasks}
          </Text>
          <Text style={styles.queueText}>
            完成任務: {queueStats.completedTasks}
          </Text>
          <Text style={styles.queueText}>
            失敗任務: {queueStats.failedTasks}
          </Text>
        </View>
      </View>

      {/* ConfigureSettings */}
      <View style={styles.configContainer}>
        <Text style={styles.sectionTitle}>處理配置</Text>

        {/* 策略Select */}
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>處理策略:</Text>
          <View style={styles.buttonGroup}>
            {Object.values(ProcessingStrategy).map(strategy => (
              <TouchableOpacity
                key={strategy}
                style={[
                  styles.configButton,
                  selectedStrategy === strategy && styles.configButtonActive,
                ]}
                onPress={() => {
                  setSelectedStrategy(strategy);
                  setStrategy(strategy);
                }}
              >
                <Text
                  style={[
                    styles.configButtonText,
                    selectedStrategy === strategy &&
                      styles.configButtonTextActive,
                  ]}
                >
                  {strategy}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 優先級Select */}
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>優先級:</Text>
          <View style={styles.buttonGroup}>
            {Object.values(DataPriority).map(priority => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.configButton,
                  selectedPriority === priority && styles.configButtonActive,
                ]}
                onPress={() => {
                  setSelectedPriority(priority);
                  setPriority(priority);
                }}
              >
                <Text
                  style={[
                    styles.configButtonText,
                    selectedPriority === priority &&
                      styles.configButtonTextActive,
                  ]}
                >
                  {priority}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cache策略Select */}
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>緩存策略:</Text>
          <View style={styles.buttonGroup}>
            {Object.values(CacheStrategy).map(strategy => (
              <TouchableOpacity
                key={strategy}
                style={[
                  styles.configButton,
                  selectedCacheStrategy === strategy &&
                    styles.configButtonActive,
                ]}
                onPress={() => {
                  setSelectedCacheStrategy(strategy);
                  setCacheStrategy(strategy);
                }}
              >
                <Text
                  style={[
                    styles.configButtonText,
                    selectedCacheStrategy === strategy &&
                      styles.configButtonTextActive,
                  ]}
                >
                  {strategy}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Operation按鈕 */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>操作</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => generateTestData(10)}
          >
            <Text style={styles.actionButtonText}>生成測試數據 (10)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => generateTestData(100)}
          >
            <Text style={styles.actionButtonText}>生成測試數據 (100)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleSingleProcess}
            disabled={isProcessing}
          >
            <Text style={styles.actionButtonText}>
              {isProcessing ? '處理中...' : '單個處理'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleBatchProcess}
            disabled={isProcessing}
          >
            <Text style={styles.actionButtonText}>
              {isProcessing ? '處理中...' : '批量處理'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleClearCache}
          >
            <Text style={styles.actionButtonText}>清理緩存</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleResetService}
          >
            <Text style={styles.actionButtonText}>重置服務</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 結果Show */}
      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>處理結果</Text>
          <Text style={styles.resultsText}>
            成功: {results.filter(r => r.success).length} / {results.length}
          </Text>
          <Text style={styles.resultsText}>
            平均處理時間:{' '}
            {formatTime(
              results.reduce((sum, r) => sum + r.processingTime, 0) /
                results.length
            )}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  performanceScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#C62828',
    flex: 1,
  },
  clearButton: {
    backgroundColor: '#C62828',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 12,
  },
  metricsContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cacheContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cacheStats: {
    gap: 8,
  },
  cacheText: {
    fontSize: 14,
    color: '#333',
  },
  queueContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  queueStats: {
    gap: 8,
  },
  queueText: {
    fontSize: 14,
    color: '#333',
  },
  configContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  configItem: {
    marginBottom: 16,
  },
  configLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  configButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  configButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  configButtonText: {
    fontSize: 12,
    color: '#666',
  },
  configButtonTextActive: {
    color: '#FFF',
  },
  actionsContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#FF9500',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultsContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
});
