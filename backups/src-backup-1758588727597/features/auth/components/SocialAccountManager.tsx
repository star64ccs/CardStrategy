import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';

import type { SocialProvider, SocialAccountLink } from '../../../core/types';
import { logger } from '../../../core/utils/logger';
import { useAppDispatch } from '../../../store/hooks';
import {
  getLinkedSocialAccounts,
  unlinkSocialAccount,
  linkSocialAccount,
  selectLinkedAccounts,
  selectIsLoadingAccounts,
  selectAccountsError,
  clearAccountsError,
} from '../../../store/slices/socialAuthSlice';

interface SocialAccountManagerProps {
  onAccountLinked?: (account: SocialAccountLink) => void;
  onAccountUnlinked?: (provider: SocialProvider) => void;
  onError?: (error: string) => void;
  style?: unknown;
  showHeader?: boolean;
  refreshable?: boolean;
}

interface SocialProviderInfo {
  name: string;
  icon: string;
  color: string;
  backgroundColor: string;
}

const SOCIAL_PROVIDER_INFO: Record<SocialProvider, SocialProviderInfo> = {
  google: {
    name: 'Google',
    icon: '🔍',
    color: '#4285F4',
    backgroundColor: '#E8F0FE',
  },
  facebook: {
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    backgroundColor: '#E7F3FF',
  },
  apple: {
    name: 'Apple',
    icon: '🍎',
    color: '#000000',
    backgroundColor: '#F2F2F2',
  },
  twitter: {
    name: 'Twitter',
    icon: '🐦',
    color: '#1DA1F2',
    backgroundColor: '#E8F4FD',
  },
  github: {
    name: 'GitHub',
    icon: '🐙',
    color: '#333333',
    backgroundColor: '#F6F8FA',
  },
  discord: {
    name: 'Discord',
    icon: '🎮',
    color: '#5865F2',
    backgroundColor: '#EDF2FF',
  },
  line: {
    name: 'LINE',
    icon: '💬',
    color: '#00B900',
    backgroundColor: '#E8F8E8',
  },
  kakao: {
    name: 'Kakao',
    icon: '💛',
    color: '#000000',
    backgroundColor: '#FEF9E7',
  },
};

export const SocialAccountManager: React.FC<SocialAccountManagerProps> = ({
  onAccountLinked,
  onAccountUnlinked,
  onError,
  style,
  showHeader = true,
  refreshable = true,
}) => {
  const _dispatch = useAppDispatch();
  const _linkedAccounts = useSelector(selectLinkedAccounts);
  const _isLoadingAccounts = useSelector(selectIsLoadingAccounts);
  const _accountsError = useSelector(selectAccountsError);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // 初始加載已鏈接的社交帳戶
    loadLinkedAccounts();
  }, []);

  useEffect(() => {
    // 處理錯誤
    if (accountsError) {
      onError?.(accountsError);
      dispatch(clearAccountsError());
    }
  }, [accountsError, onError, dispatch]);

  /**
   * 加載已鏈接的社交帳戶
   */
  const _loadLinkedAccounts = async () => {
    try {
      await dispatch(getLinkedSocialAccounts()).unwrap();
    } catch (error: unknown) {
      logger.error('加載已鏈接社交帳戶失敗:', { error });
    }
  };

  /**
   * 刷新數據
   */
  const _handleRefresh = async () => {
    if (!refreshable) return;

    setRefreshing(true);
    try {
      await loadLinkedAccounts();
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * 解除鏈接社交帳戶
   */
  const _handleUnlinkAccount = async (account: SocialAccountLink) => {
    Alert.alert(
      '解除鏈接帳戶',
      `確定要解除鏈接 ${SOCIAL_PROVIDER_INFO[account.provider].name} 帳戶嗎？`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '解除鏈接',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(unlinkSocialAccount(account.provider)).unwrap();
              logger.info('社交帳戶解除鏈接成功:', {
                provider: account.provider,
              });
              onAccountUnlinked?.(account.provider);
            } catch (error: unknown) {
              logger.error('社交帳戶解除鏈接失敗:', {
                error,
                provider: account.provider,
              });
              Alert.alert('錯誤', error.message || '解除鏈接失敗');
            }
          },
        },
      ]
    );
  };

  /**
   * 渲染社交帳戶項目
   */
  const _renderAccountItem = (account: SocialAccountLink) => {
    const _providerInfo = SOCIAL_PROVIDER_INFO[account.provider];
    const { isVerified } = account;

    return (
      <View key={account.id} style={styles.accountItem}>
        <View style={styles.accountInfo}>
          <View
            style={[
              styles.providerIcon,
              { backgroundColor: providerInfo.backgroundColor },
            ]}
          >
            <Text style={styles.icon}>{providerInfo.icon}</Text>
          </View>

          <View style={styles.accountDetails}>
            <Text style={styles.providerName}>{providerInfo.name}</Text>
            <Text style={styles.accountEmail}>{account.email}</Text>
            <Text style={styles.accountName}>{account.name}</Text>

            <View style={styles.accountMeta}>
              <Text style={styles.linkedDate}>
                鏈接於: {new Date(account.linkedAt).toLocaleDateString()}
              </Text>
              {isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>已驗證</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.unlinkButton}
          onPress={() => handleUnlinkAccount(account)}
          activeOpacity={0.7}
        >
          <Text style={styles.unlinkButtonText}>解除鏈接</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * 渲染空狀態
   */
  const _renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔗</Text>
      <Text style={styles.emptyTitle}>暫無鏈接的社交帳戶</Text>
      <Text style={styles.emptyDescription}>
        您可以鏈接社交帳戶以便快速登錄
      </Text>
    </View>
  );

  /**
   * 渲染加載狀態
   */
  const _renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size='large' color='#4285F4' />
      <Text style={styles.loadingText}>加載社交帳戶...</Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>社交帳戶管理</Text>
          <Text style={styles.headerSubtitle}>管理您已鏈接的社交登錄帳戶</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          refreshable ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#4285F4']}
              tintColor='#4285F4'
            />
          ) : undefined
        }
      >
        {isLoadingAccounts ? (
          renderLoadingState()
        ) : linkedAccounts.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.accountsList}>
            {linkedAccounts.map(renderAccountItem)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  accountsList: {
    padding: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  accountInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  accountDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  accountEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  accountName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  accountMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkedDate: {
    fontSize: 12,
    color: '#999',
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  unlinkButton: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  unlinkButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
});

export default SocialAccountManager;
