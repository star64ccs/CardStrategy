import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type {
  AndroidPushNotificationConfig,
  AndroidPushNotificationPayload,
} from '../services/androidPushNotificationService';
import { AndroidPushNotificationService } from '../services/androidPushNotificationService';

interface AndroidPushNotificationExampleProps {
  onSuccess?: (result: unknown) => void;
  onError?: (error: unknown) => void;
}

/**
 * Android 推送通知示例組件
 * 展示完整的 FCM 推送通知功能
 */
export const AndroidPushNotificationExample: React.FC<
  AndroidPushNotificationExampleProps
> = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [serviceInfo, setServiceInfo] = useState<any>(null);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('測試推送通知');
  const [notificationBody, setNotificationBody] =
    useState('這是一個測試推送通知');
  const [targetToken, setTargetToken] = useState('');
  const [topicName, setTopicName] = useState('test-topic');
  const [enableVibration, setEnableVibration] = useState(true);
  const [enableSound, setEnableSound] = useState(true);
  const [enableBadge, setEnableBadge] = useState(true);
  const [priority, setPriority] = useState<'default' | 'high'>('high');

  const _pushService = AndroidPushNotificationService.getInstance();

  useEffect(() => {
    initializeService();
  }, []);

  /**
   * 初始化服務
   */
  const _initializeService = async () => {
    try {
      setIsLoading(true);

      // 配置推送通知服務
      const config: AndroidPushNotificationConfig = {
        fcmServerKey: 'test-server-key',
        fcmProjectId: 'test-project-id',
        fcmEnvironment: 'development',
        enableBadge: true,
        enableSound: true,
        enableAlert: true,
        enableVibration: true,
        priority: 'high',
        timeToLive: 3600,
      };

      pushService.configure(config);

      // 獲取服務信息
      const _info = pushService.getServiceInfo();
      setServiceInfo(info);

      // 獲取統計信息
      const _deliveryStats = await pushService.getDeliveryStats();
      setStats(deliveryStats);
    } catch (error) {
      console.error('初始化 Android 推送通知服務失敗:', error);
      Alert.alert('錯誤', '初始化推送通知服務失敗');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 請求推送通知權限
   */
  const _requestPermissions = async () => {
    try {
      setIsLoading(true);

      const _granted = await pushService.requestPermissions();

      if (granted) {
        Alert.alert('成功', '推送通知權限已授予');
        onSuccess?.({ type: 'permissions_granted' });
      } else {
        Alert.alert('失敗', '推送通知權限被拒絕');
        onError?.({ type: 'permissions_denied' });
      }
    } catch (error) {
      console.error('請求推送通知權限失敗:', error);
      Alert.alert('錯誤', '請求權限失敗');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 註冊遠程推送通知
   */
  const _registerForRemoteNotifications = async () => {
    try {
      setIsLoading(true);

      const _success = await pushService.registerForRemoteNotifications();

      if (success) {
        const _token = await pushService.getDeviceToken();
        setDeviceToken(token);
        setIsRegistered(true);

        Alert.alert('成功', '遠程推送通知註冊成功');
        onSuccess?.({ type: 'registration_success', token });
      } else {
        Alert.alert('失敗', '遠程推送通知註冊失敗');
        onError?.({ type: 'registration_failed' });
      }
    } catch (error) {
      console.error('註冊遠程推送通知失敗:', error);
      Alert.alert('錯誤', '註冊失敗');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 取消註冊遠程推送通知
   */
  const _unregisterForRemoteNotifications = async () => {
    try {
      setIsLoading(true);

      const _success = await pushService.unregisterForRemoteNotifications();

      if (success) {
        setDeviceToken(null);
        setIsRegistered(false);

        Alert.alert('成功', '遠程推送通知取消註冊成功');
        onSuccess?.({ type: 'unregistration_success' });
      } else {
        Alert.alert('失敗', '遠程推送通知取消註冊失敗');
        onError?.({ type: 'unregistration_failed' });
      }
    } catch (error) {
      console.error('取消註冊遠程推送通知失敗:', error);
      Alert.alert('錯誤', '取消註冊失敗');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 發送推送通知
   */
  const _sendNotification = async () => {
    try {
      setIsLoading(true);

      if (!targetToken) {
        Alert.alert('錯誤', '請輸入目標設備令牌');
        return;
      }

      const payload: AndroidPushNotificationPayload = {
        notification: {
          title: notificationTitle,
          body: notificationBody,
          icon: 'ic_notification',
          color: '#FF0000',
          sound: enableSound ? 'default' : undefined,
          channelId: 'default',
        },
        android: {
          priority: priority === 'default' ? 'normal' : priority,
          notification: {
            icon: 'ic_android_notification',
            color: '#00FF00',
            channelId: 'default',
            priority,
            defaultSound: enableSound,
            defaultVibrateTimings: enableVibration,
            visibility: 'public',
          },
        },
        data: {
          type: 'test',
          timestamp: Date.now().toString(),
          platform: 'android',
        },
      };

      const _result = await pushService.sendNotification(targetToken, payload);

      if (result.success) {
        Alert.alert(
          '發送成功',
          `消息ID: ${result.messageId}\n時間: ${result.timestamp.toLocaleString()}`
        );
        onSuccess?.(result);
      } else {
        Alert.alert(
          '發送失敗',
          `錯誤: ${result.error}\n錯誤代碼: ${result.errorCode}`
        );
        onError?.(result);
      }

      // 更新統計信息
      const _updatedStats = await pushService.getDeliveryStats();
      setStats(updatedStats);
    } catch (error) {
      console.error('發送推送通知失敗:', error);
      Alert.alert('錯誤', '發送失敗');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 批量發送推送通知
   */
  const _sendBulkNotifications = async () => {
    try {
      setIsLoading(true);

      const _deviceTokens = [
        'test-device-token-1',
        'test-device-token-2',
        'test-device-token-3',
      ];

      const payload: AndroidPushNotificationPayload = {
        notification: {
          title: notificationTitle,
          body: notificationBody,
          channelId: 'default',
        },
        data: {
          type: 'bulk_test',
          timestamp: Date.now().toString(),
        },
      };

      const _results = await pushService.sendBulkNotifications(
        deviceTokens,
        payload
      );

      const _successCount = results.filter(r => r.success).length;
      const _failureCount = results.filter(r => !r.success).length;

      Alert.alert(
        '批量發送完成',
        `成功: ${successCount}\n失敗: ${failureCount}\n總計: ${deviceTokens.length}`
      );

      onSuccess?.({ type: 'bulk_send_complete', results });

      // 更新統計信息
      const _updatedStats = await pushService.getDeliveryStats();
      setStats(updatedStats);
    } catch (error) {
      console.error('批量發送推送通知失敗:', error);
      Alert.alert('錯誤', '批量發送失敗');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 訂閱主題
   */
  const _subscribeToTopic = async () => {
    try {
      setIsLoading(true);

      const _success = await pushService.subscribeToTopic(topicName);

      if (success) {
        Alert.alert('成功', `已訂閱主題: ${topicName}`);
        onSuccess?.({ type: 'topic_subscribed', topic: topicName });
      } else {
        Alert.alert('失敗', `訂閱主題失敗: ${topicName}`);
        onError?.({ type: 'topic_subscription_failed', topic: topicName });
      }

      // 更新統計信息
      const _updatedStats = await pushService.getDeliveryStats();
      setStats(updatedStats);
    } catch (error) {
      console.error('訂閱主題失敗:', error);
      Alert.alert('錯誤', '訂閱主題失敗');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 取消訂閱主題
   */
  const _unsubscribeFromTopic = async () => {
    try {
      setIsLoading(true);

      const _success = await pushService.unsubscribeFromTopic(topicName);

      if (success) {
        Alert.alert('成功', `已取消訂閱主題: ${topicName}`);
        onSuccess?.({ type: 'topic_unsubscribed', topic: topicName });
      } else {
        Alert.alert('失敗', `取消訂閱主題失敗: ${topicName}`);
        onError?.({ type: 'topic_unsubscription_failed', topic: topicName });
      }

      // 更新統計信息
      const _updatedStats = await pushService.getDeliveryStats();
      setStats(updatedStats);
    } catch (error) {
      console.error('取消訂閱主題失敗:', error);
      Alert.alert('錯誤', '取消訂閱主題失敗');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 驗證設備令牌
   */
  const _validateDeviceToken = async () => {
    try {
      setIsLoading(true);

      if (!targetToken) {
        Alert.alert('錯誤', '請輸入要驗證的設備令牌');
        return;
      }

      const _isValid = await pushService.validateDeviceToken(targetToken);

      if (isValid) {
        Alert.alert('驗證結果', '設備令牌有效');
        onSuccess?.({ type: 'token_valid', token: targetToken });
      } else {
        Alert.alert('驗證結果', '設備令牌無效');
        onError?.({ type: 'token_invalid', token: targetToken });
      }
    } catch (error) {
      console.error('驗證設備令牌失敗:', error);
      Alert.alert('錯誤', '驗證失敗');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 刷新統計信息
   */
  const _refreshStats = async () => {
    try {
      setIsLoading(true);

      const _updatedStats = await pushService.getDeliveryStats();
      setStats(updatedStats);

      Alert.alert('成功', '統計信息已更新');
    } catch (error) {
      console.error('刷新統計信息失敗:', error);
      Alert.alert('錯誤', '刷新統計信息失敗');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 渲染服務信息
   */
  const _renderServiceInfo = () => {
    if (!serviceInfo) return null;

    return (
      <View style={styles.serviceInfo}>
        <Text style={styles.sectionTitle}>服務信息</Text>
        <Text>平台: {serviceInfo.platform}</Text>
        <Text>已初始化: {serviceInfo.isInitialized ? '是' : '否'}</Text>
        <Text>服務就緒: {serviceInfo.isServiceReady ? '是' : '否'}</Text>
        <Text>設備令牌: {serviceInfo.deviceToken || '未獲取'}</Text>
        {serviceInfo.config && (
          <>
            <Text>環境: {serviceInfo.config.fcmEnvironment}</Text>
            <Text>
              啟用徽章: {serviceInfo.config.enableBadge ? '是' : '否'}
            </Text>
            <Text>
              啟用聲音: {serviceInfo.config.enableSound ? '是' : '否'}
            </Text>
            <Text>
              啟用震動: {serviceInfo.config.enableVibration ? '是' : '否'}
            </Text>
          </>
        )}
      </View>
    );
  };

  /**
   * 渲染統計信息
   */
  const _renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsInfo}>
        <Text style={styles.sectionTitle}>統計信息</Text>
        <Text>總發送: {stats.totalSent}</Text>
        <Text>總投遞: {stats.totalDelivered}</Text>
        <Text>總失敗: {stats.totalFailed}</Text>
        <Text>成功率: {stats.successRate.toFixed(2)}%</Text>
        <Text>主題訂閱: {stats.topicSubscriptions}</Text>
        <Text>活躍令牌: {stats.activeTokens}</Text>
        {stats.lastSentAt && (
          <Text>最後發送: {stats.lastSentAt.toLocaleString()}</Text>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>處理中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Android 推送通知示例</Text>

      {/* 服務信息 */}
      {renderServiceInfo()}

      {/* 統計信息 */}
      {renderStats()}

      {/* 權限和註冊 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>權限和註冊</Text>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={requestPermissions}
        >
          <Text style={styles.buttonText}>請求推送通知權限</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={registerForRemoteNotifications}
        >
          <Text style={styles.buttonText}>註冊遠程推送通知</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={unregisterForRemoteNotifications}
        >
          <Text style={styles.buttonText}>取消註冊遠程推送通知</Text>
        </TouchableOpacity>

        {deviceToken && (
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenLabel}>設備令牌:</Text>
            <Text style={styles.tokenValue}>{deviceToken}</Text>
          </View>
        )}
      </View>

      {/* 推送通知配置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>推送通知配置</Text>

        <TextInput
          style={styles.input}
          placeholder='通知標題'
          value={notificationTitle}
          onChangeText={setNotificationTitle}
        />

        <TextInput
          style={styles.input}
          placeholder='通知內容'
          value={notificationBody}
          onChangeText={setNotificationBody}
          multiline
        />

        <View style={styles.configItem}>
          <Text>啟用震動:</Text>
          <Switch value={enableVibration} onValueChange={setEnableVibration} />
        </View>

        <View style={styles.configItem}>
          <Text>啟用聲音:</Text>
          <Switch value={enableSound} onValueChange={setEnableSound} />
        </View>

        <View style={styles.configItem}>
          <Text>啟用徽章:</Text>
          <Switch value={enableBadge} onValueChange={setEnableBadge} />
        </View>

        <View style={styles.configItem}>
          <Text>優先級: {priority}</Text>
          <TouchableOpacity
            style={styles.priorityButton}
            onPress={() =>
              setPriority(priority === 'high' ? 'default' : 'high')
            }
          >
            <Text style={styles.priorityButtonText}>切換</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 推送通知發送 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>推送通知發送</Text>

        <TextInput
          style={styles.input}
          placeholder='目標設備令牌'
          value={targetToken}
          onChangeText={setTargetToken}
        />

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={sendNotification}
        >
          <Text style={styles.buttonText}>發送單個推送通知</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={sendBulkNotifications}
        >
          <Text style={styles.buttonText}>批量發送推送通知</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={validateDeviceToken}
        >
          <Text style={styles.buttonText}>驗證設備令牌</Text>
        </TouchableOpacity>
      </View>

      {/* 主題訂閱 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>主題訂閱</Text>

        <TextInput
          style={styles.input}
          placeholder='主題名稱'
          value={topicName}
          onChangeText={setTopicName}
        />

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={subscribeToTopic}
        >
          <Text style={styles.buttonText}>訂閱主題</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={unsubscribeFromTopic}
        >
          <Text style={styles.buttonText}>取消訂閱主題</Text>
        </TouchableOpacity>
      </View>

      {/* 其他操作 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>其他操作</Text>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={refreshStats}
        >
          <Text style={styles.buttonText}>刷新統計信息</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  serviceInfo: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsInfo: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  warningButton: {
    backgroundColor: '#FF9500',
  },
  infoButton: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priorityButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  priorityButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tokenInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tokenValue: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default AndroidPushNotificationExample;
