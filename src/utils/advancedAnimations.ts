import { Animated, Easing, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 高級動畫配置
export const ADVANCED_ANIMATION_CONFIG = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
    extraSlow: 1200,
  },
  easing: {
    // 基礎緩動
    ease: Easing.ease,
    easeIn: Easing.in(Easing.ease),
    easeOut: Easing.out(Easing.ease),
    easeInOut: Easing.inOut(Easing.ease),

    // 彈性緩動
    bounce: Easing.bounce,
    elastic: Easing.elastic(1),
    elasticIn: Easing.in(Easing.elastic(1)),
    elasticOut: Easing.out(Easing.elastic(1)),

    // 貝塞爾曲線
    smooth: Easing.bezier(0.25, 0.1, 0.25, 1),
    smoothIn: Easing.bezier(0.42, 0, 1, 1),
    smoothOut: Easing.bezier(0, 0, 0.58, 1),
    smoothInOut: Easing.bezier(0.42, 0, 0.58, 1),

    // 特殊效果
    back: Easing.back(1.7),
    backIn: Easing.in(Easing.back(1.7)),
    backOut: Easing.out(Easing.back(1.7)),

    // 指數緩動
    exponential: Easing.exponential,
    exponentialIn: Easing.in(Easing.exponential),
    exponentialOut: Easing.out(Easing.exponential),
  },
  spring: {
    default: {
      tension: 100,
      friction: 8,
    },
    gentle: {
      tension: 50,
      friction: 7,
    },
    bouncy: {
      tension: 200,
      friction: 5,
    },
    stiff: {
      tension: 300,
      friction: 10,
    },
  },
};

// 動畫值管理器
export class AnimationValueManager {
  private values: Map<string, Animated.Value> = new Map();
  private animations: Map<string, Animated.CompositeAnimation> = new Map();

  createValue(key: string, initialValue: number = 0): Animated.Value {
    if (this.values.has(key)) {
      return this.values.get(key)!;
    }
    const value = new Animated.Value(initialValue);
    this.values.set(key, value);
    return value;
  }

  getValue(key: string): Animated.Value | undefined {
    return this.values.get(key);
  }

  setValue(key: string, value: number): void {
    const animatedValue = this.values.get(key);
    if (animatedValue) {
      animatedValue.setValue(value);
    }
  }

  stopAnimation(key: string): void {
    const animation = this.animations.get(key);
    if (animation) {
      animation.stop();
      this.animations.delete(key);
    }
  }

  stopAllAnimations(): void {
    this.animations.forEach((animation) => animation.stop());
    this.animations.clear();
  }

  cleanup(): void {
    this.stopAllAnimations();
    this.values.clear();
  }
}

// 高級動畫效果
export const advancedAnimations = {
  // 3D 旋轉動畫
  rotate3D: (
    rotateX: Animated.Value,
    rotateY: Animated.Value,
    rotateZ: Animated.Value,
    duration: number = 1000,
    easing: any = ADVANCED_ANIMATION_CONFIG.easing.smooth
  ): Animated.CompositeAnimation => {
    return Animated.parallel([
      Animated.timing(rotateX, {
        toValue: 1,
        duration,
        easing,
        useNativeDriver: true,
      }),
      Animated.timing(rotateY, {
        toValue: 1,
        duration,
        easing,
        useNativeDriver: true,
      }),
      Animated.timing(rotateZ, {
        toValue: 1,
        duration,
        easing,
        useNativeDriver: true,
      }),
    ]);
  },

  // 波浪動畫
  wave: (
    waveValue: Animated.Value,
    amplitude: number = 20,
    frequency: number = 2,
    duration: number = 2000
  ): Animated.CompositeAnimation => {
    return Animated.loop(
      Animated.timing(waveValue, {
        toValue: 1,
        duration,
        easing: ADVANCED_ANIMATION_CONFIG.easing.smoothInOut,
        useNativeDriver: true,
      })
    );
  },

  // 脈衝光環效果
  pulseRing: (
    ringValue: Animated.Value,
    ringOpacity: Animated.Value,
    duration: number = 1500
  ): Animated.CompositeAnimation => {
    return Animated.loop(
      Animated.parallel([
        Animated.timing(ringValue, {
          toValue: 1,
          duration,
          easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration,
          easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
          useNativeDriver: true,
        }),
      ])
    );
  },

  // 打字機效果
  typewriter: (
    textValue: Animated.Value,
    duration: number = 1000,
    delay: number = 0
  ): Animated.CompositeAnimation => {
    return Animated.timing(textValue, {
      toValue: 1,
      duration,
      delay,
      easing: ADVANCED_ANIMATION_CONFIG.easing.linear,
      useNativeDriver: false,
    });
  },

  // 粒子爆炸效果
  particleExplosion: (
    particles: Animated.Value[],
    centerX: number,
    centerY: number,
    duration: number = 800
  ): Animated.CompositeAnimation => {
    const animations = particles.map((particle, index) => {
      const angle = (index / particles.length) * 2 * Math.PI;
      const distance = 100 + Math.random() * 50;
      const targetX = centerX + Math.cos(angle) * distance;
      const targetY = centerY + Math.sin(angle) * distance;

      return Animated.parallel([
        Animated.timing(particle, {
          toValue: 1,
          duration,
          delay: index * 50,
          easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
          useNativeDriver: true,
        }),
      ]);
    });

    return Animated.parallel(animations);
  },

  // 液體填充效果
  liquidFill: (
    fillValue: Animated.Value,
    waveValue: Animated.Value,
    duration: number = 2000
  ): Animated.CompositeAnimation => {
    return Animated.parallel([
      Animated.timing(fillValue, {
        toValue: 1,
        duration,
        easing: ADVANCED_ANIMATION_CONFIG.easing.smoothInOut,
        useNativeDriver: false,
      }),
      Animated.loop(
        Animated.timing(waveValue, {
          toValue: 1,
          duration: 1000,
          easing: ADVANCED_ANIMATION_CONFIG.easing.smoothInOut,
          useNativeDriver: false,
        })
      ),
    ]);
  },

  // 磁鐵吸附效果
  magneticPull: (
    pullValue: Animated.Value,
    targetPosition: number,
    duration: number = 500
  ): Animated.CompositeAnimation => {
    return Animated.spring(pullValue, {
      toValue: targetPosition,
      ...ADVANCED_ANIMATION_CONFIG.spring.bouncy,
      useNativeDriver: true,
    });
  },

  // 光暈效果
  glow: (
    glowValue: Animated.Value,
    intensity: number = 1,
    duration: number = 2000
  ): Animated.CompositeAnimation => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(glowValue, {
          toValue: intensity,
          duration: duration / 2,
          easing: ADVANCED_ANIMATION_CONFIG.easing.smoothInOut,
          useNativeDriver: false,
        }),
        Animated.timing(glowValue, {
          toValue: 0.3,
          duration: duration / 2,
          easing: ADVANCED_ANIMATION_CONFIG.easing.smoothInOut,
          useNativeDriver: false,
        }),
      ])
    );
  },
};

// 動畫組合器
export const animationComposers = {
  // 卡片翻轉效果
  cardFlip: (
    flipValue: Animated.Value,
    scaleValue: Animated.Value,
    duration: number = 600
  ): Animated.CompositeAnimation => {
    return Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.8,
        duration: duration / 2,
        easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
        useNativeDriver: true,
      }),
      Animated.timing(flipValue, {
        toValue: 1,
        duration: duration / 2,
        easing: ADVANCED_ANIMATION_CONFIG.easing.smoothInOut,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: duration / 2,
        easing: ADVANCED_ANIMATION_CONFIG.easing.smoothIn,
        useNativeDriver: true,
      }),
    ]);
  },

  // 成功慶祝動畫
  successCelebration: (
    scaleValue: Animated.Value,
    rotateValue: Animated.Value,
    colorValue: Animated.Value,
    duration: number = 1000
  ): Animated.CompositeAnimation => {
    return Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: duration * 0.3,
          easing: ADVANCED_ANIMATION_CONFIG.easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: duration * 0.7,
          easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(rotateValue, {
        toValue: 1,
        duration,
        easing: ADVANCED_ANIMATION_CONFIG.easing.smoothInOut,
        useNativeDriver: true,
      }),
      Animated.timing(colorValue, {
        toValue: 1,
        duration,
        easing: ADVANCED_ANIMATION_CONFIG.easing.smoothInOut,
        useNativeDriver: false,
      }),
    ]);
  },

  // 錯誤震動動畫
  errorShake: (
    shakeValue: Animated.Value,
    duration: number = 500
  ): Animated.CompositeAnimation => {
    return Animated.sequence([
      Animated.timing(shakeValue, {
        toValue: 10,
        duration: duration * 0.1,
        easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
        useNativeDriver: true,
      }),
      Animated.timing(shakeValue, {
        toValue: -10,
        duration: duration * 0.1,
        easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
        useNativeDriver: true,
      }),
      Animated.timing(shakeValue, {
        toValue: 10,
        duration: duration * 0.1,
        easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
        useNativeDriver: true,
      }),
      Animated.timing(shakeValue, {
        toValue: -10,
        duration: duration * 0.1,
        easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
        useNativeDriver: true,
      }),
      Animated.timing(shakeValue, {
        toValue: 0,
        duration: duration * 0.6,
        easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
        useNativeDriver: true,
      }),
    ]);
  },

  // 頁面轉場動畫
  pageTransition: (
    opacityValue: Animated.Value,
    translateYValue: Animated.Value,
    scaleValue: Animated.Value,
    duration: number = 400
  ): Animated.CompositeAnimation => {
    return Animated.parallel([
      Animated.timing(opacityValue, {
        toValue: 1,
        duration,
        easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
        useNativeDriver: true,
      }),
      Animated.timing(translateYValue, {
        toValue: 0,
        duration,
        easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration,
        easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
        useNativeDriver: true,
      }),
    ]);
  },

  // 加載完成動畫
  loadingComplete: (
    progressValue: Animated.Value,
    checkmarkValue: Animated.Value,
    scaleValue: Animated.Value,
    duration: number = 800
  ): Animated.CompositeAnimation => {
    return Animated.sequence([
      Animated.timing(progressValue, {
        toValue: 1,
        duration: duration * 0.6,
        easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.timing(checkmarkValue, {
          toValue: 1,
          duration: duration * 0.4,
          easing: ADVANCED_ANIMATION_CONFIG.easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: duration * 0.2,
          easing: ADVANCED_ANIMATION_CONFIG.easing.bounce,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: duration * 0.2,
        easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
        useNativeDriver: true,
      }),
    ]);
  },
};

// 動畫預設
export const ANIMATION_PRESETS = {
  // 卡片相關動畫
  card: {
    enter: {
      opacity: 0,
      translateY: 50,
      scale: 0.9,
      duration: 400,
      easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
    },
    exit: {
      opacity: 0,
      translateY: -50,
      scale: 0.9,
      duration: 300,
      easing: ADVANCED_ANIMATION_CONFIG.easing.smoothIn,
    },
    hover: {
      scale: 1.05,
      duration: 200,
      easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
    },
    press: {
      scale: 0.95,
      duration: 100,
      easing: ADVANCED_ANIMATION_CONFIG.easing.smoothIn,
    },
  },

  // 按鈕動畫
  button: {
    press: {
      scale: 0.95,
      duration: 150,
      easing: ADVANCED_ANIMATION_CONFIG.easing.smoothIn,
    },
    release: {
      scale: 1,
      duration: 150,
      easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
    },
    success: {
      scale: 1.1,
      duration: 200,
      easing: ADVANCED_ANIMATION_CONFIG.easing.bounce,
    },
  },

  // 模態框動畫
  modal: {
    enter: {
      opacity: 0,
      scale: 0.8,
      duration: 300,
      easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      duration: 200,
      easing: ADVANCED_ANIMATION_CONFIG.easing.smoothIn,
    },
  },

  // 列表項目動畫
  listItem: {
    enter: {
      opacity: 0,
      translateX: -50,
      duration: 300,
      easing: ADVANCED_ANIMATION_CONFIG.easing.smoothOut,
    },
    stagger: {
      delay: 50,
      duration: 300,
    },
  },

  // 加載動畫
  loading: {
    spinner: {
      duration: 1000,
      easing: ADVANCED_ANIMATION_CONFIG.easing.linear,
    },
    pulse: {
      duration: 1200,
      easing: ADVANCED_ANIMATION_CONFIG.easing.smoothInOut,
    },
    dots: {
      duration: 800,
      easing: ADVANCED_ANIMATION_CONFIG.easing.smoothInOut,
    },
  },
};

// 動畫工具函數
export const animationUtils = {
  // 創建交錯動畫
  createStaggeredAnimation: (
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
  },

  // 創建循環動畫
  createLoopAnimation: (
    animation: Animated.CompositeAnimation,
    iterations: number = -1
  ): Animated.CompositeAnimation => {
    return Animated.loop(animation, { iterations });
  },

  // 創建序列動畫
  createSequenceAnimation: (
    animations: Animated.CompositeAnimation[]
  ): Animated.CompositeAnimation => {
    return Animated.sequence(animations);
  },

  // 創建並行動畫
  createParallelAnimation: (
    animations: Animated.CompositeAnimation[]
  ): Animated.CompositeAnimation => {
    return Animated.parallel(animations);
  },

  // 動畫插值器
  createInterpolator: (
    animatedValue: Animated.Value,
    inputRange: number[],
    outputRange: any[]
  ) => {
    return animatedValue.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  },

  // 動畫延遲
  createDelay: (duration: number): Animated.CompositeAnimation => {
    return Animated.delay(duration);
  },

  // 動畫停止
  stopAnimation: (animation: Animated.CompositeAnimation): void => {
    animation.stop();
  },

  // 動畫重置
  resetAnimation: (
    animatedValue: Animated.Value,
    toValue: number = 0
  ): void => {
    animatedValue.setValue(toValue);
  },
};

// 性能優化工具
export const performanceOptimizers = {
  // 動畫緩存
  animationCache: new Map<string, Animated.CompositeAnimation>(),

  // 獲取緩存的動畫
  getCachedAnimation: (
    key: string
  ): Animated.CompositeAnimation | undefined => {
    return performanceOptimizers.animationCache.get(key);
  },

  // 緩存動畫
  cacheAnimation: (
    key: string,
    animation: Animated.CompositeAnimation
  ): void => {
    performanceOptimizers.animationCache.set(key, animation);
  },

  // 清理動畫緩存
  clearAnimationCache: (): void => {
    performanceOptimizers.animationCache.clear();
  },

  // 批量動畫優化
  batchAnimations: (
    animations: Animated.CompositeAnimation[]
  ): Animated.CompositeAnimation => {
    return Animated.parallel(animations);
  },

  // 動畫節流
  throttleAnimation: (
    animation: Animated.CompositeAnimation,
    throttleTime: number = 100
  ): Animated.CompositeAnimation => {
    let lastRun = 0;
    return {
      ...animation,
      start: (callback?: (result: { finished: boolean }) => void) => {
        const now = Date.now();
        if (now - lastRun >= throttleTime) {
          lastRun = now;
          animation.start(callback);
        }
      },
    } as Animated.CompositeAnimation;
  },
};

// 動畫監控工具
export const animationMonitor = {
  activeAnimations: new Set<Animated.CompositeAnimation>(),

  // 監控動畫開始
  trackAnimation: (animation: Animated.CompositeAnimation): void => {
    animationMonitor.activeAnimations.add(animation);
  },

  // 監控動畫結束
  untrackAnimation: (animation: Animated.CompositeAnimation): void => {
    animationMonitor.activeAnimations.delete(animation);
  },

  // 獲取活躍動畫數量
  getActiveAnimationCount: (): number => {
    return animationMonitor.activeAnimations.size;
  },

  // 停止所有動畫
  stopAllAnimations: (): void => {
    animationMonitor.activeAnimations.forEach((animation) => animation.stop());
    animationMonitor.activeAnimations.clear();
  },
};

export default {
  ADVANCED_ANIMATION_CONFIG,
  AnimationValueManager,
  advancedAnimations,
  animationComposers,
  ANIMATION_PRESETS,
  animationUtils,
  performanceOptimizers,
  animationMonitor,
};
