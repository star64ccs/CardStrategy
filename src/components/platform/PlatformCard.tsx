import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { isIOS, isAndroid, getPlatformStyles } from '../../utils/platformUtils';

interface PlatformCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  backgroundColor?: string;
  testID?: string;
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  children,
  style,
  elevation = 4,
  borderRadius,
  padding = 16,
  margin = 8,
  backgroundColor = '#FFFFFF',
  testID
}) => {
  const platformStyles = getPlatformStyles();

  // 獲取平台特定樣式
  const getCardStyle = (): ViewStyle => {
    const baseStyle = platformStyles.card || {};

    const platformSpecificStyle = isIOS() ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.1,
      shadowRadius: elevation,
      backgroundColor
    } : {
      elevation,
      backgroundColor
    };

    const customStyle = {
      borderRadius: borderRadius || (isIOS() ? 12 : 8),
      padding,
      margin
    };

    return {
      ...baseStyle,
      ...platformSpecificStyle,
      ...customStyle,
      ...style
    };
  };

  return (
    <View style={getCardStyle()} testID={testID}>
      {children}
    </View>
  );
};

export default PlatformCard;
