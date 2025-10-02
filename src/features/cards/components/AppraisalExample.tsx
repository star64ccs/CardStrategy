import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { useAppraisal } from '../hooks/useAppraisal';
import type { AppraisalResult } from '../types/appraisal';

import { AppraisalScanner } from './AppraisalScanner';

export const AppraisalExample: React.FC = () => {
  const {
    loadAppraisalHistory,
    loadAppraisalStats,
    loadAppraisalOptions,
    history,
    stats,
    options,
    getAppraisalById,
    getLatestAppraisal,
    getAppraisalTrend,
    getAverageGrade,
    getBestGrade,
    getWorstGrade,
    getTotalAppraisals,
  } = useAppraisal();

  const [selectedCardId, setSelectedCardId] = useState('demo_card_001');
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    // InitializeData
    loadAppraisalStats();
    loadAppraisalOptions();
  }, [loadAppraisalStats, loadAppraisalOptions]);

  const _handleAppraisalComplete = (result: AppraisalResult) => {
    Alert.alert(
      '鑑定完成',
      `卡牌 ${result.cardId} 鑑定完成！\n等級: ${result.overallGrade}\n分數: ${result.overallScore.toFixed(1)}/10`,
      [
        {
          text: '查看詳情',
          onPress: () => loadAppraisalHistory(result.cardId),
        },
        { text: '確定', style: 'default' },
      ]
    );
  };

  const _handleAppraisalError = (error: unknown) => {
    Alert.alert('鑑定Error', error.message || '鑑定過程中發生Error');
  };

  const _renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>鑑定統計</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalAppraisals}</Text>
            <Text style={styles.statLabel}>總鑑定次數</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats.averageProcessingTime.toFixed(0)}ms
            </Text>
            <Text style={styles.statLabel}>平均處理時間</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.accuracyRate}%</Text>
            <Text style={styles.statLabel}>準確率</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.userSatisfaction}/5</Text>
            <Text style={styles.statLabel}>用戶滿意度</Text>
          </View>
        </View>
      </View>
    );
  };

  const _renderGradeDistribution = () => {
    if (!stats?.gradeDistribution) return null;

    return (
      <View style={styles.distributionContainer}>
        <Text style={styles.sectionTitle}>等級分佈</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.distributionRow}>
            {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
              <View key={grade} style={styles.distributionItem}>
                <Text style={styles.distributionGrade}>{grade}</Text>
                <Text style={styles.distributionCount}>{count}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const _renderMethodUsage = () => {
    if (!stats?.methodUsage) return null;

    return (
      <View style={styles.methodContainer}>
        <Text style={styles.sectionTitle}>鑑定方法使用</Text>
        {Object.entries(stats.methodUsage).map(([method, count]) => (
          <View key={method} style={styles.methodItem}>
            <Text style={styles.methodName}>{method}</Text>
            <Text style={styles.methodCount}>{count} 次</Text>
          </View>
        ))}
      </View>
    );
  };

  const _renderHistory = () => {
    if (history.length === 0) return null;

    return (
      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>鑑定歷史</Text>
        {history.map(cardHistory => (
          <View key={cardHistory.cardId} style={styles.historyItem}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyCardId}>{cardHistory.cardId}</Text>
              <Text style={styles.historyCount}>
                {cardHistory.totalAppraisals} 次鑑定
              </Text>
            </View>
            <View style={styles.historyDetails}>
              <Text style={styles.historyDetail}>
                平均等級: {cardHistory.averageGrade} (
                {cardHistory.averageScore.toFixed(1)})
              </Text>
              <Text style={styles.historyDetail}>
                最佳: {cardHistory.bestGrade} | 最差: {cardHistory.worstGrade}
              </Text>
              <Text style={styles.historyDetail}>
                趨勢:{' '}
                {cardHistory.trend === 'improving'
                  ? '改善中'
                  : cardHistory.trend === 'declining'
                    ? '下降中'
                    : '穩定'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => setSelectedCardId(cardHistory.cardId)}
            >
              <Text style={styles.viewDetailsButtonText}>查看詳情</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const _renderSelectedCardDetails = () => {
    const _cardHistory = getAppraisalById(selectedCardId);
    if (!cardHistory) return null;

    const _latestAppraisal = getLatestAppraisal(selectedCardId);

    return (
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>卡牌詳情: {selectedCardId}</Text>

        {latestAppraisal && (
          <View style={styles.latestAppraisal}>
            <Text style={styles.detailTitle}>最新鑑定結果</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>等級:</Text>
              <Text style={styles.detailValue}>
                {latestAppraisal.overallGrade}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>分數:</Text>
              <Text style={styles.detailValue}>
                {latestAppraisal.overallScore.toFixed(1)}/10
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>信心度:</Text>
              <Text style={styles.detailValue}>
                {(latestAppraisal.metadata.confidence * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>鑑定時間:</Text>
              <Text style={styles.detailValue}>
                {new Date(latestAppraisal.timestamp).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.summaryStats}>
          <Text style={styles.detailTitle}>統計摘要</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>總鑑定次數:</Text>
            <Text style={styles.detailValue}>
              {getTotalAppraisals(selectedCardId)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>平均等級:</Text>
            <Text style={styles.detailValue}>
              {getAverageGrade(selectedCardId)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>最佳等級:</Text>
            <Text style={styles.detailValue}>
              {getBestGrade(selectedCardId)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>最差等級:</Text>
            <Text style={styles.detailValue}>
              {getWorstGrade(selectedCardId)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>趨勢:</Text>
            <Text style={styles.detailValue}>
              {getAppraisalTrend(selectedCardId) === 'improving'
                ? '改善中'
                : getAppraisalTrend(selectedCardId) === 'declining'
                  ? '下降中'
                  : '穩定'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (showScanner) {
    return (
      <View style={styles.container}>
        <AppraisalScanner
          cardId={selectedCardId}
          onAppraisalComplete={handleAppraisalComplete}
          onError={handleAppraisalError}
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowScanner(false)}
        >
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>模擬鑑定系統示例</Text>

      {/* Control按鈕 */}
      <View style={styles.controlContainer}>
        <TouchableOpacity
          style={styles.scannerButton}
          onPress={() => setShowScanner(true)}
        >
          <Text style={styles.scannerButtonText}>開始鑑定</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => {
            loadAppraisalStats();
            loadAppraisalOptions();
          }}
        >
          <Text style={styles.refreshButtonText}>刷新數據</Text>
        </TouchableOpacity>
      </View>

      {/* StatisticsInformation */}
      {renderStats()}

      {/* 等級分佈 */}
      {renderGradeDistribution()}

      {/* Method使用 */}
      {renderMethodUsage()}

      {/* 選中的卡牌詳情 */}
      {renderSelectedCardDetails()}

      {/* 歷史Record */}
      {renderHistory()}
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  controlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  scannerButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 120,
  },
  scannerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 120,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  distributionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  distributionRow: {
    flexDirection: 'row',
  },
  distributionItem: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 60,
  },
  distributionGrade: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  distributionCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  methodContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  methodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  methodName: {
    fontSize: 16,
    color: '#333',
  },
  methodCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  latestAppraisal: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryStats: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  historyContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  historyItem: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  historyCardId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  historyCount: {
    fontSize: 14,
    color: '#666',
  },
  historyDetails: {
    marginBottom: 10,
  },
  historyDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  viewDetailsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  viewDetailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
