import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '@/config/theme';
import {
  notificationService,
  NotificationSettings,
} from '@/services/notificationService';
import { logger } from '@/utils/logger';

export const NotificationSettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    priceAlerts: true,
    marketUpdates: true,
    investmentAdvice: true,
    systemNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    checkNotificationPermission();
    loadSettings();
  }, []);

  const checkNotificationPermission = async () => {
    try {
      const status = await notificationService.getPermissionStatus();
      setHasPermission(status.granted);
    } catch (error) {
      logger.error('檢查通知權限失敗:', { error });
      setHasPermission(false);
    }
  };

  const loadSettings = async () => {
    try {
      // 從本地存儲加載設置
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const savedSettings = await AsyncStorage.getItem('notification_settings');

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } else {
        // 使用默認設置
        setSettings(defaultSettings);
      }
    } catch (error) {
      logger.error('加載通知設置失敗:', { error });
      // 使用默認設置
      setSettings(defaultSettings);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      setSettings(newSettings);

      // 保存到本地存儲
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem(
        'notification_settings',
        JSON.stringify(newSettings)
      );

      // 同步到 Redux store
      const { store } = require('@/store');
      store.dispatch({
        type: 'settings/updateNotificationSettings',
        payload: newSettings,
      });

      logger.info('通知設置已保存', { settings: newSettings });
    } catch (error) {
      logger.error('保存通知設置失敗:', { error });
      Alert.alert('錯誤', '保存設置失敗，請重試');
    }
  };

  const requestPermission = async () => {
    try {
      setIsLoading(true);
      await notificationService.initialize();
      await checkNotificationPermission();
      Alert.alert('成功', '通知權限已授予');
    } catch (error) {
      logger.error('請求通知權限失敗:', { error });
      Alert.alert('錯誤', '無法獲取通知權限，請在設置中手動開啟');
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      setIsLoading(true);
      await notificationService.testNotification();
      Alert.alert('成功', '測試通知已發送');
    } catch (error) {
      logger.error('發送測試通知失敗:', { error });
      Alert.alert('錯誤', '發送測試通知失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    saveSettings(newSettings);
  };

  const renderSettingItem = (
    title: string,
    description: string,
    key: keyof NotificationSettings,
    icon: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={() => toggleSetting(key)}
        trackColor={{
          false: theme.colors.borderLight,
          true: theme.colors.primary,
        }}
        thumbColor={settings[key] ? theme.colors.white : theme.colors.gray}
      />
    </View>
  );

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <Text style={styles.loadingText}>檢查通知權限...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* 權限狀態 */}
        {!hasPermission && (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>需要通知權限</Text>
            <Text style={styles.permissionText}>
              開啟通知權限以接收價格提醒、市場更新等重要信息
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size='small' color={theme.colors.white} />
              ) : (
                <Text style={styles.permissionButtonText}>開啟通知權限</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* 通知類型設置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知類型</Text>

          {renderSettingItem(
            '價格提醒',
            '當關注的卡牌價格達到目標時通知您',
            'priceAlerts',
            '💰'
          )}

          {renderSettingItem(
            '市場更新',
            '接收市場趨勢和重要更新信息',
            'marketUpdates',
            '📈'
          )}

          {renderSettingItem(
            '投資建議',
            '接收 AI 生成的投資建議和提醒',
            'investmentAdvice',
            '🤖'
          )}

          {renderSettingItem(
            '系統通知',
            '接收應用更新和維護信息',
            'systemNotifications',
            '⚙️'
          )}
        </View>

        {/* 通知方式設置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知方式</Text>

          {renderSettingItem(
            '聲音提醒',
            '通知時播放提示音',
            'soundEnabled',
            '🔊'
          )}

          {renderSettingItem(
            '震動提醒',
            '通知時震動提醒',
            'vibrationEnabled',
            '📳'
          )}
        </View>

        {/* 測試和重置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>測試與管理</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={testNotification}
            disabled={isLoading || !hasPermission}
          >
            <Text style={styles.actionButtonIcon}>🔔</Text>
            <View style={styles.actionButtonText}>
              <Text style={styles.actionButtonTitle}>發送測試通知</Text>
              <Text style={styles.actionButtonDescription}>
                發送一個測試通知來驗證設置
              </Text>
            </View>
            {isLoading && (
              <ActivityIndicator size='small' color={theme.colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={() => {
              Alert.alert('確認操作', '確定要清除所有通知設置嗎？', [
                { text: '取消', style: 'cancel' },
                {
                  text: '確定',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await notificationService.cancelAllNotifications();
                      Alert.alert('成功', '所有通知已清除');
                    } catch (error) {
                      logger.error('清除通知失敗:', { error });
                      Alert.alert('錯誤', '清除通知失敗，請重試');
                    }
                  },
                },
              ]);
            }}
          >
            <Text style={styles.actionButtonIcon}>🗑️</Text>
            <View style={styles.actionButtonText}>
              <Text style={styles.actionButtonTitle}>清除所有通知</Text>
              <Text style={styles.actionButtonDescription}>
                清除所有已安排的通知
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 說明信息 */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>💡 使用提示</Text>
          <Text style={styles.infoText}>
            • 價格提醒：設置目標價格後，當卡牌價格達到目標時會自動通知{'\n'}•
            市場更新：定期接收市場趨勢分析和重要更新{'\n'}• 投資建議：AI
            會根據您的投資組合提供個性化建議{'\n'}•
            系統通知：包含應用更新、維護等重要信息
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  content: {
    flex: 1,
    padding: theme.spacing.large,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  permissionContainer: {
    backgroundColor: theme.colors.warning,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.large,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.small,
  },
  permissionText: {
    fontSize: 14,
    color: theme.colors.white,
    marginBottom: theme.spacing.medium,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: theme.colors.warning,
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.medium,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: theme.spacing.medium,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.small,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.backgroundPaper,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
  },
  dangerButton: {
    backgroundColor: `${theme.colors.error}20`,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginRight: theme.spacing.medium,
  },
  actionButtonText: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.small,
  },
  actionButtonDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  infoContainer: {
    backgroundColor: theme.colors.backgroundPaper,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    marginTop: theme.spacing.large,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.medium,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
