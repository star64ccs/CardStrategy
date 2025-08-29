import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store';

import { animationService } from '../../services/animationService';
import {
  initializeAnimationService,
  selectAnimationState,
  updatePerformanceMetrics,
} from '../../store/slices/animationSlice';
import type {
  AnimationEvent,
  AnimationPerformance,
} from '../../types/animation';

// 動畫上下文接口
interface AnimationContextType {
  // 狀態
  isInitialized: boolean;
  error: string | null;

  // 服務方法
  createAnimation: (config: unknown) => string;
  playAnimation: (id: string) => Promise<void>;
  pauseAnimation: (id: string) => void;
  stopAnimation: (id: string) => void;

  // 批量操作
  playAll: () => Promise<void>;
  pauseAll: () => void;
  stopAll: () => void;

  // 配置管理
  updateConfig: (id: string, config: unknown) => void;
  getConfig: (id: string) => any;

  // 性能監控
  getPerformance: () => AnimationPerformance;
  enablePerformanceMonitoring: (enabled: boolean) => void;

  // 偏好設置
  updatePreferences: (preferences: unknown) => void;
  getPreferences: () => any;

  // 預設動畫
  registerPreset: (preset: unknown) => void;
  getPreset: (name: string) => any;
  getAllPresets: () => any[];

  // 事件監聽
  on: (event: string, callback: (event: AnimationEvent) => void) => void;
  off: (event: string, callback: (event: AnimationEvent) => void) => void;
}

// 創建上下文
const _AnimationContext = createContext<AnimationContextType | null>(null);

// Provider Props
interface AnimationProviderProps {
  children: ReactNode;
  autoInitialize?: boolean;
  enablePerformanceMonitoring?: boolean;
  maxConcurrentAnimations?: number;
  performanceThreshold?: number;
}

/**
 * 動畫提供者組件
 * 提供動畫服務的上下文，管理動畫的生命週期
 */
export const AnimationProvider: React.FC<AnimationProviderProps> = ({
  children,
  autoInitialize = true,
  enablePerformanceMonitoring = true,
  maxConcurrentAnimations = 10,
  performanceThreshold = 30,
}) => {
  const _dispatch = useDispatch<AppDispatch>();
  const { isInitialized, error } = useSelector(selectAnimationState);
  const _performanceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化動畫服務
  useEffect(() => {
    if (autoInitialize && !isInitialized) {
      dispatch(initializeAnimationService());
    }
    return undefined;
  }, [autoInitialize, isInitialized, dispatch]);

  // 設置性能監控
  useEffect(() => {
    if (isInitialized && enablePerformanceMonitoring) {
      // 啟用性能監控
      animationService.enablePerformanceMonitoring(true);

      // 定期更新性能指標
      performanceIntervalRef.current = setInterval(() => {
        const _performance = animationService.getPerformance();
        dispatch(updatePerformanceMetrics(performance));
      }, 1000); // 每秒更新一次

      return () => {
        if (performanceIntervalRef.current) {
          clearInterval(performanceIntervalRef.current);
          performanceIntervalRef.current = null;
        }
      };
    }
    return undefined;
  }, [dispatch, isInitialized, enablePerformanceMonitoring]);

  // 清理資源
  useEffect(() => {
    return () => {
      if (performanceIntervalRef.current) {
        clearInterval(performanceIntervalRef.current);
      }
    };
  }, []);

  // 創建上下文值
  const contextValue: AnimationContextType = {
    // 狀態
    isInitialized,
    error,

    // 服務方法
    createAnimation: (config: unknown) => animationService.createAnimation(config),
    playAnimation: async (id: string) => {
      try {
        await animationService.playAnimation(id);
      } catch (error) {
        console.error('播放動畫失敗:', error);
        throw error;
      }
    },
    pauseAnimation: (id: string) => {
      try {
        animationService.pauseAnimation(id);
      } catch (error) {
        console.error('暫停動畫失敗:', error);
        throw error;
      }
    },
    stopAnimation: (id: string) => {
      try {
        animationService.stopAnimation(id);
      } catch (error) {
        console.error('停止動畫失敗:', error);
        throw error;
      }
    },

    // 批量操作
    playAll: async () => {
      try {
        await animationService.playAll();
      } catch (error) {
        console.error('播放所有動畫失敗:', error);
        throw error;
      }
    },
    pauseAll: () => {
      try {
        animationService.pauseAll();
      } catch (error) {
        console.error('暫停所有動畫失敗:', error);
        throw error;
      }
    },
    stopAll: () => {
      try {
        animationService.stopAll();
      } catch (error) {
        console.error('停止所有動畫失敗:', error);
        throw error;
      }
    },

    // 配置管理
    updateConfig: (id: string, config: unknown) => {
      try {
        animationService.updateConfig(id, config);
      } catch (error) {
        console.error('更新動畫配置失敗:', error);
        throw error;
      }
    },
    getConfig: (id: string) => animationService.getConfig(id),

    // 性能監控
    getPerformance: () => animationService.getPerformance(),
    enablePerformanceMonitoring: (enabled: boolean) => {
      try {
        animationService.enablePerformanceMonitoring(enabled);
      } catch (error) {
        console.error('啟用性能監控失敗:', error);
        throw error;
      }
    },

    // 偏好設置
    updatePreferences: (preferences: unknown) => {
      try {
        animationService.updatePreferences(preferences);
      } catch (error) {
        console.error('更新偏好設置失敗:', error);
        throw error;
      }
    },
    getPreferences: () => animationService.getPreferences(),

    // 預設動畫
    registerPreset: (preset: unknown) => {
      try {
        animationService.registerPreset(preset);
      } catch (error) {
        console.error('註冊預設動畫失敗:', error);
        throw error;
      }
    },
    getPreset: (name: string) => animationService.getPreset(name),
    getAllPresets: () => animationService.getAllPresets(),

    // 事件監聽
    on: (event: string, callback: (event: AnimationEvent) => void) => {
      animationService.on(event, callback);
    },
    off: (event: string, callback: (event: AnimationEvent) => void) => {
      animationService.off(event, callback);
    },
  };

  // 如果未初始化且啟用了自動初始化，顯示加載狀態
  if (autoInitialize && !isInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '16px',
          color: '#666',
        }}
      >
        正在初始化動畫系統...
      </div>
    );
  }

  // 如果有錯誤，顯示錯誤信息
  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '16px',
          color: '#ff4444',
          textAlign: 'center',
          padding: '20px',
        }}
      >
        <div>
          <h3>動畫系統初始化失敗</h3>
          <p>{error}</p>
          <button
            onClick={() => dispatch(initializeAnimationService())}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};

/**
 * 使用動畫上下文的 Hook
 */
export const _useAnimation = (): AnimationContextType => {
  const _context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation 必須在 AnimationProvider 內部使用');
  }
  return context;
};

/**
 * 動畫提供者 HOC
 */
export const _withAnimation = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => (
    <AnimationProvider>
      <Component {...props} />
    </AnimationProvider>
  );
};

export default AnimationProvider;
