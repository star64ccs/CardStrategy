import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Loading, Skeleton } from '../components/common';
import { theme } from '../config/theme';
import { termsService } from '../services/termsService';
import { TermsAgreementModal } from '../components/terms/TermsAgreementModal';
import {
  TermsType,
  TermsVersion,
  UserConsent,
  TermsComplianceCheck,
  TermsStatistics,
} from '../types/terms';
import {
  TERMS_TYPE_DISPLAY_NAMES,
  TERMS_IMPORTANCE_LEVELS,
} from '../data/termsContent';
import { logger } from '../utils/logger';

const { width } = Dimensions.get('window');

interface TermsManagementScreenProps {
  navigation: any;
}

const TermsManagementScreen: React.FC<TermsManagementScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [compliance, setCompliance] = useState<TermsComplianceCheck | null>(
    null
  );
  const [consentHistory, setConsentHistory] = useState<UserConsent[]>([]);
  const [statistics, setStatistics] = useState<TermsStatistics | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedTermType, setSelectedTermType] = useState<TermsType | null>(
    null
  );

  // 模擬用戶 ID (實際應用中應從認證狀態獲取)
  const userId = 'user-123';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [complianceData, historyData, statsData] = await Promise.all([
        termsService.checkUserConsent(userId),
        termsService.getUserConsentHistory(userId),
        termsService.getTermsStatistics(),
      ]);

      setCompliance(complianceData);
      setConsentHistory(historyData);
      setStatistics(statsData);
    } catch (error) {
      logger.error('加載條款數據失敗:', error);
      Alert.alert('錯誤', '無法加載條款數據，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleViewTerms = (termType: TermsType) => {
    setSelectedTermType(termType);
    setShowTermsModal(true);
  };

  const handleTermsAgree = () => {
    setShowTermsModal(false);
    loadData(); // 重新加載數據
  };

  const handleTermsDecline = () => {
    setShowTermsModal(false);
    Alert.alert('提示', '您已選擇不同意條款。');
  };

  const handleTermsClose = () => {
    setShowTermsModal(false);
  };

  const handleWithdrawConsent = async (termType: TermsType) => {
    Alert.alert(
      '撤回同意',
      `確定要撤回對 ${TERMS_TYPE_DISPLAY_NAMES[termType]} 的同意嗎？\n\n撤回後可能影響某些功能的使用。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定撤回',
          style: 'destructive',
          onPress: async () => {
            try {
              await termsService.withdrawConsent(userId, termType);
              Alert.alert('成功', '已成功撤回同意');
              loadData();
            } catch (error) {
              logger.error('撤回同意失敗:', error);
              Alert.alert('錯誤', '撤回同意失敗，請稍後再試');
            }
          },
        },
      ]
    );
  };

  const getConsentStatus = (termType: TermsType) => {
    const consent = consentHistory.find((c) => c.termsType === termType);
    if (!consent) return 'pending';
    if (
      consent.status === 'accepted' &&
      consent.expiresAt &&
      new Date() > consent.expiresAt
    ) {
      return 'expired';
    }
    return consent.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return theme.colors.success;
      case 'declined':
        return theme.colors.error;
      case 'expired':
        return theme.colors.warning;
      case 'pending':
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return '已同意';
      case 'declined':
        return '已拒絕';
      case 'expired':
        return '已過期';
      case 'pending':
        return '待同意';
      default:
        return '未知';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'warning';
      case 'important':
        return 'information-circle';
      case 'standard':
        return 'checkmark-circle';
      default:
        return 'help-circle';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return theme.colors.error;
      case 'important':
        return theme.colors.warning;
      case 'standard':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>條款管理</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  const renderComplianceStatus = () => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons
          name="shield-checkmark"
          size={24}
          color={theme.colors.primary}
        />
        <Text style={styles.cardTitle}>合規狀態</Text>
      </View>

      <View style={styles.complianceStatus}>
        <View style={styles.statusItem}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: compliance?.compliant
                  ? theme.colors.success
                  : theme.colors.error,
              },
            ]}
          />
          <Text style={styles.statusText}>
            {compliance?.compliant ? '合規' : '不合規'}
          </Text>
        </View>

        {compliance && (
          <View style={styles.complianceDetails}>
            <Text style={styles.detailText}>
              待同意條款：{compliance.pendingTerms.length}
            </Text>
            <Text style={styles.detailText}>
              過期條款：{compliance.expiredTerms.length}
            </Text>
            <Text style={styles.detailText}>
              缺失條款：{compliance.missingTerms.length}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );

  const renderTermsList = () => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="document-text" size={24} color={theme.colors.primary} />
        <Text style={styles.cardTitle}>條款列表</Text>
      </View>

      <View style={styles.termsList}>
        {Object.entries(TERMS_TYPE_DISPLAY_NAMES).map(([type, displayName]) => {
          const status = getConsentStatus(type as TermsType);
          const importance = TERMS_IMPORTANCE_LEVELS[type as TermsType];

          return (
            <View key={type} style={styles.termItem}>
              <View style={styles.termInfo}>
                <View style={styles.termHeader}>
                  <Ionicons
                    name={getImportanceIcon(importance)}
                    size={20}
                    color={getImportanceColor(importance)}
                  />
                  <Text style={styles.termTitle}>{displayName}</Text>
                </View>

                <View style={styles.termStatus}>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(status) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(status) },
                    ]}
                  >
                    {getStatusText(status)}
                  </Text>
                </View>
              </View>

              <View style={styles.termActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleViewTerms(type as TermsType)}
                >
                  <Text style={styles.actionButtonText}>查看</Text>
                </TouchableOpacity>

                {status === 'accepted' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.withdrawButton]}
                    onPress={() => handleWithdrawConsent(type as TermsType)}
                  >
                    <Text style={styles.withdrawButtonText}>撤回</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );

  const renderStatistics = () => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="stats-chart" size={24} color={theme.colors.primary} />
        <Text style={styles.cardTitle}>統計信息</Text>
      </View>

      {statistics ? (
        <View style={styles.statistics}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.acceptanceRate}%</Text>
            <Text style={styles.statLabel}>同意率</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.totalUsers}</Text>
            <Text style={styles.statLabel}>總用戶</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.pendingUsers}</Text>
            <Text style={styles.statLabel}>待同意</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>暫無統計數據</Text>
      )}
    </Card>
  );

  const renderConsentHistory = () => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="time" size={24} color={theme.colors.primary} />
        <Text style={styles.cardTitle}>同意歷史</Text>
      </View>

      {consentHistory.length > 0 ? (
        <View style={styles.historyList}>
          {consentHistory.slice(0, 5).map((consent, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>
                  {TERMS_TYPE_DISPLAY_NAMES[consent.termsType]}
                </Text>
                <Text style={styles.historyDate}>
                  {new Date(consent.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.historyStatus,
                  { color: getStatusColor(consent.status) },
                ]}
              >
                {getStatusText(consent.status)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noDataText}>暫無同意記錄</Text>
      )}
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading size="large" />
        <Text style={styles.loadingText}>正在加載條款數據...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderHeader()}
        {renderComplianceStatus()}
        {renderTermsList()}
        {renderStatistics()}
        {renderConsentHistory()}
      </ScrollView>

      <TermsAgreementModal
        visible={showTermsModal}
        userId={userId}
        onAgree={handleTermsAgree}
        onDecline={handleTermsDecline}
        onClose={handleTermsClose}
        forceAgreement={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 8,
  },
  complianceStatus: {
    alignItems: 'center',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  complianceDetails: {
    alignSelf: 'stretch',
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  termsList: {
    gap: 12,
  },
  termItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  termInfo: {
    flex: 1,
  },
  termHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  termTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 8,
  },
  termStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  termActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  withdrawButton: {
    backgroundColor: theme.colors.error,
  },
  withdrawButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  statistics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  historyDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TermsManagementScreen;
