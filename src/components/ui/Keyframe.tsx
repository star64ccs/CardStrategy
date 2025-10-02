import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { KeyframeProps } from '../../types/animation';
import { useAnimation } from '../providers/AnimationProvider';

/**
 * OffKey幀動畫Component
 * 提供基於OffKey幀的複雜動畫效果
 */
export const Keyframe: React.FC<KeyframeProps> = ({
  keyframes,
  autoPlay = false,
  loop = false,
  reverse = false,
  startTime = 0,
  endTime,
  optimizeForPerformance = true,
  useTransform3d = true,
  children,
  onStart,
  onEnd,
  onPause,
  onResume,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  ...props
}) => {
  const { createAnimation, playAnimation, stopAnimation } = useAnimation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [animationId, setAnimationId] = useState<string | null>(null);
  const _elementRef = useRef<HTMLDivElement>(null);
  const _animationRef = useRef<Animation | null>(null);
  const _rafIdRef = useRef<number | null>(null);

  // 計算動畫總時長
  const _totalDuration = endTime || keyframes.config.duration || 1000;

  // Create動畫Configure
  const _createAnimationConfig = useCallback(() => {
    const _config = {
      ...keyframes.config,
      duration: totalDuration,
      iterations: loop ? -1 : 1,
      direction: reverse ? 'reverse' : 'normal',
    };

    // 性能優化
    if (optimizeForPerformance) {
      config.willChange = true;
      config.transform3d = useTransform3d;
      config.backfaceVisibility = true;
    }

    return config;
  }, [
    keyframes.config,
    totalDuration,
    loop,
    reverse,
    optimizeForPerformance,
    useTransform3d,
  ]);

  // 生成OffKey幀
  const _generateKeyframes = useCallback(() => {
    const frames: Keyframe[] = [];

    // 按Offset量SortOffKey幀
    const _sortedKeyframes = [...keyframes.keyframes].sort(
      (a, b) => a.offset - b.offset
    );

    sortedKeyframes.forEach((keyframe, index) => {
      const frame: Keyframe = {
        offset: keyframe.offset,
        properties: { ...keyframe.properties } as any,
      };

      // Add緩動Function
      if (keyframe.easing) {
        frame.easing = keyframe.easing as any;
      }

      frames.push(frame);
    });

    // 如果沒有OffKey幀，提供Default的
    if (frames.length === 0) {
      frames.push(
        {
          offset: 0,
          properties: { opacity: 0, transform: 'translateY(20px)' } as any,
        },
        {
          offset: 1,
          properties: { opacity: 1, transform: 'translateY(0)' } as any,
        }
      );
    }

    return frames;
  }, [keyframes.keyframes]);

  // 生成動畫Options
  const _generateAnimationOptions = useCallback(() => {
    const _config = createAnimationConfig();

    return {
      duration: config.duration,
      easing: typeof config.easing === 'string' ? config.easing : 'ease-out',
      delay: config.delay || 0,
      iterations: config.iterations || 1,
      direction: config.direction || 'normal',
      fill: config.fillMode || 'none',
    };
  }, [createAnimationConfig]);

  // 播放動畫
  const _play = useCallback(async () => {
    if (!elementRef.current || isPlaying) return;

    const _element = elementRef.current;
    const _frames = generateKeyframes();
    const _options = generateAnimationOptions();

    // Create動畫
    const _animation = element.animate(frames, options as any);
    animationRef.current = animation;

    // Settings性能優化
    if (optimizeForPerformance) {
      element.style.willChange = 'transform, opacity';
      if (useTransform3d) {
        element.style.transform = 'translateZ(0)';
      }
    }

    setIsPlaying(true);
    setIsPaused(false);

    // SettingsEvent監聽
    animation.onfinish = () => {
      setIsPlaying(false);
      setProgress(1);
      setCurrentTime(totalDuration);

      // 調用 onEnd Callback
      onEnd?.({
        type: 'end',
        timestamp: Date.now(),
        animation: createAnimationConfig() as any,
        target: element,
      });
    };

    animation.oncancel = () => {
      setIsPlaying(false);
      setIsPaused(false);

      // 調用 onEnd Callback
      onEnd?.({
        type: 'cancel',
        timestamp: Date.now(),
        animation: createAnimationConfig() as any,
        target: element,
      });
    };

    // 調用 onStart Callback
    onStart?.({
      type: 'start',
      timestamp: Date.now(),
      animation: createAnimationConfig() as any,
      target: element,
    });

    // Monitor動畫進度
    const _updateProgress = () => {
      if (animation && !animation.finished) {
        const _currentTime = animation.currentTime || 0;
        const _progress = (currentTime as number) / totalDuration;

        setCurrentTime(currentTime as number);
        setProgress(Math.min(progress, 1));

        rafIdRef.current = requestAnimationFrame(updateProgress);
      }
    };

    rafIdRef.current = requestAnimationFrame(updateProgress);
  }, [
    isPlaying,
    generateKeyframes,
    generateAnimationOptions,
    optimizeForPerformance,
    useTransform3d,
    totalDuration,
    onStart,
    onEnd,
    createAnimationConfig,
  ]);

  // Pause動畫
  const _pause = useCallback(() => {
    if (animationRef.current && isPlaying) {
      animationRef.current.pause();
      setIsPaused(true);

      // 調用 onPause Callback
      onPause?.({
        type: 'pause',
        timestamp: Date.now(),
        animation: createAnimationConfig() as any,
        target: elementRef.current || undefined,
      });
    }
  }, [isPlaying, onPause, createAnimationConfig]);

  // Restore動畫
  const _resume = useCallback(() => {
    if (animationRef.current && isPaused) {
      animationRef.current.play();
      setIsPaused(false);

      // 調用 onResume Callback
      onResume?.({
        type: 'resume',
        timestamp: Date.now(),
        animation: createAnimationConfig() as any,
        target: elementRef.current || undefined,
      });
    }
  }, [isPaused, onResume, createAnimationConfig]);

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
    if (elementRef.current && optimizeForPerformance) {
      elementRef.current.style.willChange = 'auto';
    }
  }, [optimizeForPerformance]);

  // Settings進度
  const _setProgressValue = useCallback(
    (newProgress: number) => {
      if (animationRef.current) {
        const _clampedProgress = Math.max(0, Math.min(1, newProgress));
        const _newTime = clampedProgress * totalDuration;

        animationRef.current.currentTime = newTime;
        setProgress(clampedProgress);
        setCurrentTime(newTime);
      }
    },
    [totalDuration]
  );

  // Settings速度
  const _setSpeed = useCallback((speed: number) => {
    if (animationRef.current) {
      animationRef.current.playbackRate = speed;
    }
  }, []);

  // Auto播放
  useEffect(() => {
    if (autoPlay) {
      play();
    }

    return () => {
      stop();
    };
  }, [autoPlay, play, stop]);

  // ComponentUninstall時清理
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // ApplyCustomProperty
  useEffect(() => {
    if (elementRef.current && keyframes.customProperties) {
      Object.entries(keyframes.customProperties).forEach(
        ([property, value]) => {
          (elementRef.current.style as any)[property] = value;
        }
      );
    }
  }, [keyframes.customProperties]);

  // 計算當前樣式
  const _getCurrentStyle = useCallback(() => {
    if (!elementRef.current || keyframes.keyframes.length === 0) {
      return {};
    }

    // 找到當前進度對應的OffKey幀
    const _sortedKeyframes = [...keyframes.keyframes].sort(
      (a, b) => a.offset - b.offset
    );
    const currentStyle: Record<string, any> = {};

    for (let i = 0; i < sortedKeyframes.length - 1; i++) {
      const _current = sortedKeyframes[i];
      const _next = sortedKeyframes[i + 1];

      if (progress >= current.offset && progress <= next.offset) {
        // 計算插Value
        const _localProgress =
          (progress - current.offset) / (next.offset - current.offset);

        Object.keys(current.properties).forEach(property => {
          const _startValue = current.properties[property];
          const _endValue = next.properties[property];

          if (typeof startValue === 'number' && typeof endValue === 'number') {
            currentStyle[property] =
              startValue + (endValue - startValue) * localProgress;
          } else {
            currentStyle[property] = progress < 0.5 ? startValue : endValue;
          }
        });

        break;
      }
    }

    return currentStyle;
  }, [progress, keyframes.keyframes]);

  // Merge樣式
  const _mergedStyle = {
    ...style,
    ...getCurrentStyle(),
  };

  return (
    <div
      ref={elementRef}
      className={className}
      style={mergedStyle}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      {...props}
    >
      {children}
    </div>
  );
};

// 預設OffKey幀Configure
export const _defaultKeyframes = {
  bounce: {
    keyframes: [
      { offset: 0, properties: { transform: 'translateY(0)' } },
      { offset: 0.2, properties: { transform: 'translateY(-20px)' } },
      { offset: 0.4, properties: { transform: 'translateY(0)' } },
      { offset: 0.6, properties: { transform: 'translateY(-10px)' } },
      { offset: 0.8, properties: { transform: 'translateY(0)' } },
      { offset: 1, properties: { transform: 'translateY(0)' } },
    ],
    config: {
      duration: 1000,
      easing: 'ease-in-out',
      iterations: 1,
    },
  },
  pulse: {
    keyframes: [
      { offset: 0, properties: { transform: 'scale(1)', opacity: 1 } },
      { offset: 0.5, properties: { transform: 'scale(1.1)', opacity: 0.8 } },
      { offset: 1, properties: { transform: 'scale(1)', opacity: 1 } },
    ],
    config: {
      duration: 1500,
      easing: 'ease-in-out',
      iterations: -1,
      direction: 'alternate',
    },
  },
  shake: {
    keyframes: [
      { offset: 0, properties: { transform: 'translateX(0)' } },
      { offset: 0.1, properties: { transform: 'translateX(-10px)' } },
      { offset: 0.2, properties: { transform: 'translateX(10px)' } },
      { offset: 0.3, properties: { transform: 'translateX(-10px)' } },
      { offset: 0.4, properties: { transform: 'translateX(10px)' } },
      { offset: 0.5, properties: { transform: 'translateX(-10px)' } },
      { offset: 0.6, properties: { transform: 'translateX(10px)' } },
      { offset: 0.7, properties: { transform: 'translateX(-10px)' } },
      { offset: 0.8, properties: { transform: 'translateX(10px)' } },
      { offset: 0.9, properties: { transform: 'translateX(-5px)' } },
      { offset: 1, properties: { transform: 'translateX(0)' } },
    ],
    config: {
      duration: 800,
      easing: 'ease-in-out',
      iterations: 1,
    },
  },
  fadeInUp: {
    keyframes: [
      { offset: 0, properties: { opacity: 0, transform: 'translateY(30px)' } },
      { offset: 1, properties: { opacity: 1, transform: 'translateY(0)' } },
    ],
    config: {
      duration: 600,
      easing: 'ease-out',
      iterations: 1,
    },
  },
  fadeInDown: {
    keyframes: [
      { offset: 0, properties: { opacity: 0, transform: 'translateY(-30px)' } },
      { offset: 1, properties: { opacity: 1, transform: 'translateY(0)' } },
    ],
    config: {
      duration: 600,
      easing: 'ease-out',
      iterations: 1,
    },
  },
  fadeInLeft: {
    keyframes: [
      { offset: 0, properties: { opacity: 0, transform: 'translateX(-30px)' } },
      { offset: 1, properties: { opacity: 1, transform: 'translateX(0)' } },
    ],
    config: {
      duration: 600,
      easing: 'ease-out',
      iterations: 1,
    },
  },
  fadeInRight: {
    keyframes: [
      { offset: 0, properties: { opacity: 0, transform: 'translateX(30px)' } },
      { offset: 1, properties: { opacity: 1, transform: 'translateX(0)' } },
    ],
    config: {
      duration: 600,
      easing: 'ease-out',
      iterations: 1,
    },
  },
};

// 便捷Component
export const BounceKeyframe: React.FC<
  Omit<KeyframeProps, 'keyframes'>
> = props => <Keyframe keyframes={defaultKeyframes.bounce} {...props} />;

export const PulseKeyframe: React.FC<
  Omit<KeyframeProps, 'keyframes'>
> = props => <Keyframe keyframes={defaultKeyframes.pulse as any} {...props} />;

export const ShakeKeyframe: React.FC<
  Omit<KeyframeProps, 'keyframes'>
> = props => <Keyframe keyframes={defaultKeyframes.shake} {...props} />;

export const FadeInUpKeyframe: React.FC<
  Omit<KeyframeProps, 'keyframes'>
> = props => <Keyframe keyframes={defaultKeyframes.fadeInUp} {...props} />;

export const FadeInDownKeyframe: React.FC<
  Omit<KeyframeProps, 'keyframes'>
> = props => <Keyframe keyframes={defaultKeyframes.fadeInDown} {...props} />;

export const FadeInLeftKeyframe: React.FC<
  Omit<KeyframeProps, 'keyframes'>
> = props => <Keyframe keyframes={defaultKeyframes.fadeInLeft} {...props} />;

export const FadeInRightKeyframe: React.FC<
  Omit<KeyframeProps, 'keyframes'>
> = props => <Keyframe keyframes={defaultKeyframes.fadeInRight} {...props} />;

export default Keyframe;
