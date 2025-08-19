import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput
} from 'react-native';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { ConflictResolutionStrategy } from '@/utils/backgroundSyncManager';

interface ConflictResolutionPanelProps {
  showDetails?: boolean;
}

export const ConflictResolutionPanel: React.FC<ConflictResolutionPanelProps> = ({
  showDetails = false
}) => {
  const {
    conflictResolutionConfig,
    updateConflictResolutionConfig,
    addCustomResolver,
    removeCustomResolver,
    testConflictResolution,
    setConflictResolutionStrategy,
    tasks
  } = useBackgroundSync();

  const [testClientData, setTestClientData] = useState('{"name": "Client", "value": 100}');
  const [testServerData, setTestServerData] = useState('{"name": "Server", "value": 200}');
  const [testStrategy, setTestStrategy] = useState<ConflictResolutionStrategy>('merge');
  const [testResult, setTestResult] = useState<any>(null);
  const [customResolverKey, setCustomResolverKey] = useState('');
  const [customResolverCode, setCustomResolverCode] = useState('');

  const strategies: ConflictResolutionStrategy[] = [
    'server-wins',
    'client-wins',
    'merge',
    'timestamp-based',
    'field-level',
    'version-based',
    'user-choice',
    'custom'
  ];

  const strategyLabels: Record<ConflictResolutionStrategy, string> = {
    'server-wins': '服務器優先',
    'client-wins': '客戶端優先',
    'merge': '智能合併',
    'timestamp-based': '基於時間戳',
    'field-level': '字段級別合併',
    'version-based': '基於版本號',
    'user-choice': '用戶選擇',
    'custom': '自定義策略'
  };

  // 處理測試衝突解決
  const handleTestConflictResolution = async () => {
    try {
      let clientData, serverData;

      try {
        clientData = JSON.parse(testClientData);
        serverData = JSON.parse(testServerData);
      } catch (error) {
        Alert.alert('錯誤', '請輸入有效的 JSON 數據');
        return;
      }

      const result = await testConflictResolution(clientData, serverData, testStrategy);
      setTestResult(result);
      Alert.alert('成功', '衝突解決測試完成');
    } catch (error) {
      Alert.alert('錯誤', `測試失敗: ${  error}`);
    }
  };

  // 處理添加自定義解析器
  const handleAddCustomResolver = () => {
    if (!customResolverKey.trim()) {
      Alert.alert('錯誤', '請輸入解析器鍵名');
      return;
    }

    try {
      // 創建一個簡單的解析器函數
      const resolver = (client: any, server: any) => {
        // 這裡可以根據 customResolverCode 創建更複雜的邏輯
        return { ...client, ...server, resolvedBy: 'custom' };
      };

      addCustomResolver(customResolverKey, resolver);
      setCustomResolverKey('');
      setCustomResolverCode('');
      Alert.alert('成功', '自定義解析器已添加');
    } catch (error) {
      Alert.alert('錯誤', `添加解析器失敗: ${  error}`);
    }
  };

  // 處理移除自定義解析器
  const handleRemoveCustomResolver = (key: string) => {
    Alert.alert(
      '確認移除',
      `確定要移除解析器 "${key}" 嗎？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          style: 'destructive',
          onPress: () => {
            removeCustomResolver(key);
            Alert.alert('成功', '解析器已移除');
          }
        }
      ]
    );
  };

  // 處理更新配置
  const handleUpdateConfig = (key: keyof typeof conflictResolutionConfig, value: any) => {
    updateConflictResolutionConfig({ [key]: value });
  };

  return (
    <ScrollView style={styles.container}>
      {/* 配置概覽 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>衝突解決配置</Text>

        <View style={styles.configGrid}>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>默認策略</Text>
            <Text style={styles.configValue}>
              {strategyLabels[conflictResolutionConfig.defaultStrategy]}
            </Text>
          </View>

          <View style={styles.configItem}>
            <Text style={styles.configLabel}>自動解決</Text>
            <Text style={[styles.configValue, conflictResolutionConfig.enableAutoResolution ? styles.success : styles.error]}>
              {conflictResolutionConfig.enableAutoResolution ? '啟用' : '禁用'}
            </Text>
          </View>

          <View style={styles.configItem}>
            <Text style={styles.configLabel}>用戶選擇</Text>
            <Text style={[styles.configValue, conflictResolutionConfig.enableUserChoice ? styles.success : styles.error]}>
              {conflictResolutionConfig.enableUserChoice ? '啟用' : '禁用'}
            </Text>
          </View>

          <View style={styles.configItem}>
            <Text style={styles.configLabel}>時間戳閾值</Text>
            <Text style={styles.configValue}>{conflictResolutionConfig.timestampThreshold}ms</Text>
          </View>
        </View>
      </View>

      {/* 測試工具 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>衝突解決測試</Text>

        <View style={styles.testInput}>
          <Text style={styles.inputLabel}>客戶端數據 (JSON):</Text>
          <TextInput
            style={styles.textInput}
            value={testClientData}
            onChangeText={setTestClientData}
            multiline
            placeholder="輸入客戶端 JSON 數據"
          />
        </View>

        <View style={styles.testInput}>
          <Text style={styles.inputLabel}>服務器數據 (JSON):</Text>
          <TextInput
            style={styles.textInput}
            value={testServerData}
            onChangeText={setTestServerData}
            multiline
            placeholder="輸入服務器 JSON 數據"
          />
        </View>

        <View style={styles.testInput}>
          <Text style={styles.inputLabel}>解決策略:</Text>
          <View style={styles.strategySelector}>
            {strategies.map((strategy) => (
              <TouchableOpacity
                key={strategy}
                style={[
                  styles.strategyButton,
                  testStrategy === strategy && styles.strategyButtonActive
                ]}
                onPress={() => setTestStrategy(strategy)}
              >
                <Text style={[
                  styles.strategyButtonText,
                  testStrategy === strategy && styles.strategyButtonTextActive
                ]}>
                  {strategyLabels[strategy]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity onPress={handleTestConflictResolution} style={styles.testButton}>
          <Text style={styles.testButtonText}>測試衝突解決</Text>
        </TouchableOpacity>

        {testResult && (
          <View style={styles.testResult}>
            <Text style={styles.resultTitle}>測試結果:</Text>
            <Text style={styles.resultText}>策略: {strategyLabels[testResult.strategy]}</Text>
            <Text style={styles.resultText}>解決: {testResult.resolved ? '成功' : '失敗'}</Text>
            <Text style={styles.resultText}>置信度: {(testResult.confidence * 100).toFixed(1)}%</Text>
            <Text style={styles.resultText}>結果: {JSON.stringify(testResult.finalValue, null, 2)}</Text>
          </View>
        )}
      </View>

      {/* 自定義解析器管理 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>自定義解析器</Text>

        <View style={styles.customResolverInput}>
          <Text style={styles.inputLabel}>解析器鍵名:</Text>
          <TextInput
            style={styles.textInput}
            value={customResolverKey}
            onChangeText={setCustomResolverKey}
            placeholder="例如: user_profile"
          />
        </View>

        <View style={styles.customResolverInput}>
          <Text style={styles.inputLabel}>解析器代碼:</Text>
          <TextInput
            style={styles.textInput}
            value={customResolverCode}
            onChangeText={setCustomResolverCode}
            multiline
            placeholder="解析器邏輯 (可選)"
          />
        </View>

        <TouchableOpacity onPress={handleAddCustomResolver} style={styles.addButton}>
          <Text style={styles.addButtonText}>添加解析器</Text>
        </TouchableOpacity>

        {Object.keys(conflictResolutionConfig.customResolvers).length > 0 && (
          <View style={styles.customResolversList}>
            <Text style={styles.listTitle}>已添加的解析器:</Text>
            {Object.keys(conflictResolutionConfig.customResolvers).map((key) => (
              <View key={key} style={styles.resolverItem}>
                <Text style={styles.resolverKey}>{key}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveCustomResolver(key)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>移除</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 任務衝突解決策略 */}
      {showDetails && tasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>任務衝突解決策略</Text>

          {tasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <Text style={styles.taskId}>{task.id}</Text>
              <Text style={styles.taskType}>{task.type} - {task.url}</Text>

              <View style={styles.taskStrategy}>
                <Text style={styles.strategyLabel}>當前策略:</Text>
                <Text style={styles.strategyValue}>
                  {task.conflictResolutionStrategy
                    ? strategyLabels[task.conflictResolutionStrategy]
                    : '使用默認策略'
                  }
                </Text>
              </View>

              <View style={styles.strategySelector}>
                {strategies.map((strategy) => (
                  <TouchableOpacity
                    key={strategy}
                    style={[
                      styles.strategyButton,
                      task.conflictResolutionStrategy === strategy && styles.strategyButtonActive
                    ]}
                    onPress={() => setConflictResolutionStrategy(task.id, strategy)}
                  >
                    <Text style={[
                      styles.strategyButtonText,
                      task.conflictResolutionStrategy === strategy && styles.strategyButtonTextActive
                    ]}>
                      {strategyLabels[strategy]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
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
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  configGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  configItem: {
    width: '48%',
    marginBottom: 12
  },
  configLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  configValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  success: {
    color: '#4CAF50'
  },
  error: {
    color: '#F44336'
  },
  testInput: {
    marginBottom: 12
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    minHeight: 40
  },
  strategySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  strategyButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff'
  },
  strategyButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  strategyButtonText: {
    fontSize: 12,
    color: '#333'
  },
  strategyButtonTextActive: {
    color: '#fff'
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500'
  },
  testResult: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 4
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  customResolverInput: {
    marginBottom: 12
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500'
  },
  customResolversList: {
    marginTop: 12
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  resolverItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  resolverKey: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  removeButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12
  },
  taskItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8
  },
  taskId: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 4
  },
  taskType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  taskStrategy: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  strategyLabel: {
    fontSize: 14,
    color: '#666'
  },
  strategyValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  }
});
