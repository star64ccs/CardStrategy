import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';

import { layoutService } from '../../services/layoutService';
import {
  addLayoutEvent,
  setCurrentBreakpoint,
  setLayoutError,
  setLayoutLoading,
  setResponsiveState,
  setWindowSize,
} from '../../store/slices/layoutSlice';
import type {
  Breakpoint,
  BreakpointConfig,
  ResponsiveEvent,
  ResponsiveProviderProps,
  ResponsiveState,
} from '../../types/layout';

// 響應式上下文
interface ResponsiveContextType {
  responsive: ResponsiveState;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeScreen: boolean;
  currentBreakpoint: Breakpoint;
  windowWidth: number;
  windowHeight: number;
  breakpoints: BreakpointConfig;
}

const _ResponsiveContext = createContext<ResponsiveContextType | undefined>(
  undefined
);

// 響應式提供者組件
export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({
  children,
  breakpoints,
  defaultBreakpoint = 'md',
  onBreakpointChange,
}) => {
  const _dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const [responsive, setResponsive] = useState<ResponsiveState>({
    currentBreakpoint: defaultBreakpoint,
    breakpoints: {
      xs: 575,
      sm: 767,
      md: 991,
      lg: 1199,
      xl: 1399,
      xxl: 1400,
      ...breakpoints,
    },
    isMobile: defaultBreakpoint === 'xs' || defaultBreakpoint === 'sm',
    isTablet: defaultBreakpoint === 'md',
    isDesktop: defaultBreakpoint === 'lg' || defaultBreakpoint === 'xl',
    isLargeScreen: defaultBreakpoint === 'xxl',
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
    windowHeight: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  // 初始化佈局服務
  const _initializeLayoutService = useCallback(async () => {
    try {
      dispatch(setLayoutLoading(true));

      // 更新配置
      if (breakpoints) {
        layoutService.updateConfig({
          breakpoints: breakpoints as any,
        });
      }

      // 初始化服務
      await layoutService.initialize();

      // 獲取初始狀態
      const _initialState = layoutService.getResponsiveState();
      setResponsive(initialState);
      dispatch(setResponsiveState(initialState));

      setIsInitialized(true);
      dispatch(setLayoutLoading(false));
    } catch (error) {
      console.error('響應式提供者初始化失敗:', error);
      dispatch(
        setLayoutError(error instanceof Error ? error.message : '初始化失敗')
      );
      dispatch(setLayoutLoading(false));
    }
  }, [dispatch, breakpoints]);

  // 處理響應式事件
  const _handleResponsiveEvent = useCallback(
    (event: ResponsiveEvent) => {
      const _newState = layoutService.getResponsiveState();
      setResponsive(newState);
      dispatch(setResponsiveState(newState));
      dispatch(addLayoutEvent(event as any));

      // 調用外部回調
      if (event.type === 'breakpointChange' && onBreakpointChange) {
        onBreakpointChange(event.breakpoint);
      }
    },
    [dispatch, onBreakpointChange]
  );

  // 設置事件監聽器
  useEffect(() => {
    if (!isInitialized) return;

    // 監聽斷點變化
    const _unsubscribeBreakpoint = layoutService.onBreakpointChange(
      handleResponsiveEvent
    );

    // 監聽窗口大小變化
    const _unsubscribeResize = layoutService.onResize(handleResponsiveEvent);

    return () => {
      unsubscribeBreakpoint();
      unsubscribeResize();
    };
  }, [isInitialized, handleResponsiveEvent]);

  // 初始化
  useEffect(() => {
    initializeLayoutService();
  }, [initializeLayoutService]);

  // 同步 Redux 狀態
  useEffect(() => {
    if (!isInitialized) return;

    dispatch(setCurrentBreakpoint(responsive.currentBreakpoint));
    dispatch(
      setWindowSize({
        width: responsive.windowWidth,
        height: responsive.windowHeight,
      })
    );
  }, [dispatch, responsive, isInitialized]);

  // 上下文值
  const contextValue: ResponsiveContextType = {
    responsive,
    isMobile: responsive.isMobile,
    isTablet: responsive.isTablet,
    isDesktop: responsive.isDesktop,
    isLargeScreen: responsive.isLargeScreen,
    currentBreakpoint: responsive.currentBreakpoint,
    windowWidth: responsive.windowWidth,
    windowHeight: responsive.windowHeight,
    breakpoints: responsive.breakpoints,
  };

  if (!isInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#666',
        }}
      >
        初始化響應式系統...
      </div>
    );
  }

  return (
    <ResponsiveContext.Provider value={contextValue}>
      {children}
    </ResponsiveContext.Provider>
  );
};

// 使用響應式 Hook
export const _useResponsive = (): ResponsiveContextType => {
  const _context = useContext(ResponsiveContext);
  if (context === undefined) {
    throw new Error('useResponsive 必須在 ResponsiveProvider 內使用');
  }
  return context;
};

// 導出上下文
export { ResponsiveContext };
