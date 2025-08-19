import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/designSystem';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: number;
  style?: ViewStyle;
  contentStyle?: TextStyle;
  trigger?: 'press' | 'longPress' | 'hover';
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  maxWidth = 200,
  style,
  contentStyle,
  trigger = 'press'
}) => {
  const [visible, setVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const childRef = useRef<TouchableOpacity>(null);

  const handlePress = () => {
    if (trigger === 'press') {
      showTooltip();
    }
  };

  const handleLongPress = () => {
    if (trigger === 'longPress') {
      showTooltip();
    }
  };

  const showTooltip = () => {
    childRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const tooltipWidth = Math.min(maxWidth, screenWidth - 40);
      const tooltipHeight = 40; // 估算高度

      let tooltipX = pageX + width / 2 - tooltipWidth / 2;
      let tooltipY = pageY;

      switch (position) {
        case 'top':
          tooltipY = pageY - tooltipHeight - 10;
          break;
        case 'bottom':
          tooltipY = pageY + height + 10;
          break;
        case 'left':
          tooltipX = pageX - tooltipWidth - 10;
          tooltipY = pageY + height / 2 - tooltipHeight / 2;
          break;
        case 'right':
          tooltipX = pageX + width + 10;
          tooltipY = pageY + height / 2 - tooltipHeight / 2;
          break;
      }

      // 確保工具提示不會超出屏幕
      tooltipX = Math.max(20, Math.min(tooltipX, screenWidth - tooltipWidth - 20));
      tooltipY = Math.max(20, Math.min(tooltipY, screenHeight - tooltipHeight - 20));

      setTooltipPosition({ x: tooltipX, y: tooltipY });
      setVisible(true);
    });
  };

  const hideTooltip = () => {
    setVisible(false);
  };

  const getArrowStyle = () => {
    const arrowSize = 8;
    const baseArrowStyle = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
      borderStyle: 'solid' as const
    };

    switch (position) {
      case 'top':
        return {
          ...baseArrowStyle,
          bottom: -arrowSize,
          left: '50%',
          marginLeft: -arrowSize,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopWidth: arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: theme.colors.background.tertiary
        };
      case 'bottom':
        return {
          ...baseArrowStyle,
          top: -arrowSize,
          left: '50%',
          marginLeft: -arrowSize,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: theme.colors.background.tertiary
        };
      case 'left':
        return {
          ...baseArrowStyle,
          right: -arrowSize,
          top: '50%',
          marginTop: -arrowSize,
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftWidth: arrowSize,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: theme.colors.background.tertiary
        };
      case 'right':
        return {
          ...baseArrowStyle,
          left: -arrowSize,
          top: '50%',
          marginTop: -arrowSize,
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: theme.colors.background.tertiary
        };
      default:
        return {};
    }
  };

  return (
    <>
      <TouchableOpacity
        ref={childRef}
        onPress={handlePress}
        onLongPress={handleLongPress}
        style={style}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hideTooltip}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={hideTooltip}
        >
          <View
            style={[
              styles.tooltip,
              {
                left: tooltipPosition.x,
                top: tooltipPosition.y,
                maxWidth
              }
            ]}
          >
            <View style={getArrowStyle()} />
            <Text style={[styles.tooltipText, contentStyle]}>{content}</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  tooltipText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.normal
  }
});
