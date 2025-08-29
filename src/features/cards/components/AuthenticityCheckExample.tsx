import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { logger } from '../../../core/utils/logger';
import { useAuthenticityCheck } from '../hooks/useAuthenticityCheck';

import { AuthenticityCheckScanner } from './AuthenticityCheckScanner';

export const AuthenticityCheckExample: React.FC = () => {
  const {
    isChecking,
    checkResult,
    checkError,
    checkHistory,
    checkStats,
    isLoadingHistory,
    historyError,
    isLoadingStats,
    statsError,
    getHistory,
    getStats,
    clearErrors,
  } = useAuthenticityCheck({
    onCheckSuccess: result => {
      logger.info('示例組件收到檢查成功:', {
        isAuthentic: result.isAuthentic,
      } as Record<string, unknown>);
    },
    onCheckError: error => {
      logger.error('示例組件收到檢查失敗:', {
        message: error.message,
      } as Record<string, unknown>);
    },
  });

  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    getHistory('current_user_id');
    getStats('current_user_id');
  }, [getHistory, getStats]);

  const _renderCheckResult = () => {
    if (!checkResult) return null;

    const _getRiskLevelColor = (riskLevel: string) => {
      switch (riskLevel) {
        case 'critical':
          return '#dc3545';
        case 'high':
          return '#fd7e14';
        case 'medium':
          return '#ffc107';
        case 'low':
          return '#28a745';
        default:
          return '#6c757d';
      }
    };

    const _getRiskLevelText = (riskLevel: string) => {
      switch (riskLevel) {
        case 'critical':
          return '極高風險';
        case 'high':
          return '高風險';
        case 'medium':
          return '中等風險';
        case 'low':
          return '低風險';
        default:
          return '未知';
      }
    };

    return (
      <View style={styles.section}>
        <Text style={styles.subHeader}>最新檢查結果</Text>
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>
            狀態: {checkResult.isAuthentic ? '✅ 真卡' : '❌ 疑似假卡'}
          </Text>
          <Text style={styles.resultSubtitle}>
            置信度: {(checkResult.confidence * 100).toFixed(2)}%
          </Text>
          <Text
            style={[
              styles.riskLevelText,
              { color: getRiskLevelColor(checkResult.riskLevel) },
            ]}
          >
            風險等級: {getRiskLevelText(checkResult.riskLevel)}
          </Text>
          <Text style={styles.timestamp}>
            檢查時間: {checkResult.metadata.timestamp.toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  const _renderCheckHistory = () => {
    if (checkHistory.length === 0) {
      return <Text style={styles.emptyText}>暫無檢查歷史</Text>;
    }

    return checkHistory.slice(0, 5).map((history, index) => (
      <View key={history.id} style={styles.historyItem}>
        <Text style={styles.historyTitle}>檢查 #{index + 1}</Text>
        <Text style={styles.historyStatus}>
          狀態: {history.result.isAuthentic ? '✅ 真卡' : '❌ 疑似假卡'}
        </Text>
        <Text style={styles.historyConfidence}>
          置信度: {(history.result.confidence * 100).toFixed(1)}%
        </Text>
        <Text style={styles.historyDate}>
          {history.timestamp.toLocaleDateString()}
        </Text>
        {history.statusChange && (
          <Text style={styles.statusChangeText}>
            狀態變化: {history.statusChange.from} → {history.statusChange.to}
          </Text>
        )}
      </View>
    ));
  };

  const _renderCheckStats = () => {
    if (!checkStats) return null;

    const _fakeDetectionRate = (
      (checkStats.fakeCards / checkStats.totalChecks) *
      100
    ).toFixed(2);

    return (
      <View style={styles.section}>
        <Text style={styles.subHeader}>檢查統計</Text>
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>
            總檢查次數: {checkStats.totalChecks}
          </Text>
          <Text style={styles.statsTitle}>
            真卡數量: {checkStats.authenticCards}
          </Text>
          <Text style={styles.statsTitle}>
            可疑卡牌: {checkStats.suspiciousCards}
          </Text>
          <Text style={styles.statsTitle}>
            假卡數量: {checkStats.fakeCards}
          </Text>
          <Text style={styles.statsTitle}>
            假卡檢測率: {fakeDetectionRate}%
          </Text>
          <Text style={styles.statsTitle}>
            平均置信度: {(checkStats.averageConfidence * 100).toFixed(1)}%
          </Text>

          <Text style={styles.statsSubtitle}>風險等級分布:</Text>
          <View style={styles.distributionContainer}>
            <Text style={styles.distributionItem}>
              低風險: {checkStats.riskLevelDistribution.low}
            </Text>
            <Text style={styles.distributionItem}>
              中等風險: {checkStats.riskLevelDistribution.medium}
            </Text>
            <Text style={styles.distributionItem}>
              高風險: {checkStats.riskLevelDistribution.high}
            </Text>
            <Text style={styles.distributionItem}>
              極高風險: {checkStats.riskLevelDistribution.critical}
            </Text>
          </View>

          {checkStats.mostCommonRiskFactors.length > 0 && (
            <>
              <Text style={styles.statsSubtitle}>常見風險因素:</Text>
              {checkStats.mostCommonRiskFactors.map((factor, index) => (
                <Text key={index} style={styles.factorItem}>
                  {factor.factor}: {factor.frequency}次 (平均嚴重程度:{' '}
                  {factor.averageSeverity.toFixed(1)})
                </Text>
              ))}
            </>
          )}
        </View>
      </View>
    );
  };

  const _renderErrors = () => {
    if (!checkError && !historyError && !statsError) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.subHeader}>錯誤信息</Text>
        {checkError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>檢查錯誤:</Text>
            <Text style={styles.errorText}>{checkError.message}</Text>
          </View>
        )}
        {historyError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>歷史加載錯誤:</Text>
            <Text style={styles.errorText}>{historyError}</Text>
          </View>
        )}
        {statsError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>統計加載錯誤:</Text>
            <Text style={styles.errorText}>{statsError}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.clearErrorsButton}
          onPress={clearErrors}
        >
          <Text style={styles.clearErrorsButtonText}>清除所有錯誤</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>防偽檢查示例</Text>

      <TouchableOpacity
        style={styles.toggleScannerButton}
        onPress={() => setShowScanner(!showScanner)}
      >
        <Text style={styles.toggleScannerButtonText}>
          {showScanner ? '隱藏掃描器' : '顯示掃描器'}
        </Text>
      </TouchableOpacity>

      {showScanner && (
        <View style={styles.scannerContainer}>
          <AuthenticityCheckScanner />
        </View>
      )}

      {renderCheckResult()}
      {renderErrors()}

      <View style={styles.section}>
        <Text style={styles.subHeader}>檢查歷史</Text>
        {isLoadingHistory ? (
          <ActivityIndicator size='small' color='#dc3545' />
        ) : historyError ? (
          <Text style={styles.errorText}>加載歷史失敗: {historyError}</Text>
        ) : (
          renderCheckHistory()
        )}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => getHistory('current_user_id')}
        >
          <Text style={styles.refreshButtonText}>刷新歷史</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>檢查統計</Text>
        {isLoadingStats ? (
          <ActivityIndicator size='small' color='#dc3545' />
        ) : statsError ? (
          <Text style={styles.errorText}>加載統計失敗: {statsError}</Text>
        ) : (
          renderCheckStats()
        )}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => getStats('current_user_id')}
        >
          <Text style={styles.refreshButtonText}>刷新統計</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  toggleScannerButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleScannerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scannerContainer: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  section: {
    margin: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  riskLevelText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  historyItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  historyStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  historyConfidence: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  historyDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  statusChangeText: {
    fontSize: 11,
    color: '#007bff',
    marginTop: 2,
    fontStyle: 'italic',
  },
  statsCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statsSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 6,
  },
  distributionContainer: {
    marginBottom: 10,
  },
  distributionItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  factorItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  errorCard: {
    backgroundColor: '#f8d7da',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#721c24',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#721c24',
  },
  clearErrorsButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  clearErrorsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AuthenticityCheckExample;
