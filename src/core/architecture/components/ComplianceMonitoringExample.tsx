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

import type { ComplianceEvent, ComplianceRule } from '../ComplianceMonitoring';
import {
  ComplianceMonitoring,
  ComplianceEventType,
  ComplianceSeverity,
  ComplianceEventStatus,
  ComplianceCategory,
} from '../ComplianceMonitoring';

interface ComplianceReport {
  summary: {
    totalEvents: number;
    bySeverity: Record<ComplianceSeverity, number>;
    byStatus: Record<ComplianceEventStatus, number>;
    byType: Record<ComplianceEventType, number>;
    byJurisdiction: Record<string, number>;
    openViolations: number;
    resolvedViolations: number;
  };
  events: ComplianceEvent[];
  trends: {
    newEvents: number;
    resolvedEvents: number;
    averageResolutionTime: number;
    violationRate: number;
  };
  recommendations: unknown[];
  complianceScore: number;
}

const ComplianceMonitoringExample: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const _monitoring = ComplianceMonitoring.getInstance();

  useEffect(() => {
    updateReport();
  }, []);

  const _updateReport = () => {
    if (isInitialized) {
      const _currentReport = monitoring.getComplianceReport();
      setReport(currentReport);
    }
  };

  const _handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const _result = await monitoring.initialize();
      setIsInitialized(result);
      if (result) {
        updateReport();
        Alert.alert('Success', '合規監控InitializeSuccess');
      } else {
        Alert.alert('Error', '合規監控InitializeFailed');
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
      const _result = await monitoring.initialize();
      setTestResults(prev => [
        ...prev,
        {
          test: '初始化測試',
          result: result ? 'Success' : 'Failed',
          details: result ? '合規監控SuccessInitialize' : 'InitializeFailed',
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

  const _testEventMonitoring = async () => {
    setIsRunningTest(true);
    try {
      const event: ComplianceEvent = {
        id: `test_event_${Date.now()}`,
        timestamp: new Date(),
        eventType: ComplianceEventType.DATA_PROCESSING,
        severity: ComplianceSeverity.MEDIUM,
        source: 'test_source',
        description: '測試數據處理事件',
        details: { dataType: 'user_data' },
        jurisdiction: 'EU',
        regulation: 'GDPR',
        status: ComplianceEventStatus.OPEN,
        metadata: {
          tags: ['test', 'data-processing'],
        },
      };

      monitoring.monitorEvent(event);
      setTestResults(prev => [
        ...prev,
        {
          test: '事件監控測試',
          result: 'Success',
          details: `監控事件: ${event.description}`,
        },
      ]);
      updateReport();
    } catch (error) {
      setTestResults(prev => [
        ...prev,
        {
          test: '事件監控測試',
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
      const _currentReport = monitoring.getComplianceReport();
      setTestResults(prev => [
        ...prev,
        {
          test: '報告生成測試',
          result: 'Success',
          details: `生成報告包含 ${currentReport.summary.totalEvents} 個事件，合規分數: ${currentReport.complianceScore}`,
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

  const _testAlertManagement = async () => {
    setIsRunningTest(true);
    try {
      const _alerts = monitoring.getAlerts();
      const _unacknowledgedAlerts = monitoring.getUnacknowledgedAlerts();

      let acknowledgedCount = 0;
      if (unacknowledgedAlerts.length > 0) {
        const _alertId = unacknowledgedAlerts[0].id;
        const _result = monitoring.acknowledgeAlert(alertId, 'test_user');
        if (result) acknowledgedCount = 1;
      }

      setTestResults(prev => [
        ...prev,
        {
          test: '警報管理測試',
          result: 'Success',
          details: `總警報: ${alerts.length}, 未確認: ${unacknowledgedAlerts.length}, 已確認: ${acknowledgedCount}`,
        },
      ]);
    } catch (error) {
      setTestResults(prev => [
        ...prev,
        {
          test: '警報管理測試',
          result: 'Error',
          details: `發生Error: ${error}`,
        },
      ]);
    } finally {
      setIsRunningTest(false);
    }
  };

  const _testAuditLog = async () => {
    setIsRunningTest(true);
    try {
      const _auditLog = monitoring.getAuditLog();
      const _jsonExport = monitoring.exportAuditLog('json');
      const _csvExport = monitoring.exportAuditLog('csv');

      setTestResults(prev => [
        ...prev,
        {
          test: '審計日誌測試',
          result: 'Success',
          details: `審計日誌: ${auditLog.length} 條記錄, JSON: ${jsonExport.length} 字符, CSV: ${csvExport.length} 字符`,
        },
      ]);
    } catch (error) {
      setTestResults(prev => [
        ...prev,
        {
          test: '審計日誌測試',
          result: 'Error',
          details: `發生Error: ${error}`,
        },
      ]);
    } finally {
      setIsRunningTest(false);
    }
  };

  const _testRuleManagement = async () => {
    setIsRunningTest(true);
    try {
      const rule: ComplianceRule = {
        id: `test_rule_${Date.now()}`,
        name: '測試合規規則',
        description: '測試合規規則描述',
        regulation: 'TEST_REGULATION',
        jurisdiction: 'TEST_JURISDICTION',
        category: ComplianceCategory.PRIVACY,
        conditions: [
          {
            field: 'eventType',
            operator: 'equals',
            value: ComplianceEventType.DATA_PROCESSING,
          },
        ],
        actions: [
          {
            type: 'ALERT',
            parameters: { message: '測試警報' },
          },
        ],
        enabled: true,
        priority: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      monitoring.addRule(rule);
      const _rules = monitoring.getRules();
      const _result = monitoring.removeRule(rule.id);

      setTestResults(prev => [
        ...prev,
        {
          test: '規則管理測試',
          result: 'Success',
          details: `添加規則: ${rule.name}, 總規則: ${rules.length}, 刪除結果: ${result}`,
        },
      ]);
    } catch (error) {
      setTestResults(prev => [
        ...prev,
        {
          test: '規則管理測試',
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
      await testEventMonitoring();
      await testReportGeneration();
      await testAlertManagement();
      await testAuditLog();
      await testRuleManagement();

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
        <Text style={styles.sectionTitle}>📊 合規監控報告摘要</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>總事件數</Text>
            <Text style={styles.summaryValue}>
              {report.summary.totalEvents}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>開放違規</Text>
            <Text style={styles.summaryValue}>
              {report.summary.openViolations}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>已解決違規</Text>
            <Text style={styles.summaryValue}>
              {report.summary.resolvedViolations}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>合規分數</Text>
            <Text style={styles.summaryValue}>{report.complianceScore}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🛡️ 合規監控示例</Text>

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
            onPress={testEventMonitoring}
            disabled={isRunningTest || !isInitialized}
          >
            <Text style={styles.buttonText}>監控測試</Text>
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
            onPress={testAlertManagement}
            disabled={isRunningTest || !isInitialized}
          >
            <Text style={styles.buttonText}>警報測試</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testAuditLog}
            disabled={isRunningTest || !isInitialized}
          >
            <Text style={styles.buttonText}>審計測試</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testRuleManagement}
            disabled={isRunningTest || !isInitialized}
          >
            <Text style={styles.buttonText}>規則測試</Text>
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

          <Text style={styles.subsectionTitle}>按嚴重性分佈</Text>
          {Object.entries(report.summary.bySeverity).map(
            ([severity, count]) => (
              <View key={severity} style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>{severity}:</Text>
                <Text style={styles.distributionValue}>{count}</Text>
              </View>
            )
          )}

          <Text style={styles.subsectionTitle}>按狀態分佈</Text>
          {Object.entries(report.summary.byStatus).map(([status, count]) => (
            <View key={status} style={styles.distributionRow}>
              <Text style={styles.distributionLabel}>{status}:</Text>
              <Text style={styles.distributionValue}>{count}</Text>
            </View>
          ))}

          <Text style={styles.subsectionTitle}>按類型分佈</Text>
          {Object.entries(report.summary.byType).map(([type, count]) => (
            <View key={type} style={styles.distributionRow}>
              <Text style={styles.distributionLabel}>{type}:</Text>
              <Text style={styles.distributionValue}>{count}</Text>
            </View>
          ))}

          <Text style={styles.subsectionTitle}>趨勢分析</Text>
          <View style={styles.trendsGrid}>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>新增事件</Text>
              <Text style={styles.trendValue}>{report.trends.newEvents}</Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>已解決</Text>
              <Text style={styles.trendValue}>
                {report.trends.resolvedEvents}
              </Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>平均解決時間</Text>
              <Text style={styles.trendValue}>
                {report.trends.averageResolutionTime.toFixed(1)}天
              </Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>違規率</Text>
              <Text style={styles.trendValue}>
                {report.trends.violationRate.toFixed(1)}%
              </Text>
            </View>
          </View>

          <Text style={styles.subsectionTitle}>
            建議 ({report.recommendations.length})
          </Text>
          {report.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationType}>{rec.type}</Text>
              <Text style={styles.recommendationTitle}>{rec.title}</Text>
              <Text style={styles.recommendationDescription}>
                {rec.description}
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
    color: '#2196F3',
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
    color: '#FF9800',
    marginBottom: 4,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  recommendationDetails: {
    fontSize: 12,
    color: '#666',
  },
});

export default ComplianceMonitoringExample;
