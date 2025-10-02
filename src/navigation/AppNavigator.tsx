import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

// 臨時Remove原始 screen Import，使用Package裝Component
// import { LoginScreen } from '../screens/LoginScreen';
// import { RegisterScreen } from '../screens/RegisterScreen';
import { theme } from '../config/theme';
import type { RootState } from '../store';

// 臨時 screen Component
const HomeScreen: React.FC = () => <div>Home Screen</div>;
const CardsScreen: React.FC = () => <div>Cards Screen</div>;
const CollectionsScreen: React.FC = () => <div>Collections Screen</div>;
const InvestmentsScreen: React.FC = () => <div>Investments Screen</div>;
const ProfileScreen: React.FC = () => <div>Profile Screen</div>;
const CardDetailScreen: React.FC = () => <div>Card Detail Screen</div>;
const CardScannerScreen: React.FC = () => <div>Card Scanner Screen</div>;
const AIChatScreen: React.FC = () => <div>AI Chat Screen</div>;
const MarketAnalysisScreen: React.FC = () => <div>Market Analysis Screen</div>;
const CardRecognitionHistoryScreen: React.FC = () => (
  <div>Card Recognition History Screen</div>
);
const NotificationsScreen: React.FC = () => <div>Notifications Screen</div>;
const NotificationBadge: React.FC<{ size: string }> = ({ size }) => (
  <div>Notification Badge</div>
);
const PerformanceMonitorScreen: React.FC = () => (
  <div>Performance Monitor Screen</div>
);
const DataCollectionStatsScreen: React.FC = () => (
  <div>Data Collection Stats Screen</div>
);
const AnnotationAssignmentScreen: React.FC = () => (
  <div>Annotation Assignment Screen</div>
);
const DataQualityDashboardScreen: React.FC = () => (
  <div>Data Quality Dashboard Screen</div>
);
const FeedbackManagementScreen: React.FC = () => (
  <div>Feedback Management Screen</div>
);
const DataQualityAssessmentScreen: React.FC = () => (
  <div>Data Quality Assessment Screen</div>
);
const FakeCardReportScreen: React.FC = () => <div>Fake Card Report Screen</div>;
const FakeCardHistoryScreen: React.FC = () => (
  <div>Fake Card History Screen</div>
);
const FakeCardTrainingScreen: React.FC = () => (
  <div>Fake Card Training Screen</div>
);

// 臨時 Login/Register ComponentPackage裝器，符合 React Navigation Class型要求
const LoginScreen: React.FC = () => <div>Login Screen</div>;
const RegisterScreen: React.FC = () => <div>Register Screen</div>;

const _Tab = createBottomTabNavigator();
const _Stack = createStackNavigator();

const _MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Cards') {
            iconName = focused ? 'albums' : 'albums-outline';
          } else if (route.name === 'Collections') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'Investments') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          const _icon = <Ionicons name={iconName} size={size} color={color} />;

          // 為個人頁面AddNotification徽章
          if (route.name === 'Profile') {
            return (
              <View style={{ position: 'relative' }}>
                {icon}
                <NotificationBadge size='small' />
              </View>
            );
          }

          return icon;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name='Home'
        component={HomeScreen}
        options={{ title: '首頁', headerShown: false }}
      />
      <Tab.Screen
        name='Cards'
        component={CardsScreen}
        options={{ title: '卡片', headerShown: false }}
      />
      <Tab.Screen
        name='Collections'
        component={CollectionsScreen}
        options={{ title: '收藏', headerShown: false }}
      />
      <Tab.Screen
        name='Investments'
        component={InvestmentsScreen}
        options={{ title: '投資', headerShown: false }}
      />
      <Tab.Screen
        name='Profile'
        component={ProfileScreen}
        options={{ title: '個人', headerShown: false }}
      />
    </Tab.Navigator>
  );
};

const _AppStack = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name='Login' component={LoginScreen} />
        <Stack.Screen name='Register' component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name='MainTabs'
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='CardDetail'
        component={CardDetailScreen}
        options={{ title: '卡牌詳情' }}
      />
      <Stack.Screen
        name='CardScanner'
        component={CardScannerScreen}
        options={{ title: '掃描卡牌' }}
      />
      <Stack.Screen
        name='CardRecognitionHistory'
        component={CardRecognitionHistoryScreen}
        options={{ title: '識別歷史' }}
      />
      <Stack.Screen
        name='AIChat'
        component={AIChatScreen}
        options={{ title: 'AI 助手' }}
      />
      <Stack.Screen
        name='MarketAnalysis'
        component={MarketAnalysisScreen}
        options={{ title: '市場分析' }}
      />
      <Stack.Screen
        name='Notifications'
        component={NotificationsScreen}
        options={{ title: '通知' }}
      />
      <Stack.Screen
        name='PerformanceMonitor'
        component={PerformanceMonitorScreen}
        options={{ title: '性能監控' }}
      />
      <Stack.Screen
        name='DataCollectionStats'
        component={DataCollectionStatsScreen}
        options={{ title: '數據收集統計' }}
      />
      <Stack.Screen
        name='AnnotationAssignment'
        component={AnnotationAssignmentScreen}
        options={{ title: '智能標註分配' }}
      />
      <Stack.Screen
        name='DataQualityDashboard'
        component={DataQualityDashboardScreen}
        options={{ title: '數據質量儀表板' }}
      />
      <Stack.Screen
        name='FeedbackManagement'
        component={FeedbackManagementScreen}
        options={{ title: '反饋管理' }}
      />
      <Stack.Screen
        name='DataQualityAssessment'
        component={DataQualityAssessmentScreen}
        options={{ title: '數據質量評估' }}
      />
      {/* False卡回報相Off路由 */}
      <Stack.Screen
        name='FakeCardReport'
        component={FakeCardReportScreen}
        options={{ title: '假卡回報', headerShown: false }}
      />
      <Stack.Screen
        name='FakeCardHistory'
        component={FakeCardHistoryScreen}
        options={{ title: '假卡提交記錄', headerShown: false }}
      />
      <Stack.Screen
        name='FakeCardTraining'
        component={FakeCardTrainingScreen}
        options={{ title: '假卡AI訓練', headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const _AppNavigator = () => {
  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
};

export default AppNavigator;
