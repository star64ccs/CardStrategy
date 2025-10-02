import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useDesignSystem } from '../../hooks/useDesignSystem';
import { touchService } from '../../services/touchService';
import type {
  TouchFeedbackConfig,
  TouchFeedbackProps,
} from '../../types/touch';

/**
 * 觸控反饋Component
 * 提供多種視覺反饋效果：波紋、縮放、透明度、顏色變化
 */
export const TouchFeedback: React.FC<TouchFeedbackProps> = ({
  children,
  feedback = {},
  onPress,
  onPressIn,
  onPressOut,
  className = '',
  style = {},
  disabled = false,
}) => {
  const { theme } = useDesignSystem();
  const _containerRef = useRef<HTMLDivElement>(null);
  const _componentId = useRef(`touch-feedback-${Date.now()}-${Math.random()}`);

  // StatusManage
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<
    {
      id: string;
      x: number;
      y: number;
      size: number;
      opacity: number;
      startTime: number;
    }[]
  >([]);

  // DefaultConfigure
  const defaultConfig: TouchFeedbackConfig = {
    type: 'ripple',
    duration: 300,
    scale: 0.95,
    opacity: 0.8,
    color: theme?.colors?.brand?.primary || '#007bff',
    rippleColor: theme?.colors?.brand?.primary || '#007bff',
    rippleSize: 100,
    disabled: false,
  };

  const _finalConfig = { ...defaultConfig, ...feedback };

  // RegisterComponent到Service
  useEffect(() => {
    if (!disabled) {
      touchService.registerFeedback(componentId.current, finalConfig);
    }

    return () => {
      touchService.unregisterFeedback(componentId.current);
    };
  }, [disabled, finalConfig]);

  // 清理過期的波紋效果
  useEffect(() => {
    const _interval = setInterval(() => {
      const _now = Date.now();
      setRipples(prev =>
        prev.filter(ripple => {
          const _elapsed = now - ripple.startTime;
          return elapsed < (finalConfig.duration || 300);
        })
      );
    }, 16); // 60fps

    return () => clearInterval(interval);
  }, [finalConfig.duration]);

  // ToolFunction
  const _getTouchPoint = useCallback(
    (event: React.TouchEvent | React.MouseEvent): { x: number; y: number } => {
      if (containerRef.current) {
        const _rect = containerRef.current.getBoundingClientRect();

        if ('touches' in event && event.touches.length > 0) {
          const _touch = event.touches[0];
          return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
          };
        } else if ('clientX' in event) {
          return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          };
        }
      }
      return { x: 0, y: 0 };
    },
    []
  );

  const _createRipple = useCallback(
    (x: number, y: number) => {
      const _rippleId = `ripple-${Date.now()}-${Math.random()}`;
      const _newRipple = {
        id: rippleId,
        x,
        y,
        size: finalConfig.rippleSize || 100,
        opacity: 1,
        startTime: Date.now(),
      };

      setRipples(prev => [...prev, newRipple]);

      // AutoRemove波紋
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== rippleId));
      }, finalConfig.duration || 300);
    },
    [finalConfig.rippleSize, finalConfig.duration]
  );

  // EventHandle器
  const _handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (disabled || finalConfig.disabled) return;

      event.preventDefault();
      setIsPressed(true);

      if (onPressIn) {
        onPressIn();
      }

      // Create波紋效果
      if (finalConfig.type === 'ripple') {
        const _point = getTouchPoint(event);
        createRipple(point.x, point.y);
      }

      // 性能Trace
      touchService.trackPerformance(componentId.current, {
        feedback: finalConfig.type,
        action: 'pressIn',
        timestamp: Date.now(),
      });
    },
    [disabled, finalConfig, onPressIn, getTouchPoint, createRipple]
  );

  const _handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (disabled || finalConfig.disabled) return;

      setIsPressed(false);

      if (onPressOut) {
        onPressOut();
      }

      if (onPress) {
        onPress();
      }

      // 性能Trace
      touchService.trackPerformance(componentId.current, {
        feedback: finalConfig.type,
        action: 'pressOut',
        timestamp: Date.now(),
      });
    },
    [disabled, finalConfig, onPressOut, onPress]
  );

  const _handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (disabled || finalConfig.disabled) return;

      setIsPressed(true);

      if (onPressIn) {
        onPressIn();
      }

      // Create波紋效果
      if (finalConfig.type === 'ripple') {
        const _point = getTouchPoint(event);
        createRipple(point.x, point.y);
      }
    },
    [disabled, finalConfig, onPressIn, getTouchPoint, createRipple]
  );

  const _handleMouseUp = useCallback(
    (event: React.MouseEvent) => {
      if (disabled || finalConfig.disabled) return;

      setIsPressed(false);

      if (onPressOut) {
        onPressOut();
      }

      if (onPress) {
        onPress();
      }
    },
    [disabled, finalConfig, onPressOut, onPress]
  );

  const _handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled || finalConfig.disabled) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsPressed(true);

        if (onPressIn) {
          onPressIn();
        }

        if (onPress) {
          onPress();
        }
      }
    },
    [disabled, finalConfig, onPressIn, onPress]
  );

  const _handleKeyUp = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled || finalConfig.disabled) return;

      if (event.key === 'Enter' || event.key === ' ') {
        setIsPressed(false);

        if (onPressOut) {
          onPressOut();
        }
      }
    },
    [disabled, finalConfig, onPressOut]
  );

  // 樣式計算
  const _getContainerStyle = useCallback((): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      userSelect: 'none',
      touchAction: 'manipulation',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: `all ${finalConfig.duration || 300}ms ease`,
      ...style,
    };

    // Root據反饋Class型Add樣式
    switch (finalConfig.type) {
      case 'scale':
        baseStyle.transform = isPressed
          ? `scale(${finalConfig.scale || 0.95})`
          : 'scale(1)';
        break;
      case 'opacity':
        baseStyle.opacity = isPressed ? finalConfig.opacity || 0.8 : 1;
        break;
      case 'color':
        baseStyle.backgroundColor = isPressed
          ? finalConfig.color || theme?.colors?.brand?.primary || '#007bff'
          : 'transparent';
        break;
      case 'custom':
        if (finalConfig.customAnimation) {
          baseStyle.animation = isPressed
            ? finalConfig.customAnimation
            : 'none';
        }
        break;
    }

    return baseStyle;
  }, [disabled, finalConfig, isPressed, style, theme?.colors?.brand?.primary]);

  // 波紋渲染
  const _renderRipples = useCallback(() => {
    if (finalConfig.type !== 'ripple') return null;

    return ripples.map(ripple => {
      const _elapsed = Date.now() - ripple.startTime;
      const _progress = Math.min(elapsed / (finalConfig.duration || 300), 1);
      const _scale = progress;
      const _opacity = 1 - progress;

      return (
        <div
          key={ripple.id}
          style={{
            position: 'absolute',
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            borderRadius: '50%',
            backgroundColor:
              finalConfig.rippleColor ||
              theme?.colors?.brand?.primary ||
              '#007bff',
            opacity,
            transform: `scale(${scale})`,
            pointerEvents: 'none',
            transition: 'none',
          }}
        />
      );
    });
  }, [ripples, finalConfig, theme?.colors?.brand?.primary]);

  return (
    <div
      ref={containerRef}
      className={`touch-feedback ${className}`}
      style={getContainerStyle()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      tabIndex={disabled ? -1 : 0}
      role='button'
      aria-disabled={disabled}
    >
      {children}
      {renderRipples()}
    </div>
  );
};
