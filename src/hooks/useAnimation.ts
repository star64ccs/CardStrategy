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
 * 動畫 Hook Configure
 */
interface UseAnimationConfig {
  // 基本Configure
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

  // PreferencesSettings
  respectMotionPreference?: boolean;
  reducedMotion?: boolean;

  // Auto播放
  autoPlay?: boolean;
  loop?: boolean;

  // EventCallback
  onStart?: (event: AnimationEvent) => void;
  onEnd?: (event: AnimationEvent) => void;
  onPause?: (event: AnimationEvent) => void;
  onResume?: (event: AnimationEvent) => void;
}

/**
 * 動畫 Hook
 * 提供動畫Control功能，Package括播放、Pause、Stop等
 */
export const _useAnimation = (
  config?: UseAnimationConfig
): UseAnimationReturn => {
  const _animationService = useAnimationContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeedState] = useState(1);
  const _animationIdRef = useRef<string | null>(null);
  const _elementRef = useRef<HTMLElement | null>(null);
  const _animationRef = useRef<Animation | null>(null);
  const _rafIdRef = useRef<number | null>(null);

  // DefaultConfigure
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

  const _finalConfig = { ...defaultConfig, ...config };

  // Create動畫Configure
  const _createAnimationConfig = useCallback((): AnimationConfig => {
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
  const _play = useCallback(async () => {
    if (!elementRef.current || isPlaying) return;

    try {
      // Create動畫Configure
      const _animationConfig = createAnimationConfig();

      // Create動畫
      const _id = animationService.createAnimation(animationConfig);
      animationIdRef.current = id;

      // Settings動畫Element
      const _element = elementRef.current;

      // Settings性能優化
      if (finalConfig.willChange) {
        element.style.willChange = 'transform, opacity';
      }
      if (finalConfig.transform3d) {
        element.style.transform = 'translateZ(0)';
      }
      if (finalConfig.backfaceVisibility) {
        element.style.backfaceVisibility = 'hidden';
      }

      // Create Web Animation
      const _keyframes = [
        { offset: 0, opacity: 0, transform: 'translateY(20px)' },
        { offset: 1, opacity: 1, transform: 'translateY(0)' },
      ];

      const _options = {
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

      const _animation = element.animate(keyframes, options);
      animationRef.current = animation;

      // Settings播放速度
      animation.playbackRate = speed;

      setIsPlaying(true);
      setIsPaused(false);

      // SettingsEvent監聽
      animation.onfinish = () => {
        setIsPlaying(false);
        setProgress(1);
        setCurrentTime(animationConfig.duration);

        // 調用 onEnd Callback
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

        // 調用 onEnd Callback
        finalConfig.onEnd({
          type: 'cancel',
          timestamp: Date.now(),
          animation: animationConfig,
          target: element,
        });
      };

      // 調用 onStart Callback
      finalConfig.onStart({
        type: 'start',
        timestamp: Date.now(),
        animation: animationConfig,
        target: element,
      });

      // Monitor動畫進度
      const _updateProgress = () => {
        if (animation && !animation.finished) {
          const _currentTime = (animation.currentTime as number) || 0;
          const _progress = currentTime / animationConfig.duration;

          setCurrentTime(currentTime);
          setProgress(Math.min(progress, 1));

          rafIdRef.current = requestAnimationFrame(updateProgress);
        }
      };

      rafIdRef.current = requestAnimationFrame(updateProgress);
    } catch (error) {
      console.error('播放動畫Failed:', error);
      throw error;
    }
  }, [isPlaying, createAnimationConfig, animationService, finalConfig, speed]);

  // Pause動畫
  const _pause = useCallback(() => {
    if (animationRef.current && isPlaying) {
      animationRef.current.pause();
      setIsPaused(true);

      // 調用 onPause Callback
      finalConfig.onPause({
        type: 'pause',
        timestamp: Date.now(),
        animation: createAnimationConfig(),
        target: elementRef.current || undefined,
      });
    }
  }, [isPlaying, finalConfig, createAnimationConfig]);

  // Stop動畫
  const _stop = useCallback(() => {
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
  const _reverse = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.reverse();
    }
  }, []);

  // ReBegin
  const _restart = useCallback(async () => {
    stop();
    await play();
  }, [stop, play]);

  // Settings進度
  const _setProgressValue = useCallback(
    (newProgress: number) => {
      if (animationRef.current) {
        const _clampedProgress = Math.max(0, Math.min(1, newProgress));
        const _newTime = clampedProgress * finalConfig.duration;

        animationRef.current.currentTime = newTime;
        setProgress(clampedProgress);
        setCurrentTime(newTime);
      }
    },
    [finalConfig.duration]
  );

  // Settings速度
  const _setSpeed = useCallback((newSpeed: number) => {
    if (animationRef.current) {
      animationRef.current.playbackRate = newSpeed;
      setSpeedState(newSpeed);
    }
  }, []);

  // Event監聽器
  const _onStart = useCallback(
    (callback: (event: AnimationEvent) => void) => {
      finalConfig.onStart = callback;
    },
    [finalConfig]
  );

  const _onEnd = useCallback(
    (callback: (event: AnimationEvent) => void) => {
      finalConfig.onEnd = callback;
    },
    [finalConfig]
  );

  const _onPause = useCallback(
    (callback: (event: AnimationEvent) => void) => {
      finalConfig.onPause = callback;
    },
    [finalConfig]
  );

  const _onResume = useCallback(
    (callback: (event: AnimationEvent) => void) => {
      finalConfig.onResume = callback;
    },
    [finalConfig]
  );

  // Get性能指標
  const performance: AnimationPerformance = animationService.getPerformance();

  // Auto播放
  useEffect(() => {
    if (finalConfig.autoPlay) {
      play();
    }

    return () => {
      stop();
    };
  }, [finalConfig.autoPlay, play, stop]);

  // ComponentUninstall時清理
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // Return動畫ControlInterface
  return {
    // Status
    isPlaying,
    isPaused,
    progress,
    currentTime,

    // ControlMethod
    play,
    pause,
    stop,
    reverse,
    restart,

    // Settings
    setProgress: setProgressValue,
    setSpeed,

    // Event
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
export const _useFadeIn = (config?: Partial<UseAnimationConfig>) => {
  return useAnimation({
    duration: 300,
    easing: 'ease-out',
    ...config,
  });
};

/**
 * 便捷 Hook：淡出動畫
 */
export const _useFadeOut = (config?: Partial<UseAnimationConfig>) => {
  return useAnimation({
    duration: 300,
    easing: 'ease-in',
    ...config,
  });
};

/**
 * 便捷 Hook：滑入動畫
 */
export const _useSlideIn = (config?: Partial<UseAnimationConfig>) => {
  return useAnimation({
    duration: 400,
    easing: 'ease-out',
    ...config,
  });
};

/**
 * 便捷 Hook：縮放動畫
 */
export const _useScale = (config?: Partial<UseAnimationConfig>) => {
  return useAnimation({
    duration: 300,
    easing: 'ease-out',
    ...config,
  });
};

/**
 * 便捷 Hook：旋轉動畫
 */
export const _useRotate = (config?: Partial<UseAnimationConfig>) => {
  return useAnimation({
    duration: 500,
    easing: 'ease-out',
    ...config,
  });
};

/**
 * 便捷 Hook：彈跳動畫
 */
export const _useBounce = (config?: Partial<UseAnimationConfig>) => {
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
export const _usePulse = (config?: Partial<UseAnimationConfig>) => {
  return useAnimation({
    duration: 1000,
    easing: 'ease-in-out',
    iterations: -1,
    direction: 'alternate',
    ...config,
  });
};

export default useAnimation;
