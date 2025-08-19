import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { isIOS, isAndroid, getPlatformStyles } from '../../utils/platformUtils';

interface PlatformButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const PlatformButton: React.FC<PlatformButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID
}) => {
  const platformStyles = getPlatformStyles();

  // 獲取平台特定樣式
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = platformStyles.button || {};

    const variantStyles = {
      primary: {
        backgroundColor: '#1C2B3A',
        borderColor: '#1C2B3A'
      },
      secondary: {
        backgroundColor: '#CBA135',
        borderColor: '#CBA135'
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: '#1C2B3A',
        borderWidth: 1
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent'
      }
    };

    const sizeStyles = {
      small: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        minHeight: 32
      },
      medium: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        minHeight: 40
      },
      large: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        minHeight: 48
      }
    };

    const disabledStyle = disabled ? {
      opacity: 0.5
    } : {};

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...disabledStyle,
      ...style
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
      fontWeight: isIOS() ? '600' : '500',
      textAlign: 'center'
    };

    const variantTextStyles = {
      primary: {
        color: '#FFFFFF'
      },
      secondary: {
        color: '#FFFFFF'
      },
      outline: {
        color: '#1C2B3A'
      },
      ghost: {
        color: '#1C2B3A'
      }
    };

    const disabledTextStyle = disabled ? {
      opacity: 0.5
    } : {};

    return {
      ...baseTextStyle,
      ...variantTextStyles[variant],
      ...disabledTextStyle,
      ...textStyle
    };
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      <Text style={getTextStyle()}>
        {loading ? '載入中...' : title}
      </Text>
    </TouchableOpacity>
  );
};

export default PlatformButton;
