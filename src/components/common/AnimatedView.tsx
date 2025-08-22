import React, { useEffect, useRef, ReactNode } from 'react';
import { Animated, ViewStyle, ViewProps } from 'react-native';
import { theme } from '@/config/theme';

export interface AnimatedViewProps extends ViewProps {
  children: ReactNode;
  animation?:
    | 'fadeIn'
    | 'slideUp'
    | 'slideDown'
    | 'slideLeft'
    | 'slideRight'
    | 'scale'
    | 'bounce';
  duration?: number;
  delay?: number;
  style?: ViewStyle;
  onAnimationComplete?: () => void;
  visible?: boolean;
}

export const AnimatedView: React.FC<AnimatedViewProps> = ({
  children,
  animation = 'fadeIn',
  duration = 300,
  delay = 0,
  style,
  onAnimationComplete,
  visible = true,
  ...props
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const translateX = useRef(new Animated.Value(50)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      const animations: Animated.CompositeAnimation[] = [];

      switch (animation) {
        case 'fadeIn':
          animations.push(
            Animated.timing(animatedValue, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            })
          );
          break;

        case 'slideUp':
          animations.push(
            Animated.parallel([
              Animated.timing(animatedValue, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
              }),
              Animated.timing(translateY, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case 'slideDown':
          animations.push(
            Animated.parallel([
              Animated.timing(animatedValue, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
              }),
              Animated.timing(translateY, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case 'slideLeft':
          animations.push(
            Animated.parallel([
              Animated.timing(animatedValue, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
              }),
              Animated.timing(translateX, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case 'slideRight':
          animations.push(
            Animated.parallel([
              Animated.timing(animatedValue, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
              }),
              Animated.timing(translateX, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case 'scale':
          animations.push(
            Animated.parallel([
              Animated.timing(animatedValue, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
              }),
              Animated.timing(scale, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case 'bounce':
          animations.push(
            Animated.sequence([
              Animated.timing(animatedValue, {
                toValue: 1,
                duration: duration * 0.6,
                delay,
                useNativeDriver: true,
              }),
              Animated.timing(scale, {
                toValue: 1.1,
                duration: duration * 0.2,
                useNativeDriver: true,
              }),
              Animated.timing(scale, {
                toValue: 1,
                duration: duration * 0.2,
                useNativeDriver: true,
              }),
            ])
          );
          break;
      }

      if (animations.length > 0) {
        Animated.parallel(animations).start(onAnimationComplete);
      }
    } else {
      // 重置動畫值
      animatedValue.setValue(0);
      translateY.setValue(50);
      translateX.setValue(50);
      scale.setValue(0.8);
    }
  }, [
    visible,
    animation,
    duration,
    delay,
    animatedValue,
    translateY,
    translateX,
    scale,
    onAnimationComplete,
  ]);

  const getTransform = () => {
    const transforms = [];

    if (animation === 'slideUp' || animation === 'slideDown') {
      transforms.push({ translateY });
    }

    if (animation === 'slideLeft' || animation === 'slideRight') {
      transforms.push({ translateX });
    }

    if (animation === 'scale' || animation === 'bounce') {
      transforms.push({ scale });
    }

    return transforms;
  };

  return (
    <Animated.View
      style={[
        {
          opacity: animatedValue,
          transform: getTransform(),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// 預定義的動畫組件
export const FadeInView: React.FC<Omit<AnimatedViewProps, 'animation'>> = (
  props
) => <AnimatedView animation="fadeIn" {...props} />;

export const SlideUpView: React.FC<Omit<AnimatedViewProps, 'animation'>> = (
  props
) => <AnimatedView animation="slideUp" {...props} />;

export const SlideDownView: React.FC<Omit<AnimatedViewProps, 'animation'>> = (
  props
) => <AnimatedView animation="slideDown" {...props} />;

export const SlideLeftView: React.FC<Omit<AnimatedViewProps, 'animation'>> = (
  props
) => <AnimatedView animation="slideLeft" {...props} />;

export const SlideRightView: React.FC<Omit<AnimatedViewProps, 'animation'>> = (
  props
) => <AnimatedView animation="slideRight" {...props} />;

export const ScaleView: React.FC<Omit<AnimatedViewProps, 'animation'>> = (
  props
) => <AnimatedView animation="scale" {...props} />;

export const BounceView: React.FC<Omit<AnimatedViewProps, 'animation'>> = (
  props
) => <AnimatedView animation="bounce" {...props} />;
