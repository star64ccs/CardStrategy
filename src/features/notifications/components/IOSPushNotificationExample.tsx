import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';

import type {
  IOSPushNotificationConfig,
  IOSPushNotificationPayload,
} from '../services/iosPushNotificationService';
import { IOSPushNotificationService } from '../services/iosPushNotificationService';

interface IOSPushNotificationExampleProps {
  title?: string;
}

export const IOSPushNotificationExample: React.FC<
  IOSPushNotificationExampleProps
> = ({ title = 'iOS 推送通知服務示例' }) => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [notificationTitle, setNotificationTitle] = useState('測試標題');
  const [notificationBody, setNotificationBody] = useState('測試內容');
  const [customData, setCustomData] = useState('{"type": "test", "id": "123"}');
  const [enableBadge, setEnableBadge] = useState(true);
  const [enableSound, setEnableSound] = useState(true);
  const [enableAlert, setEnableAlert] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const _iosPushService = IOSPushNotificationService.getInstance();

  useEffect(() => {
    checkServiceStatus();
  }, []);

  const _checkServiceStatus = () => {
    const _serviceInfo = iosPushService.getServiceInfo();
    setIsConfigured(serviceInfo.isServiceReady);
    setDeviceToken(serviceInfo.hasDeviceToken ? '已獲取' : null);
  };

  const _configureService = () => {
    const config: IOSPushNotificationConfig = {
      apnsKeyId: 'test_key_id',
      apnsTeamId: 'test_team_id',
      apnsBundleId: 'com.cardstrategy.app',
      apnsEnvironment: 'development',
      enableBadge,
      enableSound,
      enableAlert,
      priority: 'normal',
      expiration: 3600,
    };

    iosPushService.configure(config);
    setIsConfigured(true);
    Alert.alert('配置成功', 'iOS 推送通知服務已配置');
  };

  const _requestPermissions = async () => {
    setLoading(true);
    try {
      const _granted = await iosPushService.requestPermissions();
      setHasPermissions(granted);

      if (granted) {
        Alert.alert('權限獲取成功', '推送通知權限已獲取');
        checkServiceStatus();
      } else {
        Alert.alert('權限獲取失敗', '無法獲取推送通知權限');
      }
    } catch (error) {
      Alert.alert('錯誤', `請求權限時發生錯誤: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const _registerForRemoteNotifications = async () => {
    setLoading(true);
    try {
      const _success = await iosPushService.registerForRemoteNotifications();
      setIsRegistered(success);

      if (success) {
        const _token = iosPushService.getDeviceToken();
        setDeviceToken(token?.token || '已獲取');
        Alert.alert('註冊成功', '遠程推送通知已註冊');
      } else {
        Alert.alert('註冊失敗', '無法註冊遠程推送通知');
      }
    } catch (error) {
      Alert.alert('錯誤', `註冊時發生錯誤: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const _unregisterForRemoteNotifications = async () => {
    setLoading(true);
    try {
      const _success = await iosPushService.unregisterForRemoteNotifications();

      if (success) {
        setIsRegistered(false);
        setDeviceToken(null);
        Alert.alert('取消註冊成功', '遠程推送通知已取消註冊');
      } else {
        Alert.alert('取消註冊失敗', '無法取消註冊遠程推送通知');
      }
    } catch (error) {
      Alert.alert('錯誤', `取消註冊時發生錯誤: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const _sendTestNotification = async () => {
    if (!deviceToken || deviceToken === '已獲取') {
      Alert.alert('錯誤', '請先獲取設備令牌');
      return;
    }

    setLoading(true);
    try {
      let customDataObj = {};
      try {
        customDataObj = JSON.parse(customData);
      } catch (e) {
        // 使用默認數據
        customDataObj = { type: 'test', id: '123' };
      }

      const payload: IOSPushNotificationPayload = {
        aps: {
          alert: {
            title: notificationTitle,
            body: notificationBody,
          },
          badge: enableBadge ? 1 : undefined,
          sound: enableSound ? 'default' : undefined,
        },
        customData: customDataObj,
      };

      const _result = await iosPushService.sendNotification(
        deviceToken,
        payload
      );

      if (result.success) {
        Alert.alert('發送成功', `推送通知已發送，消息ID: ${result.messageId}`);
      } else {
        Alert.alert('發送失敗', `錯誤: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('錯誤', `發送通知時發生錯誤: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const _sendLocalNotification = async () => {
    setLoading(true);
    try {
      const _success = await iosPushService.sendLocalNotification(
        notificationTitle,
        notificationBody,
        {
          badge: enableBadge ? 1 : undefined,
          sound: enableSound ? 'default' : undefined,
          category: 'test_category',
        }
      );

      if (success) {
        Alert.alert('發送成功', '本地推送通知已發送');
      } else {
        Alert.alert('發送失敗', '無法發送本地推送通知');
      }
    } catch (error) {
      Alert.alert('錯誤', `發送本地通知時發生錯誤: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const _getDeliveryStats = async () => {
    setLoading(true);
    try {
      const _deliveryStats = await iosPushService.getDeliveryStats();
      setStats(deliveryStats);
      Alert.alert(
        '統計信息',
        `總發送: ${deliveryStats.totalSent}\n` +
          `成功投遞: ${deliveryStats.totalDelivered}\n` +
          `失敗: ${deliveryStats.totalFailed}\n` +
          `成功率: ${(deliveryStats.successRate * 100).toFixed(1)}%\n` +
          `平均投遞時間: ${deliveryStats.averageDeliveryTime}ms`
      );
    } catch (error) {
      Alert.alert('錯誤', `獲取統計信息時發生錯誤: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const _resetStats = () => {
    iosPushService.resetStats();
    setStats(null);
    Alert.alert('重置成功', '統計信息已重置');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {/* 服務狀態 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>服務狀態</Text>
        <View style={styles.statusRow}>
          <Text>配置狀態:</Text>
          <Text
            style={isConfigured ? styles.statusSuccess : styles.statusError}
          >
            {isConfigured ? '已配置' : '未配置'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text>權限狀態:</Text>
          <Text
            style={hasPermissions ? styles.statusSuccess : styles.statusError}
          >
            {hasPermissions ? '已獲取' : '未獲取'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text>註冊狀態:</Text>
          <Text
            style={isRegistered ? styles.statusSuccess : styles.statusError}
          >
            {isRegistered ? '已註冊' : '未註冊'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text>設備令牌:</Text>
          <Text style={styles.statusInfo}>{deviceToken || '未獲取'}</Text>
        </View>
      </View>

      {/* 配置選項 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>配置選項</Text>
        <View style={styles.switchRow}>
          <Text>啟用徽章</Text>
          <Switch value={enableBadge} onValueChange={setEnableBadge} />
        </View>
        <View style={styles.switchRow}>
          <Text>啟用聲音</Text>
          <Switch value={enableSound} onValueChange={setEnableSound} />
        </View>
        <View style={styles.switchRow}>
          <Text>啟用提醒</Text>
          <Switch value={enableAlert} onValueChange={setEnableAlert} />
        </View>
        <TouchableOpacity
          style={[styles.button, !isConfigured && styles.buttonDisabled]}
          onPress={configureService}
          disabled={!isConfigured}
        >
          <Text style={styles.buttonText}>配置服務</Text>
        </TouchableOpacity>
      </View>

      {/* 權限和註冊 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>權限和註冊</Text>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={requestPermissions}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '處理中...' : '請求權限'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            (loading || !hasPermissions) && styles.buttonDisabled,
          ]}
          onPress={registerForRemoteNotifications}
          disabled={loading || !hasPermissions}
        >
          <Text style={styles.buttonText}>
            {loading ? '處理中...' : '註冊遠程推送'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            (loading || !isRegistered) && styles.buttonDisabled,
          ]}
          onPress={unregisterForRemoteNotifications}
          disabled={loading || !isRegistered}
        >
          <Text style={styles.buttonText}>
            {loading ? '處理中...' : '取消註冊'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 通知內容 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通知內容</Text>
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
        <TextInput
          style={styles.input}
          placeholder='自定義數據 (JSON)'
          value={customData}
          onChangeText={setCustomData}
          multiline
        />
      </View>

      {/* 發送通知 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>發送通知</Text>
        <TouchableOpacity
          style={[
            styles.button,
            (loading || !isConfigured) && styles.buttonDisabled,
          ]}
          onPress={sendTestNotification}
          disabled={loading || !isConfigured}
        >
          <Text style={styles.buttonText}>
            {loading ? '發送中...' : '發送測試通知'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={sendLocalNotification}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '發送中...' : '發送本地通知'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 統計信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>統計信息</Text>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={getDeliveryStats}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '獲取中...' : '獲取投遞統計'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !stats && styles.buttonDisabled]}
          onPress={resetStats}
          disabled={!stats}
        >
          <Text style={styles.buttonText}>重置統計</Text>
        </TouchableOpacity>
      </View>

      {/* 服務信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>服務信息</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            const _serviceInfo = iosPushService.getServiceInfo();
            Alert.alert(
              '服務信息',
              `平台: ${serviceInfo.platform}\n` +
                `初始化狀態: ${serviceInfo.isInitialized ? '是' : '否'}\n` +
                `服務就緒: ${serviceInfo.isServiceReady ? '是' : '否'}\n` +
                `有設備令牌: ${serviceInfo.hasDeviceToken ? '是' : '否'}\n` +
                `環境: ${serviceInfo.deviceTokenEnvironment || '未知'}`
            );
          }}
        >
          <Text style={styles.buttonText}>查看服務信息</Text>
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
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusSuccess: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusError: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  statusInfo: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IOSPushNotificationExample;
