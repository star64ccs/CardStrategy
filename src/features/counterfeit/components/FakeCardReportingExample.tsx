import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFakeCardReporting } from '../hooks/useFakeCardReporting';
import {
  BlacklistType,
  ReportSeverity,
  ReportType,
  WarningType,
} from '../types/reporting';

import { BlacklistManager } from './BlacklistManager';
import { ReportForm } from './ReportForm';
import { WarningDisplay } from './WarningDisplay';

export const FakeCardReportingExample: React.FC = () => {
  const {
    // Status
    isInitialized,
    isLoading,
    error,
    reports,
    reportStats,
    warnings,
    userWarnings,
    blacklist,
    isUserBlacklisted,
    communityWarnings,
    // ServiceManage
    initializeService,
    // 舉報Manage
    submitReport,
    getStats,
    searchReports,
    // WarningManage
    issueWarning,
    fetchUserWarnings,
    // 黑名單Manage
    blacklistUser,
    checkBlacklistStatus,
    // 社DistrictWarningManage
    issueCommunityWarning,
    fetchCommunityWarnings,
    // StatisticsFunction
    getPendingReportsCount,
    getResolvedReportsCount,
    getActiveWarningsCount,
    getActiveBlacklistEntriesCount,
  } = useFakeCardReporting();

  const [showReportForm, setShowReportForm] = useState(false);
  const [showBlacklistManager, setShowBlacklistManager] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'reports' | 'warnings' | 'blacklist'
  >('overview');

  useEffect(() => {
    if (!isInitialized) {
      initializeService();
    }
  }, [isInitialized, initializeService]);

  useEffect(() => {
    if (isInitialized) {
      getStats();
      fetchCommunityWarnings();
    }
  }, [isInitialized, getStats, fetchCommunityWarnings]);

  const _handleSubmitReport = async (reportData: unknown) => {
    try {
      const _result = await submitReport(reportData);
      if (result.meta.requestStatus === 'fulfilled') {
        Alert.alert('Success', '舉報已提交，我們會盡快處理');
        setShowReportForm(false);
        getStats(); // RefreshStatistics
      }
    } catch (error) {
      Alert.alert('Error', '提交Failed，請重試');
    }
  };

  const _handleIssueWarning = async () => {
    try {
      await issueWarning({
        type: WarningType.SELLER_WARNING,
        targetId: 'user_002',
        targetType: 'SELLER',
        title: '假卡銷售警告',
        message: '您被舉報銷售假卡，請立即停止此類行為',
        severity: ReportSeverity.HIGH,
        isActive: true,
        createdBy: 'moderator_001',
      });
      Alert.alert('Success', '警告已發出');
    } catch (error) {
      Alert.alert('Error', '發出警告Failed');
    }
  };

  const _handleAddToBlacklist = async () => {
    try {
      await blacklistUser({
        type: BlacklistType.USER,
        targetId: 'user_002',
        targetValue: 'user_002',
        reason: '多次違規行為',
        severity: ReportSeverity.CRITICAL,
        isActive: true,
        createdBy: 'moderator_001',
      });
      Alert.alert('Success', '已添加到黑名單');
    } catch (error) {
      Alert.alert('Error', '添加到黑名單Failed');
    }
  };

  const _handleIssueCommunityWarning = async () => {
    try {
      await issueCommunityWarning({
        title: '假卡防範提醒',
        message: '請注意防範假卡，購買前務必仔細檢查',
        severity: ReportSeverity.MEDIUM,
        targetAudience: 'ALL',
        isActive: true,
        displayFrom: new Date(),
        createdBy: 'admin_001',
      });
      Alert.alert('Success', '社區警告已發出');
    } catch (error) {
      Alert.alert('Error', '發出社區警告Failed');
    }
  };

  const _getSeverityColor = (severity: ReportSeverity) => {
    switch (severity) {
      case ReportSeverity.LOW:
        return '#4CAF50';
      case ReportSeverity.MEDIUM:
        return '#FF9800';
      case ReportSeverity.HIGH:
        return '#F44336';
      case ReportSeverity.CRITICAL:
        return '#9C27B0';
      default:
        return '#FF9800';
    }
  };

  const _formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>初始化假卡回報系統...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>假卡回報系統</Text>
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => setShowReportForm(true)}
        >
          <Ionicons name='flag' size={20} color='#fff' />
          <Text style={styles.reportButtonText}>舉報假卡</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Tag欄 */}
      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: '概覽', icon: 'stats-chart' },
          { key: 'reports', label: '舉報', icon: 'flag' },
          { key: 'warnings', label: '警告', icon: 'warning' },
          { key: 'blacklist', label: '黑名單', icon: 'shield' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.key ? '#007AFF' : '#666'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'overview' && (
          <View style={styles.overviewContainer}>
            {/* Statistics卡片 */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name='flag' size={24} color='#007AFF' />
                <Text style={styles.statNumber}>{reports.length}</Text>
                <Text style={styles.statLabel}>總舉報</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name='time' size={24} color='#FF9800' />
                <Text style={styles.statNumber}>
                  {getPendingReportsCount()}
                </Text>
                <Text style={styles.statLabel}>待處理</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name='checkmark-circle' size={24} color='#4CAF50' />
                <Text style={styles.statNumber}>
                  {getResolvedReportsCount()}
                </Text>
                <Text style={styles.statLabel}>已解決</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name='warning' size={24} color='#F44336' />
                <Text style={styles.statNumber}>
                  {getActiveWarningsCount()}
                </Text>
                <Text style={styles.statLabel}>活躍警告</Text>
              </View>
            </View>

            {/* 快速Operation */}
            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>快速操作</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleIssueWarning}
                >
                  <Ionicons name='warning' size={20} color='#FF9800' />
                  <Text style={styles.actionButtonText}>發出警告</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleAddToBlacklist}
                >
                  <Ionicons name='shield' size={20} color='#F44336' />
                  <Text style={styles.actionButtonText}>加入黑名單</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleIssueCommunityWarning}
                >
                  <Ionicons name='megaphone' size={20} color='#9C27B0' />
                  <Text style={styles.actionButtonText}>社區警告</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 最近舉報 */}
            <View style={styles.recentReports}>
              <Text style={styles.sectionTitle}>最近舉報</Text>
              {reports.slice(0, 3).map(report => (
                <View key={report.id} style={styles.reportItem}>
                  <View style={styles.reportHeader}>
                    <Text style={styles.reportTitle}>
                      {report.report.title}
                    </Text>
                    <View
                      style={[
                        styles.severityBadge,
                        {
                          backgroundColor: getSeverityColor(
                            report.report.severity
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.severityText}>
                        {report.report.severity === ReportSeverity.LOW && '低'}
                        {report.report.severity === ReportSeverity.MEDIUM &&
                          '中'}
                        {report.report.severity === ReportSeverity.HIGH && '高'}
                        {report.report.severity === ReportSeverity.CRITICAL &&
                          '嚴重'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reportDescription}>
                    {report.report.description.substring(0, 100)}...
                  </Text>
                  <Text style={styles.reportDate}>
                    {formatDate(report.createdAt)}
                  </Text>
                </View>
              ))}
            </View>

            {/* 活躍Warning */}
            <View style={styles.activeWarnings}>
              <Text style={styles.sectionTitle}>活躍警告</Text>
              {warnings
                .filter(w => w.isActive)
                .slice(0, 2)
                .map(warning => (
                  <WarningDisplay
                    key={warning.id}
                    warning={warning}
                    showActions={false}
                  />
                ))}
            </View>
          </View>
        )}

        {activeTab === 'reports' && (
          <View style={styles.reportsContainer}>
            <Text style={styles.sectionTitle}>舉報列表</Text>
            {reports.map(report => (
              <View key={report.id} style={styles.reportItem}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportTitle}>{report.report.title}</Text>
                  <View
                    style={[
                      styles.severityBadge,
                      {
                        backgroundColor: getSeverityColor(
                          report.report.severity
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.severityText}>
                      {report.report.severity === ReportSeverity.LOW && '低'}
                      {report.report.severity === ReportSeverity.MEDIUM && '中'}
                      {report.report.severity === ReportSeverity.HIGH && '高'}
                      {report.report.severity === ReportSeverity.CRITICAL &&
                        '嚴重'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reportDescription}>
                  {report.report.description}
                </Text>
                <View style={styles.reportMetadata}>
                  <Text style={styles.reportType}>
                    類型:{' '}
                    {report.report.reportType === ReportType.FAKE_CARD &&
                      '假卡'}
                  </Text>
                  <Text style={styles.reportStatus}>
                    狀態: {report.response.status}
                  </Text>
                  <Text style={styles.reportDate}>
                    {formatDate(report.createdAt)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'warnings' && (
          <View style={styles.warningsContainer}>
            <Text style={styles.sectionTitle}>警告列表</Text>
            {warnings.map(warning => (
              <WarningDisplay
                key={warning.id}
                warning={warning}
                onAcknowledge={warningId => {
                  Alert.alert('確認', '警告已確認');
                }}
                onDismiss={warningId => {
                  Alert.alert('確認', '警告已忽略');
                }}
              />
            ))}
          </View>
        )}

        {activeTab === 'blacklist' && (
          <View style={styles.blacklistContainer}>
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => setShowBlacklistManager(true)}
            >
              <Ionicons name='settings' size={20} color='#fff' />
              <Text style={styles.manageButtonText}>管理黑名單</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>黑名單條目</Text>
            {blacklist.map(entry => (
              <View key={entry.id} style={styles.blacklistItem}>
                <View style={styles.blacklistHeader}>
                  <Text style={styles.blacklistId}>{entry.targetId}</Text>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(entry.severity) },
                    ]}
                  >
                    <Text style={styles.severityText}>
                      {entry.severity === ReportSeverity.LOW && '低'}
                      {entry.severity === ReportSeverity.MEDIUM && '中'}
                      {entry.severity === ReportSeverity.HIGH && '高'}
                      {entry.severity === ReportSeverity.CRITICAL && '嚴重'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.blacklistReason}>{entry.reason}</Text>
                <Text style={styles.blacklistDate}>
                  創建時間: {formatDate(entry.createdAt)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 舉報Table單模態框 */}
      <Modal
        visible={showReportForm}
        animationType='slide'
        onRequestClose={() => setShowReportForm(false)}
      >
        <ReportForm
          onSuccess={handleSubmitReport}
          onCancel={() => setShowReportForm(false)}
        />
      </Modal>

      {/* 黑名單Manage模態框 */}
      <Modal
        visible={showBlacklistManager}
        animationType='slide'
        onRequestClose={() => setShowBlacklistManager(false)}
      >
        <BlacklistManager onClose={() => setShowBlacklistManager(false)} />
      </Modal>
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  recentReports: {
    marginBottom: 24,
  },
  reportItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reportMetadata: {
    flexDirection: 'row',
    gap: 16,
  },
  reportType: {
    fontSize: 12,
    color: '#999',
  },
  reportStatus: {
    fontSize: 12,
    color: '#999',
  },
  reportDate: {
    fontSize: 12,
    color: '#999',
  },
  activeWarnings: {
    marginBottom: 24,
  },
  reportsContainer: {
    padding: 16,
  },
  warningsContainer: {
    padding: 16,
  },
  blacklistContainer: {
    padding: 16,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  blacklistItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  blacklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  blacklistId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  blacklistReason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  blacklistDate: {
    fontSize: 12,
    color: '#999',
  },
});
