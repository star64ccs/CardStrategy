import { Animated, Easing } from 'react-native';

// 動畫配置
export const ANIMATION_CONFIG = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  easing: {
    ease: Easing.ease,
    easeIn: Easing.in(Easing.ease),
    easeOut: Easing.out(Easing.ease),
    easeInOut: Easing.inOut(Easing.ease),
    bounce: Easing.bounce,
    elastic: Easing.elastic(1),
  },
};

// 淡入動畫
export const fadeIn = (
  animatedValue: Animated.Value,
  duration: number = ANIMATION_CONFIG.duration.normal,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    delay,
    easing: ANIMATION_CONFIG.easing.easeOut,
    useNativeDriver: true,
  });
};

// 淡出動畫
export const fadeOut = (
  animatedValue: Animated.Value,
  duration: number = ANIMATION_CONFIG.duration.normal,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    easing: ANIMATION_CONFIG.easing.easeIn,
    useNativeDriver: true,
  });
};

// 滑入動畫
export const slideIn = (
  animatedValue: Animated.Value,
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance: number = 50,
  duration: number = ANIMATION_CONFIG.duration.normal,
  delay: number = 0
): Animated.CompositeAnimation => {
  const toValue =
    direction === 'up' || direction === 'left' ? -distance : distance;

  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    easing: ANIMATION_CONFIG.easing.easeOut,
    useNativeDriver: true,
  });
};

// 縮放動畫
export const scale = (
  animatedValue: Animated.Value,
  toValue: number = 1,
  duration: number = ANIMATION_CONFIG.duration.normal,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    delay,
    easing: ANIMATION_CONFIG.easing.easeOut,
    useNativeDriver: true,
  });
};

// 彈跳動畫
export const bounce = (
  animatedValue: Animated.Value,
  duration: number = ANIMATION_CONFIG.duration.normal,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1.1,
      duration: duration * 0.6,
      delay,
      easing: ANIMATION_CONFIG.easing.easeOut,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: duration * 0.4,
      easing: ANIMATION_CONFIG.easing.bounce,
      useNativeDriver: true,
    }),
  ]);
};

// 搖擺動畫
export const shake = (
  animatedValue: Animated.Value,
  intensity: number = 10,
  duration: number = ANIMATION_CONFIG.duration.fast
): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: intensity,
      duration: duration / 4,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -intensity,
      duration: duration / 4,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: intensity,
      duration: duration / 4,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: duration / 4,
      useNativeDriver: true,
    }),
  ]);
};

// 脈衝動畫
export const pulse = (
  animatedValue: Animated.Value,
  duration: number = ANIMATION_CONFIG.duration.slow
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration / 2,
        easing: ANIMATION_CONFIG.easing.easeInOut,
        useNativeDriver: false,
      }),
      Animated.timing(animatedValue, {
        toValue: 0.3,
        duration: duration / 2,
        easing: ANIMATION_CONFIG.easing.easeInOut,
        useNativeDriver: false,
      }),
    ])
  );
};

// 旋轉動畫
export const rotate = (
  animatedValue: Animated.Value,
  duration: number = ANIMATION_CONFIG.duration.slow
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: ANIMATION_CONFIG.easing.linear,
      useNativeDriver: true,
    })
  );
};

// 並行動畫
export const parallel = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.parallel(animations);
};

// 序列動畫
export const sequence = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.sequence(animations);
};

// 延遲動畫
export const delay = (duration: number): Animated.CompositeAnimation => {
  return Animated.delay(duration);
};

// 動畫工具函數
export const createStaggeredAnimation = (
  animatedValues: Animated.Value[],
  animationCreator: (
    value: Animated.Value,
    index: number
  ) => Animated.CompositeAnimation,
  staggerDelay: number = 100
): Animated.CompositeAnimation => {
  const animations = animatedValues.map((value, index) =>
    Animated.sequence([
      Animated.delay(index * staggerDelay),
      animationCreator(value, index),
    ])
  );

  return Animated.parallel(animations);
};

// 動畫組合器
export const combineAnimations = {
  fadeInSlideUp: (
    opacity: Animated.Value,
    translateY: Animated.Value,
    duration = 300
  ) =>
    parallel([
      fadeIn(opacity, duration),
      slideIn(translateY, 'up', 50, duration),
    ]),

  fadeInScale: (
    opacity: Animated.Value,
    scale: Animated.Value,
    duration = 300
  ) => parallel([fadeIn(opacity, duration), scale(scale, 1, duration)]),

  bounceIn: (opacity: Animated.Value, scale: Animated.Value, duration = 500) =>
    parallel([fadeIn(opacity, duration), bounce(scale, duration)]),
};

// 動畫預設
export const ANIMATION_PRESETS = {
  cardEnter: (
    opacity: Animated.Value,
    translateY: Animated.Value,
    index: number
  ) =>
    sequence([
      delay(index * 100),
      combineAnimations.fadeInSlideUp(opacity, translateY, 400),
    ]),

  buttonPress: (scale: Animated.Value) =>
    sequence([scale(scale, 0.95, 100), scale(scale, 1, 100)]),

  loadingSpinner: (rotation: Animated.Value) => rotate(rotation, 1000),

  successCheck: (scale: Animated.Value) =>
    sequence([
      scale(scale, 0, 0),
      scale(scale, 1.2, 200),
      scale(scale, 1, 100),
    ]),
};
