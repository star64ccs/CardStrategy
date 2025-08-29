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

import type { Rule, RuleContext } from '../ExtensionModuleLayer';
import { HybridArchitectureCore } from '../HybridArchitectureCore';

interface ArchitectureStatus {
  isInitialized: boolean;
  core: {
    businessService: boolean;
    securityFramework: boolean;
    dataModels: boolean;
    apiDesign: boolean;
  };
  adaptation: {
    jurisdictionDetector: boolean;
    regulationMapper: boolean;
    complianceEngine: boolean;
  };
  extensions: {
    pluginManager: boolean;
    configurationManager: boolean;
    ruleEngine: boolean;
  };
  monitoring: {
    performance: boolean;
    compliance: boolean;
    security: boolean;
  };
}

const HybridArchitectureCoreExample: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState<ArchitectureStatus | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const _hybridCore = HybridArchitectureCore.getInstance();

  useEffect(() => {
    updateStatus();
  }, []);

  const _updateStatus = () => {
    const _currentStatus = hybridCore.getArchitectureStatus();
    setStatus(currentStatus);
    setIsInitialized(currentStatus.isInitialized);
  };

  const _handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const _result = await hybridCore.initialize();
      if (result) {
        Alert.alert('成功', '混合架構核心初始化成功！');
        updateStatus();
      } else {
        Alert.alert('錯誤', '混合架構核心初始化失敗！');
      }
    } catch (error) {
      Alert.alert('錯誤', `初始化過程中發生錯誤: ${error}`);
    } finally {
      setIsInitializing(false);
    }
  };

  const _handleShutdown = async () => {
    try {
      await hybridCore.shutdown();
      Alert.alert('成功', '混合架構核心已關閉！');
      updateStatus();
    } catch (error) {
      Alert.alert('錯誤', `關閉過程中發生錯誤: ${error}`);
    }
  };

  const _testBusinessOperation = async () => {
    if (!isInitialized) {
      Alert.alert('錯誤', '請先初始化混合架構核心！');
      return;
    }

    setIsRunningTest(true);
    const results: unknown[] = [];

    try {
      // 測試業務操作
      const _operation = {
        type: 'card_analysis',
        data: {
          cardId: 'test_card_001',
          userId: 'user_001',
          action: 'analyze',
        },
      };

      const _context = {
        startTime: Date.now(),
        userId: 'user_001',
        sessionId: 'session_001',
        permissions: ['READ', 'ANALYZE'],
      };

      const _result = await hybridCore.executeBusinessOperation(
        operation,
        context
      );
      results.push({
        test: '業務操作執行',
        success: result.success,
        data: result,
      });

      // 測試性能監控
      const _performanceResult =
        await hybridCore.monitoring.performance.monitorPerformance([
          {
            id: 'test_performance',
            name: 'response_time',
            value: 150,
            unit: 'ms',
            timestamp: new Date(),
            category: 'api',
          },
        ]);
      results.push({
        test: '性能監控',
        success: performanceResult.success,
        data: performanceResult,
      });

      // 測試合規監控
      const _complianceResult =
        await hybridCore.monitoring.compliance.monitorCompliance([
          {
            id: 'test_compliance',
            regulation: 'GDPR',
            jurisdiction: 'EU',
            status: 'compliant',
            score: 85,
            timestamp: new Date(),
            details: '合規檢查通過',
          },
        ]);
      results.push({
        test: '合規監控',
        success: complianceResult.success,
        data: complianceResult,
      });

      // 測試安全監控
      const _securityResult =
        await hybridCore.monitoring.security.monitorSecurity([
          {
            id: 'test_security',
            type: 'authentication',
            status: 'secure',
            severity: 'low',
            timestamp: new Date(),
            details: '認證安全',
          },
        ]);
      results.push({
        test: '安全監控',
        success: securityResult.success,
        data: securityResult,
      });

      setTestResults(results);
      Alert.alert('成功', '所有測試完成！');
    } catch (error) {
      Alert.alert('錯誤', `測試過程中發生錯誤: ${error}`);
    } finally {
      setIsRunningTest(false);
    }
  };

  const _testIndividualComponents = async () => {
    if (!isInitialized) {
      Alert.alert('錯誤', '請先初始化混合架構核心！');
      return;
    }

    setIsRunningTest(true);
    const results: unknown[] = [];

    try {
      // 測試核心層
      const _coreTest =
        await hybridCore.core.businessLogic.processBusinessLogic({
          id: 'test-operation',
          type: 'PROCESS',
          data: 'test',
          context: {
            userId: 'test',
            permissions: ['test'],
            jurisdiction: 'GLOBAL',
            metadata: {},
          },
          resource: 'test',
          timestamp: new Date(),
        });
      results.push({
        test: '核心層 - 業務邏輯',
        success: coreTest.success,
        data: coreTest,
      });

      // 測試適配層
      const _adaptationTest = await hybridCore.adaptation.compliance('GLOBAL', {
        type: 'test',
        data: 'test',
      });
      results.push({
        test: '適配層 - 合規檢查',
        success: adaptationTest.overall === 'COMPLIANT',
        data: adaptationTest,
      });

      // 測試擴充層
      const testRule: Rule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'Test rule for demonstration',
        condition: 'true',
        action: 'console.log("Test rule executed")',
        priority: 1,
        enabled: true,
        category: 'test',
        version: '1.0.0',
      };

      const testContext: RuleContext = {
        data: { test: 'test' },
        environment: 'test',
        timestamp: new Date(),
      };

      const _extensionTest = await hybridCore.extensions.rules.executeRules(
        [testRule],
        testContext
      );
      results.push({
        test: '擴充層 - 規則引擎',
        success: extensionTest.success,
        data: extensionTest,
      });

      setTestResults(results);
      Alert.alert('成功', '組件測試完成！');
    } catch (error) {
      Alert.alert('錯誤', `組件測試過程中發生錯誤: ${error}`);
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
        <Text style={styles.testTitle}>{result.test}</Text>
        {renderStatusIndicator(result.success)}
      </View>
      <Text style={styles.testData}>
        {JSON.stringify(result.data, null, 2)}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏗️ 混合架構核心示例</Text>

      {/* 初始化控制 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 架構控制</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleInitialize}
            disabled={isInitializing || isInitialized}
          >
            {isInitializing ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>初始化架構</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleShutdown}
            disabled={!isInitialized}
          >
            <Text style={styles.buttonText}>關閉架構</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 架構狀態 */}
      {status && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 架構狀態</Text>

          <View style={styles.statusSection}>
            <Text style={styles.statusTitle}>核心層</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>業務邏輯</Text>
              {renderStatusIndicator(status.core.businessService)}
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>安全框架</Text>
              {renderStatusIndicator(status.core.securityFramework)}
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>數據模型</Text>
              {renderStatusIndicator(status.core.dataModels)}
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>API設計</Text>
              {renderStatusIndicator(status.core.apiDesign)}
            </View>
          </View>

          <View style={styles.statusSection}>
            <Text style={styles.statusTitle}>適配層</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>管轄區檢測</Text>
              {renderStatusIndicator(status.adaptation.jurisdictionDetector)}
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>法規映射</Text>
              {renderStatusIndicator(status.adaptation.regulationMapper)}
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>合規引擎</Text>
              {renderStatusIndicator(status.adaptation.complianceEngine)}
            </View>
          </View>

          <View style={styles.statusSection}>
            <Text style={styles.statusTitle}>擴充層</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>插件管理</Text>
              {renderStatusIndicator(status.extensions.pluginManager)}
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>配置管理</Text>
              {renderStatusIndicator(status.extensions.configurationManager)}
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>規則引擎</Text>
              {renderStatusIndicator(status.extensions.ruleEngine)}
            </View>
          </View>

          <View style={styles.statusSection}>
            <Text style={styles.statusTitle}>監控層</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>性能監控</Text>
              {renderStatusIndicator(status.monitoring.performance)}
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>合規監控</Text>
              {renderStatusIndicator(status.monitoring.compliance)}
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>安全監控</Text>
              {renderStatusIndicator(status.monitoring.security)}
            </View>
          </View>
        </View>
      )}

      {/* 測試控制 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 功能測試</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={testBusinessOperation}
            disabled={!isInitialized || isRunningTest}
          >
            {isRunningTest ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>測試業務操作</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.infoButton]}
            onPress={testIndividualComponents}
            disabled={!isInitialized || isRunningTest}
          >
            <Text style={styles.buttonText}>測試組件</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>清除結果</Text>
        </TouchableOpacity>
      </View>

      {/* 測試結果 */}
      {testResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 測試結果</Text>
          {testResults.map(renderTestResult)}
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  infoButton: {
    backgroundColor: '#00BCD4',
  },
  secondaryButton: {
    backgroundColor: '#9E9E9E',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statusSection: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 14,
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
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  testData: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default HybridArchitectureCoreExample;
