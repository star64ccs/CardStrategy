import React from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import {
  ADVANCED_ANIMATION_CONFIG,
  AnimationValueManager,
  advancedAnimations,
  animationComposers,
  ANIMATION_PRESETS,
  animationUtils,
  performanceOptimizers,
  animationMonitor
} from '../utils/advancedAnimations';

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    flex: 1
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20
  },
  section: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10
  },
  animationBox: {
    width: 100,
    height: 100,
    backgroundColor: '#ffd700',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  animationText: {
    color: '#1a1a1a',
    fontWeight: 'bold'
  }
});

export default {
  title: 'Animation System',
  parameters: {
    docs: {
      description: {
        component: '高級動畫系統提供豐富的動畫效果和性能優化工具。'
      }
    }
  },
  decorators: [
    (Story) => (
      <View style={styles.container}>
        <Story />
      </View>
    )
  ]
};

// 動畫配置展示
export const AnimationConfig = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>動畫配置</Text>
    <View style={{ color: '#ffffff' }}>
      <Text>動畫時長配置:</Text>
      <Text>• instant: {ADVANCED_ANIMATION_CONFIG.duration.instant}ms</Text>
      <Text>• fast: {ADVANCED_ANIMATION_CONFIG.duration.fast}ms</Text>
      <Text>• normal: {ADVANCED_ANIMATION_CONFIG.duration.normal}ms</Text>
      <Text>• slow: {ADVANCED_ANIMATION_CONFIG.duration.slow}ms</Text>
      <Text>• verySlow: {ADVANCED_ANIMATION_CONFIG.duration.verySlow}ms</Text>
      <Text>• extraSlow: {ADVANCED_ANIMATION_CONFIG.duration.extraSlow}ms</Text>
    </View>
  </View>
);

// 基礎動畫效果展示
export const BasicAnimations = () => {
  const scaleValue = new Animated.Value(1);
  const rotateValue = new Animated.Value(0);
  const opacityValue = new Animated.Value(1);

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>基礎動畫效果</Text>
      <View style={styles.row}>
        <Animated.View
          style={[
            styles.animationBox,
            {
              transform: [{ scale: scaleValue }]
            }
          ]}
        >
          <Text style={styles.animationText}>縮放</Text>
        </Animated.View>
      </View>
    </View>
  );
};

// 高級動畫效果展示
export const AdvancedAnimations = () => {
  const waveValue = new Animated.Value(0);
  const glowValue = new Animated.Value(0);
  const pulseValue = new Animated.Value(1);

  React.useEffect(() => {
    // 波浪動畫
    const waveAnimation = advancedAnimations.wave(waveValue, 20, 2, 2000);
    waveAnimation.start();

    // 光暈動畫
    const glowAnimation = advancedAnimations.glow(glowValue, 1, 2000);
    glowAnimation.start();

    // 脈衝動畫
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    );
    pulseAnimation.start();

    return () => {
      waveAnimation.stop();
      glowAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const waveTranslateY = waveValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20]
  });

  const glowOpacity = glowValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5]
  });

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>高級動畫效果</Text>
      <View style={styles.row}>
        <Animated.View
          style={[
            styles.animationBox,
            {
              transform: [{ translateY: waveTranslateY }]
            }
          ]}
        >
          <Text style={styles.animationText}>波浪</Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.animationBox,
            {
              transform: [{ scale: pulseValue }]
            }
          ]}
        >
          <Text style={styles.animationText}>脈衝</Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.animationBox,
            {
              shadowColor: '#ffd700',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: glowOpacity,
              shadowRadius: 20,
              elevation: 10
            }
          ]}
        >
          <Text style={styles.animationText}>光暈</Text>
        </Animated.View>
      </View>
    </View>
  );
};

// 動畫組合器展示
export const AnimationComposers = () => {
  const scaleValue = new Animated.Value(1);
  const rotateValue = new Animated.Value(0);
  const shakeValue = new Animated.Value(0);

  const handleSuccessAnimation = () => {
    const successAnimation = animationComposers.successCelebration(
      scaleValue,
      rotateValue,
      scaleValue,
      1000
    );
    successAnimation.start();
  };

  const handleErrorAnimation = () => {
    const errorAnimation = animationComposers.errorShake(shakeValue, 500);
    errorAnimation.start();
  };

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const shakeTranslateX = shakeValue.interpolate({
    inputRange: [-10, 0, 10],
    outputRange: [-10, 0, 10]
  });

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>動畫組合器</Text>
      <View style={styles.row}>
        <Animated.View
          style={[
            styles.animationBox,
            {
              transform: [
                { scale: scaleValue },
                { rotate }
              ]
            }
          ]}
        >
          <Text style={styles.animationText}>成功</Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.animationBox,
            {
              transform: [{ translateX: shakeTranslateX }]
            }
          ]}
        >
          <Text style={styles.animationText}>錯誤</Text>
        </Animated.View>
      </View>
      <View style={styles.row}>
        <Text
          style={{ color: '#ffd700', marginRight: 10 }}
          onPress={handleSuccessAnimation}
        >
          觸發成功動畫
        </Text>
        <Text
          style={{ color: '#ff6b6b' }}
          onPress={handleErrorAnimation}
        >
          觸發錯誤動畫
        </Text>
      </View>
    </View>
  );
};

// 動畫預設展示
export const AnimationPresets = () => {
  const cardOpacity = new Animated.Value(0);
  const cardTranslateY = new Animated.Value(50);
  const cardScale = new Animated.Value(0.9);

  React.useEffect(() => {
    const preset = ANIMATION_PRESETS.card.enter;
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: preset.duration,
        easing: preset.easing,
        useNativeDriver: true
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: preset.duration,
        easing: preset.easing,
        useNativeDriver: true
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: preset.duration,
        easing: preset.easing,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>動畫預設</Text>
      <View style={styles.row}>
        <Animated.View
          style={[
            styles.animationBox,
            {
              opacity: cardOpacity,
              transform: [
                { translateY: cardTranslateY },
                { scale: cardScale }
              ]
            }
          ]}
        >
          <Text style={styles.animationText}>卡片入場</Text>
        </Animated.View>
      </View>
    </View>
  );
};

// 動畫工具函數展示
export const AnimationUtils = () => {
  const values = [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ];

  React.useEffect(() => {
    const staggeredAnimation = animationUtils.createStaggeredAnimation(
      values,
      (value, index) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 500,
          delay: index * 200,
          useNativeDriver: true
        }),
      200
    );
    staggeredAnimation.start();
  }, []);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>動畫工具函數</Text>
      <View style={styles.row}>
        {values.map((value, index) => (
          <Animated.View
            key={index}
            style={[
              styles.animationBox,
              {
                opacity: value,
                transform: [
                  {
                    scale: value.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1]
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.animationText}>{index + 1}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

// 性能優化工具展示
export const PerformanceOptimizers = () => {
  const [activeAnimations, setActiveAnimations] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveAnimations(animationMonitor.getActiveAnimationCount());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>性能優化工具</Text>
      <View style={{ color: '#ffffff' }}>
        <Text>活躍動畫數量: {activeAnimations}</Text>
        <Text>動畫緩存大小: {performanceOptimizers.animationCache.size}</Text>
      </View>
      <View style={styles.row}>
        <Text
          style={{ color: '#ffd700', marginRight: 10 }}
          onPress={() => {
            performanceOptimizers.clearAnimationCache();
            // logger.info('動畫緩存已清理');
          }}
        >
          清理緩存
        </Text>
        <Text
          style={{ color: '#ff6b6b' }}
          onPress={() => {
            animationMonitor.stopAllAnimations();
            // logger.info('所有動畫已停止');
          }}
        >
          停止所有動畫
        </Text>
      </View>
    </View>
  );
};

// 動畫系統文檔
export const AnimationSystemDocumentation = () => (
  <View style={styles.container}>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>動畫系統文檔</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>配置系統</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>ADVANCED_ANIMATION_CONFIG 提供統一的動畫配置：</Text>
          <Text>• duration: 動畫時長配置</Text>
          <Text>• easing: 緩動函數配置</Text>
          <Text>• spring: 彈簧動畫配置</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>高級動畫效果</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>advancedAnimations 提供豐富的動畫效果：</Text>
          <Text>• rotate3D: 3D旋轉動畫</Text>
          <Text>• wave: 波浪動畫</Text>
          <Text>• pulseRing: 脈衝光環</Text>
          <Text>• typewriter: 打字機效果</Text>
          <Text>• particleExplosion: 粒子爆炸</Text>
          <Text>• liquidFill: 液體填充</Text>
          <Text>• magneticPull: 磁鐵吸附</Text>
          <Text>• glow: 光暈效果</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>動畫組合器</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>animationComposers 提供複雜動畫組合：</Text>
          <Text>• cardFlip: 卡片翻轉</Text>
          <Text>• successCelebration: 成功慶祝</Text>
          <Text>• errorShake: 錯誤震動</Text>
          <Text>• pageTransition: 頁面轉場</Text>
          <Text>• loadingComplete: 加載完成</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>動畫預設</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>ANIMATION_PRESETS 提供常用動畫預設：</Text>
          <Text>• card: 卡片相關動畫</Text>
          <Text>• button: 按鈕動畫</Text>
          <Text>• modal: 模態框動畫</Text>
          <Text>• listItem: 列表項目動畫</Text>
          <Text>• loading: 加載動畫</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>使用示例</Text>
        <View style={{ color: '#ffffff' }}>
          <Text>```tsx</Text>
          <Text>import { advancedAnimations, animationComposers } from '@utils/advancedAnimations';</Text>
          <Text></Text>
          <Text>// 使用高級動畫</Text>
          <Text>const waveAnimation = advancedAnimations.wave(waveValue, 20, 2, 2000);</Text>
          <Text>waveAnimation.start();</Text>
          <Text></Text>
          <Text>// 使用動畫組合器</Text>
          <Text>const successAnimation = animationComposers.successCelebration(scaleValue, rotateValue, colorValue);</Text>
          <Text>successAnimation.start();</Text>
          <Text>```</Text>
        </View>
      </View>
    </View>
  </View>
);
