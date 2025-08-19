import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '@/config/theme';
import { navigationService } from '@/services/navigationService';

interface NotificationBadgeProps {
  count?: number;
  size?: 'small' | 'medium' | 'large';
  showZero?: boolean;
  animated?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  size = 'medium',
  showZero = false,
  animated = true
}) => {
  const [badgeCount, setBadgeCount] = useState(count);
  const scaleAnim = new Animated.Value(1);
  const opacityAnim = new Animated.Value(1);

  useEffect(() => {
    // 監聽導航服務的徽章更新
    const handleBadgeUpdate = (newCount: number) => {
      setBadgeCount(newCount);

      if (animated && newCount > count) {
        // 新通知到達時的動畫效果
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1.3,
              duration: 200,
              useNativeDriver: true
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.8,
              duration: 200,
              useNativeDriver: true
            })
          ]),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true
            })
          ])
        ]).start();
      }
    };

    navigationService.onBadgeUpdate(handleBadgeUpdate);

    return () => {
      navigationService.removeBadgeUpdateCallback(handleBadgeUpdate);
    };
  }, [count, animated, scaleAnim, opacityAnim]);

  // 如果數量為0且不顯示零，則不渲染
  if (badgeCount === 0 && !showZero) {
    return null;
  }

  // 格式化顯示數量
  const displayCount = badgeCount > 99 ? '99+' : badgeCount.toString();

  // 根據大小獲取樣式
  const getBadgeSize = () => {
    switch (size) {
      case 'small':
        return {
          width: 16,
          height: 16,
          fontSize: 10,
          borderRadius: 8
        };
      case 'large':
        return {
          width: 24,
          height: 24,
          fontSize: 14,
          borderRadius: 12
        };
      default: // medium
        return {
          width: 20,
          height: 20,
          fontSize: 12,
          borderRadius: 10
        };
    }
  };

  const badgeSize = getBadgeSize();

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          width: badgeSize.width,
          height: badgeSize.height,
          borderRadius: badgeSize.borderRadius,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          backgroundColor: badgeCount > 0 ? theme.colors.error : theme.colors.gray
        }
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            fontSize: badgeSize.fontSize,
            color: theme.colors.white
          }
        ]}
      >
        {displayCount}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 16,
    minHeight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  badgeText: {
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 16
  }
});
