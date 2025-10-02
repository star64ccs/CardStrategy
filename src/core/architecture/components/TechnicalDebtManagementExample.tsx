import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import type {
  TechnicalDebtSeverity,
  TechnicalDebtCategory,
  TechnicalDebtResolution,
} from '../TechnicalDebtManagement';
import {
  TechnicalDebtManagement,
  TechnicalDebtStatus,
} from '../TechnicalDebtManagement';

interface TechnicalDebtReport {
  summary: {
    totalItems: number;
    byStatus: Record<TechnicalDebtStatus, number>;
    bySeverity: Record<TechnicalDebtSeverity, number>;
    byCategory: Record<TechnicalDebtCategory, number>;
    totalEffort: number;
    totalCost: number;
  };
  items: unknown[];
  trends: {
    newItems: number;
    resolvedItems: number;
    averageResolutionTime: number;
    debtGrowthRate: number;
  };
  recommendations: unknown[];
}

const TechnicalDebtManagementExample: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [report, setReport] = useState<TechnicalDebtReport | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const _management = TechnicalDebtManagement.getInstance();

  useEffect(() => {
    updateReport();
  }, []);

  const _updateReport = () => {
    if (isInitialized) {
      const _currentReport = management.getTechnicalDebtReport();
      setReport(currentReport);
    }
  };

  const _handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const _result = await management.initialize();
      setIsInitialized(result);
      if (result) {
        updateReport();
        Alert.alert('Success', '技術債務管理InitializeSuccess');
      } else {
        Alert.alert('Error', '技術債務管理InitializeFailed');
      }
    } catch (error) {
      Alert.alert('Error', `Initialize過程中發生Error: ${error}`);
    } finally {
      setIsInitializing(false);
    }
  };

  const _testInitialization = async () => {
    setIsRunningTest(true);
    try {
      const _result = await management.initialize();
      setTestResults(prev => [
        ...prev,
        {
          test: '初始化測試',
          result: result ? 'Success' : 'Failed',
          details: result ? '技術債務管理SuccessInitialize' : 'InitializeFailed',
        },
      ]);
    } catch (error) {
      setTestResults(prev => [
        ...prev,
        {
          test: '初始化測試',
          result: 'Error',
          details: `發生Error: ${error}`,
        },
      ]);
    } finally {
      setIsRunningTest(false);
    }
  };

  const _testScanForNewIssues = async () => {
    setIsRunningTest(true);
    try {
      const _newIssues = await management.scanForNewIssues();
      setTestResults(prev => [
        ...prev,
        {
          test: '掃描新問題測試',
          result: 'Success',
          details: `發現 ${newIssues.length} 個新問題`,
        },
      ]);
      updateReport();
    } catch (error) {
      setTestResults(prev => [
        ...prev,
        {
          test: '掃描新問題測試',
          result: 'Error',
          details: `發生Error: ${error}`,
        },
      ]);
    } finally {
      setIsRunningTest(false);
    }
  };

  const _testReportGeneration = async () => {
    setIsRunningTest(true);
    try {
      const _currentReport = management.getTechnicalDebtReport();
      setTestResults(prev => [
        ...prev,
        {
          test: '報告生成測試',
          result: 'Success',
          details: `生成報告包含 ${currentReport.summary.totalItems} 個項目`,
        },
      ]);
    } catch (error) {
      setTestResults(prev => [
        ...prev,
        {
          test: '報告生成測試',
          result: 'Error',
          details: `發生Error: ${error}`,
        },
      ]);
    } finally {
      setIsRunningTest(false);
    }
  };

  const _testItemManagement = async () => {
    setIsRunningTest(true);
    try {
      const _currentReport = management.getTechnicalDebtReport();
      if (currentReport.items.length > 0) {
        const _itemId = currentReport.items[0].id;

        // TestUpdateStatus
        const _statusResult = management.updateItemStatus(
          itemId,
          TechnicalDebtStatus.IN_PROGRESS
        );

        // Test分配項目
        const _assignResult = management.assignItem(itemId, 'developer1');

        // TestAddResolve方案
        const resolution: TechnicalDebtResolution = {
          approach: '重構代碼',
          steps: ['分析問題', '設計解決方案', '實施修復'],
          resources: ['開發者', '測試工具'],
          timeline: 5,
          cost: 1000,
          risks: ['可能引入新bug'],
          benefits: ['提高代碼質量'],
        };
        const _resolutionResult = management.addResolution(itemId, resolution);

        setTestResults(prev => [
          ...prev,
          {
            test: '項目管理測試',
            result: 'Success',
            details: `狀態更新: ${statusResult}, 分配: ${assignResult}, 解決方案: ${resolutionResult}`,
          },
        ]);
        updateReport();
      } else {
        setTestResults(prev => [
          ...prev,
          {
            test: '項目管理測試',
            result: '跳過',
            details: '沒有可用的項目進行測試',
          },
        ]);
      }
    } catch (error) {
      setTestResults(prev => [
        ...prev,
        {
          test: '項目管理測試',
          result: 'Error',
          details: `發生Error: ${error}`,
        },
      ]);
    } finally {
      setIsRunningTest(false);
    }
  };

  const _testRecommendations = async () => {
    setIsRunningTest(true);
    try {
      const _recommendations = management.getRecommendations();
      const _ratio = management.calculateTechnicalDebtRatio();

      setTestResults(prev => [
        ...prev,
        {
          test: '建議和指標測試',
          result: 'Success',
          details: `獲取 ${recommendations.length} 個建議, 技術債務比率: ${ratio.toFixed(2)}%`,
        },
      ]);
    } catch (error) {
      setTestResults(prev => [
        ...prev,
        {
          test: '建議和指標測試',
          result: 'Error',
          details: `發生Error: ${error}`,
        },
      ]);
    } finally {
      setIsRunningTest(false);
    }
  };

  const _testAllFeatures = async () => {
    setIsRunningTest(true);
    try {
      await testInitialization();
      await testScanForNewIssues();
      await testReportGeneration();
      await testItemManagement();
      await testRecommendations();

      setTestResults(prev => [
        ...prev,
        {
          test: '完整功能測試',
          result: '完成',
          details: '所有功能測試已完成',
        },
      ]);
    } catch (error) {
      setTestResults(prev => [
        ...prev,
        {
          test: '完整功能測試',
          result: 'Error',
          details: `發生Error: ${error}`,
        },
      ]);
    } finally {
      setIsRunningTest(false);
    }
  };

  const _clearResults = () => {
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
                result.result === 'Success'
                  ? '#4CAF50'
                  : result.result === 'Error'
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

  const _renderReportSummary = () => {
    if (!report) return null;

    return (
      <View style={styles.reportSection}>
        <Text style={styles.sectionTitle}>📊 技術債務報告摘要</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>總項目數</Text>
            <Text style={styles.summaryValue}>{report.summary.totalItems}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>總工作量</Text>
            <Text style={styles.summaryValue}>
              {report.summary.totalEffort}h
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>總成本</Text>
            <Text style={styles.summaryValue}>${report.summary.totalCost}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>新增項目</Text>
            <Text style={styles.summaryValue}>{report.trends.newItems}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔧 技術債務管理示例</Text>

      {/* InitializeControl */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 初始化控制</Text>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleInitialize}
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

      {/* Report摘要 */}
      {renderReportSummary()}

      {/* TestControl */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 功能測試</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testInitialization}
            disabled={isRunningTest}
          >
            <Text style={styles.buttonText}>初始化測試</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testScanForNewIssues}
            disabled={isRunningTest || !isInitialized}
          >
            <Text style={styles.buttonText}>掃描測試</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testReportGeneration}
            disabled={isRunningTest || !isInitialized}
          >
            <Text style={styles.buttonText}>報告測試</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testItemManagement}
            disabled={isRunningTest || !isInitialized}
          >
            <Text style={styles.buttonText}>管理測試</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testRecommendations}
            disabled={isRunningTest || !isInitialized}
          >
            <Text style={styles.buttonText}>建議測試</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testAllFeatures}
            disabled={isRunningTest}
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
        </View>
      </View>

      {/* Test結果 */}
      {testResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 測試結果</Text>
          {testResults.map(renderTestResult)}
        </View>
      )}

      {/* 詳細Report */}
      {report && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 詳細報告</Text>

          <Text style={styles.subsectionTitle}>按狀態分佈</Text>
          {Object.entries(report.summary.byStatus).map(([status, count]) => (
            <View key={status} style={styles.distributionRow}>
              <Text style={styles.distributionLabel}>{status}:</Text>
              <Text style={styles.distributionValue}>{count}</Text>
            </View>
          ))}

          <Text style={styles.subsectionTitle}>按嚴重性分佈</Text>
          {Object.entries(report.summary.bySeverity).map(
            ([severity, count]) => (
              <View key={severity} style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>{severity}:</Text>
                <Text style={styles.distributionValue}>{count}</Text>
              </View>
            )
          )}

          <Text style={styles.subsectionTitle}>趨勢分析</Text>
          <View style={styles.trendsGrid}>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>新增項目</Text>
              <Text style={styles.trendValue}>{report.trends.newItems}</Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>已解決</Text>
              <Text style={styles.trendValue}>
                {report.trends.resolvedItems}
              </Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>平均解決時間</Text>
              <Text style={styles.trendValue}>
                {report.trends.averageResolutionTime.toFixed(1)}天
              </Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>債務增長率</Text>
              <Text style={styles.trendValue}>
                {report.trends.debtGrowthRate.toFixed(1)}%
              </Text>
            </View>
          </View>

          <Text style={styles.subsectionTitle}>
            建議 ({report.recommendations.length})
          </Text>
          {report.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationType}>{rec.type}</Text>
              <Text style={styles.recommendationRationale}>
                {rec.rationale}
              </Text>
              <Text style={styles.recommendationDetails}>
                預期影響: {rec.expectedImpact} | 預估工作量:{' '}
                {rec.estimatedEffort}h
              </Text>
            </View>
          ))}
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#555',
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
  testButton: {
    backgroundColor: '#4CAF50',
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
  reportSection: {
    backgroundColor: '#e3f2fd',
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
    color: '#2196F3',
  },
  distributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  distributionLabel: {
    fontSize: 14,
    color: '#666',
  },
  distributionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  trendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trendItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  trendValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  recommendationItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  recommendationType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  recommendationRationale: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  recommendationDetails: {
    fontSize: 12,
    color: '#666',
  },
});

export default TechnicalDebtManagementExample;
