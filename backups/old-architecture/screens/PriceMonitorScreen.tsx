import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Switch,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/config/ThemeProvider';
import {
  priceMonitorService,
  PriceAlert,
  AlertStatistics,
  MonitoringConfig,
} from '@/services/priceMonitorService';
import {
  smartNotificationService,
  NotificationAnalytics,
} from '@/services/smartNotificationService';
import { notificationService } from '@/services/notificationService';
import { logger } from '@/utils/logger';

export const PriceMonitorScreen: React.FC = () => {
  const { theme } = useTheme();
  const [activeAlerts, setActiveAlerts] = useState<PriceAlert[]>([]);
  const [statistics, setStatistics] = useState<AlertStatistics | null>(null);
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(
    null
  );
  const [config, setConfig] = useState<MonitoringConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const [alerts, stats, notifAnalytics, monitorConfig] = await Promise.all([
        priceMonitorService.getActiveAlerts(),
        priceMonitorService.getStatistics(),
        smartNotificationService.getAnalytics(),
        priceMonitorService.getConfig(),
      ]);

      setActiveAlerts(alerts);
      setStatistics(stats);
      setAnalytics(notifAnalytics);
      setConfig(monitorConfig);
    } catch (error) {
      logger.error('加載價格監控數據失敗:', { error });
      Alert.alert('錯誤', '加載數據失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const deleteAlert = async (alertId: string) => {
    Alert.alert('確認刪除', '確定要刪除此價格提醒嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '確定',
        style: 'destructive',
        onPress: async () => {
          try {
            await priceMonitorService.deletePriceAlert(alertId);
            await loadData();
            Alert.alert('成功', '價格提醒已刪除');
          } catch (error) {
            logger.error('刪除價格提醒失敗:', { error });
            Alert.alert('錯誤', '刪除失敗，請重試');
          }
        },
      },
    ]);
  };

  const updateConfig = async (newConfig: Partial<MonitoringConfig>) => {
    try {
      priceMonitorService.updateConfig(newConfig);
      setConfig(prev => (prev ? { ...prev, ...newConfig } : null));
      Alert.alert('成功', '監控配置已更新');
    } catch (error) {
      logger.error('更新監控配置失敗:', { error });
      Alert.alert('錯誤', '更新配置失敗，請重試');
    }
  };

  const testNotification = async () => {
    try {
      await notificationService.testNotification();
      Alert.alert('成功', '測試通知已發送');
    } catch (error) {
      logger.error('發送測試通知失敗:', { error });
      Alert.alert('錯誤', '發送測試通知失敗，請重試');
    }
  };

  const renderAlertItem = (alert: PriceAlert) => (
    <View
      key={alert.id}
      style={[
        styles.alertItem,
        { backgroundColor: theme.colors.backgroundPaper },
      ]}
    >
      <View style={styles.alertHeader}>
        <Text style={[styles.alertTitle, { color: theme.colors.textPrimary }]}>
          {alert.cardName}
        </Text>
        <TouchableOpacity
          onPress={() => deleteAlert(alert.id)}
          style={styles.deleteButton}
        >
          <Text
            style={[styles.deleteButtonText, { color: theme.colors.error }]}
          >
            刪除
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.alertDetails}>
        <Text style={[styles.alertText, { color: theme.colors.textSecondary }]}>
          目標價格: {alert.targetPrice} TWD
        </Text>
        <Text style={[styles.alertText, { color: theme.colors.textSecondary }]}>
          當前價格: {alert.currentPrice} TWD
        </Text>
        <Text style={[styles.alertText, { color: theme.colors.textSecondary }]}>
          條件: 價格{alert.type === 'above' ? '上漲' : '下跌'}到目標價格
        </Text>
        <Text style={[styles.alertText, { color: theme.colors.textSecondary }]}>
          觸發次數: {alert.triggerCount}
          {alert.maxTriggers && ` / ${alert.maxTriggers}`}
        </Text>
        {alert.lastTriggered && (
          <Text
            style={[styles.alertText, { color: theme.colors.textSecondary }]}
          >
            最後觸發: {new Date(alert.lastTriggered).toLocaleString()}
          </Text>
        )}
      </View>
    </View>
  );

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <View
        style={[
          styles.section,
          { backgroundColor: theme.colors.backgroundPaper },
        ]}
      >
        <Text
          style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
        >
          📊 監控統計
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {statistics.activeAlerts}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              活躍提醒
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {statistics.triggeredAlerts}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              已觸發
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>
              {statistics.successRate.toFixed(1)}%
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              成功率
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.info }]}>
              {statistics.averageResponseTime.toFixed(0)}ms
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              平均響應
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <View
        style={[
          styles.section,
          { backgroundColor: theme.colors.backgroundPaper },
        ]}
      >
        <Text
          style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
        >
          📈 通知分析
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {analytics.totalSent}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              已發送
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {analytics.totalRead}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              已讀取
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>
              {analytics.totalClicked}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              已點擊
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.info }]}>
              {(analytics.userEngagement * 100).toFixed(1)}%
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              參與度
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderConfig = () => {
    if (!config || !showConfig) return null;

    return (
      <View
        style={[
          styles.section,
          { backgroundColor: theme.colors.backgroundPaper },
        ]}
      >
        <Text
          style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
        >
          ⚙️ 監控配置
        </Text>

        <View style={styles.configItem}>
          <Text
            style={[styles.configLabel, { color: theme.colors.textPrimary }]}
          >
            檢查間隔 (分鐘)
          </Text>
          <TextInput
            style={[
              styles.configInput,
              {
                backgroundColor: theme.colors.backgroundLight,
                color: theme.colors.textPrimary,
                borderColor: theme.colors.borderLight,
              },
            ]}
            value={String(config.checkInterval / 60000)}
            onChangeText={text => {
              const minutes = parseInt(text) || 5;
              updateConfig({ checkInterval: minutes * 60000 });
            }}
            keyboardType='numeric'
            placeholder='5'
          />
        </View>

        <View style={styles.configItem}>
          <Text
            style={[styles.configLabel, { color: theme.colors.textPrimary }]}
          >
            價格變化閾值 (%)
          </Text>
          <TextInput
            style={[
              styles.configInput,
              {
                backgroundColor: theme.colors.backgroundLight,
                color: theme.colors.textPrimary,
                borderColor: theme.colors.borderLight,
              },
            ]}
            value={String(config.priceChangeThreshold)}
            onChangeText={text => {
              const threshold = parseFloat(text) || 5;
              updateConfig({ priceChangeThreshold: threshold });
            }}
            keyboardType='numeric'
            placeholder='5'
          />
        </View>

        <View style={styles.configItem}>
          <Text
            style={[styles.configLabel, { color: theme.colors.textPrimary }]}
          >
            智能提醒
          </Text>
          <Switch
            value={config.enableSmartAlerts}
            onValueChange={value => updateConfig({ enableSmartAlerts: value })}
            trackColor={{
              false: theme.colors.borderLight,
              true: theme.colors.primary,
            }}
            thumbColor={
              config.enableSmartAlerts ? theme.colors.white : theme.colors.gray
            }
          />
        </View>

        <View style={styles.configItem}>
          <Text
            style={[styles.configLabel, { color: theme.colors.textPrimary }]}
          >
            市場趨勢提醒
          </Text>
          <Switch
            value={config.enableMarketTrendAlerts}
            onValueChange={value =>
              updateConfig({ enableMarketTrendAlerts: value })
            }
            trackColor={{
              false: theme.colors.borderLight,
              true: theme.colors.primary,
            }}
            thumbColor={
              config.enableMarketTrendAlerts
                ? theme.colors.white
                : theme.colors.gray
            }
          />
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.backgroundLight },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            加載價格監控數據...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.backgroundLight },
      ]}
    >
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* 標題和操作按鈕 */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            價格監控管理
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={testNotification}
            >
              <Text
                style={[styles.actionButtonText, { color: theme.colors.white }]}
              >
                測試通知
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.secondary },
              ]}
              onPress={() => setShowConfig(!showConfig)}
            >
              <Text
                style={[styles.actionButtonText, { color: theme.colors.white }]}
              >
                {showConfig ? '隱藏配置' : '顯示配置'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 統計信息 */}
        {renderStatistics()}
        {renderAnalytics()}

        {/* 配置選項 */}
        {renderConfig()}

        {/* 活躍提醒列表 */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.backgroundPaper },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            🔔 活躍價格提醒 ({activeAlerts.length})
          </Text>

          {activeAlerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                目前沒有活躍的價格提醒
              </Text>
              <Text
                style={[
                  styles.emptySubtext,
                  { color: theme.colors.textSecondary },
                ]}
              >
                在卡片詳情頁面設置價格提醒
              </Text>
            </View>
          ) : (
            activeAlerts.map(renderAlertItem)
          )}
        </View>

        {/* 使用說明 */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.backgroundPaper },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            💡 使用說明
          </Text>
          <Text
            style={[styles.helpText, { color: theme.colors.textSecondary }]}
          >
            • 價格監控會定期檢查您設置的價格提醒{'\n'}•
            智能提醒會分析市場趨勢和您的投資組合{'\n'}•
            您可以調整監控間隔和通知偏好{'\n'}•
            高優先級通知會立即發送，低優先級會延遲到最佳時間
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  alertItem: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertDetails: {
    gap: 4,
  },
  alertText: {
    fontSize: 14,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  configLabel: {
    fontSize: 16,
    flex: 1,
  },
  configInput: {
    width: 80,
    height: 36,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default PriceMonitorScreen;
