import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { HomeScreen } from '@/screens/HomeScreen';
import { CardsScreen } from '@/screens/CardsScreen';
import { CollectionsScreen } from '@/screens/CollectionsScreen';
import { InvestmentsScreen } from '@/screens/InvestmentsScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { CardDetailScreen } from '@/screens/CardDetailScreen';
import { CardScannerScreen } from '@/screens/CardScannerScreen';
import { AIChatScreen } from '@/screens/AIChatScreen';
import { MarketAnalysisScreen } from '@/screens/MarketAnalysisScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';
import { theme } from '@/config/theme';
import { RootState } from '@/store';
import { CardRecognitionHistoryScreen } from '@/screens/CardRecognitionHistoryScreen';
import { NotificationsScreen } from '@/screens/NotificationsScreen';
import { NotificationBadge } from '@/components/common/NotificationBadge';
import { PerformanceMonitorScreen } from '@/screens/PerformanceMonitorScreen';
import DataCollectionStatsScreen from '@/screens/DataCollectionStatsScreen';
import AnnotationAssignmentScreen from '@/screens/AnnotationAssignmentScreen';
import DataQualityDashboardScreen from '@/screens/DataQualityDashboardScreen';
import FeedbackManagementScreen from '@/screens/FeedbackManagementScreen';
import DataQualityAssessmentScreen from '@/screens/DataQualityAssessmentScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
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

          const icon = <Ionicons name={iconName} size={size} color={color} />;

          // 為個人頁面添加通知徽章
          if (route.name === 'Profile') {
            return (
              <View style={{ position: 'relative' }}>
                {icon}
                <NotificationBadge size="small" />
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
          height: 60
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600'
        }
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: '首頁', headerShown: false }}
      />
      <Tab.Screen
        name="Cards"
        component={CardsScreen}
        options={{ title: '卡牌' }}
      />
      <Tab.Screen
        name="Collections"
        component={CollectionsScreen}
        options={{ title: '收藏' }}
      />
      <Tab.Screen
        name="Investments"
        component={InvestmentsScreen}
        options={{ title: '投資' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: '個人' }}
      />
    </Tab.Navigator>
  );
};

const AppStack = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600'
        }
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CardDetail"
        component={CardDetailScreen}
        options={{ title: '卡牌詳情' }}
      />
      <Stack.Screen
        name="CardScanner"
        component={CardScannerScreen}
        options={{ title: '掃描卡牌' }}
      />
      <Stack.Screen
        name="CardRecognitionHistory"
        component={CardRecognitionHistoryScreen}
        options={{ title: '識別歷史' }}
      />
      <Stack.Screen
        name="AIChat"
        component={AIChatScreen}
        options={{ title: 'AI 助手' }}
      />
      <Stack.Screen
        name="MarketAnalysis"
        component={MarketAnalysisScreen}
        options={{ title: '市場分析' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: '通知' }}
      />
      <Stack.Screen
        name="PerformanceMonitor"
        component={PerformanceMonitorScreen}
        options={{ title: '性能監控' }}
      />
      <Stack.Screen
        name="DataCollectionStats"
        component={DataCollectionStatsScreen}
        options={{ title: '數據收集統計' }}
      />
      <Stack.Screen
        name="AnnotationAssignment"
        component={AnnotationAssignmentScreen}
        options={{ title: '智能標註分配' }}
      />
      <Stack.Screen
        name="DataQualityDashboard"
        component={DataQualityDashboardScreen}
        options={{ title: '數據質量監控儀表板' }}
      />
      <Stack.Screen
        name="FeedbackManagement"
        component={FeedbackManagementScreen}
        options={{ title: '反饋管理' }}
      />
      <Stack.Screen
        name="DataQualityAssessment"
        component={DataQualityAssessmentScreen}
        options={{ title: '定期數據質量評估' }}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
};
