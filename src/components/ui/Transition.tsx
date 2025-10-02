import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { TransitionConfig, TransitionProps } from '../../types/animation';
import { useAnimation } from '../providers/AnimationProvider';

/**
 * 過渡動畫Component
 * 提供Element進入和Exit的過渡效果
 */
export const Transition: React.FC<TransitionProps> = ({
  transition,
  in: inProp = false,
  appear = false,
  unmountOnExit = false,
  children,
  onEnter,
  onEntering,
  onEntered,
  onExit,
  onExiting,
  onExited,
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
  const [isVisible, setIsVisible] = useState(inProp);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationId, setAnimationId] = useState<string | null>(null);
  const _elementRef = useRef<HTMLDivElement>(null);
  const _previousInProp = useRef(inProp);

  // Create進入動畫Configure
  const _createEnterAnimation = useCallback((): TransitionConfig => {
    return {
      ...transition,
      property: transition.property,
      from: transition.from,
      to: transition.to,
      duration: transition.duration || 300,
      easing: transition.easing || 'ease-out',
      fillMode: 'forwards',
    };
  }, [transition]);

  // CreateExit動畫Configure
  const _createExitAnimation = useCallback((): TransitionConfig => {
    return {
      ...transition,
      property: transition.property,
      from: transition.to,
      to: transition.from,
      duration: transition.duration || 300,
      easing: transition.easing || 'ease-in',
      fillMode: 'forwards',
    };
  }, [transition]);

  // Handle進入動畫
  const _handleEnter = useCallback(async () => {
    if (!elementRef.current) return;

    const _element = elementRef.current;

    // 調用 onEnter Callback
    onEnter?.(element);

    // Settings初始Status
    if (Array.isArray(transition.property)) {
      transition.property.forEach(prop => {
        if (transition.from && transition.from[prop] !== undefined) {
          (element.style as any)[prop] = transition.from[prop];
        }
      });
    } else if (transition.from) {
      Object.assign(element.style, transition.from);
    }

    // Create動畫
    const _enterConfig = createEnterAnimation();
    const _id = createAnimation(enterConfig);
    setAnimationId(id);

    // Settings動畫Element
    if (elementRef.current) {
      // 這裡需要將ElementSettings到動畫Service中
      // 由於動畫Service的實現Limit，我們使用 CSS 動畫作為備選方案
      const _keyframes = generateKeyframes(enterConfig);
      const _options = generateAnimationOptions(enterConfig);

      const _animation = element.animate(keyframes, options);

      setIsAnimating(true);

      // 調用 onEntering Callback
      onEntering?.(element);

      // SettingsEvent監聽
      animation.onfinish = () => {
        setIsAnimating(false);
        setAnimationId(null);
        setIsVisible(true);

        // 調用 onEntered Callback
        onEntered?.(element);

        // 調用 onEnd Callback
        onEnd?.({
          type: 'end',
          timestamp: Date.now(),
          animation: enterConfig,
          target: element,
        });
      };

      animation.oncancel = () => {
        setIsAnimating(false);
        setAnimationId(null);

        // 調用 onEnd Callback
        onEnd?.({
          type: 'cancel',
          timestamp: Date.now(),
          animation: enterConfig,
          target: element,
        });
      };

      // 調用 onStart Callback
      onStart?.({
        type: 'start',
        timestamp: Date.now(),
        animation: enterConfig,
        target: element,
      });
    }
  }, [
    transition,
    createEnterAnimation,
    createAnimation,
    onEnter,
    onEntering,
    onEntered,
    onStart,
    onEnd,
  ]);

  // HandleExit動畫
  const _handleExit = useCallback(async () => {
    if (!elementRef.current) return;

    const _element = elementRef.current;

    // 調用 onExit Callback
    onExit?.(element);

    // Create動畫
    const _exitConfig = createExitAnimation();
    const _id = createAnimation(exitConfig);
    setAnimationId(id);

    // Settings動畫Element
    if (elementRef.current) {
      const _keyframes = generateKeyframes(exitConfig);
      const _options = generateAnimationOptions(exitConfig);

      const _animation = element.animate(keyframes, options);

      setIsAnimating(true);

      // 調用 onExiting Callback
      onExiting?.(element);

      // SettingsEvent監聽
      animation.onfinish = () => {
        setIsAnimating(false);
        setAnimationId(null);
        setIsVisible(false);

        // 調用 onExited Callback
        onExited?.(element);

        // 調用 onEnd Callback
        onEnd?.({
          type: 'end',
          timestamp: Date.now(),
          animation: exitConfig,
          target: element,
        });
      };

      animation.oncancel = () => {
        setIsAnimating(false);
        setAnimationId(null);
        setIsVisible(false);

        // 調用 onExited Callback
        onExited?.(element);

        // 調用 onEnd Callback
        onEnd?.({
          type: 'cancel',
          timestamp: Date.now(),
          animation: exitConfig,
          target: element,
        });
      };

      // 調用 onStart Callback
      onStart?.({
        type: 'start',
        timestamp: Date.now(),
        animation: exitConfig,
        target: element,
      });
    }
  }, [
    transition,
    createExitAnimation,
    createAnimation,
    onExit,
    onExiting,
    onExited,
    onStart,
    onEnd,
  ]);

  // 監聽 in Property變化
  useEffect(() => {
    if (inProp !== previousInProp.current) {
      if (inProp) {
        // Element進入
        if (appear || previousInProp.current !== undefined) {
          handleEnter();
        } else {
          setIsVisible(true);
        }
      } else {
        // ElementExit
        handleExit();
      }
      previousInProp.current = inProp;
    }
  }, [inProp, appear, handleEnter, handleExit]);

  // ComponentUninstall時清理動畫
  useEffect(() => {
    return () => {
      if (animationId) {
        stopAnimation(animationId);
      }
    };
  }, [animationId, stopAnimation]);

  // 生成OffKey幀
  const _generateKeyframes = (config: TransitionConfig): Keyframe[] => {
    const keyframes: Keyframe[] = [];

    if (Array.isArray(config.property)) {
      // 多Property動畫
      config.property.forEach(prop => {
        if (
          config.from &&
          config.to &&
          config.from[prop] !== undefined &&
          config.to[prop] !== undefined
        ) {
          keyframes.push(
            { offset: 0, [prop]: config.from[prop] },
            { offset: 1, [prop]: config.to[prop] }
          );
        }
      });
    } else if (config.from && config.to) {
      // 單Property動畫
      keyframes.push(
        { offset: 0, ...config.from },
        { offset: 1, ...config.to }
      );
    }

    return keyframes.length > 0
      ? keyframes
      : [
          { offset: 0, opacity: 0, transform: 'translateY(20px)' },
          { offset: 1, opacity: 1, transform: 'translateY(0)' },
        ];
  };

  // 生成動畫Options
  const _generateAnimationOptions = (
    config: TransitionConfig
  ): KeyframeAnimationOptions => {
    return {
      duration: config.duration || 300,
      easing: typeof config.easing === 'string' ? config.easing : 'ease-out',
      delay: config.delay || 0,
      iterations: config.iterations || 1,
      direction: config.direction || 'normal',
      fill: config.fillMode || 'forwards',
    };
  };

  // 如果Element不可見且Settings了Uninstall，則不渲染
  if (!isVisible && unmountOnExit) {
    return null;
  }

  // 計算ShowStatus
  const _shouldShow = isVisible || isAnimating;

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        ...style,
        visibility: shouldShow ? 'visible' : 'hidden',
        display: shouldShow ? 'block' : 'none',
      }}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      {...props}
    >
      {children}
    </div>
  );
};

// 預設過渡Configure
export const _defaultTransitions = {
  fade: {
    property: 'opacity',
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 300,
    easing: 'ease-out',
  },
  slide: {
    property: ['opacity', 'transform'],
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 400,
    easing: 'ease-out',
  },
  scale: {
    property: ['opacity', 'transform'],
    from: { opacity: 0, transform: 'scale(0.8)' },
    to: { opacity: 1, transform: 'scale(1)' },
    duration: 300,
    easing: 'ease-out',
  },
  rotate: {
    property: ['opacity', 'transform'],
    from: { opacity: 0, transform: 'rotate(-180deg)' },
    to: { opacity: 1, transform: 'rotate(0deg)' },
    duration: 500,
    easing: 'ease-out',
  },
};

// 便捷Component
export const FadeTransition: React.FC<
  Omit<TransitionProps, 'transition'>
> = props => <Transition transition={defaultTransitions.fade} {...props} />;

export const SlideTransition: React.FC<
  Omit<TransitionProps, 'transition'>
> = props => <Transition transition={defaultTransitions.slide} {...props} />;

export const ScaleTransition: React.FC<
  Omit<TransitionProps, 'transition'>
> = props => <Transition transition={defaultTransitions.scale} {...props} />;

export const RotateTransition: React.FC<
  Omit<TransitionProps, 'transition'>
> = props => <Transition transition={defaultTransitions.rotate} {...props} />;

export default Transition;
