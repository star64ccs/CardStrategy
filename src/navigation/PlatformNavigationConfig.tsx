import React from 'react';
import { Platform } from 'react-native';
// 臨時實現
const _isIOS = () => Platform.OS === 'ios';
const _isAndroid = () => Platform.OS === 'android';
const _getPlatformStyles = () => ({});

// 平台Specific導航Configure
export const _getPlatformNavigationConfig = () => {
  const _platformStyles = getPlatformStyles();

  return {
    // 堆疊導航器Configure
    stackNavigator: {
      screenOptions: {
        headerStyle: {
          backgroundColor: isIOS() ? '#FFFFFF' : '#1C2B3A',
          borderBottomColor: isIOS() ? '#E5E5E5' : 'transparent',
          borderBottomWidth: isIOS() ? 0.5 : 0,
          elevation: isAndroid() ? 4 : 0,
        },
        headerTitleStyle: {
          fontWeight: isIOS() ? '600' : '500',
          fontSize: isIOS() ? 17 : 20,
          color: isIOS() ? '#1C2B3A' : '#FFFFFF',
        },
        headerTintColor: isIOS() ? '#1C2B3A' : '#FFFFFF',
        headerBackTitleVisible: isIOS(),
        headerBackTitle: isIOS() ? '返回' : undefined,
        gestureEnabled: isIOS(),
        gestureDirection: 'horizontal',
        cardStyle: {
          backgroundColor: '#F8F9FA',
        },
      },
    },

    // Tag導航器Configure
    tabNavigator: {
      screenOptions: {
        tabBarStyle: {
          backgroundColor: isIOS() ? '#FFFFFF' : '#1C2B3A',
          borderTopColor: isIOS() ? '#E5E5E5' : 'transparent',
          borderTopWidth: isIOS() ? 0.5 : 0,
          elevation: isAndroid() ? 8 : 0,
          shadowColor: isIOS() ? '#000' : undefined,
          shadowOffset: isIOS() ? { width: 0, height: -2 } : undefined,
          shadowOpacity: isIOS() ? 0.1 : undefined,
          shadowRadius: isIOS() ? 4 : undefined,
          height: isIOS() ? 83 : 60,
          paddingBottom: isIOS() ? 20 : 8,
          paddingTop: isIOS() ? 8 : 8,
        },
        tabBarActiveTintColor: '#1C2B3A',
        tabBarInactiveTintColor: isIOS() ? '#8E8E93' : '#B0B0B0',
        tabBarLabelStyle: {
          fontSize: isIOS() ? 10 : 12,
          fontWeight: isIOS() ? '500' : '400',
          marginTop: isIOS() ? 4 : 0,
        },
        tabBarIconStyle: {
          marginBottom: isIOS() ? 0 : 4,
        },
      },
    },

    // 抽屜導航器Configure
    drawerNavigator: {
      screenOptions: {
        headerStyle: {
          backgroundColor: '#1C2B3A',
          elevation: isAndroid() ? 4 : 0,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 20,
          color: '#FFFFFF',
        },
        headerTintColor: '#FFFFFF',
        drawerStyle: {
          backgroundColor: '#FFFFFF',
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
          color: '#1C2B3A',
        },
        drawerActiveTintColor: '#1C2B3A',
        drawerInactiveTintColor: '#8E8E93',
        drawerActiveBackgroundColor: '#F0F0F0',
      },
    },
  };
};

// 平台Specific動畫Configure
export const _getPlatformAnimationConfig = () => {
  return {
    // iOS 動畫Configure
    ios: {
      // 頁面轉場動畫
      cardStyleInterpolator: ({
        current,
        layouts,
      }: {
        current: unknown;
        layouts: unknown;
      }) => ({
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      }),
      // TagSwitch動畫
      tabBarStyle: {
        transform: [
          {
            translateY: 0,
          },
        ],
      },
    },

    // Android 動畫Configure
    android: {
      // 頁面轉場動畫
      cardStyleInterpolator: ({
        current,
        layouts,
      }: {
        current: unknown;
        layouts: unknown;
      }) => ({
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      }),
      // TagSwitch動畫
      tabBarStyle: {
        transform: [
          {
            translateY: 0,
          },
        ],
      },
    },
  };
};

// 平台Specific手勢Configure
export const _getPlatformGestureConfig = () => {
  return {
    // iOS 手勢Configure
    ios: {
      // 滑動Return手勢
      gestureEnabled: true,
      gestureDirection: 'horizontal',
      gestureResponseDistance: {
        horizontal: 50,
      },
      // 3D Touch 手勢
      enable3DTouch: true,
      // Haptic Feedback
      hapticFeedback: true,
    },

    // Android 手勢Configure
    android: {
      // 滑動Return手勢
      gestureEnabled: true,
      gestureDirection: 'horizontal',
      gestureResponseDistance: {
        horizontal: 50,
      },
      // 長按手勢
      longPressGesture: true,
      // 雙擊手勢
      doubleTapGesture: true,
    },
  };
};

// 平台SpecificThemeConfigure
export const _getPlatformThemeConfig = () => {
  return {
    // iOS ThemeConfigure
    ios: {
      colors: {
        primary: '#1C2B3A',
        secondary: '#CBA135',
        background: '#F8F9FA',
        surface: '#FFFFFF',
        text: '#1C2B3A',
        textSecondary: '#8E8E93',
        border: '#E5E5E5',
        error: '#FF3B30',
        success: '#34C759',
        warning: '#FF9500',
        info: '#007AFF',
      },
      typography: {
        fontFamily: 'SF Pro Display',
        fontSize: {
          small: 12,
          medium: 16,
          large: 20,
          xlarge: 24,
        },
        fontWeight: {
          regular: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
        },
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
      borderRadius: {
        small: 4,
        medium: 8,
        large: 12,
        xlarge: 16,
      },
    },

    // Android ThemeConfigure
    android: {
      colors: {
        primary: '#1C2B3A',
        secondary: '#CBA135',
        background: '#F8F9FA',
        surface: '#FFFFFF',
        text: '#1C2B3A',
        textSecondary: '#757575',
        border: '#E0E0E0',
        error: '#F44336',
        success: '#4CAF50',
        warning: '#FF9800',
        info: '#2196F3',
      },
      typography: {
        fontFamily: 'Roboto',
        fontSize: {
          small: 12,
          medium: 16,
          large: 20,
          xlarge: 24,
        },
        fontWeight: {
          regular: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
        },
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
      borderRadius: {
        small: 2,
        medium: 4,
        large: 8,
        xlarge: 12,
      },
    },
  };
};

// 平台Specific無障礙Configure
export const _getPlatformAccessibilityConfig = () => {
  return {
    // iOS 無障礙Configure
    ios: {
      // VoiceOver Support
      accessibilityLabel: (label: string) => label,
      accessibilityHint: (hint: string) => hint,
      accessibilityRole: (role: string) => role,
      accessibilityState: (state: unknown) => state,
      // Dynamic字體Support
      allowFontScaling: true,
      // 高對比度Support
      accessibilityHighContrast: true,
      // 減少動畫Support
      accessibilityReduceMotion: true,
    },

    // Android 無障礙Configure
    android: {
      // TalkBack Support
      accessibilityLabel: (label: string) => label,
      accessibilityHint: (hint: string) => hint,
      accessibilityRole: (role: string) => role,
      accessibilityState: (state: unknown) => state,
      // Dynamic字體Support
      allowFontScaling: true,
      // 高對比度Support
      accessibilityHighContrast: true,
      // 減少動畫Support
      accessibilityReduceMotion: true,
      // 顏色反轉Support
      accessibilityColorInversion: true,
    },
  };
};

// 平台Specific性能Configure
export const _getPlatformPerformanceConfig = () => {
  return {
    // iOS 性能Configure
    ios: {
      // Memory優化
      memoryOptimization: true,
      // 電池優化
      batteryOptimization: true,
      // 後台HandleLimit
      backgroundProcessingLimit: 30,
      // Graph片Cache大小
      imageCacheSize: 50 * 1024 * 1024, // 50MB
    },

    // Android 性能Configure
    android: {
      // Memory優化
      memoryOptimization: true,
      // 電池優化
      batteryOptimization: true,
      // 後台HandleLimit
      backgroundProcessingLimit: 60,
      // Graph片Cache大小
      imageCacheSize: 100 * 1024 * 1024, // 100MB
      // RAM 優化
      ramOptimization: true,
    },
  };
};

// Export所有平台導航Configure
export default {
  getPlatformNavigationConfig,
  getPlatformAnimationConfig,
  getPlatformGestureConfig,
  getPlatformThemeConfig,
  getPlatformAccessibilityConfig,
  getPlatformPerformanceConfig,
};
