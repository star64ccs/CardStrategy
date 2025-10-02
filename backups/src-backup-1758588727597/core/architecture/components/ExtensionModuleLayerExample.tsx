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

import type {
  Plugin,
  Configuration,
  Rule,
  RuleContext,
} from '../ExtensionModuleLayer';
import { ExtensionModuleLayer } from '../ExtensionModuleLayer';

interface ComponentState {
  isInitialized: boolean;
  isLoading: boolean;
  plugins: Plugin[];
  configurations: Configuration[];
  rules: Rule[];
  testResults: {
    pluginTest: string;
    configTest: string;
    ruleTest: string;
    integrationTest: string;
  };
}

// 示例插件實現
class ExamplePlugin implements Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies: unknown[];
  enabled: boolean;

  constructor(id: string, name: string, version = '1.0.0') {
    this.id = id;
    this.name = name;
    this.version = version;
    this.description = '示例插件用於演示';
    this.author = 'CardStrategy Team';
    this.dependencies = [];
    this.enabled = false;
  }

  async load(): Promise<void> {
    this.enabled = true;
    console.log(`插件 ${this.name} 已加載`);
  }

  async unload(): Promise<void> {
    this.enabled = false;
    console.log(`插件 ${this.name} 已卸載`);
  }

  async execute(data: unknown): Promise<any> {
    return {
      result: 'success',
      pluginId: this.id,
      data: { ...data, processed: true },
      timestamp: new Date().toISOString(),
    };
  }
}

const ExtensionModuleLayerExample: React.FC = () => {
  const [state, setState] = useState<ComponentState>({
    isInitialized: false,
    isLoading: false,
    plugins: [],
    configurations: [],
    rules: [],
    testResults: {
      pluginTest: '',
      configTest: '',
      ruleTest: '',
      integrationTest: '',
    },
  });

  const _extensionLayer = ExtensionModuleLayer.getInstance();

  useEffect(() => {
    initializeLayer();
  }, []);

  const _initializeLayer = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await extensionLayer.initialize();
      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
      Alert.alert(
        '初始化失敗',
        error instanceof Error ? error.message : '未知錯誤'
      );
    }
  };

  const _testPluginManager = async () => {
    try {
      // 創建示例插件
      const _plugin1 = new ExamplePlugin('card-analyzer', '卡牌分析器');
      const _plugin2 = new ExamplePlugin('price-tracker', '價格追蹤器');

      // 註冊插件
      const _result1 =
        await extensionLayer.pluginManager.registerPlugin(plugin1);
      const _result2 =
        await extensionLayer.pluginManager.registerPlugin(plugin2);

      if (result1.success && result2.success) {
        // 啟用插件
        await extensionLayer.pluginManager.enablePlugin('card-analyzer');

        // 執行插件
        const _executionResult = await plugin1.execute({
          cardId: '123',
          action: 'analyze',
        });

        // 獲取所有插件
        const _allPlugins = extensionLayer.pluginManager.getAllPlugins();

        setState(prev => ({
          ...prev,
          plugins: allPlugins,
          testResults: {
            ...prev.testResults,
            pluginTest: `✅ 插件測試成功\n- 註冊: ${result1.pluginId}, ${result2.pluginId}\n- 執行結果: ${JSON.stringify(executionResult, null, 2)}`,
          },
        }));
      } else {
        throw new Error('插件註冊失敗');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        testResults: {
          ...prev.testResults,
          pluginTest: `❌ 插件測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        },
      }));
    }
  };

  const _testConfigurationManager = async () => {
    try {
      // 創建示例配置
      const config1: Configuration = {
        id: 'app-settings',
        name: '應用設置',
        version: '1.0.0',
        data: {
          theme: 'dark',
          language: 'zh-TW',
          notifications: true,
          autoSync: false,
        },
        environment: 'development',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const config2: Configuration = {
        id: 'api-config',
        name: 'API配置',
        version: '1.0.0',
        data: {
          baseUrl: 'https://api.cardstrategy.com',
          timeout: 30000,
          retryAttempts: 3,
        },
        environment: 'production',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 加載配置
      const _result1 =
        await extensionLayer.configurationManager.loadConfiguration(config1);
      const _result2 =
        await extensionLayer.configurationManager.loadConfiguration(config2);

      if (result1.success && result2.success) {
        // 更新配置
        const _updates = [
          {
            path: 'app-settings.theme',
            value: 'light',
            operation: 'set' as const,
          },
          {
            path: 'api-config.timeout',
            value: 60000,
            operation: 'set' as const,
          },
        ];

        const _updateResult =
          await extensionLayer.configurationManager.updateConfiguration(
            updates
          );

        // 創建備份
        const _backupResult =
          await extensionLayer.configurationManager.backupConfiguration();

        // 獲取所有配置
        const _allConfigs =
          extensionLayer.configurationManager.getAllConfigurations();

        setState(prev => ({
          ...prev,
          configurations: allConfigs,
          testResults: {
            ...prev.testResults,
            configTest: `✅ 配置測試成功\n- 加載: ${result1.configuration?.name}, ${result2.configuration?.name}\n- 更新: ${updateResult.updatedPaths.join(', ')}\n- 備份: ${backupResult.backupId}`,
          },
        }));
      } else {
        throw new Error('配置加載失敗');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        testResults: {
          ...prev.testResults,
          configTest: `❌ 配置測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        },
      }));
    }
  };

  const _testRuleEngine = async () => {
    try {
      // 創建示例規則
      const rule1: Rule = {
        id: 'price-alert',
        name: '價格警報規則',
        description: '當卡牌價格超過閾值時發送警報',
        condition: 'data.value > 100',
        action: "data.status = 'alert'",
        priority: 1,
        enabled: true,
        category: 'price',
        version: '1.0.0',
      };

      const rule2: Rule = {
        id: 'card-validation',
        name: '卡牌驗證規則',
        description: '驗證卡牌數據完整性',
        condition: "data.type === 'card'",
        action: "log('Card validated')",
        priority: 2,
        enabled: true,
        category: 'validation',
        version: '1.0.0',
      };

      // 創建規則
      const _result1 = await extensionLayer.ruleEngine.manageRules({
        type: 'create',
        rule: rule1,
      });
      const _result2 = await extensionLayer.ruleEngine.manageRules({
        type: 'create',
        rule: rule2,
      });

      if (result1.success && result2.success) {
        // 執行規則
        const context: RuleContext = {
          data: { value: 150, type: 'card', status: 'pending' },
          environment: 'test',
          timestamp: new Date(),
        };

        const _executionResult = await extensionLayer.ruleEngine.executeRules(
          [rule1, rule2],
          context
        );

        // 評估規則
        const _evaluationResult = extensionLayer.ruleEngine.evaluateRules(
          [rule1, rule2],
          { value: 200, type: 'card' }
        );

        // 檢測衝突
        const _conflictResult = extensionLayer.ruleEngine.detectRuleConflicts([
          rule1,
          rule2,
        ]);

        // 獲取所有規則
        const _allRules = extensionLayer.ruleEngine.getAllRules();

        setState(prev => ({
          ...prev,
          rules: allRules,
          testResults: {
            ...prev.testResults,
            ruleTest: `✅ 規則測試成功\n- 創建: ${result1.ruleId}, ${result2.ruleId}\n- 執行: ${executionResult.executedRules.join(', ')}\n- 匹配: ${evaluationResult.matchedRules.length} 個規則\n- 衝突: ${conflictResult.conflicts.length} 個`,
          },
        }));
      } else {
        throw new Error('規則創建失敗');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        testResults: {
          ...prev.testResults,
          ruleTest: `❌ 規則測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        },
      }));
    }
  };

  const _testIntegration = async () => {
    try {
      // 執行所有測試
      await testPluginManager();
      await testConfigurationManager();
      await testRuleEngine();

      // 驗證整合結果
      const _pluginCount = extensionLayer.pluginManager.getAllPlugins().length;
      const _configCount =
        extensionLayer.configurationManager.getAllConfigurations().length;
      const _ruleCount = extensionLayer.ruleEngine.getAllRules().length;

      setState(prev => ({
        ...prev,
        testResults: {
          ...prev.testResults,
          integrationTest: `✅ 整合測試成功\n- 插件數量: ${pluginCount}\n- 配置數量: ${configCount}\n- 規則數量: ${ruleCount}\n- 所有服務正常運行`,
        },
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        testResults: {
          ...prev.testResults,
          integrationTest: `❌ 整合測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        },
      }));
    }
  };

  const _runAllTests = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await testIntegration();
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const _renderStatus = () => (
    <View style={styles.statusContainer}>
      <Text style={styles.statusTitle}>ExtensionModuleLayer 狀態</Text>
      <Text
        style={[
          styles.statusText,
          { color: state.isInitialized ? '#4CAF50' : '#F44336' },
        ]}
      >
        {state.isInitialized ? '✅ 已初始化' : '❌ 未初始化'}
      </Text>
    </View>
  );

  const _renderTestButtons = () => (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.button}
        onPress={testPluginManager}
        disabled={!state.isInitialized || state.isLoading}
      >
        <Text style={styles.buttonText}>測試插件管理器</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={testConfigurationManager}
        disabled={!state.isInitialized || state.isLoading}
      >
        <Text style={styles.buttonText}>測試配置管理器</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={testRuleEngine}
        disabled={!state.isInitialized || state.isLoading}
      >
        <Text style={styles.buttonText}>測試規則引擎</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={runAllTests}
        disabled={!state.isInitialized || state.isLoading}
      >
        <Text style={styles.buttonText}>運行所有測試</Text>
      </TouchableOpacity>
    </View>
  );

  const _renderTestResults = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>測試結果</Text>

      {state.testResults.pluginTest && (
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>插件管理器:</Text>
          <Text style={styles.resultText}>{state.testResults.pluginTest}</Text>
        </View>
      )}

      {state.testResults.configTest && (
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>配置管理器:</Text>
          <Text style={styles.resultText}>{state.testResults.configTest}</Text>
        </View>
      )}

      {state.testResults.ruleTest && (
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>規則引擎:</Text>
          <Text style={styles.resultText}>{state.testResults.ruleTest}</Text>
        </View>
      )}

      {state.testResults.integrationTest && (
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>整合測試:</Text>
          <Text style={styles.resultText}>
            {state.testResults.integrationTest}
          </Text>
        </View>
      )}
    </View>
  );

  const _renderDataSummary = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>數據摘要</Text>

      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>插件數量:</Text>
        <Text style={styles.summaryValue}>{state.plugins.length}</Text>
      </View>

      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>配置數量:</Text>
        <Text style={styles.summaryValue}>{state.configurations.length}</Text>
      </View>

      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>規則數量:</Text>
        <Text style={styles.summaryValue}>{state.rules.length}</Text>
      </View>
    </View>
  );

  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#2196F3' />
        <Text style={styles.loadingText}>正在初始化...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ExtensionModuleLayer 示例</Text>

      {renderStatus()}
      {renderTestButtons()}
      {renderTestResults()}
      {renderDataSummary()}
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
  statusContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  resultItem: {
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 12,
    color: '#333',
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 4,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ExtensionModuleLayerExample;
