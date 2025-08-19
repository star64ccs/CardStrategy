import React from 'react';
import { Platform } from 'react-native';
import { isIOS, isAndroid, getPlatformStyles } from '../utils/platformUtils';

// 平台特定導航配置
export const getPlatformNavigationConfig = () => {
  const platformStyles = getPlatformStyles();

  return {
    // 堆疊導航器配置
    stackNavigator: {
      screenOptions: {
        headerStyle: {
          backgroundColor: isIOS() ? '#FFFFFF' : '#1C2B3A',
          borderBottomColor: isIOS() ? '#E5E5E5' : 'transparent',
          borderBottomWidth: isIOS() ? 0.5 : 0,
          elevation: isAndroid() ? 4 : 0
        },
        headerTitleStyle: {
          fontWeight: isIOS() ? '600' : '500',
          fontSize: isIOS() ? 17 : 20,
          color: isIOS() ? '#1C2B3A' : '#FFFFFF'
        },
        headerTintColor: isIOS() ? '#1C2B3A' : '#FFFFFF',
        headerBackTitleVisible: isIOS(),
        headerBackTitle: isIOS() ? '返回' : undefined,
        gestureEnabled: isIOS(),
        gestureDirection: 'horizontal',
        cardStyle: {
          backgroundColor: '#F8F9FA'
        }
      }
    },

    // 標籤導航器配置
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
          paddingTop: isIOS() ? 8 : 8
        },
        tabBarActiveTintColor: '#1C2B3A',
        tabBarInactiveTintColor: isIOS() ? '#8E8E93' : '#B0B0B0',
        tabBarLabelStyle: {
          fontSize: isIOS() ? 10 : 12,
          fontWeight: isIOS() ? '500' : '400',
          marginTop: isIOS() ? 4 : 0
        },
        tabBarIconStyle: {
          marginBottom: isIOS() ? 0 : 4
        }
      }
    },

    // 抽屜導航器配置
    drawerNavigator: {
      screenOptions: {
        headerStyle: {
          backgroundColor: '#1C2B3A',
          elevation: isAndroid() ? 4 : 0
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 20,
          color: '#FFFFFF'
        },
        headerTintColor: '#FFFFFF',
        drawerStyle: {
          backgroundColor: '#FFFFFF',
          width: 280
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
          color: '#1C2B3A'
        },
        drawerActiveTintColor: '#1C2B3A',
        drawerInactiveTintColor: '#8E8E93',
        drawerActiveBackgroundColor: '#F0F0F0'
      }
    }
  };
};

// 平台特定動畫配置
export const getPlatformAnimationConfig = () => {
  return {
    // iOS 動畫配置
    ios: {
      // 頁面轉場動畫
      cardStyleInterpolator: ({ current, layouts }) => ({
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0]
              })
            }
          ]
        }
      }),
      // 標籤切換動畫
      tabBarStyle: {
        transform: [
          {
            translateY: 0
          }
        ]
      }
    },

    // Android 動畫配置
    android: {
      // 頁面轉場動畫
      cardStyleInterpolator: ({ current, layouts }) => ({
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0]
              })
            }
          ]
        }
      }),
      // 標籤切換動畫
      tabBarStyle: {
        transform: [
          {
            translateY: 0
          }
        ]
      }
    }
  };
};

// 平台特定手勢配置
export const getPlatformGestureConfig = () => {
  return {
    // iOS 手勢配置
    ios: {
      // 滑動返回手勢
      gestureEnabled: true,
      gestureDirection: 'horizontal',
      gestureResponseDistance: {
        horizontal: 50
      },
      // 3D Touch 手勢
      enable3DTouch: true,
      // Haptic Feedback
      hapticFeedback: true
    },

    // Android 手勢配置
    android: {
      // 滑動返回手勢
      gestureEnabled: true,
      gestureDirection: 'horizontal',
      gestureResponseDistance: {
        horizontal: 50
      },
      // 長按手勢
      longPressGesture: true,
      // 雙擊手勢
      doubleTapGesture: true
    }
  };
};

// 平台特定主題配置
export const getPlatformThemeConfig = () => {
  return {
    // iOS 主題配置
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
        info: '#007AFF'
      },
      typography: {
        fontFamily: 'SF Pro Display',
        fontSize: {
          small: 12,
          medium: 16,
          large: 20,
          xlarge: 24
        },
        fontWeight: {
          regular: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        }
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32
      },
      borderRadius: {
        small: 4,
        medium: 8,
        large: 12,
        xlarge: 16
      }
    },

    // Android 主題配置
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
        info: '#2196F3'
      },
      typography: {
        fontFamily: 'Roboto',
        fontSize: {
          small: 12,
          medium: 16,
          large: 20,
          xlarge: 24
        },
        fontWeight: {
          regular: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        }
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32
      },
      borderRadius: {
        small: 2,
        medium: 4,
        large: 8,
        xlarge: 12
      }
    }
  };
};

// 平台特定無障礙配置
export const getPlatformAccessibilityConfig = () => {
  return {
    // iOS 無障礙配置
    ios: {
      // VoiceOver 支持
      accessibilityLabel: (label: string) => label,
      accessibilityHint: (hint: string) => hint,
      accessibilityRole: (role: string) => role,
      accessibilityState: (state: any) => state,
      // 動態字體支持
      allowFontScaling: true,
      // 高對比度支持
      accessibilityHighContrast: true,
      // 減少動畫支持
      accessibilityReduceMotion: true
    },

    // Android 無障礙配置
    android: {
      // TalkBack 支持
      accessibilityLabel: (label: string) => label,
      accessibilityHint: (hint: string) => hint,
      accessibilityRole: (role: string) => role,
      accessibilityState: (state: any) => state,
      // 動態字體支持
      allowFontScaling: true,
      // 高對比度支持
      accessibilityHighContrast: true,
      // 減少動畫支持
      accessibilityReduceMotion: true,
      // 顏色反轉支持
      accessibilityColorInversion: true
    }
  };
};

// 平台特定性能配置
export const getPlatformPerformanceConfig = () => {
  return {
    // iOS 性能配置
    ios: {
      // 內存優化
      memoryOptimization: true,
      // 電池優化
      batteryOptimization: true,
      // 後台處理限制
      backgroundProcessingLimit: 30,
      // 圖片緩存大小
      imageCacheSize: 50 * 1024 * 1024 // 50MB
    },

    // Android 性能配置
    android: {
      // 內存優化
      memoryOptimization: true,
      // 電池優化
      batteryOptimization: true,
      // 後台處理限制
      backgroundProcessingLimit: 60,
      // 圖片緩存大小
      imageCacheSize: 100 * 1024 * 1024, // 100MB
      // RAM 優化
      ramOptimization: true
    }
  };
};

// 導出所有平台導航配置
export default {
  getPlatformNavigationConfig,
  getPlatformAnimationConfig,
  getPlatformGestureConfig,
  getPlatformThemeConfig,
  getPlatformAccessibilityConfig,
  getPlatformPerformanceConfig
};
