import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { GlobalCoreArchitecture } from '../GlobalCoreArchitecture';

interface ArchitectureStatus {
  initialized: boolean;
  services: {
    coreBusiness: boolean;
    security: boolean;
    dataModels: boolean;
    apiDesign: boolean;
  };
}

const GlobalCoreArchitectureExample: React.FC = () => {
  const [status, setStatus] = useState<ArchitectureStatus>({
    initialized: false,
    services: {
      coreBusiness: false,
      security: false,
      dataModels: false,
      apiDesign: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    initializeArchitecture();
  }, []);

  const _initializeArchitecture = async () => {
    setLoading(true);
    try {
      const _architecture = GlobalCoreArchitecture.getInstance();
      await architecture.initialize();

      setStatus({
        initialized: true,
        services: {
          coreBusiness: true,
          security: true,
          dataModels: true,
          apiDesign: true,
        },
      });

      addTestResult('✅ 架構InitializeSuccess', 'success');
    } catch (error) {
      addTestResult(`❌ 架構InitializeFailed: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const _addTestResult = (
    message: string,
    type: 'success' | 'error' | 'info'
  ) => {
    setTestResults(prev => [
      ...prev,
      {
        id: Date.now(),
        message,
        type,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const _testCoreBusinessService = async () => {
    try {
      const _architecture = GlobalCoreArchitecture.getInstance();
      const _service = architecture.getCoreBusinessService();

      const _operation = {
        id: 'test_operation',
        type: 'CREATE' as const,
        resource: 'user',
        data: { name: 'Test User', email: 'test@example.com' },
        context: {
          userId: 'user123',
          sessionId: 'session123',
          jurisdiction: 'GLOBAL',
          permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
          metadata: {},
        },
        timestamp: new Date(),
      };

      const _result = await service.processBusinessLogic(operation);
      addTestResult(`✅ 業務邏輯HandleSuccess: ${result.success}`, 'success');
    } catch (error) {
      addTestResult(`❌ 業務邏輯HandleFailed: ${error}`, 'error');
    }
  };

  const _testSecurityFramework = async () => {
    try {
      const _architecture = GlobalCoreArchitecture.getInstance();
      const _framework = architecture.getGlobalSecurityFramework();

      const _threats = [
        {
          id: 'threat1',
          type: 'MALWARE' as const,
          severity: 'HIGH' as const,
          source: 'unknown',
          target: 'system',
          timestamp: new Date(),
        },
      ];

      const _result = await framework.detectThreats(threats);
      addTestResult(
        `✅ 威脅檢測Success: 檢測到 ${result.detected.length} 個威脅`,
        'success'
      );
    } catch (error) {
      addTestResult(`❌ 威脅檢測Failed: ${error}`, 'error');
    }
  };

  const _testDataModels = async () => {
    try {
      const _architecture = GlobalCoreArchitecture.getInstance();
      const _dataModels = architecture.getGlobalDataModels();

      const _model = {
        id: 'test_model',
        name: '測試模型',
        fields: [
          {
            name: 'id',
            type: 'STRING' as const,
            required: true,
            sensitive: false,
          },
          {
            name: 'email',
            type: 'STRING' as const,
            required: true,
            sensitive: true,
          },
        ],
        validation: [],
        encryption: {
          enabled: true,
          algorithm: 'AES-256',
          keyRotation: true,
          rotationPeriod: 90,
        },
        retention: {
          period: 2555,
          action: 'DELETE' as const,
          compliance: ['GDPR'],
        },
      };

      const _result = await dataModels.defineDataModel(model);
      addTestResult(`✅ 數據模型定義Success: ${result.modelId}`, 'success');
    } catch (error) {
      addTestResult(`❌ 數據模型定義Failed: ${error}`, 'error');
    }
  };

  const _testAPIDesign = async () => {
    try {
      const _architecture = GlobalCoreArchitecture.getInstance();
      const _apiDesign = architecture.getGlobalAPIDesign();

      const _api = {
        name: 'Test API',
        version: '1.0.0',
        endpoints: [
          {
            path: '/api/test',
            method: 'GET' as const,
            parameters: [],
            responses: [{ code: 200, description: 'Success', schema: {} }],
            security: {
              authentication: true,
              authorization: true,
              encryption: true,
              audit: true,
            },
          },
        ],
        authentication: {
          type: 'JWT' as const,
          required: true,
          scopes: ['read'],
        },
        rateLimit: {
          requests: 100,
          window: 60,
          burst: 10,
        },
      };

      const _result = await apiDesign.designAPI(api);
      addTestResult(`✅ API設計Success: ${result.apiId}`, 'success');
    } catch (error) {
      addTestResult(`❌ API設計Failed: ${error}`, 'error');
    }
  };

  const _runAllTests = async () => {
    setTestResults([]);
    addTestResult('🚀 開始執行所有測試...', 'info');

    await testCoreBusinessService();
    await testSecurityFramework();
    await testDataModels();
    await testAPIDesign();

    addTestResult('✅ 所有測試完成', 'success');
  };

  const _clearResults = () => {
    setTestResults([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏗️ 全局核心架構示例</Text>

      {/* 架構Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 架構狀態</Text>
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>初始化狀態:</Text>
            <Text
              style={[
                styles.statusValue,
                status.initialized ? styles.success : styles.error,
              ]}
            >
              {status.initialized ? '✅ 已初始化' : '❌ 未初始化'}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>核心業務服務:</Text>
            <Text
              style={[
                styles.statusValue,
                status.services.coreBusiness ? styles.success : styles.error,
              ]}
            >
              {status.services.coreBusiness ? '✅ 運行中' : '❌ 未運行'}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>安全框架:</Text>
            <Text
              style={[
                styles.statusValue,
                status.services.security ? styles.success : styles.error,
              ]}
            >
              {status.services.security ? '✅ 運行中' : '❌ 未運行'}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>數據模型:</Text>
            <Text
              style={[
                styles.statusValue,
                status.services.dataModels ? styles.success : styles.error,
              ]}
            >
              {status.services.dataModels ? '✅ 運行中' : '❌ 未運行'}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>API設計:</Text>
            <Text
              style={[
                styles.statusValue,
                status.services.apiDesign ? styles.success : styles.error,
              ]}
            >
              {status.services.apiDesign ? '✅ 運行中' : '❌ 未運行'}
            </Text>
          </View>
        </View>
      </View>

      {/* Operation按鈕 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎮 操作測試</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={runAllTests}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>🚀 執行所有測試</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={testCoreBusinessService}
            disabled={loading}
          >
            <Text style={styles.buttonText}>💼 測試業務邏輯</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={testSecurityFramework}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🛡️ 測試安全框架</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={testDataModels}
            disabled={loading}
          >
            <Text style={styles.buttonText}>📊 測試數據模型</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={testAPIDesign}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🔌 測試API設計</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearResults}
          >
            <Text style={styles.buttonText}>🗑️ 清除結果</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Test結果 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 測試結果</Text>
        {testResults.length === 0 ? (
          <Text style={styles.noResults}>暫無測試結果</Text>
        ) : (
          <View style={styles.resultsContainer}>
            {testResults.map(result => (
              <View key={result.id} style={styles.resultItem}>
                <Text style={styles.resultTime}>{result.timestamp}</Text>
                <Text
                  style={[
                    styles.resultMessage,
                    result.type === 'success'
                      ? styles.successText
                      : result.type === 'error'
                        ? styles.errorText
                        : styles.infoText,
                  ]}
                >
                  {result.message}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
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
  statusContainer: {
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  success: {
    color: '#4CAF50',
  },
  error: {
    color: '#F44336',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: '#4CAF50',
  },
  clearButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noResults: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
  resultsContainer: {
    gap: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  resultTime: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
    minWidth: 60,
  },
  resultMessage: {
    fontSize: 14,
    flex: 1,
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#F44336',
  },
  infoText: {
    color: '#2196F3',
  },
});

export default GlobalCoreArchitectureExample;
