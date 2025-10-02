// 按鈕點擊動畫Component
import type { ReactNode } from 'react';
import React, { useCallback, useRef } from 'react';

import type { ButtonClickConfig } from '../../types/microInteractions';
import {
  MicroInteractionType,
  TriggerType,
} from '../../types/microInteractions';
import { useMicroInteraction } from '../providers/MicroInteractionProvider';

// Component Props
interface ButtonClickAnimationProps {
  children: ReactNode;
  config?: Partial<ButtonClickConfig>;
  onClick?: (event: React.MouseEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onMouseUp?: (event: React.MouseEvent) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
  onTouchEnd?: (event: React.TouchEvent) => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  id?: string;
}

// DefaultConfigure
const DEFAULT_CONFIG: ButtonClickConfig = {
  id: '',
  type: MicroInteractionType.BUTTON_CLICK,
  trigger: TriggerType.CLICK,
  duration: 300,
  easing: 'ease-out',
  ripple: {
    enabled: true,
    color: 'rgba(255, 255, 255, 0.3)',
    duration: 600,
    scale: 1.5,
  },
  scale: {
    enabled: true,
    scale: 0.95,
    duration: 150,
  },
  shadow: {
    enabled: true,
    intensity: 0.2,
    duration: 150,
  },
  accessibility: {
    reducedMotion: false,
    screenReader: true,
    keyboardOnly: false,
  },
  performance: {
    useTransform: true,
    useOpacity: true,
    useWillChange: true,
    throttleScroll: false,
  },
};

// 按鈕點擊動畫Component
export const ButtonClickAnimation: React.FC<ButtonClickAnimationProps> = ({
  children,
  config = {},
  onClick,
  onMouseDown,
  onMouseUp,
  onTouchStart,
  onTouchEnd,
  className = '',
  style = {},
  disabled = false,
  id,
}) => {
  const { register, trigger, unregister } = useMicroInteraction();
  const _buttonRef = useRef<HTMLButtonElement>(null);
  const _interactionIdRef = useRef<string>('');

  // MergeConfigure
  const finalConfig: ButtonClickConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    id:
      id ||
      `button-click-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  // Register微交互
  React.useEffect(() => {
    if (!disabled) {
      const _interactionId = register(finalConfig);
      interactionIdRef.current = interactionId;

      return () => {
        unregister(interactionId);
      };
    }
    return undefined;
  }, [register, unregister, finalConfig, disabled]);

  // Handle點擊Event
  const _handleClick = useCallback(
    async (event: React.MouseEvent) => {
      if (disabled || !interactionIdRef.current) return;

      try {
        // 觸發微交互
        await trigger(interactionIdRef.current, {
          element: buttonRef.current,
          event: 'click',
          position: {
            x: event.clientX,
            y: event.clientY,
          },
        });
      } catch (error) {
        console.warn('按鈕點擊動畫Failed:', error);
      }

      // 調用原始 onClick
      onClick?.(event);
    },
    [disabled, trigger, onClick]
  );

  // Handle鼠標按下Event
  const _handleMouseDown = useCallback(
    async (event: React.MouseEvent) => {
      if (disabled || !interactionIdRef.current) return;

      try {
        // 觸發按下動畫
        await trigger(interactionIdRef.current, {
          element: buttonRef.current,
          event: 'mousedown',
          position: {
            x: event.clientX,
            y: event.clientY,
          },
        });
      } catch (error) {
        console.warn('按鈕按下動畫Failed:', error);
      }

      // 調用原始 onMouseDown
      onMouseDown?.(event);
    },
    [disabled, trigger, onMouseDown]
  );

  // Handle鼠標釋放Event
  const _handleMouseUp = useCallback(
    async (event: React.MouseEvent) => {
      if (disabled || !interactionIdRef.current) return;

      try {
        // 觸發釋放動畫
        await trigger(interactionIdRef.current, {
          element: buttonRef.current,
          event: 'mouseup',
          position: {
            x: event.clientX,
            y: event.clientY,
          },
        });
      } catch (error) {
        console.warn('按鈕釋放動畫Failed:', error);
      }

      // 調用原始 onMouseUp
      onMouseUp?.(event);
    },
    [disabled, trigger, onMouseUp]
  );

  // Handle觸控BeginEvent
  const _handleTouchStart = useCallback(
    async (event: React.TouchEvent) => {
      if (disabled || !interactionIdRef.current) return;

      const _touch = event.touches[0];
      try {
        // 觸發觸控Begin動畫
        await trigger(interactionIdRef.current, {
          element: buttonRef.current,
          event: 'touchstart',
          position: {
            x: touch.clientX,
            y: touch.clientY,
          },
        });
      } catch (error) {
        console.warn('按鈕觸控開始動畫Failed:', error);
      }

      // 調用原始 onTouchStart
      onTouchStart?.(event);
    },
    [disabled, trigger, onTouchStart]
  );

  // Handle觸控EndEvent
  const _handleTouchEnd = useCallback(
    async (event: React.TouchEvent) => {
      if (disabled || !interactionIdRef.current) return;

      const _touch = event.changedTouches[0];
      try {
        // 觸發觸控End動畫
        await trigger(interactionIdRef.current, {
          element: buttonRef.current,
          event: 'touchend',
          position: {
            x: touch.clientX,
            y: touch.clientY,
          },
        });
      } catch (error) {
        console.warn('按鈕觸控結束動畫Failed:', error);
      }

      // 調用原始 onTouchEnd
      onTouchEnd?.(event);
    },
    [disabled, trigger, onTouchEnd]
  );

  // 計算樣式
  const buttonStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    ...style,
  };

  // Add性能優化樣式
  if (finalConfig.performance?.useWillChange) {
    buttonStyle.willChange = 'transform, box-shadow';
  }

  if (finalConfig.performance?.useTransform) {
    buttonStyle.transform = 'translateZ(0)';
  }

  return (
    <button
      ref={buttonRef}
      className={className}
      style={buttonStyle}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={disabled}
      data-micro-interaction={finalConfig.id}
      aria-label={
        finalConfig.accessibility?.screenReader ? '可點擊按鈕' : undefined
      }
    >
      {children}
    </button>
  );
};

// 便捷Component：主要按鈕
export const PrimaryButton: React.FC<
  Omit<ButtonClickAnimationProps, 'config'> & {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
  }
> = ({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  style = {},
  ...props
}) => {
  const _variantStyles = {
    primary: {
      backgroundColor: '#1976D2',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    secondary: {
      backgroundColor: '#f5f5f5',
      color: '#333333',
      border: '1px solid #e0e0e0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#1976D2',
      border: '2px solid #1976D2',
      boxShadow: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#1976D2',
      border: 'none',
      boxShadow: 'none',
    },
  };

  const _sizeStyles = {
    small: {
      padding: '8px 16px',
      fontSize: '14px',
      borderRadius: '4px',
    },
    medium: {
      padding: '12px 24px',
      fontSize: '16px',
      borderRadius: '6px',
    },
    large: {
      padding: '16px 32px',
      fontSize: '18px',
      borderRadius: '8px',
    },
  };

  const _buttonStyle = {
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <ButtonClickAnimation
      className={`button-${variant} button-${size} ${className}`}
      style={buttonStyle}
      config={{
        ripple: {
          enabled: true,
          color:
            variant === 'primary'
              ? 'rgba(255, 255, 255, 0.3)'
              : 'rgba(25, 118, 210, 0.2)',
          duration: 600,
          scale: 1.5,
        },
        scale: {
          enabled: true,
          scale: 0.95,
          duration: 150,
        },
        shadow: {
          enabled: true,
          intensity: 0.2,
          duration: 150,
        },
      }}
      {...props}
    >
      {children}
    </ButtonClickAnimation>
  );
};

// 便捷Component：Graph標按鈕
export const IconButton: React.FC<
  Omit<ButtonClickAnimationProps, 'config'> & {
    icon: ReactNode;
    size?: 'small' | 'medium' | 'large';
    circular?: boolean;
  }
> = ({
  icon,
  size = 'medium',
  circular = false,
  className = '',
  style = {},
  ...props
}) => {
  const _sizeStyles = {
    small: {
      width: '32px',
      height: '32px',
      fontSize: '16px',
    },
    medium: {
      width: '40px',
      height: '40px',
      fontSize: '20px',
    },
    large: {
      width: '48px',
      height: '48px',
      fontSize: '24px',
    },
  };

  const _iconButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    color: '#666666',
    border: 'none',
    borderRadius: circular ? '50%' : '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ...sizeStyles[size],
    ...style,
  };

  return (
    <ButtonClickAnimation
      className={`icon-button ${circular ? 'circular' : ''} ${className}`}
      style={iconButtonStyle}
      config={{
        ripple: {
          enabled: true,
          color: 'rgba(0, 0, 0, 0.1)',
          duration: 400,
          scale: 1.2,
        },
        scale: {
          enabled: true,
          scale: 0.9,
          duration: 100,
        },
        shadow: {
          enabled: false,
        },
      }}
      {...props}
    >
      {icon}
    </ButtonClickAnimation>
  );
};

// 便捷Component：浮動Operation按鈕
export const FloatingActionButton: React.FC<
  Omit<ButtonClickAnimationProps, 'config'> & {
    icon: ReactNode;
    color?: string;
    size?: 'small' | 'medium' | 'large';
  }
> = ({
  icon,
  color = '#1976D2',
  size = 'medium',
  className = '',
  style = {},
  ...props
}) => {
  const _sizeStyles = {
    small: {
      width: '40px',
      height: '40px',
      fontSize: '18px',
    },
    medium: {
      width: '56px',
      height: '56px',
      fontSize: '24px',
    },
    large: {
      width: '64px',
      height: '64px',
      fontSize: '28px',
    },
  };

  const _fabStyle = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color,
    color: '#ffffff',
    border: 'none',
    borderRadius: '50%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    zIndex: 1000,
    ...sizeStyles[size],
    ...style,
  };

  return (
    <ButtonClickAnimation
      className={`floating-action-button ${className}`}
      style={fabStyle as any}
      config={{
        ripple: {
          enabled: true,
          color: 'rgba(255, 255, 255, 0.3)',
          duration: 600,
          scale: 1.8,
        },
        scale: {
          enabled: true,
          scale: 0.9,
          duration: 150,
        },
        shadow: {
          enabled: true,
          intensity: 0.4,
          duration: 200,
        },
      }}
      {...props}
    >
      {icon}
    </ButtonClickAnimation>
  );
};

// DefaultExport
export default ButtonClickAnimation;
