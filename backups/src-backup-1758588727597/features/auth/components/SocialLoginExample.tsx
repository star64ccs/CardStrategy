import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import type { SocialAuthResponse, SocialProvider } from '../../../core/types';
import { SocialAccountLink } from '../../../core/types';
import { useSocialAuth } from '../hooks/useSocialAuth';

import { SocialAccountManager } from './SocialAccountManager';
import { SocialLoginButtons } from './SocialLoginButtons';

/**
 * 社交登錄示例組件
 * 展示如何使用社交登錄功能
 */
export const SocialLoginExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'manage'>('login');
  const [loginResult, setLoginResult] = useState<SocialAuthResponse | null>(
    null
  );

  const {
    isSocialLoggingIn,
    socialLoginError,
    linkedAccounts,
    isLoadingAccounts,
    configuredProviders,
    isCheckingConfig,
    login,
    linkAccount,
    unlinkAccount,
    loadLinkedAccounts,
    clearError,
    reset,
  } = useSocialAuth({
    onLoginSuccess: response => {
      setLoginResult(response);
      Alert.alert('登錄成功', `歡迎 ${response.user.username}！`);
    },
    onLoginError: error => {
      Alert.alert('登錄失敗', error);
    },
    onAccountLinked: account => {
      Alert.alert('帳戶鏈接成功', `${account.name} 帳戶已成功鏈接`);
    },
    onAccountUnlinked: provider => {
      Alert.alert('帳戶解除鏈接', `${provider} 帳戶已解除鏈接`);
    },
  });

  const _handleManualLogin = async () => {
    try {
      // 示例：手動執行社交登錄
      const _credentials = {
        provider: 'google' as SocialProvider,
        accessToken: 'mock-access-token',
        userInfo: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
          firstName: 'Test',
          lastName: 'User',
        },
      };

      const _response = await login(credentials);
      console.log('手動登錄成功:', response);
    } catch (error: unknown) {
      Alert.alert('手動登錄失敗', error.message);
    }
  };

  const _handleManualLink = async () => {
    try {
      // 示例：手動鏈接社交帳戶
      const _credentials = {
        provider: 'facebook' as SocialProvider,
        accessToken: 'mock-facebook-token',
        userInfo: {
          id: '456',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      const _account = await linkAccount(credentials);
      console.log('手動鏈接成功:', account);
    } catch (error: unknown) {
      Alert.alert('手動鏈接失敗', error.message);
    }
  };

  const _handleRefreshAccounts = async () => {
    try {
      const _accounts = await loadLinkedAccounts();
      console.log('刷新帳戶成功:', accounts);
    } catch (error: unknown) {
      Alert.alert('刷新帳戶失敗', error.message);
    }
  };

  const _handleReset = () => {
    reset();
    setLoginResult(null);
    Alert.alert('重置完成', '社交登錄狀態已重置');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>社交登錄示例</Text>
        <Text style={styles.subtitle}>展示多平台社交登錄功能的使用方法</Text>
      </View>

      {/* 標籤切換 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'login' && styles.activeTab]}
          onPress={() => setActiveTab('login')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'login' && styles.activeTabText,
            ]}
          >
            登錄
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'manage' && styles.activeTab]}
          onPress={() => setActiveTab('manage')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'manage' && styles.activeTabText,
            ]}
          >
            帳戶管理
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'login' ? (
          <View style={styles.loginSection}>
            {/* 狀態信息 */}
            <View style={styles.statusSection}>
              <Text style={styles.sectionTitle}>當前狀態</Text>
              <Text style={styles.statusText}>
                登錄中: {isSocialLoggingIn ? '是' : '否'}
              </Text>
              <Text style={styles.statusText}>
                檢查配置: {isCheckingConfig ? '是' : '否'}
              </Text>
              <Text style={styles.statusText}>
                已配置提供商: {configuredProviders.join(', ') || '無'}
              </Text>
              {socialLoginError && (
                <Text style={styles.errorText}>錯誤: {socialLoginError}</Text>
              )}
            </View>

            {/* 登錄結果 */}
            {loginResult && (
              <View style={styles.resultSection}>
                <Text style={styles.sectionTitle}>登錄結果</Text>
                <Text style={styles.resultText}>
                  用戶: {loginResult.user.username}
                </Text>
                <Text style={styles.resultText}>
                  郵箱: {loginResult.user.email}
                </Text>
                <Text style={styles.resultText}>
                  提供商: {loginResult.provider}
                </Text>
                <Text style={styles.resultText}>
                  新用戶: {loginResult.isNewUser ? '是' : '否'}
                </Text>
              </View>
            )}

            {/* 社交登錄按鈕 */}
            <View style={styles.loginSection}>
              <Text style={styles.sectionTitle}>社交登錄</Text>
              <SocialLoginButtons
                onLoginSuccess={response => {
                  setLoginResult(response);
                  Alert.alert('登錄成功', `歡迎 ${response.user.username}！`);
                }}
                onLoginError={error => {
                  Alert.alert('登錄失敗', error);
                }}
                onProviderNotConfigured={provider => {
                  Alert.alert('未配置', `${provider} 登錄尚未配置`);
                }}
              />
            </View>

            {/* 手動操作按鈕 */}
            <View style={styles.manualSection}>
              <Text style={styles.sectionTitle}>手動操作</Text>
              <TouchableOpacity
                style={styles.manualButton}
                onPress={handleManualLogin}
              >
                <Text style={styles.manualButtonText}>手動 Google 登錄</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.manualButton}
                onPress={handleManualLink}
              >
                <Text style={styles.manualButtonText}>手動鏈接 Facebook</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.manualButton}
                onPress={clearError}
              >
                <Text style={styles.manualButtonText}>清除錯誤</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.manualButton, styles.resetButton]}
                onPress={handleReset}
              >
                <Text style={styles.manualButtonText}>重置狀態</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.manageSection}>
            {/* 帳戶管理 */}
            <View style={styles.manageHeader}>
              <Text style={styles.sectionTitle}>帳戶管理</Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefreshAccounts}
                disabled={isLoadingAccounts}
              >
                <Text style={styles.refreshButtonText}>
                  {isLoadingAccounts ? '加載中...' : '刷新帳戶'}
                </Text>
              </TouchableOpacity>
            </View>

            <SocialAccountManager
              onAccountLinked={account => {
                Alert.alert('帳戶鏈接成功', `${account.name} 帳戶已成功鏈接`);
              }}
              onAccountUnlinked={provider => {
                Alert.alert('帳戶解除鏈接', `${provider} 帳戶已解除鏈接`);
              }}
              onError={error => {
                Alert.alert('帳戶管理錯誤', error);
              }}
              showHeader={false}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4285F4',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4285F4',
  },
  content: {
    flex: 1,
  },
  loginSection: {
    padding: 20,
  },
  manageSection: {
    flex: 1,
  },
  statusSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultSection: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  manualSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  manualButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#F44336',
  },
  manualButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  manageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  refreshButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SocialLoginExample;
