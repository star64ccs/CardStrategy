import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  FlatList,
} from 'react-native';

import type { Session, SessionActivity } from '../../../core/types';
import { SessionSecurityInfo } from '../../../core/types';
import { logger } from '../../../core/utils/logger';
import { useSession } from '../hooks/useSession';

interface SessionManagerProps {
  showHeader?: boolean;
  onSessionTerminated?: (sessionId: string) => void;
  onError?: (error: string) => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  showHeader = true,
  onSessionTerminated,
  onError,
}) => {
  const {
    currentSession,
    sessions,
    isSessionsLoading,
    sessionsError,
    activities,
    isActivitiesLoading,
    activitiesError,
    securityInfo,
    isSecurityLoading,
    securityError,
    analytics,
    isAnalyticsLoading,
    analyticsError,
    isTerminating,
    terminationError,
    getSessionsList,
    getActivities,
    getSecurity,
    getAnalytics,
    terminate,
    clearSessionsError,
    clearActivitiesError,
    clearSecurityError,
    clearAnalyticsError,
    clearTerminationError,
  } = useSession({
    onSessionError: onError,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'sessions' | 'activities' | 'security' | 'analytics'
  >('sessions');

  useEffect(() => {
    loadAllData();
  }, []);

  const _loadAllData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        getSessionsList(),
        getActivities(),
        getSecurity(),
        getAnalytics(),
      ]);
      clearAllErrors();
    } catch (error: unknown) {
      logger.error('加載會話數據失敗:', error);
      onError?.(error.message || '加載會話數據失敗');
    } finally {
      setRefreshing(false);
    }
  };

  const _clearAllErrors = () => {
    clearSessionsError();
    clearActivitiesError();
    clearSecurityError();
    clearAnalyticsError();
    clearTerminationError();
  };

  const _handleTerminateSession = async (sessionId: string) => {
    Alert.alert('終止會話', '確定要終止這個會話嗎？這將立即登出該設備。', [
      { text: '取消', style: 'cancel' },
      {
        text: '終止',
        style: 'destructive',
        onPress: async () => {
          try {
            await terminate({ sessionId, reason: '用戶手動終止' });
            onSessionTerminated?.(sessionId);
            Alert.alert('成功', '會話已終止');
          } catch (error: unknown) {
            logger.error('終止會話失敗:', error);
            onError?.(error.message || '終止會話失敗');
            Alert.alert('錯誤', error.message || '終止會話失敗');
          }
        },
      },
    ]);
  };

  const _renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size='large' color='#007AFF' />
      <Text style={styles.loadingText}>加載會話數據...</Text>
    </View>
  );

  const _renderError = (error: string | null) =>
    error ? <Text style={styles.errorText}>錯誤: {error}</Text> : null;

  const _renderSessionItem = ({ item }: { item: Session }) => {
    const _isCurrent = item.id === currentSession?.id;
    const _isExpired = new Date() > item.expiresAt;

    return (
      <View
        style={[styles.sessionItem, isCurrent && styles.currentSessionItem]}
      >
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionTitle}>
            {item.deviceInfo.deviceName ||
              item.deviceInfo.deviceModel ||
              '未知設備'}
            {isCurrent && ' (當前)'}
          </Text>
          <View style={styles.sessionStatus}>
            <Text
              style={[
                styles.statusText,
                isExpired ? styles.expiredText : styles.activeText,
              ]}
            >
              {isExpired ? '已過期' : '活躍'}
            </Text>
          </View>
        </View>

        <View style={styles.sessionDetails}>
          <Text style={styles.detailText}>
            平台: {item.deviceInfo.platform} {item.deviceInfo.platformVersion}
          </Text>
          <Text style={styles.detailText}>
            設備類型: {item.deviceInfo.deviceType}
          </Text>
          <Text style={styles.detailText}>
            位置: {item.locationInfo?.country || '未知'}
          </Text>
          <Text style={styles.detailText}>
            創建時間: {item.createdAt.toLocaleString()}
          </Text>
          <Text style={styles.detailText}>
            最後活動: {item.lastActiveAt.toLocaleString()}
          </Text>
          <Text style={styles.detailText}>
            過期時間: {item.expiresAt.toLocaleString()}
          </Text>
        </View>

        {!isCurrent && (
          <TouchableOpacity
            style={[
              styles.terminateButton,
              isTerminating && styles.disabledButton,
            ]}
            onPress={() => handleTerminateSession(item.id)}
            disabled={isTerminating}
          >
            <Text style={styles.terminateButtonText}>終止會話</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const _renderActivityItem = ({ item }: { item: SessionActivity }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityType}>{item.activityType}</Text>
        <Text style={styles.activityTime}>
          {item.timestamp.toLocaleString()}
        </Text>
      </View>
      <Text style={styles.activityDescription}>{item.description}</Text>
      {item.ipAddress && (
        <Text style={styles.activityDetail}>IP: {item.ipAddress}</Text>
      )}
    </View>
  );

  const _renderSessionsTab = () => (
    <View style={styles.tabContent}>
      {renderError(sessionsError)}
      {renderError(terminationError)}

      {isSessionsLoading ? (
        renderLoading()
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSessionItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadAllData} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>沒有找到會話記錄</Text>
          }
        />
      )}
    </View>
  );

  const _renderActivitiesTab = () => (
    <View style={styles.tabContent}>
      {renderError(activitiesError)}

      {isActivitiesLoading ? (
        renderLoading()
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadAllData} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>沒有找到活動記錄</Text>
          }
        />
      )}
    </View>
  );

  const _renderSecurityTab = () => (
    <View style={styles.tabContent}>
      {renderError(securityError)}

      {isSecurityLoading ? (
        renderLoading()
      ) : securityInfo ? (
        <ScrollView
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadAllData} />
          }
        >
          <View style={styles.securitySection}>
            <Text style={styles.sectionTitle}>安全狀態</Text>
            <View style={styles.securityItem}>
              <Text style={styles.securityLabel}>安全評分:</Text>
              <Text
                style={[
                  styles.securityValue,
                  {
                    color:
                      securityInfo.securityScore >= 80 ? '#4CAF50' : '#FF9800',
                  },
                ]}
              >
                {securityInfo.securityScore}/100
              </Text>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityLabel}>風險等級:</Text>
              <Text
                style={[
                  styles.securityValue,
                  { color: getRiskLevelColor(securityInfo.riskLevel) },
                ]}
              >
                {getRiskLevelText(securityInfo.riskLevel)}
              </Text>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityLabel}>是否受損:</Text>
              <Text
                style={[
                  styles.securityValue,
                  { color: securityInfo.isCompromised ? '#F44336' : '#4CAF50' },
                ]}
              >
                {securityInfo.isCompromised ? '是' : '否'}
              </Text>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityLabel}>最後檢查:</Text>
              <Text style={styles.securityValue}>
                {securityInfo.lastSecurityCheck.toLocaleString()}
              </Text>
            </View>
          </View>

          {securityInfo.recommendations.length > 0 && (
            <View style={styles.securitySection}>
              <Text style={styles.sectionTitle}>安全建議</Text>
              {securityInfo.recommendations.map((recommendation, index) => (
                <Text key={index} style={styles.recommendationText}>
                  • {recommendation}
                </Text>
              ))}
            </View>
          )}

          {securityInfo.suspiciousActivities.length > 0 && (
            <View style={styles.securitySection}>
              <Text style={styles.sectionTitle}>可疑活動</Text>
              {securityInfo.suspiciousActivities.map((activity, index) => (
                <View key={index} style={styles.suspiciousActivityItem}>
                  <Text style={styles.suspiciousActivityType}>
                    {activity.activityType}
                  </Text>
                  <Text style={styles.suspiciousActivityDescription}>
                    {activity.description}
                  </Text>
                  <Text style={styles.suspiciousActivityTime}>
                    {activity.timestamp.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>沒有安全信息</Text>
      )}
    </View>
  );

  const _renderAnalyticsTab = () => (
    <View style={styles.tabContent}>
      {renderError(analyticsError)}

      {isAnalyticsLoading ? (
        renderLoading()
      ) : analytics ? (
        <ScrollView
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadAllData} />
          }
        >
          <View style={styles.analyticsSection}>
            <Text style={styles.sectionTitle}>會話統計</Text>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsLabel}>總會話數:</Text>
              <Text style={styles.analyticsValue}>
                {analytics.totalSessions}
              </Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsLabel}>活躍會話:</Text>
              <Text style={styles.analyticsValue}>
                {analytics.activeSessions}
              </Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsLabel}>平均會話時長:</Text>
              <Text style={styles.analyticsValue}>
                {analytics.averageSessionDuration} 分鐘
              </Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsLabel}>最活躍設備:</Text>
              <Text style={styles.analyticsValue}>
                {analytics.mostActiveDevice}
              </Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsLabel}>最活躍位置:</Text>
              <Text style={styles.analyticsValue}>
                {analytics.mostActiveLocation}
              </Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsLabel}>安全事件:</Text>
              <Text style={styles.analyticsValue}>
                {analytics.securityIncidents}
              </Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsLabel}>最後更新:</Text>
              <Text style={styles.analyticsValue}>
                {analytics.lastUpdated.toLocaleString()}
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>沒有分析數據</Text>
      )}
    </View>
  );

  const _getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'high':
        return '#F44336';
      case 'critical':
        return '#9C27B0';
      default:
        return '#666';
    }
  };

  const _getRiskLevelText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return '低';
      case 'medium':
        return '中';
      case 'high':
        return '高';
      case 'critical':
        return '嚴重';
      default:
        return '未知';
    }
  };

  return (
    <View style={styles.container}>
      {showHeader && <Text style={styles.header}>會話管理</Text>}

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sessions' && styles.activeTab]}
          onPress={() => setActiveTab('sessions')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'sessions' && styles.activeTabText,
            ]}
          >
            會話 ({sessions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activities' && styles.activeTab]}
          onPress={() => setActiveTab('activities')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'activities' && styles.activeTabText,
            ]}
          >
            活動 ({activities.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'security' && styles.activeTab]}
          onPress={() => setActiveTab('security')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'security' && styles.activeTabText,
            ]}
          >
            安全
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'analytics' && styles.activeTabText,
            ]}
          >
            分析
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'sessions' && renderSessionsTab()}
      {activeTab === 'activities' && renderActivitiesTab()}
      {activeTab === 'security' && renderSecurityTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
    paddingTop: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    marginHorizontal: 15,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
    paddingHorizontal: 15,
  },
  listContainer: {
    padding: 15,
  },
  scrollContainer: {
    flex: 1,
    padding: 15,
  },
  sessionItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  currentSessionItem: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sessionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeText: {
    color: '#4CAF50',
  },
  expiredText: {
    color: '#F44336',
  },
  sessionDetails: {
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  terminateButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  terminateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  activityItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  activityDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  activityDetail: {
    fontSize: 12,
    color: '#888',
  },
  securitySection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  securityLabel: {
    fontSize: 16,
    color: '#555',
  },
  securityValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  recommendationText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
  suspiciousActivityItem: {
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  suspiciousActivityType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  suspiciousActivityDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  suspiciousActivityTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  analyticsSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  analyticsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  analyticsLabel: {
    fontSize: 16,
    color: '#555',
  },
  analyticsValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
});

export default SessionManager;
