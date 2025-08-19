import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle
} from 'react-native';
import { theme } from '../../theme/designSystem';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'spinner' | 'dots' | 'pulse';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = theme.colors.gold.primary,
  text,
  style,
  textStyle,
  variant = 'spinner'
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const dotValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;

  useEffect(() => {
    if (variant === 'spinner') {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      );
      spinAnimation.start();
      return () => spinAnimation.stop();
    } else if (variant === 'pulse') {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true
          })
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    } else if (variant === 'dots') {
      const dotAnimations = dotValues.map((dotValue, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(dotValue, {
              toValue: 1,
              duration: 400,
              delay: index * 200,
              useNativeDriver: true
            }),
            Animated.timing(dotValue, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true
            })
          ])
        )
      );
      dotAnimations.forEach(animation => animation.start());
      return () => dotAnimations.forEach(animation => animation.stop());
    }
  }, [variant]);

  const getSize = () => {
    const sizeMap = {
      small: 20,
      medium: 32,
      large: 48
    };
    return sizeMap[size];
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const renderSpinner = () => (
    <Animated.View
      style={[
        styles.spinner,
        {
          width: getSize(),
          height: getSize(),
          borderColor: color,
          borderTopColor: 'transparent',
          transform: [{ rotate: spin }]
        }
      ]}
    />
  );

  const renderPulse = () => (
    <Animated.View
      style={[
        styles.pulse,
        {
          width: getSize(),
          height: getSize(),
          backgroundColor: color,
          transform: [{ scale: pulseValue }]
        }
      ]}
    />
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {dotValues.map((dotValue, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              width: getSize() / 4,
              height: getSize() / 4,
              backgroundColor: color,
              opacity: dotValue
            }
          ]}
        />
      ))}
    </View>
  );

  const renderContent = () => {
    switch (variant) {
      case 'spinner':
        return renderSpinner();
      case 'pulse':
        return renderPulse();
      case 'dots':
        return renderDots();
      default:
        return renderSpinner();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {renderContent()}
      {text && (
        <Text style={[styles.text, textStyle]}>{text}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md
  },
  spinner: {
    borderWidth: 2,
    borderRadius: theme.borderRadius.full
  },
  pulse: {
    borderRadius: theme.borderRadius.full
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dot: {
    borderRadius: theme.borderRadius.full,
    marginHorizontal: theme.spacing.xs
  },
  text: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center'
  }
});
