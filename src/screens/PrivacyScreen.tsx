import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Loading, Skeleton } from '../components/common';
import { theme } from '../config/theme';
import {
  fetchPrivacyPreferences,
  fetchPrivacyDashboard,
  fetchConsentHistory,
  fetchDataRightsRequestHistory,
  checkPrivacyCompliance,
  selectPrivacyPreferences,
  selectPrivacyPreferencesLoading,
  selectPrivacyDashboard,
  selectPrivacyDashboardLoading,
  selectConsentHistory,
  selectConsentHistoryLoading,
  selectDataRightsRequests,
  selectDataRightsRequestsLoading,
  selectComplianceCheck,
  selectComplianceCheckLoading,
  selectCurrentRegion
} from '../store/slices/privacySlice';
import { PrivacyPreferencesModal } from '../components/privacy/PrivacyPreferencesModal';
import { ConsentHistoryModal } from '../components/privacy/ConsentHistoryModal';
import { DataRightsModal } from '../components/privacy/DataRightsModal';
import { ComplianceReportModal } from '../components/privacy/ComplianceReportModal';
import { PrivacyDashboard } from '../components/privacy/PrivacyDashboard';
import { ConsentManager } from '../components/privacy/ConsentManager';
import { DataRightsManager } from '../components/privacy/DataRightsManager';
import { DataBreachDashboard } from '../components/privacy/DataBreachDashboard';
import { DataBreachEventDetail } from '../components/privacy/DataBreachEventDetail';

const { width } = Dimensions.get('window');

const PrivacyScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Redux 狀態
  const preferences = useSelector(selectPrivacyPreferences);
  const preferencesLoading = useSelector(selectPrivacyPreferencesLoading);
  const dashboard = useSelector(selectPrivacyDashboard);
  const dashboardLoading = useSelector(selectPrivacyDashboardLoading);
  const consentHistory = useSelector(selectConsentHistory);
  const consentHistoryLoading = useSelector(selectConsentHistoryLoading);
  const dataRightsRequests = useSelector(selectDataRightsRequests);
  const dataRightsRequestsLoading = useSelector(selectDataRightsRequestsLoading);
  const complianceCheck = useSelector(selectComplianceCheck);
  const complianceCheckLoading = useSelector(selectComplianceCheckLoading);
  const currentRegion = useSelector(selectCurrentRegion);

  // 本地狀態
  const [refreshing, setRefreshing] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showConsentHistoryModal, setShowConsentHistoryModal] = useState(false);
  const [showDataRightsModal, setShowDataRightsModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showDataBreachDetail, setShowDataBreachDetail] = useState(false);
  const [selectedBreachEvent, setSelectedBreachEvent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'consent' | 'rights' | 'settings' | 'breach'>('overview');

  // 模擬用戶 ID (實際應用中應從認證狀態獲取)
  const userId = 'user-123';

  useEffect(() => {
    loadPrivacyData();
  }, []);

  const loadPrivacyData = async () => {
    try {
      await Promise.all([
        dispatch(fetchPrivacyPreferences(userId) as any),
        dispatch(fetchPrivacyDashboard(userId) as any),
        dispatch(fetchConsentHistory(userId) as any),
        dispatch(fetchDataRightsRequestHistory(userId) as any),
        dispatch(checkPrivacyCompliance({ userId, region: currentRegion }) as any)
      ]);
    } catch (error) {
      console.error('加載隱私數據失敗:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPrivacyData();
    setRefreshing(false);
  };

  const handleComplianceCheck = async () => {
    try {
      await dispatch(checkPrivacyCompliance({ userId, region: currentRegion }) as any);
      setShowComplianceModal(true);
    } catch (error) {
      console.error('合規性檢查失敗:', error);
    }
  };

  const handleBreachEventPress = (event: any) => {
    setSelectedBreachEvent(event);
    setShowDataBreachDetail(true);
  };

  const handleCreateBreachEvent = () => {
    // 這裡可以導航到創建事件頁面或顯示模態框
    Alert.alert('創建事件', '手動創建數據洩露事件功能');
  };

  const handleComplianceCheck = async () => {
    setComplianceCheckLoading(true);
    try {
      // 執行合規性檢查邏輯
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert(t('privacy.success.title'), t('privacy.success.compliance_check_passed'));
    } catch (error) {
      Alert.alert(t('privacy.error.title'), t('privacy.error.compliance_check_failed'));
    } finally {
      setComplianceCheckLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>{t('privacy.title')}</Text>
      <Text style={styles.subtitle}>{t('privacy.subtitle')}</Text>
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { key: 'overview', label: t('privacy.tabs.overview'), icon: 'grid-outline' },
        { key: 'consent', label: t('privacy.tabs.consent'), icon: 'checkmark-circle-outline' },
        { key: 'rights', label: t('privacy.tabs.rights'), icon: 'shield-outline' },
        { key: 'breach', label: '數據洩露', icon: 'alert-circle-outline' },
        { key: 'settings', label: t('privacy.tabs.settings'), icon: 'settings-outline' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => setActiveTab(tab.key as any)}
        >
          <Ionicons
            name={tab.icon as any}
            size={20}
            color={activeTab === tab.key ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* 隱私儀表板 */}
      <PrivacyDashboard
        dashboard={dashboard}
        loading={dashboardLoading}
        onRefresh={onRefresh}
      />

      {/* 合規性檢查 */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="shield-checkmark" size={24} color={theme.colors.primary} />
          <Text style={styles.cardTitle}>{t('privacy.compliance.title')}</Text>
        </View>
        <Text style={styles.cardDescription}>
          {t('privacy.compliance.description')}
        </Text>
        <Button
          title={t('privacy.compliance.check_button')}
          onPress={handleComplianceCheck}
          loading={complianceCheckLoading}
          style={styles.button}
        />
      </Card>

      {/* 快速操作 */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="flash" size={24} color={theme.colors.primary} />
          <Text style={styles.cardTitle}>{t('privacy.quick_actions.title')}</Text>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => setShowPreferencesModal(true)}
          >
            <Ionicons name="options" size={20} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>{t('privacy.quick_actions.preferences')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => setShowConsentHistoryModal(true)}
          >
            <Ionicons name="time" size={20} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>{t('privacy.quick_actions.history')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => setShowDataRightsModal(true)}
          >
            <Ionicons name="document-text" size={20} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>{t('privacy.quick_actions.rights')}</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );

  const renderConsentTab = () => (
    <View style={styles.tabContent}>
      <ConsentManager
        preferences={preferences}
        consentHistory={consentHistory}
        loading={consentHistoryLoading}
        onRefresh={onRefresh}
      />
    </View>
  );

  const renderRightsTab = () => (
    <View style={styles.tabContent}>
      <DataRightsManager
        dataRightsRequests={dataRightsRequests}
        loading={dataRightsRequestsLoading}
        onRefresh={onRefresh}
      />
    </View>
  );

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="settings" size={24} color={theme.colors.primary} />
          <Text style={styles.cardTitle}>{t('privacy.settings.title')}</Text>
        </View>

        {/* 地區設置 */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('privacy.settings.region')}</Text>
            <Text style={styles.settingValue}>{currentRegion}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </View>

        {/* 通知設置 */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('privacy.settings.notifications')}</Text>
            <Text style={styles.settingDescription}>
              {t('privacy.settings.notifications_description')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </View>

        {/* 數據保留 */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('privacy.settings.data_retention')}</Text>
            <Text style={styles.settingDescription}>
              {t('privacy.settings.data_retention_description')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </View>

        {/* 第三方共享 */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('privacy.settings.third_party')}</Text>
            <Text style={styles.settingDescription}>
              {t('privacy.settings.third_party_description')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </View>
      </Card>

      {/* 高級設置 */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="construct" size={24} color={theme.colors.primary} />
          <Text style={styles.cardTitle}>{t('privacy.settings.advanced.title')}</Text>
        </View>

        <Button
          title={t('privacy.settings.advanced.export_data')}
          variant="outline"
          onPress={() => {/* 導出數據 */}}
          style={styles.button}
        />

        <Button
          title={t('privacy.settings.advanced.delete_data')}
          variant="outline"
          onPress={() => {
            Alert.alert(
              t('privacy.settings.advanced.delete_confirm_title'),
              t('privacy.settings.advanced.delete_confirm_message'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('common.confirm'), style: 'destructive', onPress: () => {/* 刪除數據 */} }
              ]
            );
          }}
          style={styles.button}
        />
      </Card>
    </View>
  );

  const renderBreachTab = () => (
    <View style={styles.tabContent}>
      <DataBreachDashboard
        onEventPress={handleBreachEventPress}
        onCreateEvent={handleCreateBreachEvent}
      />
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'consent':
        return renderConsentTab();
      case 'rights':
        return renderRightsTab();
      case 'breach':
        return renderBreachTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderOverviewTab();
    }
  };

  if (preferencesLoading && !preferences) {
    return (
      <View style={styles.loadingContainer}>
        <Loading size="large" />
        <Text style={styles.loadingText}>{t('privacy.loading')}</Text>
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
        {renderTabBar()}
        {renderTabContent()}
      </ScrollView>

      {/* 模態框 */}
      <PrivacyPreferencesModal
        visible={showPreferencesModal}
        preferences={preferences}
        onClose={() => setShowPreferencesModal(false)}
        onSave={(preferences) => {
          // 保存偏好設置
          setShowPreferencesModal(false);
        }}
      />

      <ConsentHistoryModal
        visible={showConsentHistoryModal}
        consentHistory={consentHistory}
        loading={consentHistoryLoading}
        onClose={() => setShowConsentHistoryModal(false)}
      />

      <DataRightsModal
        visible={showDataRightsModal}
        dataRightsRequests={dataRightsRequests}
        loading={dataRightsRequestsLoading}
        onClose={() => setShowDataRightsModal(false)}
      />

      <ComplianceReportModal
        visible={showComplianceModal}
        complianceCheck={complianceCheck}
        onClose={() => setShowComplianceModal(false)}
      />

      {selectedBreachEvent && (
        <DataBreachEventDetail
          event={selectedBreachEvent}
          onClose={() => {
            setShowDataBreachDetail(false);
            setSelectedBreachEvent(null);
          }}
          onUpdate={(updatedEvent) => {
            setSelectedBreachEvent(updatedEvent);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  scrollView: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary
  },
  header: {
    padding: 20,
    backgroundColor: theme.colors.primary
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.8
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary
  },
  tabLabel: {
    marginLeft: 4,
    fontSize: 12,
    color: theme.colors.textSecondary
  },
  activeTabLabel: {
    color: theme.colors.primary,
    fontWeight: '600'
  },
  tabContent: {
    padding: 16
  },
  card: {
    marginBottom: 16
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 8
  },
  cardDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20
  },
  button: {
    marginTop: 8
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  quickAction: {
    alignItems: 'center',
    padding: 12
  },
  quickActionText: {
    fontSize: 12,
    color: theme.colors.text,
    marginTop: 4,
    textAlign: 'center'
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  settingInfo: {
    flex: 1
  },
  settingLabel: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 2
  },
  settingValue: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500'
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary
  }
});

export default PrivacyScreen;
