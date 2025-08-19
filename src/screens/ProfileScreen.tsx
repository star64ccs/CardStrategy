import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useAppDispatch, RootState } from '@/store';
import { useTheme } from '@/config/ThemeProvider';
import { Button } from '@/components/common/Button';
import { Loading } from '@/components/common/Loading';
import { logout } from '@/store/slices/authSlice';


export const ProfileScreen: React.FC = () => {
  const { theme, toggleTheme, mode } = useTheme();
  const dispatch = useAppDispatch();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  // 處理登出
  const handleLogout = useCallback(() => {
    Alert.alert(
      '確認登出',
      '您確定要登出嗎？',
      [
        { text: '取消', style: 'cancel' },
        { text: '登出', style: 'destructive', onPress: () => dispatch(logout()) }
      ]
    );
  }, [dispatch]);

  // 處理設置項點擊
  const handleSettingPress = useCallback((setting: string) => {
    switch (setting) {
      case 'theme':
        toggleTheme();
        break;
      case 'notifications':
        Alert.alert('通知設置', '此功能即將推出');
        break;
      case 'privacy':
        Alert.alert('隱私設置', '此功能即將推出');
        break;
      case 'language':
        Alert.alert('語言設置', '此功能即將推出');
        break;
      case 'help':
        Alert.alert('幫助中心', '此功能即將推出');
        break;
      case 'about':
        Alert.alert('關於我們', 'CardStrategy v1.0.0\n\n一個智能卡片投資分析應用');
        break;
      default:
        break;
    }
  }, [toggleTheme]);

  const renderUserInfo = () => (
    <View style={[styles.userInfoContainer, { backgroundColor: theme.colors.backgroundPaper }]}>
      <View style={styles.avatarContainer}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.avatarText, { color: theme.colors.white }]}>
              {user?.firstName?.[0] || user?.username?.[0] || 'U'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.userDetails}>
        <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
          {user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.username || '用戶'
          }
        </Text>
        <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
          {user?.email || 'user@example.com'}
        </Text>
        <View style={styles.userStats}>
          <Text style={[styles.userStat, { color: theme.colors.textSecondary }]}>
            加入時間:{' '}
            {user?.statistics?.joinDate
              ? new Date(user.statistics.joinDate).toLocaleDateString()
              : '未知'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSettingsSection = () => (
    <View style={styles.settingsContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
        設置
      </Text>

      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.colors.backgroundPaper }]}
        onPress={() => handleSettingPress('theme')}
      >
        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
          主題模式
        </Text>
        <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
          {mode === 'auto' ? '自動' : mode === 'dark' ? '深色' : '淺色'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.colors.backgroundPaper }]}
        onPress={() => handleSettingPress('notifications')}
      >
        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
          通知設置
        </Text>
        <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
          {'>'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.colors.backgroundPaper }]}
        onPress={() => handleSettingPress('privacy')}
      >
        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
          隱私設置
        </Text>
        <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
          {'>'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.colors.backgroundPaper }]}
        onPress={() => handleSettingPress('language')}
      >
        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
          語言設置
        </Text>
        <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
          繁體中文 {'>'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSupportSection = () => (
    <View style={styles.supportContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
        支持
      </Text>

      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.colors.backgroundPaper }]}
        onPress={() => handleSettingPress('help')}
      >
        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
          幫助中心
        </Text>
        <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
          {'>'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.colors.backgroundPaper }]}
        onPress={() => handleSettingPress('about')}
      >
        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
          關於我們
        </Text>
        <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
          {'>'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Loading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.backgroundPaper }]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          個人資料
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {renderUserInfo()}
        {renderSettingsSection()}
        {renderSupportSection()}

        <View style={styles.logoutContainer}>
          <Button
            title="登出"
            onPress={handleLogout}
            variant="danger"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    padding: 16
  },
  userInfoContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  avatarContainer: {
    marginRight: 16
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center'
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8
  },
  userStats: {
    flexDirection: 'row'
  },
  userStat: {
    fontSize: 12
  },
  settingsContainer: {
    marginBottom: 24
  },
  supportContainer: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  settingLabel: {
    fontSize: 16
  },
  settingValue: {
    fontSize: 14
  },
  logoutContainer: {
    marginTop: 24
  }
});
