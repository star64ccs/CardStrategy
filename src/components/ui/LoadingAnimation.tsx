// 加載動畫組件
import type { ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';

import type { LoadingConfig } from '../../types/microInteractions';
import {
  MicroInteractionType,
  TriggerType,
} from '../../types/microInteractions';
import { useMicroInteraction } from '../providers/MicroInteractionProvider';

// 組件 Props
interface LoadingAnimationProps {
  children?: ReactNode;
  config?: Partial<LoadingConfig>;
  loading: boolean;
  progress?: number;
  message?: string;
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  id?: string;
}

// 默認配置
const DEFAULT_CONFIG: LoadingConfig = {
  id: '',
  type: MicroInteractionType.LOADING,
  trigger: TriggerType.AUTO,
  duration: 1000,
  easing: 'ease-in-out',
  spinner: {
    type: 'circular',
    size: 24,
    color: '#1976D2',
    thickness: 2,
  },
  skeleton: {
    enabled: false,
    rows: 3,
    height: 20,
    borderRadius: 4,
  },
  progress: {
    enabled: false,
    type: 'indeterminate',
    value: 0,
    color: '#1976D2',
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

// 加載動畫組件
export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  children,
  config = {},
  loading,
  progress = 0,
  message,
  onComplete,
  className = '',
  style = {},
  disabled = false,
  id,
}) => {
  const { register, trigger, unregister } = useMicroInteraction();
  const _containerRef = useRef<HTMLDivElement>(null);
  const _interactionIdRef = useRef<string>('');
  const _prevLoadingRef = useRef<boolean>(loading);

  // 合併配置
  const finalConfig: LoadingConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    id:
      id || `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  // 註冊微交互
  useEffect(() => {
    if (!disabled) {
      const _interactionId = register(finalConfig);
      interactionIdRef.current = interactionId;

      return () => {
        unregister(interactionId);
      };
    }
    return undefined;
  }, [register, unregister, finalConfig, disabled]);

  // 監聽加載狀態變化
  useEffect(() => {
    if (disabled || !interactionIdRef.current) return undefined;

    if (loading !== prevLoadingRef.current) {
      const _triggerLoadingAnimation = async () => {
        try {
          await trigger(interactionIdRef.current, {
            element: containerRef.current,
            loading,
            progress,
            message,
          });
        } catch (error) {
          console.warn('加載動畫失敗:', error);
        }
      };

      triggerLoadingAnimation();
      prevLoadingRef.current = loading;
    }
    return undefined;
  }, [loading, progress, message, disabled, trigger]);

  // 監聽進度變化
  useEffect(() => {
    if (disabled || !interactionIdRef.current || !loading) return;

    const _triggerProgressUpdate = async () => {
      try {
        await trigger(interactionIdRef.current, {
          element: containerRef.current,
          loading,
          progress,
          message,
        });
      } catch (error) {
        console.warn('進度更新動畫失敗:', error);
      }
    };

    triggerProgressUpdate();
  }, [progress, loading, message, disabled, trigger]);

  // 處理完成回調
  useEffect(() => {
    if (!loading && prevLoadingRef.current && onComplete) {
      onComplete();
    }
  }, [loading, onComplete]);

  // 計算樣式
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    ...style,
  };

  // 添加性能優化樣式
  if (finalConfig.performance?.useWillChange) {
    containerStyle.willChange = 'transform, opacity';
  }

  if (finalConfig.performance?.useTransform) {
    containerStyle.transform = 'translateZ(0)';
  }

  return (
    <div
      ref={containerRef}
      className={`loading-animation ${loading ? 'loading' : 'loaded'} ${className}`}
      style={containerStyle}
      data-micro-interaction={finalConfig.id}
      data-loading={loading}
      data-progress={progress}
      aria-busy={loading}
      aria-label={message || (loading ? '正在加載' : '加載完成')}
      role='status'
    >
      {loading && (
        <div
          className='loading-overlay'
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          {/* 加載器 */}
          {finalConfig.spinner && (
            <div
              className='loading-spinner'
              style={{
                marginBottom: message ? '8px' : 0,
              }}
            >
              {finalConfig.spinner.type === 'circular' && (
                <CircularSpinner
                  size={finalConfig.spinner.size}
                  color={finalConfig.spinner.color}
                  thickness={finalConfig.spinner.thickness}
                />
              )}
              {finalConfig.spinner.type === 'linear' && (
                <LinearSpinner
                  color={finalConfig.spinner.color}
                  thickness={finalConfig.spinner.thickness}
                />
              )}
              {finalConfig.spinner.type === 'dots' && (
                <DotsSpinner
                  size={finalConfig.spinner.size}
                  color={finalConfig.spinner.color}
                />
              )}
              {finalConfig.spinner.type === 'pulse' && (
                <PulseSpinner
                  size={finalConfig.spinner.size}
                  color={finalConfig.spinner.color}
                />
              )}
              {finalConfig.spinner.type === 'wave' && (
                <WaveSpinner
                  size={finalConfig.spinner.size}
                  color={finalConfig.spinner.color}
                />
              )}
            </div>
          )}

          {/* 進度條 */}
          {finalConfig.progress?.enabled && (
            <div
              className='loading-progress'
              style={{
                width: '100%',
                maxWidth: '200px',
                marginBottom: message ? '8px' : 0,
              }}
            >
              <ProgressBar
                type={finalConfig.progress.type}
                value={finalConfig.progress.value || progress}
                color={finalConfig.progress.color}
              />
            </div>
          )}

          {/* 消息 */}
          {message && (
            <div
              className='loading-message'
              style={{
                fontSize: '14px',
                color: '#666666',
                textAlign: 'center',
              }}
            >
              {message}
            </div>
          )}
        </div>
      )}

      {/* 骨架屏 */}
      {loading && finalConfig.skeleton?.enabled && (
        <div className='loading-skeleton'>
          <Skeleton
            rows={finalConfig.skeleton.rows || 3}
            height={finalConfig.skeleton.height || 20}
            borderRadius={finalConfig.skeleton.borderRadius || 4}
          />
        </div>
      )}

      {/* 內容 */}
      <div
        className='loading-content'
        style={{
          opacity: loading ? 0.3 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// 圓形加載器
const CircularSpinner: React.FC<{
  size?: number;
  color?: string;
  thickness?: number;
}> = ({ size = 24, color = '#1976D2', thickness = 2 }) => (
  <div
    style={{
      width: size,
      height: size,
      border: `${thickness}px solid #f3f3f3`,
      borderTop: `${thickness}px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }}
  />
);

// 線性加載器
const LinearSpinner: React.FC<{
  color?: string;
  thickness?: number;
}> = ({ color = '#1976D2', thickness = 2 }) => (
  <div
    style={{
      width: '100%',
      height: thickness,
      backgroundColor: '#f3f3f3',
      borderRadius: thickness / 2,
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        width: '30%',
        height: '100%',
        backgroundColor: color,
        borderRadius: thickness / 2,
        animation: 'slide 1.5s ease-in-out infinite',
      }}
    />
  </div>
);

// 點狀加載器
const DotsSpinner: React.FC<{
  size?: number;
  color?: string;
}> = ({ size = 24, color = '#1976D2' }) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {[0, 1, 2].map(i => (
      <div
        key={i}
        style={{
          width: size / 3,
          height: size / 3,
          backgroundColor: color,
          borderRadius: '50%',
          animation: `bounce 1.4s ease-in-out infinite both`,
          animationDelay: `${i * 0.16}s`,
        }}
      />
    ))}
  </div>
);

// 脈衝加載器
const PulseSpinner: React.FC<{
  size?: number;
  color?: string;
}> = ({ size = 24, color = '#1976D2' }) => (
  <div
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: '50%',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}
  />
);

// 波浪加載器
const WaveSpinner: React.FC<{
  size?: number;
  color?: string;
}> = ({ size = 24, color = '#1976D2' }) => (
  <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end' }}>
    {[0, 1, 2, 3, 4].map(i => (
      <div
        key={i}
        style={{
          width: '3px',
          height: size * (0.3 + i * 0.1),
          backgroundColor: color,
          borderRadius: '2px',
          animation: 'wave 1.2s ease-in-out infinite',
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}
  </div>
);

// 進度條
const ProgressBar: React.FC<{
  type: 'determinate' | 'indeterminate';
  value: number;
  color?: string;
}> = ({ type, value, color = '#1976D2' }) => (
  <div
    style={{
      width: '100%',
      height: '4px',
      backgroundColor: '#f3f3f3',
      borderRadius: '2px',
      overflow: 'hidden',
    }}
  >
    {type === 'determinate' ? (
      <div
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: '2px',
          transition: 'width 0.3s ease',
        }}
      />
    ) : (
      <div
        style={{
          width: '30%',
          height: '100%',
          backgroundColor: color,
          borderRadius: '2px',
          animation: 'slide 1.5s ease-in-out infinite',
        }}
      />
    )}
  </div>
);

// 骨架屏
const Skeleton: React.FC<{
  rows: number;
  height: number;
  borderRadius: number;
}> = ({ rows, height, borderRadius }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        style={{
          height,
          backgroundColor: '#f0f0f0',
          borderRadius,
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}
  </div>
);

// 便捷組件：全屏加載
export const FullScreenLoading: React.FC<
  Omit<LoadingAnimationProps, 'children'> & {
    overlay?: boolean;
    backdrop?: boolean;
  }
> = ({
  overlay = true,
  backdrop = true,
  className = '',
  style = {},
  ...props
}) => {
  const fullScreenStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    ...(backdrop && {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    }),
    ...style,
  };

  return (
    <LoadingAnimation
      className={`fullscreen-loading ${className}`}
      style={fullScreenStyle}
      {...props}
    />
  );
};

// 便捷組件：內聯加載
export const InlineLoading: React.FC<
  Omit<LoadingAnimationProps, 'children'> & {
    size?: 'small' | 'medium' | 'large';
  }
> = ({ size = 'medium', className = '', style = {}, ...props }) => {
  const _sizeStyles = {
    small: { width: '16px', height: '16px' },
    medium: { width: '24px', height: '24px' },
    large: { width: '32px', height: '32px' },
  };

  return (
    <LoadingAnimation
      className={`inline-loading inline-loading-${size} ${className}`}
      style={{ ...sizeStyles[size], ...style }}
      {...props}
    />
  );
};

// 便捷組件：按鈕加載
export const ButtonLoading: React.FC<
  Omit<LoadingAnimationProps, 'children'> & {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
  }
> = ({
  variant = 'primary',
  size = 'medium',
  className = '',
  style = {},
  ...props
}) => {
  const _variantStyles = {
    primary: { backgroundColor: '#1976D2', color: '#ffffff' },
    secondary: { backgroundColor: '#f5f5f5', color: '#333333' },
    outline: {
      backgroundColor: 'transparent',
      color: '#1976D2',
      border: '2px solid #1976D2',
    },
  };

  const _sizeStyles = {
    small: { padding: '8px 16px', fontSize: '14px' },
    medium: { padding: '12px 24px', fontSize: '16px' },
    large: { padding: '16px 32px', fontSize: '18px' },
  };

  const _buttonStyle = {
    ...variantStyles[variant],
    ...sizeStyles[size],
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    ...style,
  };

  return (
    <LoadingAnimation
      className={`button-loading button-loading-${variant} button-loading-${size} ${className}`}
      style={buttonStyle}
      {...props}
    />
  );
};

// 添加 CSS 動畫
const _style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
  }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes wave {
    0%, 100% { transform: scaleY(0.3); }
    50% { transform: scaleY(1); }
  }
`;
document.head.appendChild(style);

// 默認導出
export default LoadingAnimation;
