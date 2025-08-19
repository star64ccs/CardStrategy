import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Loading } from '../common';
import { theme } from '../../config/theme';
import { termsSyncService } from '../../services/termsSyncService';
import { logger } from '../../utils/logger';

interface TermsSyncManagerProps {
  onClose: () => void;
}

export const TermsSyncManager: React.FC<TermsSyncManagerProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [syncConfig, setSyncConfig] = useState<any>(null);

  useEffect(() => {
    loadSyncData();
  }, []);

  const loadSyncData = async () => {
    setLoading(true);
    try {
      const [status, config] = await Promise.all([
        termsSyncService.getSyncStatus(),
        termsSyncService.getSyncConfig()
      ]);
      setSyncStatus(status);
      setSyncConfig(config);
    } catch (error) {
      logger.error('加載同步數據失敗:', error);
      Alert.alert('錯誤', '無法加載同步數據');
    } finally {
      setLoading(false);
    }
  };

  const handleForceSync = async () => {
    setSyncing(true);
    try {
      const success = await termsSyncService.forceSync();
      if (success) {
        Alert.alert('成功', '條款同步完成');
        await loadSyncData();
      } else {
        Alert.alert('失敗', '條款同步失敗，請檢查網絡連接');
      }
    } catch (error) {
      logger.error('強制同步失敗:', error);
      Alert.alert('錯誤', '同步過程中發生錯誤');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleAutoSync = async (value: boolean) => {
    try {
      await termsSyncService.updateSyncConfig({ autoSync: value });
      setSyncConfig(prev => ({ ...prev, autoSync: value }));
      Alert.alert('成功', `自動同步已${value ? '啟用' : '禁用'}`);
    } catch (error) {
      logger.error('更新自動同步設置失敗:', error);
      Alert.alert('錯誤', '無法更新自動同步設置');
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    try {
      await termsSyncService.updateSyncConfig({ notifyOnUpdate: value });
      setSyncConfig(prev => ({ ...prev, notifyOnUpdate: value }));
    } catch (error) {
      logger.error('更新通知設置失敗:', error);
      Alert.alert('錯誤', '無法更新通知設置');
    }
  };

  const handleResetStatus = async () => {
    Alert.alert(
      '重置同步狀態',
      '確定要重置同步狀態嗎？這將清除所有同步歷史記錄。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          style: 'destructive',
          onPress: async () => {
            try {
              await termsSyncService.resetSyncStatus();
              await loadSyncData();
              Alert.alert('成功', '同步狀態已重置');
            } catch (error) {
              logger.error('重置同步狀態失敗:', error);
              Alert.alert('錯誤', '無法重置同步狀態');
            }
          }
        }
      ]
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '從未';
    return new Date(date).toLocaleString('zh-TW');
  };

  const getStatusColor = (hasUpdates: boolean) => {
    return hasUpdates ? theme.colors.warning : theme.colors.success;
  };

  const getStatusText = (hasUpdates: boolean) => {
    return hasUpdates ? '有更新' : '已是最新';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading size="large" />
        <Text style={styles.loadingText}>正在加載同步數據...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>條款同步管理</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* 同步狀態 */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sync" size={24} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>同步狀態</Text>
          </View>

          {syncStatus && (
            <View style={styles.statusContent}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>同步狀態:</Text>
                <View style={styles.statusValue}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(syncStatus.hasUpdates) }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(syncStatus.hasUpdates) }
                  ]}>
                    {getStatusText(syncStatus.hasUpdates)}
                  </Text>
                </View>
              </View>

              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>最後同步:</Text>
                <Text style={styles.statusText}>
                  {formatDate(syncStatus.lastSyncTime)}
                </Text>
              </View>

              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>最後更新:</Text>
                <Text style={styles.statusText}>
                  {formatDate(syncStatus.lastUpdateTime)}
                </Text>
              </View>

              {syncStatus.syncError && (
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>同步錯誤:</Text>
                  <Text style={[styles.statusText, styles.errorText]}>
                    {syncStatus.syncError}
                  </Text>
                </View>
              )}

              {syncStatus.pendingTerms.length > 0 && (
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>待更新條款:</Text>
                  <Text style={styles.statusText}>
                    {syncStatus.pendingTerms.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Card>

        {/* 同步配置 */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="settings" size={24} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>同步配置</Text>
          </View>

          {syncConfig && (
            <View style={styles.configContent}>
              <View style={styles.configItem}>
                <View style={styles.configInfo}>
                  <Text style={styles.configLabel}>自動同步</Text>
                  <Text style={styles.configDescription}>
                    每24小時自動檢查並同步條款更新
                  </Text>
                </View>
                <Switch
                  value={syncConfig.autoSync}
                  onValueChange={handleToggleAutoSync}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.white}
                />
              </View>

              <View style={styles.configItem}>
                <View style={styles.configInfo}>
                  <Text style={styles.configLabel}>更新通知</Text>
                  <Text style={styles.configDescription}>
                    條款更新時發送通知提醒
                  </Text>
                </View>
                <Switch
                  value={syncConfig.notifyOnUpdate}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.white}
                />
              </View>

              <View style={styles.configItem}>
                <View style={styles.configInfo}>
                  <Text style={styles.configLabel}>同步間隔</Text>
                  <Text style={styles.configDescription}>
                    {Math.round(syncConfig.syncInterval / (1000 * 60 * 60))} 小時
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Card>

        {/* 操作按鈕 */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="construct" size={24} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>操作</Text>
          </View>

          <View style={styles.actions}>
            <Button
              title={syncing ? '同步中...' : '強制同步'}
              onPress={handleForceSync}
              disabled={syncing}
              style={styles.actionButton}
              loading={syncing}
            />

            <Button
              title="重置狀態"
              onPress={handleResetStatus}
              style={[styles.actionButton, styles.resetButton]}
              textStyle={styles.resetButtonText}
            />
          </View>
        </Card>

        {/* 說明信息 */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>說明</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              • 條款同步確保您始終使用最新版本的條款內容
            </Text>
            <Text style={styles.infoText}>
              • 自動同步會在後台定期檢查更新
            </Text>
            <Text style={styles.infoText}>
              • 如果服務器不可用，將使用本地條款作為備用
            </Text>
            <Text style={styles.infoText}>
              • 條款更新時會通知您重新同意
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface
  },
  closeButton: {
    padding: 4
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center'
  },
  headerSpacer: {
    width: 32
  },
  content: {
    flex: 1
  },
  card: {
    margin: 16,
    marginTop: 8
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 8
  },
  statusContent: {
    gap: 12
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary
  },
  statusValue: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600'
  },
  errorText: {
    color: theme.colors.error
  },
  configContent: {
    gap: 16
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  configInfo: {
    flex: 1,
    marginRight: 16
  },
  configLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text
  },
  configDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2
  },
  actions: {
    gap: 12
  },
  actionButton: {
    marginBottom: 8
  },
  resetButton: {
    backgroundColor: theme.colors.error
  },
  resetButtonText: {
    color: theme.colors.white
  },
  infoContent: {
    gap: 8
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20
  }
});
