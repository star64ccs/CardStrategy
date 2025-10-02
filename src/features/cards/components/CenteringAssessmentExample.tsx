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
import { useCenteringAssessment } from '../hooks/useCenteringAssessment';

import { CenteringAssessmentScanner } from './CenteringAssessmentScanner';

export const CenteringAssessmentExample: React.FC = () => {
  const {
    isAssessing,
    assessmentResult,
    assessmentError,
    assessmentHistory,
    assessmentStats,
    isLoadingHistory,
    historyError,
    isLoadingStats,
    statsError,
    getHistory,
    getStats,
    clearErrors,
  } = useCenteringAssessment({
    onAssessmentSuccess: result => {
      logger.info('示例組件收到評估Success:', {
        overallScore: result.overallScore,
      } as Record<string, unknown>);
    },
    onAssessmentError: error => {
      logger.error('示例組件收到評估Failed:', {
        message: error.message,
      } as Record<string, unknown>);
    },
  });

  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    getHistory('current_user_id');
    getStats('current_user_id');
  }, [getHistory, getStats]);

  const _renderAssessmentResult = () => {
    if (!assessmentResult) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.subHeader}>最新評估結果</Text>
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>
            整體評分: {assessmentResult.overallScore}/10
          </Text>
          <View style={styles.scoreGrid}>
            <Text style={styles.scoreItem}>
              置中: {assessmentResult.centeringScore}/10
            </Text>
            <Text style={styles.scoreItem}>
              邊緣: {assessmentResult.edgeWearScore}/10
            </Text>
            <Text style={styles.scoreItem}>
              角落: {assessmentResult.cornerWearScore}/10
            </Text>
            <Text style={styles.scoreItem}>
              表面: {assessmentResult.surfaceWearScore}/10
            </Text>
          </View>
          <Text style={styles.timestamp}>
            評估時間: {assessmentResult.metadata.timestamp.toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  const _renderAssessmentHistory = () => {
    if (assessmentHistory.length === 0) {
      return <Text style={styles.emptyText}>暫無評估歷史</Text>;
    }

    return assessmentHistory.slice(0, 5).map((history, index) => (
      <View key={history.id} style={styles.historyItem}>
        <Text style={styles.historyTitle}>評估 #{index + 1}</Text>
        <Text style={styles.historyScore}>
          評分: {history.result.overallScore}/10
        </Text>
        <Text style={styles.historyDate}>
          {history.timestamp.toLocaleDateString()}
        </Text>
        {history.improvement && (
          <Text style={styles.improvementText}>
            改進: +{history.improvement.toFixed(1)}
          </Text>
        )}
      </View>
    ));
  };

  const _renderAssessmentStats = () => {
    if (!assessmentStats) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.subHeader}>評估統計</Text>
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>
            總評估次數: {assessmentStats.totalAssessments}
          </Text>
          <Text style={styles.statsTitle}>
            平均評分: {assessmentStats.averageScore.toFixed(1)}/10
          </Text>

          <Text style={styles.statsSubtitle}>評分分布:</Text>
          <View style={styles.distributionContainer}>
            <Text style={styles.distributionItem}>
              優秀 (9-10): {assessmentStats.scoreDistribution.excellent}
            </Text>
            <Text style={styles.distributionItem}>
              良好 (7-8): {assessmentStats.scoreDistribution.good}
            </Text>
            <Text style={styles.distributionItem}>
              一般 (5-6): {assessmentStats.scoreDistribution.fair}
            </Text>
            <Text style={styles.distributionItem}>
              較差 (3-4): {assessmentStats.scoreDistribution.poor}
            </Text>
            <Text style={styles.distributionItem}>
              很差 (1-2): {assessmentStats.scoreDistribution.veryPoor}
            </Text>
          </View>

          {assessmentStats.mostCommonIssues.length > 0 && (
            <>
              <Text style={styles.statsSubtitle}>常見問題:</Text>
              {assessmentStats.mostCommonIssues.map((issue, index) => (
                <Text key={index} style={styles.issueItem}>
                  {issue.issue}: {issue.frequency}次 (平均影響:{' '}
                  {issue.averageImpact.toFixed(1)}分)
                </Text>
              ))}
            </>
          )}
        </View>
      </View>
    );
  };

  const _renderErrors = () => {
    if (!assessmentError && !historyError && !statsError) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.subHeader}>錯誤信息</Text>
        {assessmentError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>評估錯誤:</Text>
            <Text style={styles.errorText}>{assessmentError.message}</Text>
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
      <Text style={styles.header}>置中評估示例</Text>

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
          <CenteringAssessmentScanner />
        </View>
      )}

      {renderAssessmentResult()}
      {renderErrors()}

      <View style={styles.section}>
        <Text style={styles.subHeader}>評估歷史</Text>
        {isLoadingHistory ? (
          <ActivityIndicator size='small' color='#007bff' />
        ) : historyError ? (
          <Text style={styles.errorText}>加載歷史失敗: {historyError}</Text>
        ) : (
          renderAssessmentHistory()
        )}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => getHistory('current_user_id')}
        >
          <Text style={styles.refreshButtonText}>刷新歷史</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>評估統計</Text>
        {isLoadingStats ? (
          <ActivityIndicator size='small' color='#007bff' />
        ) : statsError ? (
          <Text style={styles.errorText}>加載統計失敗: {statsError}</Text>
        ) : (
          renderAssessmentStats()
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
    backgroundColor: '#28a745',
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
    marginBottom: 10,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  scoreItem: {
    fontSize: 14,
    color: '#666',
    marginRight: 15,
    marginBottom: 5,
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
  historyScore: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  historyDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  improvementText: {
    fontSize: 11,
    color: '#28a745',
    marginTop: 2,
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
  issueItem: {
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

export default CenteringAssessmentExample;
