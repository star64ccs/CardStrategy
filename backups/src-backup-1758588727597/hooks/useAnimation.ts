import { useCallback, useEffect, useRef, useState } from 'react';

import { useAnimation as useAnimationContext } from '../components/providers/AnimationProvider';
import type {
  AnimationConfig,
  AnimationEvent,
  AnimationPerformance,
  EasingFunction,
  UseAnimationReturn,
} from '../types/animation';

/**
 * 動畫 Hook 配置
 */
interface UseAnimationConfig {
  // 基本配置
  duration?: number;
  easing?: EasingFunction;
  delay?: number;
  iterations?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';

  // 性能優化
  willChange?: boolean;
  transform3d?: boolean;
  backfaceVisibility?: boolean;

  // 偏好設置
  respectMotionPreference?: boolean;
  reducedMotion?: boolean;

  // 自動播放
  autoPlay?: boolean;
  loop?: boolean;

  // 事件回調
  onStart?: (event: AnimationEvent) => void;
  onEnd?: (event: AnimationEvent) => void;
  onPause?: (event: AnimationEvent) => void;
  onResume?: (event: AnimationEvent) => void;
}

/**
 * 動畫 Hook
 * 提供動畫控制功能，包括播放、暫停、停止等
 */
export const useAnimation = (
  config?: UseAnimationConfig
): UseAnimationReturn => {
  const animationService = useAnimationContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeedState] = useState(1);
  const animationIdRef = useRef<string | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const animationRef = useRef<Animation | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // 默認配置
  const defaultConfig: Required<UseAnimationConfig> = {
    duration: 300,
    easing: 'ease-out',
    delay: 0,
    iterations: 1,
    direction: 'normal',
    fillMode: 'none',
    willChange: true,
    transform3d: true,
    backfaceVisibility: true,
    respectMotionPreference: true,
    reducedMotion: false,
    autoPlay: false,
    loop: false,
    onStart: () => {},
    onEnd: () => {},
    onPause: () => {},
    onResume: () => {},
  };

  const finalConfig = { ...defaultConfig, ...config };

  // 創建動畫配置
  const createAnimationConfig = useCallback((): AnimationConfig => {
    return {
      duration: finalConfig.duration,
      easing: finalConfig.easing,
      delay: finalConfig.delay,
      iterations: finalConfig.loop ? -1 : finalConfig.iterations,
      direction: finalConfig.direction,
      fillMode: finalConfig.fillMode,
      willChange: finalConfig.willChange,
      transform3d: finalConfig.transform3d,
      backfaceVisibility: finalConfig.backfaceVisibility,
      respectMotionPreference: finalConfig.respectMotionPreference,
      reducedMotion: finalConfig.reducedMotion,
    };
  }, [finalConfig]);

  // 播放動畫
  const play = useCallback(async () => {
    if (!elementRef.current || isPlaying) return;

    try {
      // 創建動畫配置
      const animationConfig = createAnimationConfig();

      // 創建動畫
      const id = animationService.createAnimation(animationConfig);
      animationIdRef.current = id;

      // 設置動畫元素
      const element = elementRef.current;

      // 設置性能優化
      if (finalConfig.willChange) {
        element.style.willChange = 'transform, opacity';
      }
      if (finalConfig.transform3d) {
        element.style.transform = 'translateZ(0)';
      }
      if (finalConfig.backfaceVisibility) {
        element.style.backfaceVisibility = 'hidden';
      }

      // 創建 Web Animation
      const keyframes = [
        { offset: 0, opacity: 0, transform: 'translateY(20px)' },
        { offset: 1, opacity: 1, transform: 'translateY(0)' },
      ];

      const options = {
        duration: animationConfig.duration,
        easing:
          typeof animationConfig.easing === 'string'
            ? animationConfig.easing
            : 'ease-out',
        delay: animationConfig.delay,
        iterations: animationConfig.iterations,
        direction: animationConfig.direction,
        fill: animationConfig.fillMode,
      };

      const animation = element.animate(keyframes, options);
      animationRef.current = animation;

      // 設置播放速度
      animation.playbackRate = speed;

      setIsPlaying(true);
      setIsPaused(false);

      // 設置事件監聽
      animation.onfinish = () => {
        setIsPlaying(false);
        setProgress(1);
        setCurrentTime(animationConfig.duration);

        // 調用 onEnd 回調
        finalConfig.onEnd({
          type: 'end',
          timestamp: Date.now(),
          animation: animationConfig,
          target: element,
        });
      };

      animation.oncancel = () => {
        setIsPlaying(false);
        setIsPaused(false);

        // 調用 onEnd 回調
        finalConfig.onEnd({
          type: 'cancel',
          timestamp: Date.now(),
          animation: animationConfig,
          target: element,
        });
      };

      // 調用 onStart 回調
      finalConfig.onStart({
        type: 'start',
        timestamp: Date.now(),
        animation: animationConfig,
        target: element,
      });

      // 監控動畫進度
      const updateProgress = () => {
        if (animation && !animation.finished) {
          const currentTime = (animation.currentTime as number) || 0;
          const progress = currentTime / animationConfig.duration;

          setCurrentTime(currentTime);
          setProgress(Math.min(progress, 1));

          rafIdRef.current = requestAnimationFrame(updateProgress);
        }
      };

      rafIdRef.current = requestAnimationFrame(updateProgress);
    } catch (error) {
      console.error('播放動畫失敗:', error);
      throw error;
    }
  }, [isPlaying, createAnimationConfig, animationService, finalConfig, speed]);

  // 暫停動畫
  const pause = useCallback(() => {
    if (animationRef.current && isPlaying) {
      animationRef.current.pause();
      setIsPaused(true);

      // 調用 onPause 回調
      finalConfig.onPause({
        type: 'pause',
        timestamp: Date.now(),
        animation: createAnimationConfig(),
        target: elementRef.current || undefined,
      });
    }
  }, [isPlaying, finalConfig, createAnimationConfig]);

  // 停止動畫
  const stop = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.cancel();
      animationRef.current = null;
    }

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
    setProgress(0);

    // 清理性能優化樣式
    if (elementRef.current) {
      elementRef.current.style.willChange = 'auto';
      elementRef.current.style.transform = '';
      elementRef.current.style.backfaceVisibility = '';
    }
  }, []);

  // 反向播放
  const reverse = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.reverse();
    }
  }, []);

  // 重新開始
  const restart = useCallback(async () => {
    stop();
    await play();
  }, [stop, play]);

  // 設置進度
  const setProgressValue = useCallback(
    (newProgress: number) => {
      if (animationRef.current) {
        const clampedProgress = Math.max(0, Math.min(1, newProgress));
        const newTime = clampedProgress * finalConfig.duration;

        animationRef.current.currentTime = newTime;
        setProgress(clampedProgress);
        setCurrentTime(newTime);
      }
    },
    [finalConfig.duration]
  );

  // 設置速度
  const setSpeed = useCallback((newSpeed: number) => {
    if (animationRef.current) {
      animationRef.current.playbackRate = newSpeed;
      setSpeedState(newSpeed);
    }
  }, []);

  // 事件監聽器
  const onStart = useCallback(
    (callback: (event: AnimationEvent) => void) => {
      finalConfig.onStart = callback;
    },
    [finalConfig]
  );

  const onEnd = useCallback(
    (callback: (event: AnimationEvent) => void) => {
      finalConfig.onEnd = callback;
    },
    [finalConfig]
  );

  const onPause = useCallback(
    (callback: (event: AnimationEvent) => void) => {
      finalConfig.onPause = callback;
    },
    [finalConfig]
  );

  const onResume = useCallback(
    (callback: (event: AnimationEvent) => void) => {
      finalConfig.onResume = callback;
    },
    [finalConfig]
  );

  // 獲取性能指標
  const performance: AnimationPerformance = animationService.getPerformance();

  // 自動播放
  useEffect(() => {
    if (finalConfig.autoPlay) {
      play();
    }

    return () => {
      stop();
    };
  }, [finalConfig.autoPlay, play, stop]);

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // 返回動畫控制接口
  return {
    // 狀態
    isPlaying,
    isPaused,
    progress,
    currentTime,

    // 控制方法
    play,
    pause,
    stop,
    reverse,
    restart,

    // 設置
    setProgress: setProgressValue,
    setSpeed,

    // 事件
    onStart,
    onEnd,
    onPause,
    onResume,

    // 性能
    performance,
  };
};

/**
 * 便捷 Hook：淡入動畫
 */
export const useFadeIn = (config?: Partial<UseAnimationConfig>) => {
  return useAnimation({
    duration: 300,
    easing: 'ease-out',
    ...config,
  });
};

/**
 * 便捷 Hook：淡出動畫
 */
export const useFadeOut = (config?: Partial<UseAnimationConfig>) => {
  return useAnimation({
    duration: 300,
    easing: 'ease-in',
    ...config,
  });
};

/**
 * 便捷 Hook：滑入動畫
 */
export const useSlideIn = (config?: Partial<UseAnimationConfig>) => {
  return useAnimation({
    duration: 400,
    easing: 'ease-out',
    ...config,
  });
};

/**
 * 便捷 Hook：縮放動畫
 */
export const useScale = (config?: Partial<UseAnimationConfig>) => {
  return useAnimation({
    duration: 300,
    easing: 'ease-out',
    ...config,
  });
};

/**
 * 便捷 Hook：旋轉動畫
 */
export const useRotate = (config?: Partial<UseAnimationConfig>) => {
  return useAnimation({
    duration: 500,
    easing: 'ease-out',
    ...config,
  });
};

/**
 * 便捷 Hook：彈跳動畫
 */
export const useBounce = (config?: Partial<UseAnimationConfig>) => {
  return useAnimation({
    duration: 600,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    iterations: 1,
    ...config,
  });
};

/**
 * 便捷 Hook：脈衝動畫
 */
export const usePulse = (config?: Partial<UseAnimationConfig>) => {
  return useAnimation({
    duration: 1000,
    easing: 'ease-in-out',
    iterations: -1,
    direction: 'alternate',
    ...config,
  });
};

export default useAnimation;
