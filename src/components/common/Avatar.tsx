import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/designSystem';

interface AvatarProps {
  source?: string;
  initials?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'circle' | 'rounded' | 'square';
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  showBorder?: boolean;
  borderColor?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  initials,
  size = 'medium',
  variant = 'circle',
  onPress,
  style,
  textStyle,
  showBorder = false,
  borderColor = theme.colors.gold.primary,
  status
}) => {
  const getSize = () => {
    const sizeMap = {
      small: 32,
      medium: 48,
      large: 64,
      xlarge: 96
    };
    return sizeMap[size];
  };

  const getBorderRadius = () => {
    const size = getSize();
    switch (variant) {
      case 'circle':
        return size / 2;
      case 'rounded':
        return theme.borderRadius.lg;
      case 'square':
        return theme.borderRadius.sm;
      default:
        return size / 2;
    }
  };

  const getFontSize = () => {
    const size = getSize();
    if (size <= 32) return theme.typography.sizes.xs;
    if (size <= 48) return theme.typography.sizes.sm;
    if (size <= 64) return theme.typography.sizes.base;
    return theme.typography.sizes.lg;
  };

  const getStatusColor = () => {
    const statusMap = {
      online: theme.colors.status.success,
      offline: theme.colors.text.disabled,
      away: theme.colors.status.warning,
      busy: theme.colors.status.error
    };
    return statusMap[status!];
  };

  const getStatusSize = () => {
    const size = getSize();
    if (size <= 32) return 8;
    if (size <= 48) return 10;
    if (size <= 64) return 12;
    return 14;
  };

  const renderContent = () => {
    if (source) {
      return (
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            {
              width: getSize(),
              height: getSize(),
              borderRadius: getBorderRadius()
            }
          ]}
          resizeMode="cover"
        />
      );
    }

    if (initials) {
      return (
        <View
          style={[
            styles.initialsContainer,
            {
              width: getSize(),
              height: getSize(),
              borderRadius: getBorderRadius(),
              backgroundColor: theme.colors.gold.primary
            }
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize: getFontSize(),
                color: theme.colors.background.primary
              },
              textStyle
            ]}
          >
            {initials.toUpperCase()}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.placeholder,
          {
            width: getSize(),
            height: getSize(),
            borderRadius: getBorderRadius(),
            backgroundColor: theme.colors.background.secondary
          }
        ]}
      >
        <Ionicons
          name="person"
          size={getSize() * 0.4}
          color={theme.colors.text.tertiary}
        />
      </View>
    );
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.container,
        {
          width: getSize(),
          height: getSize()
        },
        style
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {renderContent()}
      {showBorder && (
        <View
          style={[
            styles.border,
            {
              width: getSize(),
              height: getSize(),
              borderRadius: getBorderRadius(),
              borderColor,
              borderWidth: 2
            }
          ]}
        />
      )}
      {status && (
        <View
          style={[
            styles.statusIndicator,
            {
              width: getStatusSize(),
              height: getStatusSize(),
              borderRadius: getStatusSize() / 2,
              backgroundColor: getStatusColor(),
              borderColor: theme.colors.background.tertiary,
              borderWidth: 2,
              right: getSize() * 0.1,
              bottom: getSize() * 0.1
            }
          ]}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  initials: {
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center'
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.primary
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  statusIndicator: {
    position: 'absolute'
  }
});
