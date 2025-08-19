import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Animated,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { theme } from '@/config/theme';
import { Notification, NotificationType } from '@/types';
import { notificationService } from '@/services/notificationService';
import { navigationService } from '@/services/navigationService';
import { notificationManager } from '@/services/notificationManager';
import { logger } from '@/utils/logger';

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkAsRead
}) => {
  const scaleAnim = new Animated.Value(1);
  const opacityAnim = new Animated.Value(notification.isRead ? 0.6 : 1);

  const handlePress = () => {
    // 動畫效果
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();

    onPress(notification);
  };

  const handleMarkAsRead = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
      Animated.timing(opacityAnim, {
        toValue: 0.6,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'price_alert':
        return 'trending-up';
      case 'market_update':
        return 'analytics';
      case 'investment_advice':
        return 'bulb';
      case 'system':
        return 'settings';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'price_alert':
        return theme.colors.warning;
      case 'market_update':
        return theme.colors.info;
      case 'investment_advice':
        return theme.colors.success;
      case 'system':
        return theme.colors.secondary;
      default:
        return theme.colors.primary;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '剛剛';
    if (minutes < 60) return `${minutes}分鐘前`;
    if (hours < 24) return `${hours}小時前`;
    if (days < 7) return `${days}天前`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <Animated.View
      style={[
        styles.notificationItem,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          backgroundColor: notification.isRead
            ? theme.colors.backgroundLight
            : theme.colors.backgroundPaper,
          borderLeftColor: getNotificationColor(notification.type),
          borderLeftWidth: notification.isRead ? 0 : 4
        }
      ]}
    >
      <TouchableOpacity
        style={styles.notificationContent}
        onPress={handlePress}
        onLongPress={handleMarkAsRead}
        activeOpacity={0.7}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getNotificationIcon(notification.type) as any}
              size={20}
              color={getNotificationColor(notification.type)}
            />
          </View>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>
              {notification.title}
            </Text>
            <Text style={[styles.notificationTime, { color: theme.colors.textSecondary }]}>
              {formatTime(notification.createdAt)}
            </Text>
          </View>
          {!notification.isRead && (
            <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
          )}
        </View>

        <Text style={[styles.notificationMessage, { color: theme.colors.textSecondary }]}>
          {notification.message}
        </Text>

        {notification.priority === 'high' && (
          <View style={[styles.priorityBadge, { backgroundColor: theme.colors.error }]}>
            <Text style={[styles.priorityText, { color: theme.colors.white }]}>
              重要
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<NotificationType | 'all'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  // 加載通知數據
  const loadNotifications = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // 從通知管理器獲取通知數據
      const allNotifications = notificationManager.getNotifications();
      setNotifications(allNotifications);

      const stats = notificationManager.getStats();
      if (stats) {
        setUnreadCount(stats.unreadCount);
      }
    } catch (error) {
      logger.error('加載通知失敗:', { error });
      Alert.alert('錯誤', '加載通知失敗，請重試');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 更新未讀數量
  const updateUnreadCount = useCallback((notifs: Notification[]) => {
    const count = notifs.filter(n => !n.isRead).length;
    setUnreadCount(count);
  }, []);

  // 篩選通知
  const filterNotifications = useCallback((filter: NotificationType | 'all') => {
    setSelectedFilter(filter);
    if (filter === 'all') {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(notifications.filter(n => n.type === filter));
    }
  }, [notifications]);

  // 標記通知為已讀
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      notificationManager.markAsRead(notificationId);

      // 更新本地狀態
      const updatedNotifications = notificationManager.getNotifications();
      setNotifications(updatedNotifications);

      const stats = notificationManager.getStats();
      if (stats) {
        setUnreadCount(stats.unreadCount);
      }

      logger.info('通知已標記為已讀:', { notificationId });
    } catch (error) {
      logger.error('標記通知為已讀失敗:', { error, notificationId });
    }
  }, []);

  // 標記所有通知為已讀
  const markAllAsRead = useCallback(async () => {
    try {
      Alert.alert(
        '標記所有已讀',
        '確定要將所有通知標記為已讀嗎？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '確定',
            onPress: async () => {
              notificationManager.markAllAsRead();

              // 更新本地狀態
              const updatedNotifications = notificationManager.getNotifications();
              setNotifications(updatedNotifications);
              setUnreadCount(0);

              logger.info('所有通知已標記為已讀');
            }
          }
        ]
      );
    } catch (error) {
      logger.error('標記所有通知為已讀失敗:', { error });
    }
  }, []);

  // 處理通知點擊
  const handleNotificationPress = useCallback((notification: Notification) => {
    // 使用通知管理器處理點擊
    notificationManager.handleNotificationClick(notification);

    // 更新本地狀態
    const updatedNotifications = notificationManager.getNotifications();
    setNotifications(updatedNotifications);

    const stats = notificationManager.getStats();
    if (stats) {
      setUnreadCount(stats.unreadCount);
    }

    logger.info('通知點擊處理完成:', { notificationId: notification.id, type: notification.type });
  }, []);

  // 初始化
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // 篩選效果
  useEffect(() => {
    filterNotifications(selectedFilter);
  }, [filterNotifications, selectedFilter]);

  // 渲染篩選器
  const renderFilterTabs = () => {
    const filterOptions = [
      { key: 'all', label: '全部', count: notifications.length },
      { key: 'price_alert', label: '價格提醒', count: notifications.filter(n => n.type === 'price_alert').length },
      { key: 'market_update', label: '市場更新', count: notifications.filter(n => n.type === 'market_update').length },
      { key: 'investment_advice', label: '投資建議', count: notifications.filter(n => n.type === 'investment_advice').length },
      { key: 'system', label: '系統', count: notifications.filter(n => n.type === 'system').length }
    ];

    return (
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                selectedFilter === filter.key && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setSelectedFilter(filter.key as NotificationType | 'all')}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.key && { color: theme.colors.white }
              ]}>
                {filter.label}
              </Text>
              {filter.count > 0 && (
                <View style={[
                  styles.filterBadge,
                  selectedFilter === filter.key && { backgroundColor: theme.colors.white }
                ]}>
                  <Text style={[
                    styles.filterBadgeText,
                    selectedFilter === filter.key && { color: theme.colors.primary }
                  ]}>
                    {filter.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // 渲染空狀態
  const renderEmptyState = () => {
    const filterOptions = [
      { key: 'all', label: '全部' },
      { key: 'price_alert', label: '價格提醒' },
      { key: 'market_update', label: '市場更新' },
      { key: 'investment_advice', label: '投資建議' },
      { key: 'system', label: '系統' }
    ];

    const currentFilter = filterOptions.find(f => f.key === selectedFilter);

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-off" size={64} color={theme.colors.textSecondary} />
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          暫無通知
        </Text>
        <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
          {selectedFilter === 'all'
            ? '您還沒有收到任何通知'
            : `您還沒有${currentFilter?.label}通知`
          }
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            加載通知中...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 標題欄 */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          通知
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={[styles.markAllReadButton, { backgroundColor: theme.colors.primary }]}
            onPress={markAllAsRead}
          >
            <Text style={[styles.markAllReadText, { color: theme.colors.white }]}>
              全部已讀
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 篩選器 */}
      {renderFilterTabs()}

      {/* 通知列表 */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={handleNotificationPress}
            onMarkAsRead={markAsRead}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadNotifications(true)}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  markAllReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  markAllReadText: {
    fontSize: 12,
    fontWeight: '500'
  },
  filterContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F5F5F5'
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666'
  },
  filterBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    minWidth: 20,
    alignItems: 'center'
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666'
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  notificationItem: {
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  notificationContent: {
    padding: 16
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  notificationInfo: {
    flex: 1
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2
  },
  notificationTime: {
    fontSize: 12
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600'
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16
  }
});
