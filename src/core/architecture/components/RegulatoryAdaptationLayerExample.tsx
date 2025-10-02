/**
 * RegulatoryAdaptationLayer 示例Component
 * 演示法規適應層的核心功能
 */

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
  Jurisdiction,
  RegulationMapping,
  ComplianceStatus,
  RequiredAction,
} from '../RegulatoryAdaptationLayer';
import {
  RegulatoryAdaptationLayer,
  JurisdictionDetector,
  RegulationMapper,
  ComplianceEngine,
} from '../RegulatoryAdaptationLayer';

interface ComponentState {
  isInitialized: boolean;
  currentJurisdiction: Jurisdiction | null;
  regulationMapping: RegulationMapping | null;
  complianceStatus: ComplianceStatus | null;
  requiredActions: RequiredAction[];
  loading: boolean;
  error: string | null;
}

const RegulatoryAdaptationLayerExample: React.FC = () => {
  const [state, setState] = useState<ComponentState>({
    isInitialized: false,
    currentJurisdiction: null,
    regulationMapping: null,
    complianceStatus: null,
    requiredActions: [],
    loading: false,
    error: null,
  });

  const _adaptationLayer = RegulatoryAdaptationLayer.getInstance();
  const _detector = new JurisdictionDetector();
  const _mapper = new RegulationMapper();
  const _engine = new ComplianceEngine();

  useEffect(() => {
    initializeLayer();
  }, []);

  const _initializeLayer = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await adaptationLayer.initialize();
      setState(prev => ({ ...prev, isInitialized: true, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: `InitializeFailed: ${error instanceof Error ? error.message : '未知Error'}`,
      }));
    }
  };

  const _detectJurisdiction = async (userData: {
    country?: string;
    language?: string;
    timezone?: string;
  }) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const _jurisdiction = await detector.detectUserJurisdiction(userData);
      setState(prev => ({
        ...prev,
        currentJurisdiction: jurisdiction,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: `司法管轄區檢測Failed: ${error instanceof Error ? error.message : '未知Error'}`,
      }));
    }
  };

  const _getRegulationMapping = async (jurisdictionCode: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const _mapping = await mapper.getRegulationMapping(jurisdictionCode);
      setState(prev => ({
        ...prev,
        regulationMapping: mapping,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: `法規映射GetFailed: ${error instanceof Error ? error.message : '未知Error'}`,
      }));
    }
  };

  const _checkCompliance = async (jurisdictionCode: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // 模擬當前實現
      const _mockImplementation = {
        consentManagement: Math.random() > 0.5,
        dataDisclosure: Math.random() > 0.5,
        userRights: Math.random() > 0.5,
        dataEncryption: Math.random() > 0.5,
        auditLogging: Math.random() > 0.5,
      };

      const _compliance = await engine.checkCompliance(
        jurisdictionCode,
        mockImplementation
      );
      const _actions = await engine.getComplianceRecommendations(
        jurisdictionCode,
        mockImplementation
      );

      setState(prev => ({
        ...prev,
        complianceStatus: compliance,
        requiredActions: actions,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: `合規CheckFailed: ${error instanceof Error ? error.message : '未知Error'}`,
      }));
    }
  };

  const _generateComplianceReport = async (jurisdictionCode: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const _mockImplementation = {
        consentManagement: true,
        dataDisclosure: false,
        userRights: true,
        dataEncryption: true,
        auditLogging: false,
      };

      const _report = await engine.generateComplianceReport(
        jurisdictionCode,
        mockImplementation
      );

      Alert.alert('合規報告', report.summary, [
        { text: '確定', style: 'default' },
      ]);

      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: `報告生成Failed: ${error instanceof Error ? error.message : '未知Error'}`,
      }));
    }
  };

  const _runFullWorkflow = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // 1. 檢測司法管轄District
      const _jurisdiction = await detector.detectUserJurisdiction({
        country: 'TW',
        language: 'zh-TW',
        timezone: 'Asia/Taipei',
      });

      // 2. Get法規Map
      const _mapping = await mapper.getRegulationMapping(jurisdiction.code);

      // 3. Check合規Status
      const _mockImplementation = {
        consentManagement: true,
        dataDisclosure: false,
        userRights: true,
        dataEncryption: true,
        auditLogging: false,
      };

      const _compliance = await engine.checkCompliance(
        jurisdiction.code,
        mockImplementation
      );
      const _actions = await engine.getComplianceRecommendations(
        jurisdiction.code,
        mockImplementation
      );

      setState(prev => ({
        ...prev,
        currentJurisdiction: jurisdiction,
        regulationMapping: mapping,
        complianceStatus: compliance,
        requiredActions: actions,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: `完整工作流程Failed: ${error instanceof Error ? error.message : '未知Error'}`,
      }));
    }
  };

  const _renderJurisdictionInfo = () => {
    if (!state.currentJurisdiction) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>當前司法管轄區</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            代碼: {state.currentJurisdiction.code}
          </Text>
          <Text style={styles.infoText}>
            名稱: {state.currentJurisdiction.name}
          </Text>
          <Text style={styles.infoText}>
            國家: {state.currentJurisdiction.country}
          </Text>
          <Text style={styles.infoText}>
            語言: {state.currentJurisdiction.language.join(', ')}
          </Text>
          <Text style={styles.infoText}>
            貨幣: {state.currentJurisdiction.currency}
          </Text>
          <Text style={styles.infoText}>
            時區: {state.currentJurisdiction.timezone}
          </Text>
        </View>
      </View>
    );
  };

  const _renderRegulationMapping = () => {
    if (!state.regulationMapping) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>法規映射</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            適用法規數量: {state.regulationMapping.applicableRegulations.length}
          </Text>
          {state.regulationMapping.applicableRegulations.map(
            (regulation, index) => (
              <Text key={index} style={styles.regulationText}>
                • {regulation.name} ({regulation.category})
              </Text>
            )
          )}
        </View>
      </View>
    );
  };

  const _renderComplianceStatus = () => {
    if (!state.complianceStatus) return null;

    const _getStatusColor = (status: string) => {
      switch (status) {
        case 'COMPLIANT':
          return '#4CAF50';
        case 'NON_COMPLIANT':
          return '#F44336';
        case 'PARTIAL':
          return '#FF9800';
        default:
          return '#9E9E9E';
      }
    };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>合規狀態</Text>
        <View style={styles.infoContainer}>
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(state.complianceStatus.overall) },
            ]}
          >
            整體狀態: {state.complianceStatus.overall}
          </Text>
          <Text style={styles.infoText}>
            合規分數: {state.complianceStatus.score.toFixed(1)}/100
          </Text>
          <Text style={styles.infoText}>
            評估時間: {state.complianceStatus.lastAssessment.toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  const _renderRequiredActions = () => {
    if (state.requiredActions.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>需要執行的行動</Text>
        <View style={styles.infoContainer}>
          {state.requiredActions.map((action, index) => (
            <View key={index} style={styles.actionItem}>
              <Text style={styles.actionTitle}>{action.description}</Text>
              <Text style={styles.actionPriority}>
                優先級: {action.priority}
              </Text>
              <Text style={styles.actionStatus}>狀態: {action.status}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (state.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>處理中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>RegulatoryAdaptationLayer 示例</Text>

      {state.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{state.error}</Text>
        </View>
      )}

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          初始化狀態: {state.isInitialized ? '✅ 已初始化' : '❌ 未初始化'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => detectJurisdiction({ country: 'US', language: 'en' })}
        >
          <Text style={styles.buttonText}>檢測美國司法管轄區</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            detectJurisdiction({ country: 'TW', language: 'zh-TW' })
          }
        >
          <Text style={styles.buttonText}>檢測台灣司法管轄區</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => detectJurisdiction({ country: 'EU', language: 'en' })}
        >
          <Text style={styles.buttonText}>檢測歐盟司法管轄區</Text>
        </TouchableOpacity>

        {state.currentJurisdiction && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => getRegulationMapping(state.currentJurisdiction.code)}
          >
            <Text style={styles.buttonText}>獲取法規映射</Text>
          </TouchableOpacity>
        )}

        {state.currentJurisdiction && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => checkCompliance(state.currentJurisdiction.code)}
          >
            <Text style={styles.buttonText}>檢查合規狀態</Text>
          </TouchableOpacity>
        )}

        {state.currentJurisdiction && (
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              generateComplianceReport(state.currentJurisdiction.code)
            }
          >
            <Text style={styles.buttonText}>生成合規報告</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={runFullWorkflow}
        >
          <Text style={styles.buttonText}>執行完整工作流程</Text>
        </TouchableOpacity>
      </View>

      {renderJurisdictionInfo()}
      {renderRegulationMapping()}
      {renderComplianceStatus()}
      {renderRequiredActions()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  statusContainer: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
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
  infoContainer: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  regulationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    lineHeight: 20,
  },
  actionItem: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionPriority: {
    fontSize: 12,
    color: '#FF9800',
    marginBottom: 2,
  },
  actionStatus: {
    fontSize: 12,
    color: '#666',
  },
});

export default RegulatoryAdaptationLayerExample;
