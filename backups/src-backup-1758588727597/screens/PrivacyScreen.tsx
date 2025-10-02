import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../store';
import {
  fetchPrivacySettingsConfig,
  updatePrivacyPreferences,
} from '../store/slices/privacySlice';

const PrivacyScreen: React.FC = () => {
  const _dispatch = useDispatch();
  const _preferences = useSelector(
    (state: RootState) => state.privacy.preferences
  );
  const _preferencesLoading = useSelector(
    (state: RootState) => state.privacy.preferencesLoading
  );
  const _preferencesError = useSelector(
    (state: RootState) => state.privacy.preferencesError
  );
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const _loadPrivacySettings = useCallback(async () => {
    try {
      await dispatch(fetchPrivacySettingsConfig('US') as any);
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    loadPrivacySettings();
  }, [loadPrivacySettings]);

  const _onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadPrivacySettings();
    } finally {
      setRefreshing(false);
    }
  }, [loadPrivacySettings]);

  const _handleComplianceCheck = useCallback(() => {
    Alert.alert('合規檢查', '正在檢查隱私合規性...', [
      { text: '確定', style: 'default' },
    ]);
  }, []);

  const _handleDataRightsRequest = useCallback(() => {
    Alert.alert(
      '數據權利請求',
      '您的數據權利請求已提交，我們將在30天內處理。',
      [{ text: '確定', style: 'default' }]
    );
  }, []);

  const _handleConsentUpdate = useCallback(
    (type: string, value: boolean) => {
      // 這裡需要根據實際的用戶ID來調用
      const _userId = 'current-user-id'; // 應該從認證狀態獲取
      dispatch(
        updatePrivacyPreferences({
          userId,
          preferences: { [type]: value },
        }) as any
      );
    },
    [dispatch]
  );

  if (preferencesLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>載入隱私設置中...</Text>
      </View>
    );
  }

  if (preferencesError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>載入失敗</Text>
        <Text style={styles.errorMessage}>{preferencesError}</Text>
        <Text style={styles.retryText} onPress={loadPrivacySettings}>
          點擊重試
        </Text>
      </View>
    );
  }

  const _renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>隱私概覽</Text>
        <Text style={styles.sectionDescription}>
          管理您的隱私設置和數據權利
        </Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.complianceButton}
          onPress={handleComplianceCheck}
        >
          <Text style={styles.complianceButtonText}>檢查合規性</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>快速操作</Text>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionText}>下載我的數據</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionText}>刪除我的帳戶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const _renderConsentTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>同意管理</Text>
        <Text style={styles.sectionDescription}>管理您對數據處理的同意</Text>
      </View>

      <View style={styles.setting}>
        <Text style={styles.settingTitle}>營銷通訊</Text>
        <TouchableOpacity
          style={[
            styles.toggle,
            preferences?.marketingConsent?.email && styles.toggleActive,
          ]}
          onPress={() =>
            handleConsentUpdate(
              'marketingConsent.email',
              !preferences?.marketingConsent?.email
            )
          }
        >
          <Text style={styles.toggleText}>
            {preferences?.marketingConsent?.email ? '已同意' : '未同意'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.setting}>
        <Text style={styles.settingTitle}>數據分享</Text>
        <TouchableOpacity
          style={[
            styles.toggle,
            preferences?.dataSharingConsent?.analytics && styles.toggleActive,
          ]}
          onPress={() =>
            handleConsentUpdate(
              'dataSharingConsent.analytics',
              !preferences?.dataSharingConsent?.analytics
            )
          }
        >
          <Text style={styles.toggleText}>
            {preferences?.dataSharingConsent?.analytics ? '已同意' : '未同意'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>同意歷史</Text>
        <Text style={styles.historyText}>
          上次更新：
          {preferences?.updatedAt
            ? new Date(preferences.updatedAt).toLocaleDateString()
            : '未知'}
        </Text>
      </View>
    </View>
  );

  const _renderDataRightsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>數據權利</Text>
        <Text style={styles.sectionDescription}>您對個人數據的權利</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.rightTitle}>訪問權</Text>
        <Text style={styles.rightDescription}>
          獲取我們持有的您的個人數據副本
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.rightTitle}>更正權</Text>
        <Text style={styles.rightDescription}>要求更正不準確的個人數據</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.rightTitle}>刪除權</Text>
        <Text style={styles.rightDescription}>要求刪除您的個人數據</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.requestButton}
          onPress={handleDataRightsRequest}
        >
          <Text style={styles.requestButtonText}>提交權利請求</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const _renderSettingsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>隱私設置</Text>
        <Text style={styles.sectionDescription}>自定義您的隱私偏好</Text>
      </View>

      <View style={styles.setting}>
        <Text style={styles.settingTitle}>通知設置</Text>
        <TouchableOpacity
          style={[
            styles.toggle,
            preferences?.notificationPreferences?.privacyUpdates &&
              styles.toggleActive,
          ]}
          onPress={() =>
            handleConsentUpdate(
              'notificationPreferences.privacyUpdates',
              !preferences?.notificationPreferences?.privacyUpdates
            )
          }
        >
          <Text style={styles.toggleText}>
            {preferences?.notificationPreferences?.privacyUpdates
              ? '已啟用'
              : '已停用'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.setting}>
        <Text style={styles.settingTitle}>數據保留</Text>
        <Text style={styles.settingDescription}>自動刪除：30 天</Text>
      </View>

      <View style={styles.setting}>
        <Text style={styles.settingTitle}>高級設置</Text>
        <TouchableOpacity
          style={[
            styles.toggle,
            preferences?.dataRights?.access && styles.toggleActive,
          ]}
          onPress={() =>
            handleConsentUpdate(
              'dataRights.access',
              !preferences?.dataRights?.access
            )
          }
        >
          <Text style={styles.toggleText}>
            {preferences?.dataRights?.access ? '已啟用' : '已停用'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const _renderChildrenProtection = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>兒童保護</Text>
        <Text style={styles.sectionDescription}>保護未成年人的隱私和安全</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.settingTitle}>年齡驗證</Text>
        <Text style={styles.settingDescription}>已啟用：13歲以下用戶限制</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.settingTitle}>家長控制</Text>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionText}>設置家長控制</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const _renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'consent':
        return renderConsentTab();
      case 'rights':
        return renderDataRightsTab();
      case 'settings':
        return renderSettingsTab();
      case 'children':
        return renderChildrenProtection();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>隱私設置</Text>
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'overview', label: '概覽' },
          { key: 'consent', label: '同意' },
          { key: 'rights', label: '權利' },
          { key: 'settings', label: '設置' },
          { key: 'children', label: '兒童保護' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
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

      <ScrollView
        style={styles.content}
        testID='privacy-scroll-view'
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor='#007AFF'
          />
        }
      >
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6C757D',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC3545',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#6C757D',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 16,
  },
  complianceButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
  },
  complianceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickAction: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  quickActionText: {
    fontSize: 16,
    color: '#007AFF',
  },
  setting: {
    marginBottom: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 12,
  },
  toggle: {
    backgroundColor: '#E9ECEF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 14,
    color: '#6C757D',
  },
  historyText: {
    fontSize: 14,
    color: '#6C757D',
  },
  rightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  rightDescription: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 12,
  },
  requestButton: {
    backgroundColor: '#28A745',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PrivacyScreen;
